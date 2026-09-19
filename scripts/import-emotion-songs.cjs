#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Emotion Remediation Song Importer & Reconciliation CLI Tool
// Reads Google Sheet authoritative mappings and audio ZIPs,
// validates matches, calculates SHA-256 hashes, supports --dry-run,
// generates SQL migration/seed files, and produces reconciliation reports.
// ─────────────────────────────────────────────────────────────

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

// ── 1. Authoritative Google Sheet Mapping Source of Truth ──
// Source: https://docs.google.com/spreadsheets/d/1tauH9adCdIUYeHItnjkungyKybzlxUj3Ig52Cn3rVQw/edit?gid=0#gid=0
const SHEET_MAPPINGS = [
  {
    trajectory: "Kshobha --> Prashanti",
    initialState: "Kshobha",
    intermediateState: null,
    targetState: "Prashanti",
    songs: {
      kapha: "Together We Make an Offering",
      vata: "Divine Treasure",
      pitta: "Hare Krishna Mantra – Raga Shiva Ranjani",
    },
  },
  {
    trajectory: "Visada --> Prashanti",
    initialState: "Visada",
    intermediateState: null,
    targetState: "Prashanti",
    songs: {
      kapha: "Vibhavari Sesa",
      vata: "Jaya Radha-Madhava",
      pitta: "I Trust You",
    },
  },
  {
    trajectory: "Kshobha --> Utsaha",
    initialState: "Kshobha",
    intermediateState: null,
    targetState: "Utsaha",
    songs: {
      kapha: "Hare Krishna Vraja Mahamantra 4",
      vata: "Mayapur Meltdown – Maha Sankirtan",
      pitta: "Searching for the Divine Love",
    },
  },
  {
    trajectory: "Visada --> Utsaha",
    initialState: "Visada",
    intermediateState: null,
    targetState: "Utsaha",
    songs: {
      kapha: "Hare Krishna Mahamantra Version 14",
      vata: "Jiv Jaago",
      pitta: "Sri Krishna Divya Nam",
    },
  },
  {
    trajectory: "Utsaha --> Prashanti",
    initialState: "Utsaha",
    intermediateState: null,
    targetState: "Prashanti",
    songs: {
      kapha: "Hare Krishna Mahamantra Version 17",
      vata: "Uplifting Hare Krishna Kirtan",
      pitta: "Hare Krishna Mantra – Raga Desi",
    },
  },
  {
    trajectory: "Kshobha --> Utsaha --> Prashanti",
    initialState: "Kshobha",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    songs: {
      kapha: "A Prayer in the Ether",
      vata: "Tava Kathamritam / Maha Mantra",
      pitta: "Heart on Fire (Hari Hari Bifale)",
    },
  },
  {
    trajectory: "Visada --> Utsaha --> Prashanti",
    initialState: "Visada",
    intermediateState: "Utsaha",
    targetState: "Prashanti",
    songs: {
      kapha: "Mellows of a Mendicant",
      vata: "Queen Kunti",
      pitta: "Guha Maha Mantra",
    },
  },
];

