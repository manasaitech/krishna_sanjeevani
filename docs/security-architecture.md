# Krishna Sanjeevani — Security Architecture Specification

## 1. Security Philosophy
Krishna Sanjeevani operates under a **Zero-Trust Media Access** model. Since client-side media playback components consume assets on public user devices, we assume all client environments are untrusted. Our security controls focus on preventing bulk asset harvesting, link sharing, and unauthorized hotlinking.

---

## 2. Ingestion Security
```
[Admin Web Panel]
       │ (Chunk-by-chunk 5MB parts upload)
       ▼
[Ingestion Bucket: songs/uploads/] (Private R2)
       │
       ▼ (Cloudflare Queue trigger)
[Queue Transcoding Worker]
       │
       ├─► Generates 16-byte random AES-128 key
       ├─► Encrypts segmented HLS MP3 chunks via Web Crypto AES-CBC
       ├─► Saves key privately at songs/processed/:trackId/keys/aes.key
       ▼
[Processed Bucket: songs/processed/] (Private R2)
```

### Ingestion Controls:
* **Role-Based Uploads:** Upload endpoints are restricted to authenticated accounts with `admin` or `super_admin` roles.
* **Multipart Chunk Ingestion:** Web Admin chunks large tracks into 5MB parts. If an upload fails, it is retried up to 3 times before failing gracefully.
* **Raw Upload Deletion:** Immediately after transcoding, the raw audio file in `songs/uploads/` is deleted to minimize storage footprints.

---

## 3. Streaming and Delivery Security
Playbacks are split into segmented chunks and encrypted, with temporary session boundaries.

```
[Player App]                 [Worker Proxy]                 [D1 Database]
     │                             │                              │
     ├─► POST /ticket ────────────►│                              │
     │   (Validate User JWT)       ├─► Check Active Sub ─────────►│
     │                             │   (Subscription Table)       │
     │                             ├─► Write Stream Session ─────►│
     │                             │   (Expires in 5 min)         │
     │◄─ Return Ticket & URL ──────┤                              │
     │                             │                              │
     ├─► GET master.m3u8?ticket ──►│                              │
     │                             ├─► Validate Stream Ticket ───►│
     │                             ├─► Slide Expiration +5m ─────►│
     │◄─ Rewritten Playlist ───────┤                              │
     │                             │                              │
     ├─► GET segment000.mp3?ticket►│                              │
     │◄─ Encrypted MP3 Segments ───┤                              │
     │                             │                              │
     └─► GET aes.key?ticket ──────►│                              │
     ◄─ Decryption Key ────────────┘                              
```

### Sliding-Window Session Tickets:
* Playback requests must pass a valid stream session ticket (`?ticket=TICKET_UUID`) in the query parameter.
* The ticket is validated dynamically against the D1 database.
* To prevent session hijacking or token leakage, each valid request extends the session expiration by **5 minutes** (sliding expiration).
* If a session ticket is expired, used for the wrong track, or accessed by a user whose subscription has lapsed, the Worker proxy immediately returns `403 Forbidden` or `401 Unauthorized`.

### AES-128 Segment Encryption:
* Playlists refer to keys relatively (`keys/aes.key`).
* The Worker proxy intercepts key requests, validates the ticket, fetches the key privately from R2, and serves it to the HLS player securely.
* Segments are encrypted in `AES-CBC` mode using a random 128-bit key and 128-bit IV generated per track.
* Standard web download attempts of `.mp3` segments return unplayable encrypted binary blobs unless the HLS client fetches the decryption key.

---

## 4. Storage Security
* **R2 Bucket Privacy:** The object store bucket has no public endpoints or read access bindings. All read/write operations must go through the Worker proxy.
* **Artwork Isolation:** The public file proxy route `/api/v1/storage/file/*` strictly enforces a prefix check: it **only** allows paths beginning with `images/` (such as thumbnails and album art). Any attempts to fetch `songs/` paths directly return `403 Forbidden`.
