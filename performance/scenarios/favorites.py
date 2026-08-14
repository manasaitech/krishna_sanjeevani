import random
import logging
from performance.config import FREE_TRACK_ID

logger = logging.getLogger("performance_test")

def favorite_flow(user):
    """Simulates checking, adding, listing, and toggling favorite state of a track."""
    track_id = user.selected_track_id or FREE_TRACK_ID
    
    # 1. Check Favorite status
    is_favorited = False
    with user.get_api(f"/favorites/{track_id}/status", catch_response=True, name="Favorites: Check Status") as response:
        if response.status_code == 200:
            is_favorited = response.json().get("data", {}).get("favorited", False)
            response.success()
        else:
            response.failure(f"Checking favorite status failed: {response.status_code}")

    # 2. List all favorites
    with user.get_api("/favorites?itemType=track", catch_response=True, name="Favorites: List Favorites") as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"List favorites failed: {response.status_code}")

    # 3. Toggle favorite (add or remove based on status)
    if not is_favorited:
        # Add to favorites
        payload = {
            "itemId": track_id,
            "itemType": "track"
        }
        with user.post_api("/favorites", json=payload, catch_response=True, name="Favorites: Add Favorite") as response:
            if response.status_code in [200, 201]:
                response.success()
            else:
                response.failure(f"Adding favorite failed: {response.status_code}")
    else:
        # Remove from favorites
        with user.delete_api(f"/favorites/{track_id}", catch_response=True, name="Favorites: Remove Favorite") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Removing favorite failed: {response.status_code}")
