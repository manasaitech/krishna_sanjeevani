const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");
const TEMP_DIR = path.join(ROOT_DIR, ".temp_emotion_upload");
const BUCKET = "krishna-sanjeevani-emotion-remediation";

const SONGS = [
  {
    id: "em_song_001",
    title: "Together We Make an Offering",
    dosha: "kapha",
    filename: "Together We Make an Offering(MP3_160K).mp3",
    r2Key: "songs/em_song_001/audio.mp3"
  },
  {
    id: "em_song_002",
    title: "Divine Treasure",
    dosha: "vata",
    filename: "Divine Treasure (feat. Jaya Sita)(MP3_160K).mp3",
    r2Key: "songs/em_song_002/audio.mp3"
  },
  {
    id: "em_song_003",
    title: "Hare Krishna Mantra – Raga Shiva Ranjani",
    dosha: "pitta",
    filename: "Hare Krishna Mantra - Raga Shiva Ranjani(MP3_160K).mp3",
    r2Key: "songs/em_song_003/audio.mp3"
  },
  {
    id: "em_song_004",
    title: "Vibhavari Sesa",
    dosha: "kapha",
    filename: "Vibhavari Sesa(MP3_160K).mp3",
    r2Key: "songs/em_song_004/audio.mp3"
  },
  {
    id: "em_song_005",
    title: "Jaya Radha-Madhava",
    dosha: "vata",
    filename: "Jaya Radha-Madhava(MP3_160K).mp3",
    r2Key: "songs/em_song_005/audio.mp3"
  },
  {
    id: "em_song_006",
    title: "I Trust You",
    dosha: "pitta",
    filename: "I Trust You - Jahnavi Harrison - Visualiser(MP3_160K).mp3",
    r2Key: "songs/em_song_006/audio.mp3"
  },
  {
    id: "em_song_007",
    title: "Hare Krishna Vraja Mahamantra 4",
    dosha: "kapha",
    filename: "Hare Krishna Vraja Mahamantra 4(MP3_160K).mp3",
    r2Key: "songs/em_song_007/audio.mp3"
  },
  {
    id: "em_song_008",
    title: "Mayapur Meltdown – Maha Sankirtan",
    dosha: "vata",
    filename: "Mayapur Meltdown_ Maha Sankirtan(MP3_160K).mp3",
    r2Key: "songs/em_song_008/audio.mp3"
  },
  {
    id: "em_song_009",
    title: "Searching for the Divine Love",
    dosha: "pitta",
    filename: "Searching for the Divine love _ Hare Krishna Mahamantra _ Harinaam Kirtan(MP3_160K).mp3",
    r2Key: "songs/em_song_009/audio.mp3"
  },
  {
    id: "em_song_010",
    title: "Hare Krishna Mahamantra Version 14",
    dosha: "kapha",
    filename: "Hare Krishna Mahamantra Version 14(MP3_160K).mp3",
    r2Key: "songs/em_song_010/audio.mp3"
  },
  {
    id: "em_song_011",
    title: "Jiv Jaago",
    dosha: "vata",
    filename: "Jiv Jaago(MP3_160K).mp3",
    r2Key: "songs/em_song_011/audio.mp3"
  },
  {
    id: "em_song_012",
    title: "Sri Krishna Divya Nam",
    dosha: "pitta",
    filename: "Sri Krishna Divya Nam(MP3_160K).mp3",
    r2Key: "songs/em_song_012/audio.mp3"
  },
  {
    id: "em_song_013",
    title: "Hare Krishna Mahamantra Version 17",
    dosha: "kapha",
    filename: "Hare Krishna Mahamantra Version 17(MP3_160K).mp3",
    r2Key: "songs/em_song_013/audio.mp3"
  },
  {
    id: "em_song_014",
    title: "Uplifting Hare Krishna Kirtan",
    dosha: "vata",
    filename: "Uplifting Hare Krishna Kirtan(MP3_160K).mp3",
    r2Key: "songs/em_song_014/audio.mp3"
  },
  {
    id: "em_song_015",
    title: "Hare Krishna Mantra – Raga Desi",
    dosha: "pitta",
    filename: "Hare Krishna Mantra - Raga Desi(MP3_160K).mp3",
    r2Key: "songs/em_song_015/audio.mp3"
  },
  {
    id: "em_song_016",
    title: "A Prayer in the Ether",
    dosha: "kapha",
    filename: "A Prayer in the Ether(MP3_160K).mp3",
    r2Key: "songs/em_song_016/audio.mp3"
  },
  {
    id: "em_song_017",
    title: "Tava Kathamritam / Maha Mantra",
    dosha: "vata",
    filename: "Tava Kathamritam _ Maha Mantra(MP3_160K).mp3",
    r2Key: "songs/em_song_017/audio.mp3"
  },
  {
    id: "em_song_018",
    title: "Heart on Fire (Hari Hari Bifale)",
    dosha: "pitta",
    filename: "Heart on Fire (Hari Hari Bifale)(MP3_160K).mp3",
    r2Key: "songs/em_song_018/audio.mp3"
  },
  {
    id: "em_song_019",
    title: "Mellows of a Mendicant",
    dosha: "kapha",
    filename: "Mellows of a Mendicant(MP3_160K).mp3",
    r2Key: "songs/em_song_019/audio.mp3"
  },
  {
    id: "em_song_020",
    title: "Queen Kunti",
    dosha: "vata",
    filename: "Queen Kunti(MP3_160K).mp3",
    r2Key: "songs/em_song_020/audio.mp3"
  },
  {
    id: "em_song_021",
    title: "Guha Maha Mantra",
    dosha: "pitta",
    filename: "_Guha Maha Mantra_ - Jahnavi Harrison - VISUALISER(MP3_160K).mp3",
    r2Key: "songs/em_song_021/audio.mp3"
  }
];

