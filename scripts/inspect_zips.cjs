const fs = require('fs');
const path = require('path');
const AdmZip = (() => {
  try {
    return require('adm-zip');
  } catch (e) {
    return null;
  }
})();

// Use node built-in or zip reader
if (AdmZip) {
  ['Surawali (Kapha).zip', 'Surawali (Pitta).zip', 'Surawali (Vata).zip'].forEach(zipName => {
    const zipPath = path.join(__dirname, '..', zipName);
    if (fs.existsSync(zipPath)) {
      console.log(`\n=== ${zipName} ===`);
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();
      entries.forEach(entry => {
        if (!entry.isDirectory) {
          console.log(`- ${entry.entryName} (${entry.header.size} bytes)`);
        }
      });
    } else {
      console.log(`Missing: ${zipName}`);
    }
  });
} else {
  console.log('adm-zip not installed, using powershell expansion');
}
