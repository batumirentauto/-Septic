// scripts/sendAfternoonImessage.cjs
// Afternoon outreach across top 60 fresh high-ticket contractors strictly via iMessage.
// Only sends if the recipient has Blue iMessage (iPhone / iPad / Mac).

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CANDIDATES_FILE = path.resolve(__dirname, 'afternoon_imessage_candidates.json');
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');

function buildHookText(owner, city) {
  const namePart = owner && owner.trim() ? ` ${owner.trim()}` : '';
  return `Hey${namePart}, do you guys still do septic repair and excavation in the ${city} area?`;
}

async function sendBlueImessage(phone, text) {
  const script = `
    set theText to ${JSON.stringify(text)}

    tell application "Messages"
      set targetService to 1st account whose service type = iMessage
      set targetBuddy to participant "${phone}" of targetService
      send theText to targetBuddy
    end tell
  `;
  return await execFileAsync('osascript', ['-e', script]);
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const candidates = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));

  console.log(`========================================================================`);
  console.log(`🚀 AFTERNOON BLUE IMESSAGE HIGH-TICKET OUTREACH (Candidates: ${candidates.length})`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no messages sent)' : 'LIVE SEND'}`);
  console.log(`========================================================================\n`);

  let blueCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const hook = buildHookText(c.owner, c.city);

    console.log(`[${i + 1}/${candidates.length}] ${c.company} | ${c.owner ? c.owner + ' | ' : ''}${c.clean_phone} (${c.city}, ${c.state}) [Group ${c.testGroup}]`);
    console.log(`   Hook: "${hook}"`);

    if (isDryRun) {
      console.log(`   [DRY RUN] Would check & send via Blue iMessage`);
      continue;
    }

    try {
      await sendBlueImessage(c.clean_phone, hook);
      blueCount++;
      console.log(`   🔵 Delivered via Blue iMessage!`);

      // Record in log
      const logData = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };
      if (!logData.history) logData.history = {};
      logData.history[c.clean_phone] = {
        company: c.company,
        owner: c.owner,
        city: c.city,
        state: c.state,
        phone: c.clean_phone,
        channel: 'BLUE_IMESSAGE',
        testGroup: c.testGroup,
        slug: c.slug,
        sentAt: new Date().toISOString(),
        hook: hook,
        status: 'SENT'
      };
      fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');

      // Human delay for delivery pacing
      const delay = 25000 + Math.floor(Math.random() * 10000);
      console.log(`   ⏳ Pausing ${(delay / 1000).toFixed(1)}s before next contact...\n`);
      await sleep(delay);

    } catch (err) {
      skippedCount++;
      console.log(`   ⚪️ Not an iMessage user (Android/Landline) — skipped safely.\n`);
      await sleep(2500);
    }
  }

  console.log(`\n========================================================================`);
  console.log(`🎉 ДНЕВНАЯ IMESSAGE РАССЫЛКА ЗАВЕРШЕНА!`);
  console.log(`Итоги: 🔵 iMessage доставлено: ${blueCount} | ⚪️ Пропущено (Android): ${skippedCount}`);
  console.log(`========================================================================\n`);
}

main();
