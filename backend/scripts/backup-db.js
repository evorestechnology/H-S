import { performBackup } from '../services/backup.service.js';

async function main() {
  console.log('--- Manual Database Backup Initiated ---');
  const res = await performBackup('CLI_MANUAL');
  if (res.success) {
    console.log(`✓ Backup successfully created: ${res.filename} (${res.sizeKB} KB)`);
    console.log(`✓ Local Path: ${res.localPath}`);
    if (res.cloudUploaded) {
      console.log(`✓ Cloud Storage: ${res.cloudPath}`);
    }
    process.exit(0);
  } else {
    console.error('✗ Backup failed:', res.error);
    process.exit(1);
  }
}

main();
