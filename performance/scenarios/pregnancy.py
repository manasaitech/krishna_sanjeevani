import random
import logging

logger = logging.getLogger("performance_test")

def pregnancy_scenario(user):
    """Simulates the lifecycle flow for a pregnancy-tracker user."""
    # 1. Update user info / set pregnancy week
    info_payload = {
        "currentWeek": random.randint(1, 40)
    }
    with user.post_api("/pregnancy/user-info", json=info_payload, catch_response=True, name="Pregnancy: Save User Info") as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"Save pregnancy user info failed: {response.status_code}")

    # 2. Get today's recommendation program
    with user.get_api("/pregnancy/today", catch_response=True, name="Pregnancy: Today recommendation") as response:
        # Note: 404 is allowed if there is no program seeded for today
        if response.status_code in [200, 404]:
            response.success()
        else:
            response.failure(f"Get pregnancy recommendation today failed: {response.status_code}")

    # 3. List all scheduled pregnancy programs
    with user.get_api("/pregnancy/programs", catch_response=True, name="Pregnancy: List Programs") as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"List pregnancy programs failed: {response.status_code}")

    # 4. View program details for a specific week
    week = random.randint(1, 40)
    with user.get_api(f"/pregnancy/week/{week}", catch_response=True, name="Pregnancy: Week Schedule") as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"Get pregnancy week schedule failed: {response.status_code}")
            
    # 5. View program details for a specific month
    month = random.randint(1, 9)
    # The route is /pregnancy/month/:month, let's verify if there is one. 
    # Yes, pregnancyRoutes.get("/month/:month") in routes definition.
    with user.get_api(f"/pregnancy/month/{month}", catch_response=True, name="Pregnancy: Month Schedule") as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"Get pregnancy month schedule failed: {response.status_code}")
