#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = path.resolve(__dirname, '..');
const cleanupJson = path.join(root, 'cleanup.json');
if (!fs.existsSync(cleanupJson)) {
  console.error('cleanup.json not found. Run the audit step first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(cleanupJson, 'utf8'));
const backupDir = path.join(root, 'cleanup-backup', new Date().toISOString().replace(/[:.]/g, '-'));

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
async function question(q) { return new Promise(resolve => rl.question(q, resolve)); }

(async () => {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('Backup dir:', backupDir);
  for (const item of data.items) {
    const p = path.join(root, item.path);
    const exists = fs.existsSync(p);
    console.log('\nPath:', item.path);
    console.log('Reason:', item.reason);
    console.log('Exists:', exists);
    if (!exists) continue;
    const ans = (await question('Action? [m]ove to backup, [d]elete, [s]kip: ')).trim().toLowerCase();
    if (ans === 'm') {
      const dest = path.join(backupDir, item.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(p, dest);
      console.log('Moved to', dest);
    } else if (ans === 'd') {
      const rimraf = require('fs').rmSync || require('fs').rmdirSync;
      try { fs.rmSync(p, { recursive: true }); } catch(e) { try { fs.rmdirSync(p, { recursive: true }); } catch(e2) {} }
      console.log('Deleted', p);
    } else {
      console.log('Skipped', item.path);
    }
  }
  rl.close();
  console.log('Done.');
})();
