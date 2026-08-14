import os
import logging
from locust import events
from performance.users import FreeUser, StandardUser, PremiumUser

# Ensure report directory exists
os.makedirs("performance/reports", exist_ok=True)

logger = logging.getLogger("performance_test")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    logger.info("*" * 60)
    logger.info("🚀 Starting Krishna Sanjeevani Performance Test Suite")
    logger.info(f"Target Host: {environment.host}")
    logger.info(f"Report Directory: {os.path.abspath('performance/reports')}")
    logger.info("*" * 60)

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    logger.info("*" * 60)
    logger.info("🏁 Performance Test Run Completed successfully")
    logger.info("*" * 60)

# Export user profiles to be discovered by Locust
__all__ = ["FreeUser", "StandardUser", "PremiumUser"]
