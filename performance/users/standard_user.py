from locust import task, between
from performance.users.base_user import BaseSanjeevaniUser
from performance.scenarios import authentication, browsing, streaming, progress, favorites, subscriptions

class StandardUser(BaseSanjeevaniUser):
    # Standard User represents 30% of the virtual user traffic in our modeling
    weight = 30
    wait_time = between(2, 5)

    def on_start(self):
        """Register, log in, and subscribe the user to standard plan."""
        authentication.register_and_login(self)
        self.subscription_tier = "standard"
        subscriptions.subscribe_user(self, plan_id="standard")
        self.initialize_track_and_program()

    @task(15)
    def browse(self):
        """Browse catalog and categories."""
        browsing.browse_catalog(self)

    @task(20)
    def play_standard_content(self):
        """Simulate HLS streaming playback for standard/free tracks."""
        # Standard users have access to free and standard tracks
        streaming.stream_free_track_flow(self)

    @task(8)
    def favorite_actions(self):
        """List and toggle favorites."""
        favorites.favorite_flow(self)

    @task(10)
    def progress_updates(self):
        """Simulate progress updates and synchronization."""
        progress.progress_flow(self)
