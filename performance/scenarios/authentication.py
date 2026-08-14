import logging
from performance.config import DEFAULT_CATEGORY

logger = logging.getLogger("performance_test")

def register_and_login(user):
    """Registers a user profile and logs in to get auth tokens."""
    # 1. Register User
    register_payload = {
        "email": user.email,
        "password": user.password,
        "fullName": user.full_name,
        "category": DEFAULT_CATEGORY
    }
    
    with user.post_api("/auth/register", json=register_payload, require_auth=False, catch_response=True) as response:
        if response.status_code == 201:
            response.success()
        elif response.status_code == 409:
            # Account already exists (can happen during repeated tests)
            response.success()
        else:
            response.failure(f"Registration failed with code {response.status_code}: {response.text}")
            return False

    # 2. Login User
    login_payload = {
        "email": user.email,
        "password": user.password
    }
    
    with user.post_api("/auth/login", json=login_payload, require_auth=False, catch_response=True) as response:
        if response.status_code == 200:
            data = response.json().get("data", {})
            tokens = data.get("tokens", {})
            user_data = data.get("user", {})
            
            user.token = tokens.get("accessToken")
            user.refresh_token = tokens.get("refreshToken")
            user.user_id = user_data.get("id")
            
            if not user.token:
                response.failure("Login response did not contain accessToken")
                return False
            response.success()
            return True
        else:
            response.failure(f"Login failed with code {response.status_code}: {response.text}")
            return False

def refresh_token_flow(user):
    """Refreshes the JWT access token using the refresh token."""
    if not user.refresh_token:
        return False
        
    payload = {
        "refreshToken": user.refresh_token
    }
    
    with user.post_api("/auth/refresh", json=payload, require_auth=False, catch_response=True) as response:
        if response.status_code == 200:
            data = response.json().get("data", {})
            tokens = data.get("tokens", {})
            user.token = tokens.get("accessToken")
            user.refresh_token = tokens.get("refreshToken")
            response.success()
            return True
        else:
            response.failure(f"Token refresh failed with code {response.status_code}: {response.text}")
            return False

def get_profile_flow(user):
    """Retrieves current user details via /auth/me."""
    with user.get_api("/auth/me", catch_response=True) as response:
        if response.status_code == 200:
            response.success()
        else:
            response.failure(f"Fetching profile failed with code {response.status_code}")

def logout_flow(user):
    """Logs out user session and resets tokens."""
    with user.post_api("/auth/logout", catch_response=True) as response:
        if response.status_code == 200:
            user.token = None
            user.refresh_token = None
            response.success()
        else:
            response.failure(f"Logout failed with code {response.status_code}")
