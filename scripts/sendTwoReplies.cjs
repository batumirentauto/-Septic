// scripts/sendTwoReplies.cjs
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execFileAsync = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');

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

const replies = [
  {
    company: 'Firestorm Septics & Shelters',
    contact: 'Jay',
    phone: '+14052271381',
    text: `Hey Jay! Not a septic job myself - I'm Heorhii with Zonus Studio. We actually built a mobile showcase for Firestorm with your equipment, photos & Shawnee service area so local jobs don't slip to competitors: https://zonus.co/firestorm-septics-shelters\n\nTake 30 sec on your phone - what do you think?`
  },
  {
    company: 'JT Services',
    contact: 'Amy B.',
    phone: '+19184065620',
    text: `Hey Amy! Not an excavation job - I'm Heorhii with Zonus Studio. We actually put together a mobile showcase for JT Services with your machinery, photos and septic & excavation services so local jobs don't slip to competitors: https://zonus.co/jt-services\n\nTake 30 sec on your phone - does the info look accurate?`
  }
];

async function main() {
  console.log('Sending replies to Jay and Amy...');
  for (const r of replies) {
    console.log(`Sending to ${r.contact} at ${r.company} (${r.phone})...`);
    await sendGreenSms(r.phone, r.text);
    console.log(`Sent to ${r.phone}! Pausing 6s...`);
    await sleep(6000);
  }
  console.log('Done!');
}

main().catch(console.error);
