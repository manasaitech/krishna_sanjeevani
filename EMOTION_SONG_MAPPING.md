# Emotion Remediation Song Mapping & Dedicated R2 Storage Architecture

## 1. Google Sheet Source of Truth

- **Authoritative Sheet URL**: [Google Sheet](https://docs.google.com/spreadsheets/d/1tauH9adCdIUYeHItnjkungyKybzlxUj3Ig52Cn3rVQw/edit?gid=0#gid=0)
- **Document Title**: *Krishna Sanjeevani Emotion Detection and Remediation*
- **Primary Dimension**: **7 Emotional Transition Trajectories** × **3 Ayurvedic Doshas (Kapha, Vata, Pitta)** = **21 Songs**.

### Trajectories & Mapped Songs

| # | Transitional Trajectory | Initial State | Target State | Kapha Dosh Song | Vata Dosh Song | Pitta Dosh Song |
|---|---|---|---|---|---|---|
| 1 | **Kshobha --> Prashanti** | Kshobha (Agitation) | Prashanti (Serenity) | *Together We Make an Offering* | *Divine Treasure* | *Hare Krishna Mantra – Raga Shiva Ranjani* |
| 2 | **Visada --> Prashanti** | Visada (Despair) | Prashanti (Serenity) | *Vibhavari Sesa* | *Jaya Radha-Madhava* | *I Trust You* |
| 3 | **Kshobha --> Utsaha** | Kshobha (Agitation) | Utsaha (Enthusiasm) | *Hare Krishna Vraja Mahamantra 4* | *Mayapur Meltdown – Maha Sankirtan* | *Searching for the Divine Love* |
| 4 | **Visada --> Utsaha** | Visada (Despair) | Utsaha (Enthusiasm) | *Hare Krishna Mahamantra Version 14* | *Jiv Jaago* | *Sri Krishna Divya Nam* |
| 5 | **Utsaha --> Prashanti** | Utsaha (Enthusiasm) | Prashanti (Serenity) | *Hare Krishna Mahamantra Version 17* | *Uplifting Hare Krishna Kirtan* | *Hare Krishna Mantra – Raga Desi* |
| 6 | **Kshobha --> Utsaha --> Prashanti** | Kshobha (Agitation) | Prashanti (Serenity) *(via Utsaha)* | *A Prayer in the Ether* | *Tava Kathamritam / Maha Mantra* | *Heart on Fire (Hari Hari Bifale)* |
| 7 | **Visada --> Utsaha --> Prashanti** | Visada (Despair) | Prashanti (Serenity) *(via Utsaha)* | *Mellows of a Mendicant* | *Queen Kunti* | *Guha Maha Mantra* |

---

## 2. Song Reconciliation Report

Audio files were extracted and verified from the 3 supplied ZIP archives:
- `Surawali (Kapha).zip` (7 audio files)
- `Surawali (Pitta).zip` (7 audio files)
- `Surawali (Vata).zip` (7 audio files)

### Summary
- **Google Sheet Records**: 21
- **Audio Files Discovered**: 21
- **Matched**: **21 (100%)**
- **Missing Audio**: 0
- **Unmapped Audio**: 0
- **Ambiguous Matches**: 0
- **Duplicate Audio Hashes**: 0

### Full Asset Reconciliation Table

| Song ID | Dosha | Sheet Title | Audio Filename in ZIP | File Size | SHA-256 Hash | R2 Key |
|---|---|---|---|---|---|---|
| `em_song_001` | Kapha | Together We Make an Offering | `Together We Make an Offering(MP3_160K).mp3` | 3.26 MB | `7fa7aabf0d2d849d1d7db43aa172ce1c7b73e0d33ae0648d066961204a7d924e` | `songs/em_song_001/audio.mp3` |
| `em_song_002` | Vata | Divine Treasure | `Divine Treasure (feat. Jaya Sita)(MP3_160K).mp3` | 8.00 MB | `7855055ba50ed20dae9cf237238be6b575916c7212f9525e83095d3fd9e00359` | `songs/em_song_002/audio.mp3` |
| `em_song_003` | Pitta | Hare Krishna Mantra – Raga Shiva Ranjani | `Hare Krishna Mantra - Raga Shiva Ranjani(MP3_160K).mp3` | 16.46 MB | `6885c7cc1d832b0f87bcd8fca5ab39cbb7d48e1dff6d9eb8a7cd7ef4fae88b3d` | `songs/em_song_003/audio.mp3` |
| `em_song_004` | Kapha | Vibhavari Sesa | `Vibhavari Sesa(MP3_160K).mp3` | 9.78 MB | `6ff254123544f694b8b8df8d48514fde013ec9dee6f303eb6f03e829530ef935` | `songs/em_song_004/audio.mp3` |
| `em_song_005` | Vata | Jaya Radha-Madhava | `Jaya Radha-Madhava(MP3_160K).mp3` | 8.93 MB | `f3697a94b8c5ef4e84b8fb51d620ca299316d2994b37b0ad53e53969825527d1` | `songs/em_song_005/audio.mp3` |
| `em_song_006` | Pitta | I Trust You | `I Trust You - Jahnavi Harrison - Visualiser(MP3_160K).mp3` | 6.05 MB | `96dfbb39d907c6ac736d3776e6d5048974b036d7d4505c3d03e0d534c5b3fdf5` | `songs/em_song_006/audio.mp3` |
| `em_song_007` | Kapha | Hare Krishna Vraja Mahamantra 4 | `Hare Krishna Vraja Mahamantra 4(MP3_160K).mp3` | 23.19 MB | `a3eb2b4619142c9dee8163e8d57eb4ad1aabe21f40f0c11d0f8f5c01322d3679` | `songs/em_song_007/audio.mp3` |
| `em_song_008` | Vata | Mayapur Meltdown – Maha Sankirtan | `Mayapur Meltdown_ Maha Sankirtan(MP3_160K).mp3` | 8.80 MB | `f0ecbaebcd426f7e560cc5f9940cc48798c8b88e8ace6d48185bca3db6e3137e` | `songs/em_song_008/audio.mp3` |
| `em_song_009` | Pitta | Searching for the Divine Love | `Searching for the Divine love _ Hare Krishna Mahamantra _ Harinaam Kirtan(MP3_160K).mp3` | 8.34 MB | `60340cdb859cae60620bc5f9e1ebfe39e4b68d03e1c2975895e4718748dfe167` | `songs/em_song_009/audio.mp3` |
| `em_song_010` | Kapha | Hare Krishna Mahamantra Version 14 | `Hare Krishna Mahamantra Version 14(MP3_160K).mp3` | 15.15 MB | `0bb7b97198516ad57c4ec4a76cd5132da192c871311ce10d96665d44dddfa59c` | `songs/em_song_010/audio.mp3` |
| `em_song_011` | Vata | Jiv Jaago | `Jiv Jaago(MP3_160K).mp3` | 9.37 MB | `4e91d756555b2b3b3a5a8daa8559958cb3a545d0013cc79c030bc7f7fd9cd4ee` | `songs/em_song_011/audio.mp3` |
| `em_song_012` | Pitta | Sri Krishna Divya Nam | `Sri Krishna Divya Nam(MP3_160K).mp3` | 12.16 MB | `26844dacf2068bf5730f86168bc14c87411bdbebec68a3780c2ff620b2a3525a` | `songs/em_song_012/audio.mp3` |
| `em_song_013` | Kapha | Hare Krishna Mahamantra Version 17 | `Hare Krishna Mahamantra Version 17(MP3_160K).mp3` | 14.44 MB | `2e4cff695cd3299287511a2702e16d0b7ea66b408401536ffe6d9f623dc67780` | `songs/em_song_013/audio.mp3` |
| `em_song_014` | Vata | Uplifting Hare Krishna Kirtan | `Uplifting Hare Krishna Kirtan(MP3_160K).mp3` | 8.46 MB | `133ecf63c478f8122ffff68cee1017d8b06f41e42d5f52fed9917c42d32b5969` | `songs/em_song_014/audio.mp3` |
| `em_song_015` | Pitta | Hare Krishna Mantra – Raga Desi | `Hare Krishna Mantra - Raga Desi(MP3_160K).mp3` | 16.46 MB | `05decdce40caa1cd492a8003b38748d165bef76841ad47ce677be6b779ca6d8d` | `songs/em_song_015/audio.mp3` |
| `em_song_016` | Kapha | A Prayer in the Ether | `A Prayer in the Ether(MP3_160K).mp3` | 2.86 MB | `7e9d0d771678dabbcdfafdf0d03dd8a4aa248f4581e0bfd500d8c25499e5e299` | `songs/em_song_016/audio.mp3` |
| `em_song_017` | Vata | Tava Kathamritam / Maha Mantra | `Tava Kathamritam _ Maha Mantra(MP3_160K).mp3` | 15.90 MB | `c3e065ae7155e0ed3b5da27251a52f5a2c379ed846139724fa6104a741f5019a` | `songs/em_song_017/audio.mp3` |
| `em_song_018` | Pitta | Heart on Fire (Hari Hari Bifale) | `Heart on Fire (Hari Hari Bifale)(MP3_160K).mp3` | 9.95 MB | `0bfe8a0531a2930f4123821ec0267cde3dbab23680336839717a19b24ffd3b8b` | `songs/em_song_018/audio.mp3` |
| `em_song_019` | Kapha | Mellows of a Mendicant | `Mellows of a Mendicant(MP3_160K).mp3` | 11.78 MB | `f2b39aa0a329f6d622a93304d22fc697f08d81bc297ae4347937765a12610428` | `songs/em_song_019/audio.mp3` |
| `em_song_020` | Vata | Queen Kunti | `Queen Kunti(MP3_160K).mp3` | 9.57 MB | `f1a0a93297f00a2510983269ee1e6a47d53b45f1323f49508d2674dceda43ee4` | `songs/em_song_020/audio.mp3` |
| `em_song_021` | Pitta | Guha Maha Mantra | `_Guha Maha Mantra_ - Jahnavi Harrison - VISUALISER(MP3_160K).mp3` | 10.72 MB | `a11bd994a459e99d6b982285062ac4bc77e73f16046c88f2ec7559e1ffb5bd8f` | `songs/em_song_021/audio.mp3` |

---

## 3. Dedicated Cloudflare R2 Storage System

- **Bucket Name**: `krishna-sanjeevani-emotion-remediation`
- **Worker Binding**: `EMOTION_SONGS_BUCKET`
- **Object Key Convention**: `songs/{songId}/audio.mp3` (e.g. `songs/em_song_001/audio.mp3`)
- **Isolation**: Surawali tracks continue to use `SONG_BUCKET` (`bhajan`). Emotion audio assets are isolated entirely in `EMOTION_SONGS_BUCKET`.

---

## 4. Ingestion CLI Commands

### Dry Run (Validates matching, hashes, and reports without writing to DB/R2)
```bash
npm run emotion:import:dry-run
```

### Production Import
```bash
npm run emotion:import
```

---

## 5. Review & Publication Workflow

Every Emotion Remediation song has a strict moderation lifecycle:

```text
       ┌───────────────┐
       │ PENDING_REVIEW│
       └───────┬───────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│   APPROVED   │ │   REJECTED   │
└──────┬───────┘ └──────────────┘
       │
       ▼
┌──────────────┐
│  PUBLISHED   │
└──────────────┘
```

- `PENDING_REVIEW`: Imported into database, uploaded to R2, but not visible in search or public content.
- `APPROVED`: Verified by administrator.
- `PUBLISHED`: Streamable and searchable by active users.
- `REJECTED`: Hidden from streaming and catalog.

---

## 6. Zero Cross-Mode Dependencies Verification

- Emotion modules (`backend/src/modes/emotion-remediation/`, `src/modes/emotion-remediation/`) import only from `core/` and `shared/`.
- No imports from `backend/src/modes/surawali/` or `src/modes/surawali/`.
