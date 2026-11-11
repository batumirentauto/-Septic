// scripts/sendFollowupLink.cjs
// Dispatches Message 2 with link + motivational copy when a contractor replies to Message 1.
// Supports Variant A (Machinery/Crew), Variant B (High-Ticket $5k-$15k), and Variant C (Turnkey/Tweaks).

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const { getMessage2 } = require('./replyTemplates.cjs');

const execFileAsync = promisify(execFile);
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');
const SPLIT_FILE = path.resolve(__dirname, 'morning_80_split_test.json');

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

function resolveVariant(userArg, candidateVariant) {
  if (userArg) {
    const u = userArg.toUpperCase();
    if (u.includes('A') || u.includes('MACH')) return 'VAR_A_MACHINERY';
    if (u.includes('B') || u.includes('TICKET')) return 'VAR_B_HIGH_TICKET';
    if (u.includes('C') || u.includes('TURN')) return 'VAR_C_TURNKEY';
  }
  // Auto-map Message 1 variant to corresponding Message 2 variant:
  // V1_BALANCED -> VAR_A_MACHINERY
  // V2_ULTRA_SHORT -> VAR_B_HIGH_TICKET
  // V3_SAFETY_FIRST -> VAR_C_TURNKEY
  if (candidateVariant === 'V2_ULTRA_SHORT') return 'VAR_B_HIGH_TICKET';
  if (candidateVariant === 'V3_SAFETY_FIRST') return 'VAR_C_TURNKEY';
  return 'VAR_A_MACHINERY';
}

async function main() {
  const targetPhone = process.argv[2];
  const variantArg = process.argv[3];

  if (!targetPhone) {
    console.log('Usage: node scripts/sendFollowupLink.cjs <phone> [VAR_A|VAR_B|VAR_C]');
    process.exit(1);
  }

  const logData = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };
  const splitCandidates = fs.existsSync(SPLIT_FILE) ? JSON.parse(fs.readFileSync(SPLIT_FILE, 'utf8')) : [];

  const cleanPhone = targetPhone.replace(/\D/g, '').length === 10 ? `+1${targetPhone.replace(/\D/g, '')}` : targetPhone;

  let entry = logData.history ? logData.history[cleanPhone] : null;
  let candidate = splitCandidates.find(c => c.phone === cleanPhone);

  const slug = (entry && entry.slug) || (candidate && candidate.slug);
  const company = (entry && entry.company) || (candidate && candidate.company) || 'Contractor';
  const candidateVariant = (entry && entry.variant) || (candidate && candidate.variant) || 'V1_BALANCED';

  if (!slug) {
    console.error(`❌ Could not find showcase slug for phone ${cleanPhone}`);
    process.exit(1);
  }

  const variantKey = resolveVariant(variantArg, candidateVariant);
  const text = getMessage2(variantKey, slug);

  console.log('========================================================================');
  console.log(`📤 SENDING MESSAGE 2 (FOLLOW-UP LINK + MOTIVATION)`);
  console.log(`Company: ${company}`);
  console.log(`Phone: ${cleanPhone}`);
  console.log(`Variant: ${variantKey}`);
  console.log(`Showcase Link: https://zonus.co/${slug}`);
  console.log('------------------------------------------------------------------------');
  console.log(`Text:\n"${text}"`);
  console.log('========================================================================\n');

  await sendGreenSms(cleanPhone, text);
  console.log('✅ Sent successfully via Green SMS!');

  // Update outreach log
  if (!logData.history) logData.history = {};
  if (!logData.history[cleanPhone]) {
    logData.history[cleanPhone] = {
      company,
      phone: cleanPhone,
      slug
    };
  }
  logData.history[cleanPhone].followupSentAt = new Date().toISOString();
  logData.history[cleanPhone].message2Variant = variantKey;
  logData.history[cleanPhone].message2Text = text;
  logData.history[cleanPhone].status = 'LINK_SENT';

  fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');
  console.log('📝 Updated outreach_sent_log.json with status LINK_SENT.');
}

main().catch(console.error);
