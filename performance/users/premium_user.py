from locust import task, between
from performance.users.base_user import BaseSanjeevaniUser
from performance.scenarios import authentication, browsing, streaming, progress, favorites, subscriptions, pregnancy

class PremiumUser(BaseSanjeevaniUser):
    # Premium User represents 20% of the virtual user traffic in our modeling
    weight = 20
    wait_time = between(1, 4)

    def on_start(self):
        """Register, log in, and subscribe the user to premium plan."""
        authentication.register_and_login(self)
        self.subscription_tier = "premium"
        subscriptions.subscribe_user(self, plan_id="premium")
        self.initialize_track_and_program()

    @task(10)
    def browse(self):
        """Browse catalogs, categories, continue listening, and details."""
        browsing.browse_catalog(self)

    @task(25)
    def play_premium_content(self):
        """Simulate HLS streaming playback of premium encrypted tracks including AES key fetches."""
        streaming.stream_premium_track_flow(self)

    @task(10)
    def pregnancy_program_flow(self):
        """Interact with the pregnancy program dashboard and recommendations."""
        pregnancy.pregnancy_scenario(self)

    @task(8)
    def favorite_actions(self):
        """List and toggle favorites."""
        favorites.favorite_flow(self)

    @task(12)
    def progress_updates(self):
        """Simulate playback progress updates and synchronization."""
        progress.progress_flow(self)
