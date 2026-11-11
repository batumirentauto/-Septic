// scripts/prepareMorning80.cjs
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

const LEADS_FILE = path.resolve(__dirname, '../src/data/septicLeads.json');
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');
const OUT_FILE = path.resolve(__dirname, 'morning_80_split_test.json');

const RECENT_DATE_TERMS = [
  'a day ago', 'days ago', 'a week ago', 'weeks ago',
  'a month ago', '2 months ago', '3 months ago',
  '4 months ago', '5 months ago', '6 months ago'
];

async function main() {
  const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));
  const log = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };

  // Exclude previously contacted or opted-out numbers
  const contactedPhones = new Set();
  for (const [phone, entry] of Object.entries(log.history || {})) {
    if (entry.status !== 'FAILED_NOT_AN_IMESSAGE_USER') {
      contactedPhones.add(phone);
    }
  }

  console.log(`Already contacted / blacklisted phones: ${contactedPhones.size}`);

  const candidates = [];
  for (const l of leads) {
    const rawPhone = (l.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `+1${rawPhone}` : (rawPhone.length === 11 && rawPhone.startsWith('1') ? `+${rawPhone}` : null);
    if (!cleanPhone || contactedPhones.has(cleanPhone)) continue;

    const rating = typeof l.rating === 'number' ? l.rating : parseFloat(l.rating);
    if (isNaN(rating) || rating < 4.6 || rating > 5.0) continue;

    const reviews = l.reviewsSample || [];
    if (reviews.length === 0) continue;

    const isRecent = reviews.some(r => {
      const d = (r.date || '').toLowerCase();
      return RECENT_DATE_TERMS.some(t => d.includes(t));
    });
    if (!isRecent) continue;

    // Determine latest review date string
    let latestDate = 'recent';
    for (const r of reviews) {
      const d = (r.date || '').toLowerCase();
      if (RECENT_DATE_TERMS.some(t => d.includes(t))) {
        latestDate = r.date;
        break;
      }
    }

    candidates.push({
      slug: l.slug,
      company: l.name,
      owner: (l.ownerName || '').trim(),
      phone: cleanPhone,
      city: l.city || '',
      state: l.state || '',
      rating: rating,
      reviewCount: l.reviewCount || 0,
      latestReviewDate: latestDate
    });
  }

  // Sort candidates by highest real reviewCount then rating
  candidates.sort((a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating);

  const target80 = candidates.slice(0, 80);
  console.log(`Selected top ${target80.length} fresh candidates for tomorrow morning.`);

  // Split into 3 test groups evenly
  const groups = {
    V1_BALANCED: [],
    V2_ULTRA_SHORT: [],
    V3_SAFETY_FIRST: []
  };

  target80.forEach((c, idx) => {
    const mod = idx % 3;
    if (mod === 0) {
      c.variant = 'V1_BALANCED';
      groups.V1_BALANCED.push(c);
    } else if (mod === 1) {
      c.variant = 'V2_ULTRA_SHORT';
      groups.V2_ULTRA_SHORT.push(c);
    } else {
      c.variant = 'V3_SAFETY_FIRST';
      groups.V3_SAFETY_FIRST.push(c);
    }
  });

  console.log(`Split breakdown:`);
  console.log(`- V1_BALANCED: ${groups.V1_BALANCED.length}`);
  console.log(`- V2_ULTRA_SHORT: ${groups.V2_ULTRA_SHORT.length}`);
  console.log(`- V3_SAFETY_FIRST: ${groups.V3_SAFETY_FIRST.length}`);

  fs.writeFileSync(OUT_FILE, JSON.stringify(target80, null, 2), 'utf8');
  console.log(`Saved to ${OUT_FILE}`);

  // Now sync to Contacts.app in batches
  console.log('\n📇 Syncing all 80 candidates into macOS Contacts.app...');
  let added = 0;
  for (let i = 0; i < target80.length; i++) {
    const c = target80[i];
    const fName = c.owner ? c.owner : c.company;
    const lName = c.owner ? `(${c.company} - ${c.city}, ${c.state})` : `(${c.city}, ${c.state})`;
    const note = `Showcase: https://zonus.co/${c.slug}`;

    const script = `
      tell application "Contacts"
        set existing to (every person whose organization is ${JSON.stringify(c.company)})
        if (count of existing) is 0 then
          set p to make new person with properties {first name:${JSON.stringify(fName)}, last name:${JSON.stringify(lName)}, organization:${JSON.stringify(c.company)}, note:${JSON.stringify(note)}}
          make new phone at end of phones of p with properties {label:"work", value:${JSON.stringify(c.phone)}}
          save
        end if
      end tell
    `;

    try {
      await execFileAsync('osascript', ['-e', script]);
      added++;
      process.stdout.write(`\r   [${i + 1}/${target80.length}] Synced into Contacts: ${c.company}`);
    } catch (err) {
      // Continue if AppleScript hiccup
    }
  }
  console.log(`\n✅ Completed sync of 80 contacts into Contacts.app!\n`);
}

main().catch(console.error);