// ── 2. Filename Normalization Engine ──
function normalizeName(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/\.mp3$/i, "")
    .replace(/\(mp3_160k\)/gi, "")
    .replace(/\(feat\.[^)]+\)/gi, "")
    .replace(/\(hari hari bifale\)/gi, "")
    .replace(/–/g, "-") // Unicode en-dash
    .replace(/—/g, "-") // Unicode em-dash
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/visualiser/gi, "")
    .replace(/jahnavi harrison/gi, "")
    .replace(/harinaam kirtan/gi, "")
    .replace(/maha sankirtan/gi, "")
    .replace(/maha mantra/gi, "")
    .replace(/version/gi, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── 3. Audio ZIP File Scanner ──
function scanZipFiles(rootDir) {
  const zipConfigs = [
    { dosha: "kapha", file: "Surawali (Kapha).zip" },
    { dosha: "pitta", file: "Surawali (Pitta).zip" },
    { dosha: "vata", file: "Surawali (Vata).zip" },
  ];

  const filesFound = [];
  const helperScript = path.join(rootDir, "scripts", "scan_zip_helper.ps1");

  for (const { dosha, file } of zipConfigs) {
    const fullZipPath = path.join(rootDir, file);
    if (!fs.existsSync(fullZipPath)) {
      console.warn(`[WARN] ZIP archive not found: ${file}`);
      continue;
    }

    try {
      const output = execSync(
        `powershell -NoProfile -ExecutionPolicy Bypass -File "${helperScript}" -ZipPath "${fullZipPath}" -Dosha "${dosha}"`,
        { maxBuffer: 10 * 1024 * 1024 }
      ).toString().trim();

      if (!output) continue;
      const parsed = JSON.parse(output);
      const entries = Array.isArray(parsed) ? parsed : [parsed];

      for (const entry of entries) {
        if (entry && entry.filename) {
          filesFound.push({
            dosha: entry.dosha,
            zipFile: entry.zipFile,
            entryFullName: entry.entryFullName,
            filename: entry.filename,
            size: entry.size,
            hash: entry.hash,
          });
        }
      }
    } catch (err) {
      console.error(`Error scanning zip ${file}:`, err.message);
    }
  }

  return filesFound;
}

// ── 4. Main Reconciliation & Ingestion Routine ──
function runReconciliation(options = {}) {
  const { dryRun = true, rootDir = path.resolve(__dirname, "..") } = options;

  console.log("==================================================================");
  console.log(`Emotion Remediation Song Importer — Mode: ${dryRun ? "DRY RUN" : "PRODUCTION"}`);
  console.log("==================================================================\n");

  const audioFiles = scanZipFiles(rootDir);
  console.log(`Discovered ${audioFiles.length} audio file(s) across ZIP archives.\n`);

  // Flatten Google Sheet records
  const sheetRecords = [];
  let songIndex = 1;

  for (const row of SHEET_MAPPINGS) {
    for (const [dosha, title] of Object.entries(row.songs)) {
      const songId = `em_song_${String(songIndex++).padStart(3, "0")}`;
      sheetRecords.push({
        id: songId,
        title,
        trajectory: row.trajectory,
        initialState: row.initialState,
        intermediateState: row.intermediateState,
        targetState: row.targetState,
        dosha,
      });
    }
  }

  const matched = [];
  const missing = [];
  const unmapped = [];
  const ambiguous = [];
  const duplicates = [];

  // Track matched zip files
  const matchedZipFiles = new Set();
  const seenHashes = new Map();

  for (const record of sheetRecords) {
    const normSheetTitle = normalizeName(record.title);

    // Candidates in same dosha
    const candidates = audioFiles.filter(
      (f) => f.dosha === record.dosha && normalizeName(f.filename).includes(normSheetTitle)
    );

    // Fallback: search across all doshas if not found
    let matchedFile = null;

    if (candidates.length === 1) {
      matchedFile = candidates[0];
    } else if (candidates.length > 1) {
      // Look for highest similarity match
      const exactCandidate = candidates.find(
        (c) => normalizeName(c.filename) === normSheetTitle
      );
      if (exactCandidate) {
        matchedFile = exactCandidate;
      } else {
        ambiguous.push({ record, candidates });
        continue;
      }
    } else {
      // Direct substring match on normalized title
      const altCandidates = audioFiles.filter((f) => {
        if (f.dosha !== record.dosha) return false;
        const normFile = normalizeName(f.filename);
        return (
          normFile.includes(normSheetTitle) ||
          normSheetTitle.includes(normFile) ||
          normFile.startsWith(normSheetTitle.slice(0, 10))
        );
      });

      if (altCandidates.length === 1) {
        matchedFile = altCandidates[0];
      } else if (altCandidates.length > 1) {
        ambiguous.push({ record, candidates: altCandidates });
        continue;
      }
    }

    if (matchedFile) {
      matchedZipFiles.add(matchedFile.entryFullName);

      // Check audio hash duplicate
      if (seenHashes.has(matchedFile.hash)) {
        duplicates.push({
          songId: record.id,
          title: record.title,
          hash: matchedFile.hash,
          duplicateOf: seenHashes.get(matchedFile.hash),
        });
      } else {
        seenHashes.set(matchedFile.hash, record.id);
      }

      matched.push({
        ...record,
        originalFilename: matchedFile.filename,
        r2Bucket: "krishna-sanjeevani-emotion-remediation",
        r2Key: `songs/${record.id}/audio.mp3`,
        fileHash: matchedFile.hash,
        fileSize: matchedFile.size,
        mimeType: "audio/mpeg",
        reviewStatus: "pending",
        zipSource: matchedFile.zipFile,
      });
    } else {
      missing.push(record);
    }
  }

  // Find unmapped audio files
  for (const file of audioFiles) {
    if (!matchedZipFiles.has(file.entryFullName)) {
      unmapped.push(file);
    }
  }

  // ── Print Reconciliation Report ──
  console.log("──────────────────────────────────────────────────────────────────");
  console.log("RECONCILIATION SUMMARY REPORT");
  console.log("──────────────────────────────────────────────────────────────────");
  console.log(`Total Google Sheet Records : ${sheetRecords.length}`);
  console.log(`Total Audio Files in ZIPs  : ${audioFiles.length}`);
  console.log(`Successfully Matched       : ${matched.length}`);
  console.log(`Missing Audio (In Sheet)   : ${missing.length}`);
  console.log(`Unmapped Audio (In ZIP)    : ${unmapped.length}`);
  console.log(`Ambiguous Candidates       : ${ambiguous.length}`);
  console.log(`Duplicate Audio Hashes     : ${duplicates.length}`);
  console.log("──────────────────────────────────────────────────────────────────\n");

  console.log("MATCHED SONGS:");
  matched.forEach((m, idx) => {
    console.log(
      `  ${String(idx + 1).padStart(2, "0")}. [${m.dosha.toUpperCase().padEnd(5)}] "${m.title}"`
    );
    console.log(`      -> File : ${m.originalFilename} (${(m.fileSize / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`      -> R2   : ${m.r2Bucket}/${m.r2Key}`);
    console.log(`      -> Hash : ${m.fileHash}`);
  });

  if (missing.length > 0) {
    console.log("\nMISSING AUDIO FILES:");
    missing.forEach((m) => console.log(`  - [${m.dosha}] "${m.title}" (${m.trajectory})`));
  }

  if (unmapped.length > 0) {
    console.log("\nUNMAPPED AUDIO FILES:");
    unmapped.forEach((u) => console.log(`  - [${u.dosha}] ${u.filename}`));
  }

  // ── Generate SQL Seed / Migration File ──
  const sqlStatements = [
    "-- Emotion Remediation Seed SQL Generated from Google Sheet & Audio ZIPs",
    "-- Idempotent INSERT OR REPLACE statements",
    "",
  ];

  const now = Date.now();

  for (const song of matched) {
    const escapeSql = (str) => (str ? str.replace(/'/g, "''") : "");
    const intermediateVal = song.intermediateState ? `'${escapeSql(song.intermediateState)}'` : "NULL";

    sqlStatements.push(
      `INSERT OR REPLACE INTO emotion_songs (id, title, trajectory, initial_state, intermediate_state, target_state, dosha, original_filename, r2_bucket, r2_key, file_hash, file_size, duration, mime_type, review_status, created_at, updated_at) VALUES ('${song.id}', '${escapeSql(song.title)}', '${escapeSql(song.trajectory)}', '${escapeSql(song.initialState)}', ${intermediateVal}, '${escapeSql(song.targetState)}', '${song.dosha}', '${escapeSql(song.originalFilename)}', '${song.r2Bucket}', '${song.r2Key}', '${song.fileHash}', ${song.fileSize}, 0, '${song.mimeType}', 'pending', ${now}, ${now});`
    );
  }

  const sqlFilePath = path.join(rootDir, "backend", "seed_emotion_songs.sql");
  fs.writeFileSync(sqlFilePath, sqlStatements.join("\n"));
  console.log(`\nGenerated SQL Seed File: ${sqlFilePath}`);

  const jsonReportPath = path.join(rootDir, "backend", "emotion_reconciliation_report.json");
  fs.writeFileSync(
    jsonReportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        dryRun,
        summary: {
          sheetRecords: sheetRecords.length,
          audioFiles: audioFiles.length,
          matched: matched.length,
          missing: missing.length,
          unmapped: unmapped.length,
          ambiguous: ambiguous.length,
          duplicates: duplicates.length,
        },
        matched,
        missing,
        unmapped,
        ambiguous,
        duplicates,
      },
      null,
      2
    )
  );
  console.log(`Generated JSON Report   : ${jsonReportPath}\n`);

  return { matched, missing, unmapped, ambiguous, duplicates };
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || !args.includes("--production");
  runReconciliation({ dryRun });
}

module.exports = { runReconciliation, normalizeName, SHEET_MAPPINGS };
