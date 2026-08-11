# Krishna Sanjeevani — Storage & Security Implementation Audit

**Date of Audit:** August 11, 2026  
**Audited By:** Antigravity AI Code Architect  
**Purpose:** Focused security and implementation audit of:
1. Multipart/Chunked Upload
2. AES-128 HLS Segment Encryption
3. Download Protection Real-World Security Level
4. System Architecture Diagram Completeness and Quality

---

## 1. Executive Summary Table

| Feature | Status | Actually Implemented? | Integrated? | Tested? | Production Ready? |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Multipart Upload** | 🔴 NOT IMPLEMENTED | No | No | No | No |
| **AES Encryption** | 🔴 NOT IMPLEMENTED | No | No | No | No |
| **HLS Streaming** | 🟢 COMPLETE | Yes | Yes | Yes | Yes |
| **Download Protection** | 🟡 PARTIAL | Yes | Yes | Yes | No (Critical Security Gaps) |
| **Architecture Diagram** | 🟡 OUTDATED | Yes | Yes | N/A | No (Contains Inaccuracies) |

---

## 2. Multipart Upload Detailed Status

### Exact Implementation Status
* **Web Admin Upload:** Uses standard single-request `multipart/form-data` upload via HTML `FormData`. It is **not** chunked or split into multiple parts.
* **Mobile Upload:** Not applicable (uploads only happen from the Admin Web panel).
* **Backend Upload Endpoints:** Only a standard POST endpoint `/api/v1/storage/audio` exists, which reads the file entirely into memory via Hono's `c.req.parseBody()` and `file.arrayBuffer()`.
* **R2 Upload Logic:** Uses Cloudflare R2's `bucket.put()` API, which uploads the binary as a single blob.
* **Cloudflare R2 Bindings:** Bindings are defined in TypeScript types, but R2 multipart APIs (`createMultipartUpload`, `uploadPart`, `completeMultipartUpload`, `abortMultipartUpload`) are **not** invoked anywhere in the codebase.
* **Upload Session Handling & Part Management:** Non-existent.
* **Large-File Handling:** Files are limited to `50MB` maximum size by constraints, as the serverless Worker runtime would run out of memory trying to allocate larger buffers for standard single-blob uploads.
* **Retry/Resume Behavior:** Non-existent. Any network disruption during upload requires a full restart of the upload.
* **Queue Integration:** After the single-put upload to R2 completes successfully, a payload is posted to the Cloudflare Queue (`MEDIA_QUEUE`) to trigger asynchronous transcoding.

