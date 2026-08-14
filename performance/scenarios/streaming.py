import re
import time
import logging
from locust import events
from performance.config import FREE_TRACK_ID, PREMIUM_TRACK_ID

logger = logging.getLogger("performance_test")

def parse_playlist(playlist_text):
    """Parses master.m3u8 body to extract AES key paths and segment paths."""
    key_paths = []
    segment_paths = []
    
    # Regex to find URI="keys/aes.key?ticket=..." or any URI value in EXT-X-KEY
    key_matches = re.findall(r'URI="([^"]+)"', playlist_text)
    for path in key_matches:
        key_paths.append(path)
        
    # Find all segment lines (lines that don't start with '#' and contain 'ticket=')
    for line in playlist_text.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            segment_paths.append(line)
            
    return key_paths, segment_paths

def stream_track_flow(user, track_id, is_premium=False):
    """Simulates the entire HLS playback session for a user."""
    start_time = time.time()
    
    # 1. Request Stream Ticket
    ticket = None
    ticket_start = time.time()
    with user.post_api(f"/stream/{track_id}/ticket", catch_response=True, name="HLS: Ticket Generation") as response:
        ticket_latency = (time.time() - ticket_start) * 1000
        if response.status_code == 200:
            data = response.json().get("data", {})
            ticket = data.get("ticket")
            response.success()
        else:
            response.failure(f"Ticket fetch failed with code {response.status_code}: {response.text}")
            events.request.fire(
                request_type="HLS",
                name="Stream Start Failure",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=Exception("Ticket request failed"),
                context={}
            )
            return

    if not ticket:
        events.request.fire(
            request_type="HLS",
            name="Stream Start Failure",
            response_time=(time.time() - start_time) * 1000,
            response_length=0,
            exception=Exception("No ticket returned"),
            context={}
        )
        return

    # 2. Get master.m3u8 playlist
    playlist_text = ""
    playlist_start = time.time()
    playlist_url = f"/stream/{track_id}/master.m3u8"
    with user.get_api(playlist_url, params={"ticket": ticket}, catch_response=True, name="HLS: Playlist Fetch") as response:
        playlist_latency = (time.time() - playlist_start) * 1000
        if response.status_code == 200:
            playlist_text = response.text
            response.success()
        else:
            response.failure(f"Playlist fetch failed with code {response.status_code}")
            events.request.fire(
                request_type="HLS",
                name="Stream Start Failure",
                response_time=(time.time() - start_time) * 1000,
                response_length=0,
                exception=Exception("Playlist request failed"),
                context={}
            )
            return

    # Fire Stream Start Success metric
    events.request.fire(
        request_type="HLS",
        name="Stream Start Success",
        response_time=(time.time() - start_time) * 1000,
        response_length=len(playlist_text),
        exception=None,
        context={}
    )

    # 3. Parse playlist and fetch key/segments
    key_paths, segment_paths = parse_playlist(playlist_text)
    
    # If key exists, fetch the decryption key
    if key_paths:
        # Resolve path - typically /keys/aes.key?ticket=xyz
        # In playlist, the URI is relative, e.g. "keys/aes.key?ticket=ticket"
        key_url = f"/stream/{track_id}/{key_paths[0]}"
        # Ensure we request it correctly (it already contains ticket parameter from playlist rewrite)
        key_start = time.time()
        # Since it already has ticket parameter, we make a raw get request or strip it to call get_api
        # But wait, Hono route is `/api/v1/stream/:trackId/keys/:keyName?ticket=xyz`
        # Let's extract keyName and ticket from key_paths[0]
        # Example: keys/aes.key?ticket=xyz -> keyName = aes.key
        key_name = "aes.key"
        with user.get_api(f"/stream/{track_id}/keys/{key_name}", params={"ticket": ticket}, catch_response=True, name="HLS: Decryption Key Fetch") as response:
            key_latency = (time.time() - key_start) * 1000
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Decryption key fetch failed with code {response.status_code}")

    # Set user playback duration state (e.g. 5 minutes or based on segments count)
    user.playback_duration = len(segment_paths) * 6 if segment_paths else 180
    user.playback_position = 0
    user.selected_track_id = track_id

    # 4. Fetch HLS segments. Simulate 5 segments (30 seconds) of active listening
    segments_to_fetch = segment_paths[:5] if segment_paths else ["audio/segment000.mp3"]
    
    for segment_path in segments_to_fetch:
        # Sleep for segment duration (6s) to simulate realistic playback buffer timing
        # except for the very first segment (startup)
        if user.playback_position > 0:
            time.sleep(6.0)

        # Retrieve the segment name
        # Path rewritten as audio/segment000.mp3?ticket=xyz
        segment_name = "segment000.mp3"
        if "audio/" in segment_path:
            segment_name = segment_path.split("audio/")[1].split("?")[0]
            
        segment_start = time.time()
        with user.get_api(f"/stream/{track_id}/audio/{segment_name}", params={"ticket": ticket}, catch_response=True, name="HLS: Segment Fetch") as response:
            segment_latency = (time.time() - segment_start) * 1000
            if response.status_code == 200:
                response.success()
                events.request.fire(
                    request_type="HLS",
                    name="Segment Served",
                    response_time=segment_latency,
                    response_length=len(response.content),
                    exception=None,
                    context={}
                )
                user.playback_position += 6
            else:
                response.failure(f"Segment fetch failed with code {response.status_code}")
                events.request.fire(
                    request_type="HLS",
                    name="Segment Failure",
                    response_time=segment_latency,
                    response_length=0,
                    exception=Exception(f"Segment download failed: status {response.status_code}"),
                    context={}
                )

def stream_free_track_flow(user):
    """Simulates streaming free content."""
    stream_track_flow(user, FREE_TRACK_ID, is_premium=False)

def stream_premium_track_flow(user):
    """Simulates streaming premium content."""
    track_id = user.selected_track_id or PREMIUM_TRACK_ID
    stream_track_flow(user, track_id, is_premium=True)

def verify_premium_access_rejected(user):
    """Verifies that unauthorized users (e.g. Free users) are blocked from premium tickets."""
    with user.post_api(f"/stream/{PREMIUM_TRACK_ID}/ticket", catch_response=True, name="AccessControl: Block Premium") as response:
        if response.status_code in [403, 404]:
            response.success()  # Blocked or unavailable, this is correct behavior!
        elif response.status_code == 200:
            response.failure("AccessControl bypass: Free user was allowed to request premium stream ticket")
        else:
            response.failure(f"AccessControl check returned unexpected status {response.status_code}")
