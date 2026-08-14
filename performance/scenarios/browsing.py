import random
import logging
from performance.config import FREE_TRACK_ID, PREMIUM_TRACK_ID, PROGRAM_ID

logger = logging.getLogger("performance_test")

def browse_catalog(user):
    """Simulates realistic browsing behavior by calling various catalog endpoints."""
    # 1. Fetch all programs
    with user.get_api("/programs", catch_response=True) as response:
        if response.status_code == 200:
            data = response.json().get("data", {}).get("data", [])
            if data:
                # Randomly pick a program ID to store in user state
                selected = random.choice(data)
                user.selected_program_id = selected.get("id")
            response.success()
        else:
            response.failure(f"List programs failed with code {response.status_code}")

    # 2. Fetch all tracks
    with user.get_api("/tracks", catch_response=True) as response:
        if response.status_code == 200:
            data = response.json().get("data", {}).get("data", [])
            if data:
                # Store a randomly selected track ID
                selected = random.choice(data)
                user.selected_track_id = selected.get("id")
            response.success()
        else:
            response.failure(f"List tracks failed with code {response.status_code}")

    # 3. Load continue-listening history
    with user.get_api("/progress/continue-listening", catch_response=True) as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"Fetch continue-listening failed with code {response.status_code}")

    # 4. Fetch list of tags
    with user.get_api("/tracks/tags", catch_response=True) as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"List tags failed with code {response.status_code}")

    # 5. Fetch program-specific tracks if a program ID is selected
    prog_id = user.selected_program_id or PROGRAM_ID
    with user.get_api(f"/programs/{prog_id}/tracks", catch_response=True) as response:
        if response.status_code in [200, 404]:
            response.success()
        else:
            response.failure(f"Fetch program tracks failed with code {response.status_code}")

    # 6. Fetch track details for selected track ID
    track_id = user.selected_track_id or FREE_TRACK_ID
    with user.get_api(f"/tracks/{track_id}", catch_response=True) as response:
        if response.status_code in [200, 404]:
            response.success()
        else:
            response.failure(f"Fetch track details failed with code {response.status_code}")
