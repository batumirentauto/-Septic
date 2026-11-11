// scripts/sendSundayEveningLeads.cjs
// Sends concise Message 2 using the high-trust zonus.co studio domain.

const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execFileAsync = promisify(execFile);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const leads = [
  {
    name: 'Matt',
    company: 'MG Septic LLC',
    phone: '+15187278699',
    city: 'Albany',
    slug: 'mg-septic-llc',
    text: `Got it Matt — reason I reached out: saw your 4.7-star reputation on Google, folks clearly respect your work in Albany.

Only thing is, customers have trouble opening your website from Google, so when local homeowners look for major $10k+ replacements, some end up going to competitors.

I put together a clean mobile showcase with your actual machinery and top reviews: https://zonus.co/mg-septic-llc

Take 10 sec on your phone — does the info look accurate?`
  },
  {
    name: 'James',
    company: 'ABC Septic Service',
    phone: '+12396286200',
    city: 'Fort Myers',
    slug: 'abc-septic-service',
    text: `Got it James — reason I reached out: saw your 4.9-star reputation on Google, folks clearly respect your work in Fort Myers.

Only thing is, customers have trouble opening your website from Google, so when local homeowners look for major $10k+ replacements, some end up going to competitors.

I put together a clean mobile showcase with your actual machinery and top reviews: https://zonus.co/abc-septic-service

Take 10 sec on your phone — does the info look accurate?`
  },
  {
    name: 'Mike',
    company: 'Tri-County Excavating',
    phone: '+15185281646',
    city: 'Albany',
    slug: 'tri-county-excavating',
    text: `Got it Mike — reason I reached out: saw your 5-star reputation on Google, folks clearly respect your work in Albany.

Only thing is, customers have trouble opening your website from Google, so when local homeowners look for major $10k+ replacements, some end up going to competitors.

I put together a clean mobile showcase with your actual machinery and top reviews: https://zonus.co/tri-county-excavating

Take 10 sec on your phone — does the info look accurate?`
  },
  {
    name: 'Chris',
    company: 'Sudano Septic & Sanitation',
    phone: '+12033096264',
    city: 'New Fairfield',
    slug: 'sudano-septic-sanitation',
    text: `Got it Chris — reason I reached out: saw your 4.9-star reputation on Google, folks clearly respect your work in New Fairfield.

Only thing is, customers have trouble opening your website from Google, so when local homeowners look for major $10k+ replacements, some end up going to competitors.

I put together a clean mobile showcase with your actual machinery and top reviews: https://zonus.co/sudano-septic-sanitation

Take 10 sec on your phone — does the info look accurate?`
  },
  {
    name: 'Jason',
    company: 'Septic Experts',
    phone: '+17063004264',
    city: 'Dahlonega',
    slug: 'septic-experts',
    text: `Got it Jason — reason I reached out: saw your 4.8-star reputation on Google, folks clearly respect your work in Dahlonega.

Only thing is, customers have trouble opening your website from Google, so when local homeowners look for major $10k+ replacements, some end up going to competitors.

I put together a clean mobile showcase with your actual machinery and top reviews: https://zonus.co/septic-experts

Take 10 sec on your phone — does the info look accurate?`
  }
];

async function sendGreenSmsText(phone, text) {
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
  console.log(`========================================================================`);
  console.log(`🚀 WARM LEAD OUTREACH (Domain: zonus.co) (Total: ${leads.length})`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no SMS sent)' : 'LIVE SEND'}`);
  console.log(`========================================================================\n`);

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    console.log(`[${i + 1}/${leads.length}] 📩 ${lead.name} (${lead.company}) -> ${lead.phone}`);
    console.log(`   Text:\n${lead.text.split('\n').map(l => '   ' + l).join('\n')}\n`);
  }

  console.log('=== Done! ===');
}

main().catch(console.error);