function getAllFilesRecursively(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesRecursively(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

async function main() {
  console.log("==================================================================");
  console.log("🚀 Extracting & Uploading 21 Emotion Remediation Songs to Cloudflare R2");
  console.log("Bucket: " + BUCKET);
  console.log("==================================================================\n");

  // 1. Extract ZIP archives if not already extracted
  const zipConfigs = [
    { zip: "Surawali (Kapha).zip", dest: path.join(TEMP_DIR, "kapha") },
    { zip: "Surawali (Pitta).zip", dest: path.join(TEMP_DIR, "pitta") },
    { zip: "Surawali (Vata).zip", dest: path.join(TEMP_DIR, "vata") },
  ];

  for (const { zip, dest } of zipConfigs) {
    const zipPath = path.join(ROOT_DIR, zip);
    if (!fs.existsSync(zipPath)) {
      console.error(`❌ ZIP archive not found: ${zipPath}`);
      continue;
    }
    console.log(`📦 Unpacking "${zip}"...`);
    fs.mkdirSync(dest, { recursive: true });
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${dest.replace(/'/g, "''")}' -Force"`, { stdio: "inherit" });
  }

  // 2. Discover all extracted MP3 files
  console.log("\n🔍 Scanning extracted MP3 files...");
  const allExtractedFiles = getAllFilesRecursively(TEMP_DIR).filter(f => f.endsWith(".mp3"));
  console.log(`Found ${allExtractedFiles.length} MP3 files in total.\n`);

  let successCount = 0;

  // 3. Upload each song to R2
  for (let i = 0; i < SONGS.length; i++) {
    const song = SONGS[i];
    const matchingFile = allExtractedFiles.find(f => path.basename(f) === song.filename);

    if (!matchingFile) {
      console.error(`[${i + 1}/${SONGS.length}] ❌ Could not find file for "${song.filename}"`);
      continue;
    }

    const fileSizeMb = (fs.statSync(matchingFile).size / (1024 * 1024)).toFixed(2);
    console.log(`[${i + 1}/${SONGS.length}] Uploading: "${song.title}" (${song.dosha})`);
    console.log(`  File: ${path.basename(matchingFile)} (${fileSizeMb} MB)`);
    console.log(`  Destination: ${BUCKET}/${song.r2Key}`);

    try {
      const uploadCmd = `npx wrangler r2 object put "${BUCKET}/${song.r2Key}" --file="${matchingFile}" --content-type="audio/mpeg" --remote`;
      execSync(uploadCmd, {
        cwd: path.join(ROOT_DIR, "backend"),
        stdio: "pipe",
      });
      console.log(`  ✅ Successfully uploaded to R2!\n`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Failed to upload ${song.r2Key}:`, err.message);
    }
  }

  console.log("==================================================================");
  console.log(`✨ UPLOAD COMPLETE: ${successCount}/${SONGS.length} songs uploaded to R2 bucket "${BUCKET}".`);
  console.log("==================================================================");

  // Clean up
  console.log("\nCleaning up local temp folder...");
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log("✅ Cleanup complete.");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
