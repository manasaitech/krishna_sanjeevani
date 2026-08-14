import uuid
from locust import HttpUser
from performance.config import TEST_PASSWORD, TEST_EMAIL_PREFIX

class BaseSanjeevaniUser(HttpUser):
    # Abstract class, do not instantiate directly in Locust runner
    abstract = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = None
        self.refresh_token = None
        self.user_id = None
        # Generate a unique email for each virtual user instance
        self.email = f"{TEST_EMAIL_PREFIX}_{uuid.uuid4().hex[:8]}@example.com"
        self.password = TEST_PASSWORD
        self.full_name = f"Perf User {self.email.split('@')[0]}"
        
        # State variables for HLS streaming and progress scenarios
        self.selected_track_id = None
        self.selected_program_id = None
        self.playback_position = 0
        self.playback_duration = 0
        self.subscription_tier = "free"

    def get_headers(self, require_auth=True) -> dict:
        """Helper to construct HTTP headers including security bypasses and authorization."""
        headers = {
            # Skip the backend's browser check by not sending browser user agents,
            # or send a custom User-Agent that doesn't contain Mozilla, Chrome, or Safari
            "User-Agent": "Locust-Sanjeevani-Test/1.0",
            "Referer": "http://localhost:3000/",
            "Sec-Fetch-Site": "same-origin",
            "Accept": "application/json",
        }
        if require_auth and self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def post_api(self, path: str, json: dict = None, require_auth: bool = True, name: str = None, **kwargs):
        """Helper for HTTP POST request with automatic header injection."""
        url = f"/api/v1{path}"
        headers = self.get_headers(require_auth=require_auth)
        if "headers" in kwargs:
            headers.update(kwargs.pop("headers"))
        return self.client.post(url, json=json, headers=headers, name=name or path, **kwargs)

    def get_api(self, path: str, params: dict = None, require_auth: bool = True, name: str = None, **kwargs):
        """Helper for HTTP GET request with automatic header injection."""
        url = f"/api/v1{path}"
        headers = self.get_headers(require_auth=require_auth)
        if "headers" in kwargs:
            headers.update(kwargs.pop("headers"))
        return self.client.get(url, params=params, headers=headers, name=name or path, **kwargs)

    def patch_api(self, path: str, json: dict = None, require_auth: bool = True, name: str = None, **kwargs):
        """Helper for HTTP PATCH request with automatic header injection."""
        url = f"/api/v1{path}"
        headers = self.get_headers(require_auth=require_auth)
        if "headers" in kwargs:
            headers.update(kwargs.pop("headers"))
        return self.client.patch(url, json=json, headers=headers, name=name or path, **kwargs)

    def delete_api(self, path: str, require_auth: bool = True, name: str = None, **kwargs):
        """Helper for HTTP DELETE request with automatic header injection."""
        url = f"/api/v1{path}"
        headers = self.get_headers(require_auth=require_auth)
        if "headers" in kwargs:
            headers.update(kwargs.pop("headers"))
        return self.client.delete(url, headers=headers, name=name or path, **kwargs)

    def initialize_track_and_program(self):
        """Fetches tracks and programs from backend to set initial valid IDs, avoiding cold-start 404s."""
        import random
        # 1. Fetch programs
        response = self.get_api("/programs", require_auth=False)
        if response.status_code == 200:
            data = response.json().get("data", {}).get("data", [])
            if data:
                self.selected_program_id = random.choice(data).get("id")
        # 2. Fetch tracks
        response = self.get_api("/tracks", require_auth=False)
        if response.status_code == 200:
            data = response.json().get("data", {}).get("data", [])
            if data:
                self.selected_track_id = random.choice(data).get("id")
