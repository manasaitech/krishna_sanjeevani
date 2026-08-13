# 🔬 Krishna Sanjeevani — Performance Engineering Testing Plan
### Version 1.0 | August 2026

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Platform Architecture Overview](#2-platform-architecture-overview)
3. [Testing Methodology & Strategy](#3-testing-methodology--strategy)
4. [User Behavior Benchmarking Model](#4-user-behavior-benchmarking-model)
5. [HLS Streaming Load Model](#5-hls-streaming-load-model)
6. [Application Server Specs Analysis](#6-application-server-specs-analysis)
7. [Test Tier Specifications](#7-test-tier-specifications)
8. [Vertical vs Horizontal Scaling](#8-vertical-vs-horizontal-scaling)
9. [Cloudflare Service Limits & Pricing](#9-cloudflare-service-limits--pricing)
10. [Cost Estimation Report](#10-cost-estimation-report)
11. [Performance Metrics & KPIs](#11-performance-metrics--kpis)
12. [Bottleneck Identification Framework](#12-bottleneck-identification-framework)
13. [Testing Tools & Execution](#13-testing-tools--execution)
14. [Risk Assessment](#14-risk-assessment)
15. [Appendix: Glossary](#15-appendix-glossary)

---

## 1. Executive Summary

This document defines a comprehensive **Performance Engineering Testing Plan** for the **Krishna Sanjeevani** therapeutic raga streaming platform. The platform runs on a Cloudflare-First serverless architecture (Workers + D1 + R2 + Queues) and serves encrypted HLS audio streams to web and mobile clients.

### Objectives
- Establish baseline performance metrics at 100 concurrent users
- Progressively scale to 1,000 → 10,000 → 100,000 (1 Lakh) users
- Identify system bottlenecks at each tier before proceeding to the next
- Produce a detailed cost estimation for infrastructure at each scale
- Generate actionable scaling recommendations (vertical & horizontal)
- Create a monitoring dashboard for real-time performance visualization

### Testing Flow
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Tier 1  │───►│  Tier 2  │───►│  Tier 3  │───►│  Tier 4  │
│ 100 Users│    │ 1K Users │    │ 10K Users│    │ 1L Users │
│  SANITY  │    │  STRESS  │    │   PERF   │    │BOTTLENECK│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     ▼               ▼               ▼               ▼
  Baseline       Validate        Production       Breaking
  Metrics        Scaling         Readiness          Point
```

> **Key Principle:** We do NOT proceed to the next tier until all KPIs pass at the current tier.

---

## 2. Platform Architecture Overview

Krishna Sanjeevani uses a fully serverless Cloudflare stack with zero traditional servers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                              │
│                                                                         │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐             │
│   │  React Web   │    │ React Native │    │  Admin Panel │             │
│   │  (Vite/TS)   │    │   (Mobile)   │    │  (Curation)  │             │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘             │
│          └──────────────┬────┴───────────────────┘                      │
│                         ▼                                               │
│          ┌──────────────────────────────┐                               │
│          │   Cloudflare Workers (Hono)  │ ◄── Edge Compute (Global)    │
│          │     API Gateway + Auth       │                               │
│          └────┬────────┬────────┬───────┘                               │
│               │        │        │                                       │
│    ┌──────────▼─┐  ┌───▼────┐  ┌▼──────────────┐                      │
│    │ D1 (SQLite)│  │ Queues │  │ R2 (Object    │                       │
│    │ Relational │  │ Media  │  │  Storage)      │                      │
│    │ Metadata   │  │Pipeline│  │ HLS Segments   │                      │
│    │ 10GB Limit │  │        │  │ 10GB Free      │                      │
│    └────────────┘  └────────┘  └────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Critical Path for Performance
The **audio streaming flow** is the most latency-sensitive path:

```
User Click "Play" ──► POST /stream/:id/ticket (Auth + D1 Write)
                  ──► GET master.m3u8?ticket=xyz (D1 Read + R2 Read + URL Rewrite)
                  ──► GET keys/aes.key?ticket=xyz (D1 Read + R2 Read)
                  ──► GET audio/segment000.mp3?ticket=xyz (D1 Read + R2 Read)
                  ──► GET audio/segment001.mp3?ticket=xyz (D1 Read + R2 Read)
                  ──► ... (continues every 6 seconds)
```

---

## 3. Testing Methodology & Strategy

### 3.1 Testing Types

| Test Type | Purpose | When |
| :--- | :--- | :--- |
| **Sanity Check** | Verify system works under minimal load | Tier 1 (100 users) |
| **Stress Test** | Push system beyond normal capacity | Tier 2 (1,000 users) |
| **Performance Test** | Measure KPIs at production-expected load | Tier 3 (10,000 users) |
| **Soak Test** | Run extended duration to detect memory leaks | All tiers (2+ hours) |
| **Spike Test** | Sudden traffic burst (0 → Peak in 10s) | Tier 2+ |
| **Bottleneck Hunt** | Find the exact breaking point | Tier 4 (1,00,000 users) |

### 3.2 Progressive Escalation Strategy

```
Phase 1: RAMP-UP
  └── Start with 10% of target users
  └── Add 10% every 60 seconds
  └── Monitor latency P95 continuously

Phase 2: STEADY STATE
  └── Hold at target concurrency for 30 minutes
  └── Collect all metrics at steady state
  └── Record baseline histograms

Phase 3: SPIKE INJECTION
  └── Inject 2x sudden spike for 60 seconds
  └── Monitor error rate and recovery time
  └── Measure system elasticity

Phase 4: COOLDOWN
  └── Ramp down 20% every 30 seconds
  └── Verify system recovers to baseline
  └── Check for resource leaks
```

### 3.3 Pass/Fail Criteria per Tier

| Metric | Tier 1 (100) | Tier 2 (1K) | Tier 3 (10K) | Tier 4 (1L) |
| :--- | :--- | :--- | :--- | :--- |
| **P95 Latency** | ≤ 200ms | ≤ 500ms | ≤ 1000ms | ≤ 2000ms |
| **P99 Latency** | ≤ 500ms | ≤ 1000ms | ≤ 2000ms | ≤ 5000ms |
| **Error Rate** | 0% | ≤ 0.1% | ≤ 0.5% | ≤ 1% |
| **RPS Achieved** | ≥ 33 | ≥ 333 | ≥ 3,333 | ≥ 33,333 |
| **Apdex Score** | ≥ 0.95 | ≥ 0.90 | ≥ 0.85 | ≥ 0.75 |
| **TTFB (Time to First Byte)** | ≤ 100ms | ≤ 200ms | ≤ 500ms | ≤ 1000ms |

---

## 4. User Behavior Benchmarking Model

### 4.1 Base User Profile

Based on mentor's guidance, a typical user session is modeled as:

| Parameter | Value | Notes |
| :--- | :--- | :--- |
| **Requests per user** | 1 every 3 seconds | Active streaming session |
| **Sessions per day** | 2 sessions | Morning raga + Evening raga |
| **Requests per session** | 20 requests | ~60 seconds of browsing + streaming |
| **Average session duration** | 15 minutes | Typical therapeutic listening session |
| **Songs played per session** | 2-3 songs | Each 5-10 minutes long |
| **Peak usage hours** | 6-8 AM, 8-10 PM IST | Morning meditation + Night sleep aid |
| **Peak-to-average ratio** | 3:1 | 3x normal traffic during peak |

### 4.2 Request Distribution per Session

A single user session generates the following API calls:

```
SESSION START
├── 1x  POST /auth/login          (or token refresh)
├── 1x  GET  /programs             (browse catalog)
├── 2x  GET  /tracks?programId=    (view track list)
├── 1x  GET  /pregnancy/dashboard  (if pregnant user)
│
├── SONG PLAY #1 (5-minute raga)
│   ├── 1x  POST /stream/:id/ticket       (session ticket)
│   ├── 1x  GET  /stream/:id/master.m3u8  (playlist)
│   ├── 1x  GET  /stream/:id/keys/aes.key (decryption key)
│   └── 50x GET  /stream/:id/audio/segmentXXX.mp3 (50 × 6s = 300s = 5min)
│
├── SONG PLAY #2 (5-minute raga)
│   ├── 1x  POST /stream/:id/ticket
│   ├── 1x  GET  /stream/:id/master.m3u8
│   ├── 1x  GET  /stream/:id/keys/aes.key
│   └── 50x GET  /stream/:id/audio/segmentXXX.mp3
│
├── 1x  POST /progress/update     (listening progress)
├── 1x  POST /favorites/toggle    (favorite a track)
└── 1x  GET  /tracks/:id          (track details)
SESSION END

TOTAL REQUESTS PER SESSION: ~112 requests
TOTAL REQUESTS PER DAY (2 sessions): ~224 requests/user/day
```

### 4.3 Requests per Second at Each Tier

| Tier | Concurrent Users | Requests/sec (Steady) | Peak RPS (3x) | Requests/day |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | 100 | 33 | 100 | 22,400 |
| **Tier 2** | 1,000 | 333 | 1,000 | 224,000 |
| **Tier 3** | 10,000 | 3,333 | 10,000 | 2,240,000 |
| **Tier 4** | 1,00,000 | 33,333 | 100,000 | 22,400,000 |

> **Formula:** `RPS = Concurrent_Users × (1 request / 3 seconds) = Users / 3`

---

## 5. HLS Streaming Load Model

### 5.1 Audio Segment Specifications

| Parameter | Value |
| :--- | :--- |
| Segment duration | 6 seconds |
| Chunk fetch interval | Every 6 seconds (continuous playback) |
| Segments per 36-sec chunk | 6 segments |
| Average segment size | 100-150 KB (128kbps encoded) |
| AES-128 encrypted | Yes (AES-CBC mode) |
| Decryption key fetch | 1x per track (cached by player) |
| Playlist fetch | 1x per track |

### 5.2 Streaming Bandwidth Model

When a user clicks "Play", the application server must deliver:

```
FIRST 36 SECONDS OF PLAYBACK:
┌─────────────────────────────────────────────────────────────┐
│ Request #1: POST ticket        (~200 bytes)                 │
│ Request #2: GET master.m3u8   (~2 KB)                       │
│ Request #3: GET aes.key       (~16 bytes)                   │
│ Request #4: GET segment000    (~120 KB)                     │
│ Request #5: GET segment001    (~120 KB)     ← 6s later      │
│ Request #6: GET segment002    (~120 KB)     ← 12s later     │
│ Request #7: GET segment003    (~120 KB)     ← 18s later     │
│ Request #8: GET segment004    (~120 KB)     ← 24s later     │
│ Request #9: GET segment005    (~120 KB)     ← 30s later     │
└─────────────────────────────────────────────────────────────┘
TOTAL DATA: ~722 KB for 36 seconds of audio
```

### 5.3 Bandwidth Requirements per Tier

| Tier | Concurrent Streamers | Segments/sec | Bandwidth (Mbps) | Monthly Transfer |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | 100 | 17 | 16 Mbps | ~160 GB |
| **Tier 2** | 1,000 | 167 | 160 Mbps | ~1.6 TB |
| **Tier 3** | 10,000 | 1,667 | 1.6 Gbps | ~16 TB |
| **Tier 4** | 1,00,000 | 16,667 | 16 Gbps | ~160 TB |

> **Key Advantage:** Cloudflare R2 has **zero egress fees**, so bandwidth cost = $0 regardless of tier!

---

## 6. Application Server Specs Analysis

### 6.1 Traditional Server Spec Reference (If Self-Hosted)

Since Krishna Sanjeevani uses Cloudflare Workers (serverless), there are no physical servers to configure. However, for reference and comparison, here is what equivalent dedicated server specs would look like:

| Specification | Tier 1 (100 Users) | Tier 2 (1K Users) | Tier 3 (10K Users) | Tier 4 (1L Users) |
| :--- | :--- | :--- | :--- | :--- |
| **NIC Switch** | 1 GBps | 1 GBps | 10 GBps | 10 GBps (bonded) |
| **RAM** | 4 GB DDR4 | 16 GB DDR4 | 64 GB DDR5 | 256 GB DDR5 |
| **CPU Frequency** | 2.4 GHz | 3.0 GHz | 3.5 GHz | 3.8 GHz+ |
| **CPU Cores** | 2 cores | 4 cores | 16 cores | 64 cores |
| **Microprocessor** | Intel i3 / AMD Ryzen 3 | Intel i5 / AMD Ryzen 5 | Intel Xeon E / AMD EPYC | Dual AMD EPYC 9004 |
| **Disk** | 100 GB SSD | 500 GB NVMe | 2 TB NVMe RAID | 8 TB NVMe RAID10 |
| **Est. Monthly Cost** | ₹2,000-3,000 | ₹8,000-12,000 | ₹40,000-60,000 | ₹2,00,000-4,00,000 |

### 6.2 NIC (Network Interface Card) Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                NIC THROUGHPUT CALCULATIONS                       │
│                                                                  │
│  1 GBps NIC = 1,000 Mbps = 125 MBps                            │
│                                                                  │
│  Each HLS segment ≈ 120 KB                                      │
│  Segments a 1 GBps NIC can serve/sec = 125,000 / 120 ≈ 1,041   │
│  Users supported @ 1 segment/6sec = 1,041 × 6 = 6,246 users    │
│                                                                  │
│  10 GBps NIC = 10,000 Mbps = 1,250 MBps                        │
│  Segments a 10 GBps NIC can serve/sec = 10,416                  │
│  Users supported @ 1 segment/6sec = 10,416 × 6 = 62,500 users  │
│                                                                  │
│  CONCLUSION: For 1 Lakh users, need bonded 10GBps or 25GBps NIC│
└─────────────────────────────────────────────────────────────────┘
```

> **With Cloudflare Workers:** NIC is irrelevant — Cloudflare's global network handles all bandwidth at edge locations worldwide with built-in multi-terabit capacity.

### 6.3 RAM Analysis (Per-Connection Memory Model)

| Component | Memory per Connection | 100 Users | 1K Users | 10K Users | 1L Users |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TCP Socket Buffer | 64 KB | 6.4 MB | 64 MB | 640 MB | 6.4 GB |
| TLS Session State | 32 KB | 3.2 MB | 32 MB | 320 MB | 3.2 GB |
| HTTP/2 Context | 16 KB | 1.6 MB | 16 MB | 160 MB | 1.6 GB |
| Application State | 8 KB | 0.8 MB | 8 MB | 80 MB | 800 MB |
| **TOTAL per User** | **120 KB** | **12 MB** | **120 MB** | **1.2 GB** | **12 GB** |
| OS + Runtime Overhead | — | 2 GB | 2 GB | 4 GB | 8 GB |
| **Total RAM Needed** | — | **~4 GB** | **~16 GB** | **~8 GB** | **~32 GB** |

> **With Cloudflare Workers:** Each Worker invocation gets 128 MB memory limit. Memory is stateless (freed after each request). No cumulative memory concern.

### 6.4 CPU Analysis (Cores vs Concurrency)

```
TRADITIONAL SERVER CPU BUDGET:
┌─────────────────────────────────────────────────────┐
│ Average request processing time: 5ms CPU            │
│                                                     │
│ Single core capacity:                               │
│   1000ms / 5ms = 200 requests/sec/core              │
│                                                     │
│ Required cores:                                     │
│   Tier 1:    33 RPS →  1 core  (16% util)          │
│   Tier 2:   333 RPS →  2 cores (83% util)          │
│   Tier 3: 3,333 RPS → 17 cores (98% util)          │
│   Tier 4: 33,333 RPS → 167 cores                   │
│                                                     │
│ With 70% target utilization headroom:               │
│   Tier 1:  2 cores   Tier 2:  4 cores               │
│   Tier 3: 24 cores   Tier 4: 238 cores              │
└─────────────────────────────────────────────────────┘

CLOUDFLARE WORKERS CPU BUDGET:
┌─────────────────────────────────────────────────────┐
│ CPU time limit per request: 30,000ms (Paid)         │
│ Configurable up to: 300,000ms (5 minutes)           │
│                                                     │
│ Actual CPU time per request:                        │
│   Simple API call:        1-5ms                     │
│   Streaming segment:      2-10ms                    │
│   Auth + DB query:        5-15ms                    │
│   Ticket + Playlist:      10-30ms                   │
│                                                     │
│ Included: 30M CPU-ms/month                          │
│ At avg 10ms per request:                            │
│   3,000,000 requests/month included                 │
│   = 100,000 requests/day                            │
│   = ~1.15 RPS sustained (included free)             │
└─────────────────────────────────────────────────────┘
```

---

## 7. Test Tier Specifications

### 7.1 Tier 1: Sanity Check (100 Users)

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 1: SANITY CHECK                                       │
│  Target: 100 Concurrent Users                               │
│  Duration: 30 minutes steady state                          │
│  Purpose: Baseline validation, ensure system works          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ramp: 10 users/minute for 10 minutes → 100 users          │
│  Steady: Hold 100 users for 30 minutes                     │
│  Cool: Remove 25 users/minute for 4 minutes                │
│                                                             │
│  Expected Load:                                             │
│  ├── 33 RPS sustained                                      │
│  ├── ~17 HLS segments/sec                                  │
│  ├── ~16 Mbps bandwidth                                    │
│  ├── 60,000 total requests                                 │
│  └── D1: ~500 reads/sec, ~5 writes/sec                     │
│                                                             │
│  Key Metrics to Capture:                                    │
│  ├── P50, P75, P90, P95, P99 latency                       │
│  ├── TTFB (Time to First Byte)                              │
│  ├── Error rate (target: 0%)                                │
│  ├── Throughput (requests/sec)                              │
│  └── Worker CPU time distribution                           │
│                                                             │
│  Pass Criteria:                                             │
│  ├── P95 latency ≤ 200ms                                   │
│  ├── Error rate = 0%                                        │
│  ├── All HLS segments play without buffering                │
│  └── No Worker CPU time exceeded errors                     │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Tier 2: Stress Test (1,000 Users)

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 2: STRESS TEST                                        │
│  Target: 1,000 Concurrent Users                             │
│  Duration: 1 hour steady state                              │
│  Purpose: Validate auto-scaling, find first bottlenecks     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ramp: 50 users/minute for 20 minutes → 1,000 users        │
│  Steady: Hold 1,000 users for 1 hour                       │
│  Spike: Inject burst to 2,000 users for 2 minutes          │
│  Cool: Gradual ramp-down over 10 minutes                   │
│                                                             │
│  Expected Load:                                             │
│  ├── 333 RPS sustained, 1000 RPS peak                      │
│  ├── ~167 HLS segments/sec                                 │
│  ├── ~160 Mbps bandwidth                                   │
│  ├── 1,200,000 total requests                              │
│  └── D1: ~5,000 reads/sec, ~50 writes/sec                  │
│                                                             │
│  Focus Areas:                                               │
│  ├── D1 row read consumption rate                           │
│  ├── R2 Class B operation rate                              │
│  ├── Worker cold start frequency                            │
│  ├── HLS playlist rewrite latency under load                │
│  └── Session ticket validation at scale                     │
│                                                             │
│  Pass Criteria:                                             │
│  ├── P95 latency ≤ 500ms                                   │
│  ├── Error rate ≤ 0.1%                                     │
│  ├── Recovery from 2x spike within 30 seconds              │
│  └── No D1 rate limiting                                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Tier 3: Performance Test (10,000 Users)

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 3: PERFORMANCE TEST                                   │
│  Target: 10,000 Concurrent Users                            │
│  Duration: 2 hours steady state                             │
│  Purpose: Production readiness validation                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ramp: 500 users/minute for 20 minutes → 10,000 users      │
│  Steady: Hold 10,000 users for 2 hours                     │
│  Spike: Inject burst to 15,000 users for 5 minutes         │
│  Cool: Gradual ramp-down over 20 minutes                   │
│                                                             │
│  Expected Load:                                             │
│  ├── 3,333 RPS sustained, 10,000 RPS peak                  │
│  ├── ~1,667 HLS segments/sec                               │
│  ├── ~1.6 Gbps bandwidth                                   │
│  ├── 24,000,000 total requests                             │
│  └── D1: ~50,000 reads/sec, ~500 writes/sec                │
│                                                             │
│  Scaling Recommendations Triggered:                         │
│  ├── Add KV cache for track metadata                        │
│  ├── Enable Smart Placement for Workers                     │
│  ├── D1 read replica configuration                          │
│  └── R2 multi-region replication                            │
│                                                             │
│  Pass Criteria:                                             │
│  ├── P95 latency ≤ 1000ms                                  │
│  ├── Error rate ≤ 0.5%                                     │
│  ├── Sustained 2-hour run without degradation               │
│  └── Cost within projected budget (±15%)                    │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 Tier 4: Bottleneck Hunt (1,00,000 Users / 1 Lakh)

```
┌─────────────────────────────────────────────────────────────┐
│  TIER 4: BOTTLENECK HUNT                                    │
│  Target: 1,00,000 Concurrent Users                          │
│  Duration: Until breaking point identified                  │
│  Purpose: Find absolute system limits                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ramp: Incremental — 10K → 25K → 50K → 75K → 1L           │
│  Each step: Hold for 15 minutes, measure, proceed           │
│  Record exact point where KPIs degrade                      │
│                                                             │
│  Expected Load:                                             │
│  ├── 33,333 RPS sustained, 100,000 RPS peak                │
│  ├── ~16,667 HLS segments/sec                              │
│  ├── ~16 Gbps bandwidth                                    │
│  ├── 240,000,000+ total requests                           │
│  └── D1: ~500K reads/sec, ~5K writes/sec                   │
│                                                             │
│  Likely Bottleneck Points:                                  │
│  ├── D1 write throughput (session ticket creation)          │
│  ├── D1 10GB storage limit                                 │
│  ├── Worker subrequest limits (1000/request)                │
│  ├── Queue consumer processing speed                        │
│  └── Global DNS resolution capacity                         │
│                                                             │
│  Scaling Solutions for 1L+:                                 │
│  ├── D1 database sharding (user-based partitioning)         │
│  ├── Cloudflare KV for session ticket caching               │
│  ├── Durable Objects for stateful streaming sessions        │
│  ├── Multiple Worker routes (geo-split)                     │
│  └── CDN pre-caching of popular track segments              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Vertical vs Horizontal Scaling

### 8.1 Scaling Strategies Comparison

| Aspect | Vertical Scaling (Scale Up) | Horizontal Scaling (Scale Out) |
| :--- | :--- | :--- |
| **Definition** | Increase resources of a single unit | Add more parallel units |
| **In Cloudflare Context** | Increase CPU ms limit, enable Unbound Workers, upgrade D1 tier | Add KV caches, use read replicas, shard databases, geo-distribute |
| **Cost Model** | Linear increase (pay more per unit) | Sub-linear (distributed cost) |
| **Complexity** | Low (config change) | Medium-High (architecture change) |
| **Max Ceiling** | Limited by service plan caps | Theoretically unlimited |
| **Downtime** | Often zero (config change) | Zero (add more nodes) |
| **Best For** | Quick fixes, Tier 1-2 | Production scale, Tier 3-4 |

### 8.2 Vertical Scaling Configurations (Cloudflare)

```
┌─────────────────────────────────────────────────────────────┐
│              VERTICAL SCALING LEVERS                         │
│                                                              │
│  1. WORKER CPU TIME LIMIT                                    │
│     Default: 10ms → Increase to: 30,000ms (30s)            │
│     Max: 300,000ms (5 min) with Workers Unbound             │
│     Config: wrangler.jsonc → [limits] cpu_ms = 300000       │
│                                                              │
│  2. D1 DATABASE SIZE                                         │
│     Default: 5 GB included → Max: 10 GB per database        │
│     Action: Optimize queries, add indexes, prune old data    │
│                                                              │
│  3. R2 REQUEST RATE                                          │
│     No hard limit on individual operations                   │
│     Optimize: Use Range requests for partial segment reads   │
│                                                              │
│  4. QUEUE BATCH SIZE                                         │
│     Current: max_batch_size = 10                             │
│     Increase to: 100 (max allowed)                           │
│     Reduces queue consumer invocations                       │
│                                                              │
│  5. WORKER MEMORY                                            │
│     Standard: 128 MB per invocation                          │
│     Cannot be increased (hard limit)                         │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Horizontal Scaling Configurations (Cloudflare)

```
┌─────────────────────────────────────────────────────────────┐
│              HORIZONTAL SCALING LEVERS                        │
│                                                              │
│  1. CLOUDFLARE KV (Edge Cache Layer)                         │
│     ├── Cache track metadata at every edge location          │
│     ├── Cache program/catalog listings                       │
│     ├── 25M free reads/month, $0.50/M after                 │
│     └── Reduces D1 reads by 80-90%                          │
│                                                              │
│  2. D1 READ REPLICAS                                         │
│     ├── Automatic read replicas at edge locations            │
│     ├── Write primary remains central                        │
│     └── Near-zero latency reads globally                     │
│                                                              │
│  3. D1 DATABASE SHARDING                                     │
│     ├── Shard by user ID hash (up to 50K DBs/account)       │
│     ├── Each shard: 10 GB capacity                           │
│     ├── Total: 50K × 10GB = 500 TB theoretical max          │
│     └── Requires routing logic in Worker                     │
│                                                              │
│  4. MULTIPLE WORKER ROUTES                                   │
│     ├── Separate Workers for API vs Streaming                │
│     ├── Dedicated streaming Worker with higher CPU limit     │
│     └── Independent scaling and deployment                   │
│                                                              │
│  5. DURABLE OBJECTS (Stateful Sessions)                      │
│     ├── Replace D1 session tickets with DOs                  │
│     ├── Each DO handles one user's streaming state           │
│     ├── Built-in consistency guarantees                      │
│     └── Eliminates D1 write contention for tickets           │
│                                                              │
│  6. R2 MULTI-REGION                                          │
│     ├── Replicate popular tracks to multiple regions         │
│     ├── Reduce cross-region R2 fetch latency                 │
│     └── Automatic failover                                   │
│                                                              │
│  7. SMART PLACEMENT                                          │
│     ├── wrangler.jsonc: "placement": { "mode": "smart" }    │
│     ├── Auto-places Worker close to D1/R2 backend            │
│     └── Reduces backend fetch latency by 30-50%              │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 Scaling Decision Matrix

| Users | Recommended Strategy | Actions |
| :--- | :--- | :--- |
| **100** | No scaling needed | Run on base Workers Paid plan |
| **1,000** | Vertical only | Increase CPU ms, add D1 indexes |
| **10,000** | Vertical + Light Horizontal | Add KV cache, enable Smart Placement |
| **1,00,000** | Full Horizontal | KV + Sharding + Durable Objects + Multi-Worker |
| **10,00,000+** | Enterprise Horizontal | Enterprise plan + Dedicated support + Multi-region R2 |

---

## 9. Cloudflare Service Limits & Pricing

### 9.1 Workers Paid Plan (Base: $5/month ≈ ₹420/month)

| Resource | Included (Free) | Overage Cost |
| :--- | :--- | :--- |
| Requests | 10 million/month | $0.30 per million |
| CPU Time | 30 million CPU-ms/month | $0.02 per million CPU-ms |
| Memory | 128 MB per invocation | Hard limit |
| Subrequests | 1,000 per request | Hard limit |
| Script Size | 10 MB compressed | Hard limit |

### 9.2 D1 Database (Included with Workers Paid)

| Resource | Included (Free) | Overage Cost |
| :--- | :--- | :--- |
| Rows Read | 25 billion/month | $0.001 per million rows |
| Rows Written | 50 million/month | $1.00 per million rows |
| Storage | 5 GB | $0.75 per GB-month |
| Max DB Size | 10 GB | Shard to multiple DBs |

### 9.3 R2 Object Storage (10 GB Free)

| Resource | Included (Free) | Overage Cost |
| :--- | :--- | :--- |
| Storage | 10 GB/month | $0.015 per GB-month |
| Class A Ops (Writes) | 1 million/month | $4.50 per million |
| Class B Ops (Reads) | 10 million/month | $0.36 per million |
| Egress Bandwidth | **Unlimited** | **$0 (Zero!)** |

### 9.4 Queues

| Resource | Included (Free) | Overage Cost |
| :--- | :--- | :--- |
| Operations | 10,000/day (~300K/month) | $0.40 per million |
| Message Size | 128 KB | Larger = multiple ops |
| Retention | 4 days (configurable to 14) | — |

---

## 10. Cost Estimation Report

### 10.1 Assumptions

| Parameter | Value |
| :--- | :--- |
| Exchange Rate | $1 USD = ₹84 INR |
| Active days per month | 30 days |
| Avg CPU time per Worker request | 10ms |
| Avg D1 rows read per API request | 3 rows |
| Avg D1 rows written per session | 5 rows |
| R2 audio storage | 5 GB (200 tracks × 25 MB each) |
| Sessions per user per day | 2 |
| Requests per session | 112 |

### 10.2 Tier 1: 100 Daily Active Users

| Service | Monthly Usage | Included Free | Billable | Monthly Cost ($) | Monthly Cost (₹) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Workers Base** | — | — | — | $5.00 | ₹420 |
| **Worker Requests** | 672,000 | 10,000,000 | 0 | $0.00 | ₹0 |
| **Worker CPU Time** | 6,720,000 ms | 30,000,000 | 0 | $0.00 | ₹0 |
| **D1 Rows Read** | 2,016,000 | 25,000,000,000 | 0 | $0.00 | ₹0 |
| **D1 Rows Written** | 30,000 | 50,000,000 | 0 | $0.00 | ₹0 |
| **D1 Storage** | 0.5 GB | 5 GB | 0 | $0.00 | ₹0 |
| **R2 Storage** | 5 GB | 10 GB | 0 | $0.00 | ₹0 |
| **R2 Class B (Reads)** | 600,000 | 10,000,000 | 0 | $0.00 | ₹0 |
| **Queues** | ~100 ops/day | 10,000/day | 0 | $0.00 | ₹0 |
| **TOTAL** | | | | **$5.00** | **₹420** |

> ✅ **100 users fits entirely within the Workers Paid base plan at ₹420/month ($5)**

---

### 10.3 Tier 2: 1,000 Daily Active Users

| Service | Monthly Usage | Included Free | Billable | Monthly Cost ($) | Monthly Cost (₹) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Workers Base** | — | — | — | $5.00 | ₹420 |
| **Worker Requests** | 6,720,000 | 10,000,000 | 0 | $0.00 | ₹0 |
| **Worker CPU Time** | 67,200,000 ms | 30,000,000 | 37,200,000 | $0.74 | ₹62 |
| **D1 Rows Read** | 20,160,000 | 25,000,000,000 | 0 | $0.00 | ₹0 |
| **D1 Rows Written** | 300,000 | 50,000,000 | 0 | $0.00 | ₹0 |
| **D1 Storage** | 1 GB | 5 GB | 0 | $0.00 | ₹0 |
| **R2 Storage** | 5 GB | 10 GB | 0 | $0.00 | ₹0 |
| **R2 Class B (Reads)** | 6,000,000 | 10,000,000 | 0 | $0.00 | ₹0 |
| **Queues** | ~500 ops/day | 10,000/day | 0 | $0.00 | ₹0 |
| **TOTAL** | | | | **$5.74** | **₹482** |

> ✅ **1,000 users costs only ₹482/month — still almost at base price!**

---

### 10.4 Tier 3: 10,000 Daily Active Users

| Service | Monthly Usage | Included Free | Billable | Monthly Cost ($) | Monthly Cost (₹) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Workers Base** | — | — | — | $5.00 | ₹420 |
| **Worker Requests** | 67,200,000 | 10,000,000 | 57,200,000 | $17.16 | ₹1,441 |
| **Worker CPU Time** | 672,000,000 ms | 30,000,000 | 642,000,000 | $12.84 | ₹1,079 |
| **D1 Rows Read** | 201,600,000 | 25,000,000,000 | 0 | $0.00 | ₹0 |
| **D1 Rows Written** | 3,000,000 | 50,000,000 | 0 | $0.00 | ₹0 |
| **D1 Storage** | 3 GB | 5 GB | 0 | $0.00 | ₹0 |
| **R2 Storage** | 10 GB | 10 GB | 0 | $0.00 | ₹0 |
| **R2 Class B (Reads)** | 60,000,000 | 10,000,000 | 50,000,000 | $18.00 | ₹1,512 |
| **R2 Class A (Writes)** | 100,000 | 1,000,000 | 0 | $0.00 | ₹0 |
| **Queues** | ~5,000 ops/day | 10,000/day | 0 | $0.00 | ₹0 |
| **KV (Recommended)** | 50,000,000 reads | 25,000,000 | 25,000,000 | $12.50 | ₹1,050 |
| **TOTAL** | | | | **$65.50** | **₹5,502** |

> ⚠️ **10,000 users costs ~₹5,500/month. R2 reads and Worker requests become significant.**

---

### 10.5 Tier 4: 1,00,000 Daily Active Users (1 Lakh)

| Service | Monthly Usage | Included Free | Billable | Monthly Cost ($) | Monthly Cost (₹) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Workers Base** | — | — | — | $5.00 | ₹420 |
| **Worker Requests** | 672,000,000 | 10,000,000 | 662,000,000 | $198.60 | ₹16,682 |
| **Worker CPU Time** | 6,720,000,000 ms | 30,000,000 | 6,690,000,000 | $133.80 | ₹11,239 |
| **D1 Rows Read** | 2,016,000,000 | 25,000,000,000 | 0 | $0.00 | ₹0 |
| **D1 Rows Written** | 30,000,000 | 50,000,000 | 0 | $0.00 | ₹0 |
| **D1 Storage** | 8 GB | 5 GB | 3 GB | $2.25 | ₹189 |
| **R2 Storage** | 50 GB | 10 GB | 40 GB | $0.60 | ₹50 |
| **R2 Class B (Reads)** | 600,000,000 | 10,000,000 | 590,000,000 | $212.40 | ₹17,842 |
| **R2 Class A (Writes)** | 1,000,000 | 1,000,000 | 0 | $0.00 | ₹0 |
| **Queues** | ~50,000 ops/day | 10,000/day | 1,200,000/month | $0.48 | ₹40 |
| **KV (Essential)** | 500,000,000 reads | 25,000,000 | 475,000,000 | $237.50 | ₹19,950 |
| **Durable Objects** | 100,000 DOs | — | 100,000 | ~$15.00 | ₹1,260 |
| **TOTAL** | | | | **$805.63** | **₹67,673** |

> 🔴 **1 Lakh users costs ~₹67,700/month. R2 reads are the #1 cost driver.**

---

### 10.6 Cost Summary Table

| Tier | Users | Monthly Cost ($) | Monthly Cost (₹) | Cost per User (₹) |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | 100 | $5.00 | ₹420 | ₹4.20 |
| **Tier 2** | 1,000 | $5.74 | ₹482 | ₹0.48 |
| **Tier 3** | 10,000 | $65.50 | ₹5,502 | ₹0.55 |
| **Tier 4** | 1,00,000 | $805.63 | ₹67,673 | ₹0.68 |

```
COST SCALING VISUALIZATION (₹/month):

   ₹67,673 │                                          ████
            │                                          ████
            │                                          ████
            │                                          ████
            │                                          ████
            │                                          ████
    ₹5,502  │                            ████          ████
      ₹482  │              ████          ████          ████
      ₹420  │  ████        ████          ████          ████
            └──────────────────────────────────────────────
               100         1,000        10,000      1,00,000
                          Daily Active Users
```

### 10.7 Cost Optimization Recommendations

| Optimization | Saves | Implementation |
| :--- | :--- | :--- |
| **Add KV Caching** | 60-80% of D1 reads | Cache track metadata, program lists |
| **CDN Segment Caching** | 40-60% of R2 reads | Cache popular track segments at edge |
| **Batch D1 Queries** | 30-50% of D1 operations | Combine multiple reads into single query |
| **Pre-generate Playlists** | 20% of Worker CPU | Cache modified m3u8 playlists in KV |
| **Use Workers Unbound** | Lower CPU cost | For long-running streaming handlers |

---

## 11. Performance Metrics & KPIs

### 11.1 Metrics to Monitor

```
┌─────────────────────────────────────────────────────────────────┐
│                 PERFORMANCE DASHBOARD METRICS                    │
│                                                                  │
│  LATENCY METRICS                                                │
│  ├── P50 (Median) Response Time                                 │
│  ├── P75 Response Time                                          │
│  ├── P90 Response Time                                          │
│  ├── P95 Response Time                                          │
│  ├── P99 Response Time                                          │
│  ├── TTFB (Time to First Byte)                                  │
│  └── TTLB (Time to Last Byte)                                   │
│                                                                  │
│  THROUGHPUT METRICS                                              │
│  ├── Requests Per Second (RPS)                                  │
│  ├── Bytes transferred per second                                │
│  ├── HLS Segments delivered per second                           │
│  └── Concurrent active connections                               │
│                                                                  │
│  ERROR METRICS                                                   │
│  ├── HTTP 4xx rate (client errors)                               │
│  ├── HTTP 5xx rate (server errors)                               │
│  ├── Worker CPU exceeded errors (1102)                           │
│  ├── D1 rate limit errors                                        │
│  └── Timeout rate                                                │
│                                                                  │
│  RESOURCE METRICS                                                │
│  ├── Worker CPU time (ms) per request                            │
│  ├── D1 rows read per request                                    │
│  ├── D1 rows written per request                                 │
│  ├── R2 Class B operations per second                            │
│  ├── R2 bandwidth utilization                                    │
│  └── Queue depth and processing lag                              │
│                                                                  │
│  BUSINESS METRICS                                                │
│  ├── Apdex Score (Application Performance Index)                 │
│  ├── Session success rate                                        │
│  ├── Audio buffering ratio                                       │
│  └── Cost per request ($)                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Histogram Buckets for Latency Distribution

| Bucket | Range | Expected % (Healthy) |
| :--- | :--- | :--- |
| Excellent | 0-50ms | 40-50% |
| Good | 50-100ms | 25-30% |
| Acceptable | 100-200ms | 15-20% |
| Tolerable | 200-500ms | 5-8% |
| Slow | 500-1000ms | 1-3% |
| Very Slow | 1000-2000ms | < 1% |
| Timeout | 2000ms+ | < 0.1% |

---

## 12. Bottleneck Identification Framework

### 12.1 Common Bottleneck Signatures

| Symptom | Likely Bottleneck | Diagnosis | Solution |
| :--- | :--- | :--- | :--- |
| P99 spikes but P50 stable | D1 write contention | Check session ticket inserts | Use Durable Objects or KV |
| All latencies increase linearly | Worker CPU saturation | Check CPU time metrics | Increase CPU limit or optimize code |
| Intermittent 5xx errors | Worker memory OOM | Check memory usage patterns | Reduce payload sizes |
| Streaming stalls after 5 min | Session ticket expiry race | Check sliding window logic | Increase ticket window |
| Error rate spikes at exact RPS | Cloudflare rate limiting | Check for 429 responses | Contact CF support, upgrade plan |
| Queue messages pile up | Consumer too slow | Check batch processing time | Increase batch size, add parallelism |

### 12.2 Bottleneck Test Protocol

```
BINARY SEARCH FOR BREAKING POINT:

Step 1: Test at 50,000 users → Pass? Continue. Fail? Binary search down.
Step 2: Test at 75,000 users → Pass? Continue. Fail? Binary search 50K-75K.
Step 3: Test at 62,500 users → Narrow down to ±1,000 user precision.
Step 4: Document exact breaking point and root cause.
Step 5: Apply fix → Re-test → Verify fix works.
Step 6: Find NEW breaking point after fix.
Step 7: Repeat until target tier is achieved.
```

---

## 13. Testing Tools & Execution

### 13.1 Recommended Load Testing Tools

| Tool | Purpose | Why |
| :--- | :--- | :--- |
| **k6 (Grafana)** | Primary load generator | JavaScript-based, supports HTTP/2, excellent histogram output |
| **Artillery** | Secondary/validation | YAML config, great for HLS streaming scenarios |
| **Cloudflare Analytics** | Server-side metrics | Native D1/R2/Worker metrics, zero-config |
| **Grafana + Prometheus** | Dashboard | Real-time metric visualization and alerting |
| **Custom HTML Dashboard** | Presentation | Self-contained report for mentor/stakeholders |

### 13.2 k6 Test Script Structure

```javascript
// k6 performance test for Krishna Sanjeevani
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const streamLatency = new Trend('stream_segment_latency');
const ticketLatency  = new Trend('ticket_request_latency');
const errorRate      = new Rate('errors');
const segmentsServed = new Counter('segments_served');

export const options = {
  stages: [
    { duration: '10m', target: 100  },  // Ramp to 100
    { duration: '30m', target: 100  },  // Steady at 100
    { duration: '10m', target: 1000 },  // Ramp to 1000
    { duration: '60m', target: 1000 },  // Steady at 1000
    { duration: '5m',  target: 0    },  // Cooldown
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'errors': ['rate<0.01'],
    'stream_segment_latency': ['p(95)<300'],
  },
};

export default function () {
  // 1. Request streaming ticket
  const ticketRes = http.post(BASE_URL + '/api/v1/stream/TRACK_ID/ticket');
  ticketLatency.add(ticketRes.timings.duration);

  // 2. Fetch HLS playlist
  const ticket = JSON.parse(ticketRes.body).ticket;
  http.get(BASE_URL + '/api/v1/stream/TRACK_ID/master.m3u8?ticket=' + ticket);

  // 3. Fetch 6 segments (simulating 36-second playback)
  for (let i = 0; i < 6; i++) {
    const segRes = http.get(BASE_URL + '/api/v1/stream/TRACK_ID/audio/segment' +
      String(i).padStart(3, '0') + '.mp3?ticket=' + ticket);
    streamLatency.add(segRes.timings.duration);
    segmentsServed.add(1);
    check(segRes, { 'segment OK': (r) => r.status === 200 });
    sleep(6); // Wait 6 seconds between segments
  }

  sleep(3); // Think time between songs
}
```

---

## 14. Risk Assessment

| Risk | Probability | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| D1 10GB storage limit hit | Medium | High | Plan database sharding at 7GB threshold |
| Worker CPU exceeded (Error 1102) | Low | High | Monitor CPU time, optimize crypto operations |
| R2 read costs exceed budget | High at 10K+ | Medium | Implement aggressive KV caching |
| Queue backlog during peak uploads | Low | Medium | Separate upload Worker from streaming Worker |
| Session ticket race conditions | Medium | High | Add distributed locks or use Durable Objects |
| Load testing tool limitations | Medium | Low | Use distributed k6 cloud runners |

---

## 15. Appendix: Glossary

| Term | Definition |
| :--- | :--- |
| **P50/P95/P99** | Percentile latency — the response time that X% of requests complete within |
| **RPS** | Requests Per Second — throughput measurement |
| **TTFB** | Time To First Byte — latency from request sent to first response byte |
| **TTLB** | Time To Last Byte — total transfer time for complete response |
| **Apdex** | Application Performance Index — user satisfaction score (0 to 1) |
| **HLS** | HTTP Live Streaming — Apple's adaptive streaming protocol |
| **AES-128** | Advanced Encryption Standard with 128-bit keys |
| **NIC** | Network Interface Card — network adapter hardware |
| **GBps** | Gigabits per second — network throughput unit |
| **Vertical Scaling** | Adding more resources to existing infrastructure (bigger machine) |
| **Horizontal Scaling** | Adding more instances/nodes (more machines) |
| **Soak Test** | Extended-duration test to detect slow resource leaks |
| **Spike Test** | Sudden traffic surge test to measure system elasticity |
| **D1** | Cloudflare's serverless SQLite database service |
| **R2** | Cloudflare's S3-compatible object storage (zero egress) |
| **KV** | Cloudflare Key-Value store — edge-distributed cache |
| **Durable Objects** | Cloudflare's stateful serverless compute primitive |
| **Class A/B Operations** | R2 operation types: A = writes/lists, B = reads/metadata |

---

*Document prepared for Krishna Sanjeevani Performance Engineering Review*  
*Last updated: August 13, 2026*