### Evidence & File Mappings
* **Frontend Web SDK (API Client):** [api.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/apps/web/src/lib/api.ts#L256-L284)  
  Creates standard HTML `FormData` and pings `/storage/upload/audio` using a single POST request:
  ```typescript
  uploadAudio: (file: File, trackId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (trackId) {
      formData.append("trackId", trackId);
    }
    return request<...>(`/storage/upload/audio`, { method: "POST", body: formData });
  }
  ```
* **Backend Storage Route:** [storage.route.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/modules/storage/storage.route.ts#L9-L10)  
  Declares the route pointing to `StorageController.uploadAudio`:
  ```typescript
  storage.post("/upload/audio", requireRole("admin", "super_admin"), StorageController.uploadAudio);
  ```
* **Backend Storage Controller:** [storage.controller.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/modules/storage/storage.controller.ts#L18-L74)  
  Parses request body, validates size limits, reads the array buffer, and triggers the upload:
  ```typescript
  const body = await c.req.parseBody();
  const file = body.file;
  // size checks against limit
  const buffer = await file.arrayBuffer();
  const result = await service.uploadFile(key, buffer, file.type);
  ```
* **Storage Service:** [storage.service.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/modules/storage/storage.service.ts#L12-L35)  
  Uploads data directly to Cloudflare R2 via a single `.put()` operation:
  ```typescript
  const object = await this.bucket.put(key, body, {
    httpMetadata: { contentType },
  });
  ```
* **Storage Constants:** [storage.constants.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/modules/storage/storage.constants.ts#L1-L2)  
  Enforces a hard limit on audio size:
  ```typescript
  AUDIO_SIZE_LIMIT: 50 * 1024 * 1024, // 50MB
  ```

### What Happens Instead
When an admin uploads a track, the frontend performs a standard multipart form post. The backend Worker downloads the entire request body into memory as an `ArrayBuffer`, put-uploads it to the ingest bucket under `songs/uploads/`, sends a message to `MEDIA_QUEUE` with the track metadata, and returns immediately. If the network drops or if the file exceeds 50MB, the request fails.

---

## 3. AES-128 HLS Segment Encryption Status

### Exact Implementation Status
* **HLS Segment Generation:** The backend segmenter splits the MP3 input file into small unencrypted MP3 segments (approx. 6 seconds each).
* **`.m3u8` Playlist:** The playlist generator builds a basic version 3 playlist containing plain relative paths to the unencrypted MP3 segments.
* **Key Generation & Storage:** No encryption keys (AES key files) are generated, stored in R2, or referenced.
* **Stream Proxy & Sessions:** The stream proxy `/api/v1/stream/...` parses the `.m3u8` from R2 and attempts to rewrite any `#EXT-X-KEY` tags. However, because the generated `.m3u8` has no encryption tags, this logic is bypassed.
* **AES Decryption Keys Endpoint:** An endpoint `/stream/:trackId/keys/:keyName` is defined in the Hono router but remains a **dead route**, as no key files exist or are requested.
* **Frontend/Mobile Playback:** Both platforms play unencrypted HLS segments natively using Hls.js (Web) or Expo AV (Mobile).

### Transcoding & Streaming Pipeline Flow
```
Uploaded MP3
     ↓ (Queue Consumer)
Segmented into unencrypted MP3 chunks using pure JS MP3 frame segmenter
     ↓
Uploaded directly to R2 under `songs/processed/${trackId}/audio/segment000.mp3`
     ↓
Plain unencrypted `master.m3u8` playlist written to R2 (No `#EXT-X-KEY` tag)
     ↓
User requests stream ticket -> Worker stores session ticket in D1 Database
     ↓
User fetches `master.m3u8?ticket=TICKET`
     ↓
Worker loads plain playlist -> Appends `?ticket=TICKET` query param to relative segments
     ↓
HLS Player receives manifest and requests unencrypted MP3 segments carrying the ticket
```

### Evidence & File Mappings
* **Queue Ingestion Worker:** [index.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/index.ts#L50-L71)  
  Iterates over chunks and writes them directly without encryption, generating a manifest with no key instructions:
  ```typescript
  for (let i = 0; i < segments.length; i++) {
    const segmentKey = `songs/processed/${trackId}/audio/segment${String(i).padStart(3, "0")}.mp3`;
    await storage.uploadFile(segmentKey, segments[i].data, "audio/mpeg");
  }
  let m3u8 = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${maxSegmentDuration}\n#EXT-X-MEDIA-SEQUENCE:0\n`;
  for (let i = 0; i < segments.length; i++) {
    m3u8 += `#EXTINF:${segments[i].duration.toFixed(3)},\naudio/segment${String(i).padStart(3, "0")}.mp3\n`;
  }
  ```
* **MP3 Segmenter:** [segmenter.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/shared/audio/segmenter.ts#L17-L165)  
  Only slices raw MP3 frame boundaries based on header sync words. It has no cryptographic logic.
* **Dead Decryption Key Route:** [stream.route.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/routes/stream.route.ts#L241-L270)  
  Serves key files from `keys/` directory in R2, which are never created:
  ```typescript
  stream.get("/:trackId/keys/:keyName", async (c) => {
    await verifyAndExtendSession(c, ticket, trackId);
    const file = await storage.getFile(`songs/processed/${trackId}/keys/${keyName}`);
    // Will throw 404 because key files are never uploaded
  });
  ```
* **Manifest Rewriting Logic:** [stream.route.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/routes/stream.route.ts#L212-L219)  
  Rewrites `#EXT-X-KEY` if it exists. Since the generated playlist has no such tag, this block never runs:
  ```typescript
  if (trimmed.includes('#EXT-X-KEY:METHOD=AES-128,URI="')) {
    // This condition is never met
  }
  ```

---

## 4. Download Protection Analysis

### Real-World Security Level Assessment
The streaming security architecture follows a gatekeeper model but contains **critical vulnerabilities** that make direct file downloading trivial for a motivated user:

1. **R2 Bucket Privacy:** The Cloudflare R2 bucket is private. No direct HTTP public access to the bucket is allowed, meeting basic security criteria.
2. **Raw MP3 Access (Post-Transcode):** The original raw uploaded MP3 is deleted from R2 immediately after transcoding (`backend/src/index.ts:L85`). This reduces the surface area for direct raw file exposure.
3. **The Public Storage Proxy Hole (CRITICAL SECURITY GAP):**  
   The endpoint `/api/v1/storage/file/*` mapped in [storage.route.ts](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/backend/src/modules/storage/storage.route.ts#L14) is **completely public** (no `requireAuth` or `requireRole` middleware). It takes the tail of the URL path and directly loads that key from the private bucket.  
   If a user knows a track ID, they can bypass the ticket system and authentication entirely by making a GET request directly to:  
   `GET /api/v1/storage/file/songs/processed/<trackId>/audio/segment000.mp3`  
   Because the key prefix is not restricted to `images/` or thumbnails, **every processed HLS segment is public and downloadable without restriction.**
4. **HLS Playlist/Segment Ticket Check:**  
   The route `/api/v1/stream/...` validates a 5-minute sliding session ticket. It also blocks simple direct pasting in browser windows by checking `Referer` and `Sec-Fetch-Site` header signatures.
5. **No Decryption Protection (Unencrypted Segments):**  
   Since HLS segments are standard unencrypted MP3 chunk files, any authenticated user streaming the track can download all the segment files from the network tab (or via the streaming endpoint) and concatenate them:
   ```bash
   copy /b segment000.mp3+segment001.mp3+segment002.mp3 full_track.mp3
   ```
   This means determined users can reconstruct the high-fidelity track easily.

---

## 5. System Architecture Diagram Status

### Status: 🟡 Existing but Outdated / Incomplete
An architecture overview exists in [architecture_design_decisions.md](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/docs/architecture_design_decisions.md) and [architecture.html](file:///c:/Users/ASUS/Desktop/Krishna-Sanjeevni/krishna-sanjeevani-flow-main/docs/architecture.html) alongside two PNG diagrams. However, the documentation is outdated and lacks detail on several core systems.

### Discrepancies and Inaccuracies vs. Code
* **Claims AES-128 Encryption is active:** Describes segment encryption and key serving endpoints as standard operating flow, which is untrue.
* **Claims "Multipart MP3" ingestion:** Suggests part-by-part chunked uploading, whereas it is actually a single-post `multipart/form-data` upload.

### Missing Core Features in Documentation
The documentation fails to describe or represent:
* **Feature Engines:** Pregnancy Engine (EDD-based raga matching), Listening History database triggers, Favorites lists, and Playback Progress sync.
* **Client Architecture:** Does not differentiate the Admin Console as a distinct security boundary (treats it as part of the public web React application).
* **Payment integrations:** Missing payment session routing, mock payment configurations, and Razorpay-ready webhook validation steps.
* **Notification Flow:** No description of push or web notification events.
* **External Integrations:** Completely misses Google OAuth ID token verification flows against Google JWKS.
* **Low-Level Design (LLD):** No separate database relationship diagrams or modular routing interaction diagrams exist.

---

## 6. Audit Evidence Logs

* **`backend/src/modules/storage/storage.service.ts`**  
  → `uploadFile` (uses `this.bucket.put()`)  
  → **Status: Mocked/Simulated Multipart** (No actual chunked upload).
* **`backend/src/shared/audio/segmenter.ts`**  
  → `segmentMp3` (Splits frames but has NO encryption code)  
  → **Status: Plain segmenting only**.
* **`backend/src/index.ts`**  
  → `queue` handler (Does not encrypt segments or output `EXT-X-KEY` in manifest)  
  → **Status: Unencrypted HLS generation**.
* **`backend/src/routes/stream.route.ts`**  
  → `/keys/:keyName` route & rewrite rules (Dead code due to lack of encryption tags in manifest)  
  → **Status: Non-functional AES wrappers**.
* **`backend/src/modules/storage/storage.route.ts`**  
  → `/file/*` public route handler (Exposes private bucket files dynamically)  
  → **Status: Security vulnerability**.
* **`docs/architecture_design_decisions.md`**  
  → Mermaid flowcharts and ADR logs  
  → **Status: Outdated and inaccurate**.
