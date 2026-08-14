import logging
from performance.config import FREE_TRACK_ID

logger = logging.getLogger("performance_test")

def update_progress(user, track_id, position, duration, completed=False, program_id=None):
    """Hits the POST /progress/update endpoint to synchronize listening state."""
    payload = {
        "trackId": track_id,
        "position": position,
        "duration": duration,
        "completed": completed
    }
    if program_id:
        payload["programId"] = program_id
        
    with user.post_api("/progress/update", json=payload, catch_response=True, name="Progress: Update Sync") as response:
        if response.status_code == 200:
            response.success()
            return True
        else:
            response.failure(f"Progress update failed with code {response.status_code}")
            return False

def progress_flow(user):
    """Simulates realistic playback progress reporting (initial, update, complete)."""
    track_id = user.selected_track_id or FREE_TRACK_ID
    prog_id = user.selected_program_id
    
    # 1. Initial play update
    update_progress(user, track_id, position=0, duration=300, completed=False, program_id=prog_id)
    
    # Simulate user playing some duration
    played_position = user.playback_position if user.playback_position > 0 else 30
    
    # 2. Mid-session update
    update_progress(user, track_id, position=played_position, duration=300, completed=False, program_id=prog_id)
    
    # 3. Simulate completion (optional branch)
    # If the user has completed streaming, mark as completed
    if user.playback_position > 0 and user.playback_position >= user.playback_duration:
        update_progress(user, track_id, position=user.playback_duration, duration=user.playback_duration, completed=True, program_id=prog_id)
