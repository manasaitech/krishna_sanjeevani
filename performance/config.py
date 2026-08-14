import os
import sys
import logging

# Configure logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("performance_test")

# Base URL setup
BASE_URL = os.getenv("LOCUST_BASE_URL", "http://localhost:8787").rstrip("/")

# Safety Checks Configuration
ENV_SAFETY_FLAG = os.getenv("PERFORMANCE_TEST_ENV", "")
ALLOW_LOAD_TEST = os.getenv("ALLOW_LOAD_TEST", "false").lower() == "true"

# Define what constitutes production or dangerous URLs
def is_local_url(url: str) -> bool:
    return "localhost" in url or "127.0.0.1" in url

# Safety Check Execution
is_local = is_local_url(BASE_URL)
is_staging = ENV_SAFETY_FLAG == "staging"
is_safe = is_local or is_staging or ALLOW_LOAD_TEST

if not is_safe:
    logger.error("=" * 60)
    logger.error("🔴 ENVIRONMENT SAFETY ABORT 🔴")
    logger.error(f"Target URL: {BASE_URL}")
    logger.error("You are attempting to run a performance test against a remote/production URL")
    logger.error("without providing the proper safety overrides.")
    logger.error("To bypass this, you must set either:")
    logger.error("  PERFORMANCE_TEST_ENV=staging")
    logger.error("  ALLOW_LOAD_TEST=true")
    logger.error("=" * 60)
    sys.exit(1)
else:
    logger.info("=" * 60)
    logger.info(f"✅ Target URL: {BASE_URL}")
    logger.info(f"✅ Environment Flag: {ENV_SAFETY_FLAG or 'Local/Default'}")
    logger.info(f"✅ Proceeding with performance test configuration...")
    logger.info("=" * 60)

# Test Data Configurations (can be overridden via environment variables)
TEST_EMAIL_PREFIX = os.getenv("LOCUST_TEST_EMAIL_PREFIX", "perf_test_user")
TEST_PASSWORD = os.getenv("LOCUST_TEST_PASSWORD", "PerfTest123!")

# Track IDs for playback and access-control verification
FREE_TRACK_ID = os.getenv("LOCUST_FREE_TRACK_ID", "track-free-id")
PREMIUM_TRACK_ID = os.getenv("LOCUST_PREMIUM_TRACK_ID", "track-premium-id")

# Program IDs and category metadata
PROGRAM_ID = os.getenv("LOCUST_PROGRAM_ID", "prog-pregnancy-1")
PREGNANCY_CATEGORY = "pregnancy"
DEFAULT_CATEGORY = "devotional"
