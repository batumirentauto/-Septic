// scripts/sendRonDecalTouchpoint.cjs
// Sends clean single-link truck decal QR touchpoint to Ron (+1 423-458-5606).

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);

const RON_PHONE = '+14234585606';
const RON_MESSAGE = `Hey Ron, pre-generated a printable QR decal for your truck doors & tank tailgates so local folks can scan and book service directly on job sites: https://zonus.co/stones-pumping/qr\n\nTake 10 sec on your phone - does the info look accurate?`;

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
  console.log(`=== Sending Clean Single-Link Decal to Ron ===`);
  console.log(`Recipient: ${RON_PHONE}`);
  console.log(`Length: ${RON_MESSAGE.length} chars`);
  console.log(`Message:\n${RON_MESSAGE}\n`);

  try {
    await sendGreenSms(RON_PHONE, RON_MESSAGE);
    console.log(`✅ Successfully sent to Ron via Green SMS!`);
    const logFile = path.resolve(__dirname, '../outreach_sent_log.json');
    if (fs.existsSync(logFile)) {
      const logData = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      if (!logData.history) logData.history = {};
      if (!logData.history[RON_PHONE]) logData.history[RON_PHONE] = {};
      logData.history[RON_PHONE].ronDecalTouchpointSentAt = new Date().toISOString();
      logData.history[RON_PHONE].ronDecalTouchpointText = RON_MESSAGE;
      logData.history[RON_PHONE].channel = 'GREEN_SMS';
      fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
    }
  } catch (err) {
    console.error(`❌ Failed sending to Ron:`, err.message);
  }
}

main();
