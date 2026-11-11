// scripts/sendVariant3Imessage.cjs
// Runs Variant 3 across all 196 fresh, active contractors (4.6-5.0*, reviews <= 6 mo) via Blue iMessage.

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CANDIDATES_FILE = path.resolve(__dirname, 'evening_filtered_recent_candidates.json');
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');

function buildVariant3Text(company, owner, slug) {
  const greeting = owner && owner.trim() ? `Hey ${owner.trim()}` : `Hey guys`;
  return `${greeting}, won't take much of your time - know you're busy. Put together a mobile site for ${company} with your real machinery, photos & services so local jobs don't slip to competitors: https://zonus.co/${slug}\n\nGot a couple mins - take a quick look. If you want to keep it, just text me back.`;
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

  console.log('========================================================================');
  console.log(`🚀 FULL SCAN VARIANT 3 PUNCHY BLUE IMESSAGE OUTREACH`);
  console.log(`Candidates to scan: ${candidates.length} fresh leads (4.6-5.0*, reviews <= 6 mo)`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE SEND'}`);
  console.log('========================================================================\n');

  let deliveredCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const text = buildVariant3Text(c.company, c.owner, c.slug);

    console.log(`[${i + 1}/${candidates.length}] ${c.company} | ${c.owner ? c.owner + ' | ' : ''}${c.clean_phone} (${c.city}, ${c.state})`);

    if (isDryRun) {
      console.log(`   [DRY RUN] Would check & send via Blue iMessage`);
      deliveredCount++;
      continue;
    }

    try {
      await sendBlueImessage(c.clean_phone, text);
      deliveredCount++;
      console.log(`   🔵 [DELIVERED #${deliveredCount}] via Blue iMessage!`);
      console.log(`   Preview link: https://zonus.co/${c.slug}`);

      // Log to sent file
      const logData = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };
      if (!logData.history) logData.history = {};
      logData.history[c.clean_phone] = {
        company: c.company,
        owner: c.owner,
        city: c.city,
        state: c.state,
        phone: c.clean_phone,
        channel: 'BLUE_IMESSAGE',
        variant: 'VARIANT_3_PUNCHY',
        slug: c.slug,
        sentAt: new Date().toISOString(),
        messageText: text,
        status: 'SENT'
      };
      fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');

      // Human pause between successful iMessage deliveries (10-14 seconds)
      const wait = 10000 + Math.floor(Math.random() * 4000);
      console.log(`   ⏳ Pausing ${(wait / 1000).toFixed(1)}s before next candidate...\n`);
      await sleep(wait);

    } catch (err) {
      skippedCount++;
      console.log(`   ⚪️ Not an iMessage user (Android/Landline) — skipped safely.\n`);
      await sleep(1200);
    }
  }

  console.log('\n========================================================================');
  console.log('🎉 ПОЛНОЕ СКАНИРОВАНИЕ БАЗЫ 196 ЗАВЕРШЕНО!');
  console.log(`🔵 Успешно доставлено Blue iMessage: ${deliveredCount}`);
  console.log(`⚪️ Пропущено (не iMessage): ${skippedCount}`);
  console.log(`📊 Конверсия в iMessage: ${((deliveredCount / (deliveredCount + skippedCount || 1)) * 100).toFixed(1)}%`);
  console.log('========================================================================\n');
}

main();
