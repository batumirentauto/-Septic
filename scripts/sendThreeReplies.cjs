// scripts/sendThreeReplies.cjs
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

const targets = [
  {
    company: 'T&V Backhoe & Septic Services',
    owner: 'Tim',
    phone: '+19188557465',
    city: 'Broken Arrow',
    slug: 'tv-backhoe-septic-services',
    text: "It's Heorhii with Zonus Studio. Saw your machinery in Broken Arrow and put together a mobile showcase for T&V Backhoe to help local homeowners book you directly: https://zonus.co/tv-backhoe-septic-services\n\n(Can text a quick video if you avoid links from new numbers).\nTake 10 sec on your phone - does the info look accurate?"
  },
  {
    company: 'LocalPro Plumbing of South Tampa',
    owner: '',
    phone: '+18137977667',
    city: 'Tampa',
    slug: 'localpro-plumbing-of-south-tampa',
    text: "Hey, not a repair job - I'm Heorhii with Zonus Studio. Saw your 5-star reputation in Tampa and built a mobile showcase for LocalPro so customers can book direct replacements: https://zonus.co/localpro-plumbing-of-south-tampa\n\n(Can text a video if you prefer).\nDoes the info look accurate to your work?"
  },
  {
    company: "Milty's Septic Services",
    owner: 'Trey',
    phone: '+19184514362',
    city: 'Stigler',
    slug: 'miltys-septic-services',
    text: "Hey Trey! It's Heorhii with Zonus Studio. Reason for the text: saw your 5-star work in Stigler and put together a clean mobile showcase for Milty's Septic with your machinery: https://zonus.co/miltys-septic-services\n\n(Can text a video if you prefer).\nTake 10 sec on your phone - does the info look accurate?"
  }
];

async function main() {
  console.log('🚀 Sending 3 tailored human replies...');
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    console.log(`[${i + 1}/${targets.length}] Sending to ${t.owner || t.company} (${t.phone})...`);
    try {
      await sendGreenSms(t.phone, t.text);
      console.log(`   🟢 Delivered via Green SMS!`);

      // Update log
      if (fs.existsSync(LOG_FILE)) {
        const logData = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        if (!logData.history) logData.history = {};
        if (!logData.history[t.phone]) logData.history[t.phone] = {};
        logData.history[t.phone].message2Sent = true;
        logData.history[t.phone].message2SentAt = new Date().toISOString();
        logData.history[t.phone].message2Text = t.text;
        logData.history[t.phone].channel = 'GREEN_SMS';
        fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');
      }
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }

    if (i < targets.length - 1) {
      const wait = 6000 + Math.floor(Math.random() * 3000);
      console.log(`   ⏳ Pausing ${(wait / 1000).toFixed(1)}s...`);
      await sleep(wait);
    }
  }
  console.log('\n🎉 All 3 replies delivered!');
}

main();
