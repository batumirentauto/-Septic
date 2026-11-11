// scripts/sendMorning80SplitTest.cjs
// Dispatches the morning split-test outreach messages (A/B/C testing Variants 1, 2, and 3).
// No links in Message 1 (Zero carrier spam filtering, pure 2-step permission approach).

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CANDIDATES_FILE = path.resolve(__dirname, 'morning_80_split_test.json');
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');

function buildMessageText(candidate) {
  const { company, owner, variant } = candidate;
  const greeting = owner && owner.trim() ? `Hey ${owner.trim()}` : `Hey guys`;

  if (variant === 'V1_BALANCED') {
    return `${greeting}, know you're busy so I'll keep it short. Noticed you don't have a website on Google Maps, so put together a ready mobile site for ${company} with your machinery, reviews & services so local jobs don't slip to competitors.\n\nMind if I text you the link to take a quick look? If you like it, great - if not, I'll just delete it, no hard feelings.`;
  }

  if (variant === 'V2_ULTRA_SHORT') {
    return `${greeting}, know you're busy - I'll be quick. Saw no website on your Google profile, so built one for ${company} with your real trucks, reviews & services so callers don't go to competitors.\n\nGot a couple mins if I shoot over the link? If you want to keep it, awesome - if not, I'll delete it, no problem.`;
  }

  if (variant === 'V3_SAFETY_FIRST') {
    return `${greeting}, keeping this short since you're busy. Saw you don't have a site on Google Maps, so put together a live showcase for ${company} with your equipment, reviews & services to help catch jobs going to competitors.\n\nWant me to send the link over to check it out? If you like it, let me know - if not, I'll take it down, no sweat.`;
  }

  throw new Error(`Unknown variant: ${variant}`);
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
  const tzArg = process.argv.find(a => a.startsWith('--tz='));
  const allowedTz = tzArg ? tzArg.split('=')[1].split(',').map(s => s.trim().toUpperCase()) : null;

  let allCandidates = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));

  const candidates = allowedTz
    ? allCandidates.filter(c => allowedTz.includes(c.tzCategory))
    : allCandidates;

  console.log('========================================================================');
  console.log(`🚀 MORNING SPLIT-TEST OUTREACH (ZERO LINKS - 2-STEP PERMISSION)`);
  console.log(`Total Candidates: ${candidates.length} ${allowedTz ? `(Filtered for TZ: ${allowedTz.join(', ')})` : ''}`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Simulation)' : '🟢 LIVE SEND (Cellular SMS)'}`);
  console.log('========================================================================\n');

  let v1Count = 0;
  let v2Count = 0;
  let v3Count = 0;
  let sentCount = 0;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const text = buildMessageText(c);

    console.log(`[${i + 1}/${candidates.length}] ${c.company} | ${c.phone} (${c.city}, ${c.state}) [${c.tzCategory}]`);
    console.log(`   Group: ${c.variant} | Owner: ${c.owner || 'None (Hey guys)'}`);

    if (c.variant === 'V1_BALANCED') v1Count++;
    else if (c.variant === 'V2_ULTRA_SHORT') v2Count++;
    else if (c.variant === 'V3_SAFETY_FIRST') v3Count++;

    if (isDryRun) {
      console.log(`   [DRY RUN] Message preview:\n   "${text.replace(/\n/g, '\n   ')}"\n`);
      sentCount++;
      await sleep(30);
      continue;
    }

    try {
      await sendGreenSms(c.phone, text);
      sentCount++;
      console.log(`   ✅ [SENT #${sentCount}] via Green SMS`);

      // Log to outreach_sent_log.json
      const logData = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };
      if (!logData.history) logData.history = {};
      logData.history[c.phone] = {
        company: c.company,
        owner: c.owner,
        city: c.city,
        state: c.state,
        phone: c.phone,
        tzCategory: c.tzCategory,
        channel: 'GREEN_SMS',
        variant: c.variant,
        slug: c.slug,
        sentAt: new Date().toISOString(),
        messageText: text,
        status: 'SENT'
      };
      fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');

      // Human pause between sends (11-15 seconds) to avoid cellular carrier rate-limits
      const pause = 11000 + Math.floor(Math.random() * 4000);
      console.log(`   ⏳ Pausing ${(pause / 1000).toFixed(1)}s before next contact...\n`);
      await sleep(pause);

    } catch (err) {
      console.error(`   ❌ Failed sending to ${c.phone}:`, err.message);
      await sleep(2000);
    }
  }

  console.log('\n========================================================================');
  console.log(`🏁 OUTREACH COMPLETE! Total Processed: ${sentCount}`);
  console.log(`- V1_BALANCED Sent: ${v1Count}`);
  console.log(`- V2_ULTRA_SHORT Sent: ${v2Count}`);
  console.log(`- V3_SAFETY_FIRST Sent: ${v3Count}`);
  console.log('========================================================================\n');
}

main().catch(console.error);
