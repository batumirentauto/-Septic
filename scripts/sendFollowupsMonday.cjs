// scripts/sendFollowupsMonday.cjs
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

const followups = [
  {
    company: '1213 Plumbing',
    owner: 'Rudy',
    phone: '+18067827454',
    city: 'Lubbock',
    group: 'A',
    slug: '1213-plumbing',
    text: `Got it Rudy - reason I reached out: saw your 5-star reputation in Lubbock, but noticed customers have trouble opening your site on phones, so some folks looking for $10k+ replacements call competitors.\n\nPut together a clean mobile showcase with your machinery to fix that. Mind if I text you the link to see if the info and photos look accurate?`
  },
  {
    company: 'Pro-Tec Septic',
    owner: 'Jason',
    phone: '+15126144444',
    city: 'Georgetown',
    group: 'A',
    slug: 'pro-tec-septic',
    text: `Got it Jason - reason I reached out: saw your 4.6-star reputation in Georgetown, but noticed customers have trouble opening your site on phones, so some folks looking for $10k+ replacements call competitors.\n\nPut together a clean mobile showcase with your machinery to fix that. Mind if I text you the link to see if the info and photos look accurate?`
  },
  {
    company: 'ABC Quick Pump Septic Service & Rentals',
    owner: 'Cameron',
    phone: '+14798775868',
    city: 'Rogers',
    group: 'A',
    slug: 'abc-quick-pump-septic-service-rentals',
    text: `Got it Cameron - reason I reached out: saw your 5-star reputation in Rogers, but noticed customers have trouble opening your site on phones, so some folks looking for $10k+ replacements call competitors.\n\nPut together a clean mobile showcase with your machinery to fix that. Mind if I text you the link to see if the info and photos look accurate?`
  },
  {
    company: 'Sherlock Homes plumbing and sewer',
    owner: 'James',
    phone: '+19139542185',
    city: 'Olathe',
    group: 'B',
    slug: 'sherlock-homes-plumbing-and-sewer',
    text: `Got it James - reason I reached out: saw your 5-star reputation in Olathe, but noticed customers have trouble opening your site on phones, so some folks looking for $10k+ replacements call competitors.\n\nPut together a mobile showcase with your machinery: https://zonus.co/sherlock-homes-plumbing-and-sewer\n(No worries if you avoid links from new numbers - can text a quick video instead!)\n\nTake 10 sec on your phone - does the info look accurate?`
  }
];

async function main() {
  console.log('🚀 Sending approved Message 2 followups...');
  for (let i = 0; i < followups.length; i++) {
    const f = followups[i];
    console.log(`[${i + 1}/${followups.length}] Sending to ${f.owner} (${f.company}) - ${f.phone} [Group ${f.group}]`);
    try {
      await sendGreenSms(f.phone, f.text);
      console.log(`   🟢 Sent successfully via Green SMS!`);

      // Update log
      if (fs.existsSync(LOG_FILE)) {
        const logData = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        if (!logData.history) logData.history = {};
        if (logData.history[f.phone]) {
          logData.history[f.phone].message2Sent = true;
          logData.history[f.phone].message2SentAt = new Date().toISOString();
          logData.history[f.phone].message2Text = f.text;
        }
        fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');
      }
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }

    if (i < followups.length - 1) {
      const wait = 6000 + Math.floor(Math.random() * 4000);
      console.log(`   ⏳ Waiting ${(wait / 1000).toFixed(1)}s before next message...`);
      await sleep(wait);
    }
  }
  console.log('\n🎉 All 4 followups dispatched!');
}

main();
