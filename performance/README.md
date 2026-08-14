# 🚀 Krishna Sanjeevani — Locust Performance Test Suite

This directory contains the Locust-based load testing and user-simulation suite for the **Krishna Sanjeevani** therapeutic streaming platform. It models stateful virtual users, tests critical API flows, and validates high-load HLS streaming capacity under progressive concurrency tiers.

---

## 📂 Directory Layout

```
performance/
├── requirements.txt      # Python dependencies (Locust)
├── config.py            # Safety checks & environment overrides
├── locustfile.py        # Locust main entrypoint
├── README.md            # Execution guide (this file)
│
├── users/               # Virtual user stateful profile models
│   ├── __init__.py
│   ├── base_user.py     # Base HTTP class with utility helpers
│   ├── free_user.py     # Free tier user behaviors (weighted)
│   ├── standard_user.py # Standard subscriber simulation
│   └── premium_user.py  # Premium subscriber simulation (encrypted HLS, pregnancy)
│
├── scenarios/           # Modular task behaviors
│   ├── __init__.py
│   ├── authentication.py# Register, login, refresh, logout
│   ├── browsing.py      # Programs, tracks lists, tags, details
│   ├── streaming.py     # HLS playlists, tickets, AES keys, segments
│   ├── progress.py      # Throttled playback sync updates
│   ├── favorites.py     # Check, add, list, remove favorites
│   ├── pregnancy.py     # Pregnancy schedules, recommendations
│   └── subscriptions.py # Order plans & verify mock subscription payments
│
└── reports/             # Local directory for HTML and CSV outputs
```

---

## 🔒 Environment Safety Controls

To prevent accidental load injection against production services, the suite performs an automated check on the target `LOCUST_BASE_URL`.

* If the target host is **remote** (i.e. does not contain `localhost` or `127.0.0.1`), the suite **requires** an explicit safety flag to run.
* If the safety flags are missing, execution terminates immediately.

Set either of the following environment variables to authorize testing against remote endpoints:
```powershell
# Set staging environment flag (Recommended for remote)
$env:PERFORMANCE_TEST_ENV="staging"

# Or force-allow load testing override
$env:ALLOW_LOAD_TEST="true"
```

---

## 🛠️ Installation & Setup

1. Make sure you have **Python 3.10+** installed on your system.
2. In your PowerShell terminal, navigate to the project directory and install dependencies:
   ```powershell
   pip install -r performance/requirements.txt
   ```

---

## 🖥️ Running the Web UI

To launch Locust with its built-in interactive dashboard:
```powershell
# Start Locust and bind it to localhost:8089 UI
locust -f performance/locustfile.py
```
Open **`http://localhost:8089`** in your browser to configure target users, spawn rate, and host URL.

---

## ⚙️ Command-Line Interface (Headless Run)

For CI/CD pipelines, headless testing, or automated runs, use the command-line interface.

### 1. Sanity Check / Tier 1 (100 Users)
* **Goal**: 100 concurrent users
* **Ramp rate**: 10 users/sec
* **Duration**: 30 minutes
```powershell
locust -f performance/locustfile.py --headless -u 100 -r 10 -t 30m --host="http://localhost:8787" --html="performance/reports/tier1_report.html" --csv="performance/reports/tier1_stats"
```

### 2. Stress Test / Tier 2 (1,000 Users)
* **Goal**: 1,000 concurrent users
* **Ramp rate**: 50 users/sec
* **Duration**: 1 hour
```powershell
locust -f performance/locustfile.py --headless -u 1000 -r 50 -t 1h --host="http://localhost:8787" --html="performance/reports/tier2_report.html" --csv="performance/reports/tier2_stats"
```

### 3. Distributed Production Test / Tier 3 (10,000 Users)
* **Goal**: 10,000 concurrent users (distributed mode)
```powershell
# Run the Master coordinator
locust -f performance/locustfile.py --master --headless -u 10000 -r 500 -t 2h --host="https://staging.backend.workers.dev" --html="performance/reports/tier3_report.html"

# Run Worker instances (on separate terminal windows or machines)
locust -f performance/locustfile.py --worker --master-host="127.0.0.1"
```

### 4. Distributed Bottleneck Hunt / Tier 4 (100,000 Users)
* **Goal**: 100,000 concurrent users (distributed mode)
```powershell
# Run Master coordinator with high scale
locust -f performance/locustfile.py --master --headless -u 100000 -r 1000 -t 3h --host="https://staging.backend.workers.dev" --html="performance/reports/tier4_report.html"

# Run Worker instances
locust -f performance/locustfile.py --worker --master-host="<MASTER_IP_ADDRESS>"
```

---

## 📈 Custom Streaming Metrics Captured

Locust will report standard HTTP analytics alongside these specific HLS streaming KPIs:
* **`HLS: Ticket Generation`**: Latency to request and store a sliding-window playback ticket.
* **`HLS: Playlist Fetch`**: Latency to retrieve and rewrite `master.m3u8`.
* **`HLS: Decryption Key Fetch`**: Latency to request the AES-128 cryptographic key.
* **`HLS: Segment Fetch`**: Latency to stream single audio segment file (.mp3).
* **`Stream Start Success`**: Custom counter fired upon ticket and playlist resolution.
* **`Stream Start Failure`**: Fired when streaming fails to start.
* **`Segment Served`**: Total segments downloaded successfully.
* **`Segment Failure`**: Segment requests that failed or timed out.
