from locust import task, between
from performance.users.base_user import BaseSanjeevaniUser
from performance.scenarios import authentication, browsing, streaming, progress, favorites

class FreeUser(BaseSanjeevaniUser):
    # Free User represents 50% of the virtual user traffic in our modeling
    weight = 50
    wait_time = between(2, 5)

    def on_start(self):
        """Register and log in the free user on session start."""
        authentication.register_and_login(self)
        self.subscription_tier = "free"
        self.initialize_track_and_program()

    @task(15)
    def browse(self):
        """Browse catalog, list tracks, check tags and detail endpoints."""
        browsing.browse_catalog(self)

    @task(20)
    def play_free_content(self):
        """Simulate HLS streaming playback for a free track."""
        streaming.stream_free_track_flow(self)

    @task(5)
    def verify_premium_is_blocked(self):
        """Verify access control: ensure premium tracks return 403 Forbidden."""
        streaming.verify_premium_access_rejected(self)

    @task(8)
    def favorite_actions(self):
        """List favorites and toggle free track favorites."""
        favorites.favorite_flow(self)

    @task(5)
    def progress_updates(self):
        """Simulate manual progress synchronization."""
        progress.progress_flow(self)
