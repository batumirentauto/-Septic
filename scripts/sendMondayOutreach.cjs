// scripts/sendMondayOutreach.cjs
// Monday morning outreach across top 70 high-ticket contractors.
// Sends directly via Green SMS as agreed.

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CANDIDATES_FILE = path.resolve(__dirname, 'monday_70_candidates.json');
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');

function buildHookText(owner, city) {
  const namePart = owner && owner.trim() ? ` ${owner.trim()}` : '';
  return `Hey${namePart}, do you guys still do septic repair and excavation in the ${city} area?`;
}

async function sendGreenSms(phone, text) {
  const script = `
    set theText to ${JSON.stringify(text)}

    tell application "Messages"
      set targetService to 1st account whose service type = SMS
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
  console.log(`🚀 MONDAY GREEN SMS HIGH-TICKET OUTREACH (Total: ${candidates.length})`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no messages sent)' : 'LIVE SEND'}`);
  console.log(`========================================================================\n`);

  let greenCount = 0;
  let failCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const hook = buildHookText(c.owner, c.city);

    console.log(`[${i + 1}/${candidates.length}] ${c.company} | ${c.owner ? c.owner + ' | ' : ''}${c.clean_phone} (${c.city}, ${c.state}) [Group ${c.testGroup}]`);
    console.log(`   Hook: "${hook}"`);

    if (!isDryRun) {
      try {
        await sendGreenSms(c.clean_phone, hook);
        greenCount++;
        console.log(`   🟢 Delivered via Green SMS!`);

        // Record to log
        const logData = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };
        if (!logData.history) logData.history = {};
        logData.history[c.clean_phone] = {
          company: c.company,
          owner: c.owner,
          city: c.city,
          state: c.state,
          phone: c.clean_phone,
          channel: 'GREEN_SMS',
          testGroup: c.testGroup,
          slug: c.slug,
          sentAt: new Date().toISOString()
        };
        fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2));
      } catch (smsErr) {
        failCount++;
        console.error(`   ❌ Failed sending SMS:`, smsErr.message);
      }

      // Natural human pause: 25 to 35 seconds
      if (i < candidates.length - 1) {
        const delay = 25000 + Math.floor(Math.random() * 10000);
        console.log(`⏳ Пауза ${(delay / 1000).toFixed(1)} сек...\n`);
        await sleep(delay);
      }
    } else {
      console.log(`   [DRY RUN] Would send direct Green SMS\n`);
    }
  }

  console.log(`\n========================================================================`);
  console.log(`🎉 РАССЫЛКА ЗАВЕРШЕНА!`);
  if (!isDryRun) {
    console.log(`Итоги: 🟢 SMS доставлено: ${greenCount} | ❌ Ошибок: ${failCount}`);
  }
  console.log(`========================================================================`);
}

main().catch(console.error);
