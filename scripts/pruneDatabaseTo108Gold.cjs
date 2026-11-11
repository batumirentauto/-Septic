const fs = require('fs');
const path = require('path');

const leadsPath = path.join(__dirname, '../src/data/septicLeads.json');
const callLeadsPath = path.join(__dirname, '../src/data/callLeads.json');
const reportPath = path.join(__dirname, 'semantic_review_audit_report.json');
const showcaseDir = path.join(__dirname, '../public/showcase');

const allLeads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const goldSlugs = new Set(report.goldTier.map(g => g.slug));
console.log(`Starting pruning. Total current leads: ${allLeads.length}. Target 108 gold leads.`);

// 1. Filter septicLeads.json
const goldLeads = allLeads.filter(l => goldSlugs.has(l.slug));

if (goldLeads.length !== 108) {
  console.error(`ERROR: Expected 108 gold leads, but filtered to ${goldLeads.length}! Aborting.`);
  process.exit(1);
}

fs.writeFileSync(leadsPath, JSON.stringify(goldLeads, null, 2), 'utf8');
console.log(`✅ Filtered src/data/septicLeads.json to exactly ${goldLeads.length} leads.`);

// 2. Update callLeads.json with all 108 gold leads
const updatedCallLeads = goldLeads.map(lead => {
  const sampleRev = lead.reviewsSample && lead.reviewsSample.length > 0 ? lead.reviewsSample[0] : null;
  return {
    slug: lead.slug,
    company: lead.name,
    owner: lead.ownerName || lead.owner || '',
    phone: lead.phone || '',
    city: lead.city || '',
    state: lead.state || '',
    rating: lead.rating,
    reviewCount: lead.reviewCount || 0,
    hookAuthor: sampleRev?.author || 'Verified Client',
    hookText: sampleRev?.text ? sampleRev.text.substring(0, 160) + '...' : '',
    palette: lead.palette || 'amber',
  };
});

fs.writeFileSync(callLeadsPath, JSON.stringify(updatedCallLeads, null, 2), 'utf8');
console.log(`✅ Updated src/data/callLeads.json with all ${updatedCallLeads.length} gold tier leads.`);

// 3. Clean up public/showcase folders (remove all non-gold directories)
let deletedDirs = 0;
let keptDirs = 0;

if (fs.existsSync(showcaseDir)) {
  const dirs = fs.readdirSync(showcaseDir);
  dirs.forEach(d => {
    const fullPath = path.join(showcaseDir, d);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!goldSlugs.has(d)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        deletedDirs++;
      } else {
        keptDirs++;
      }
    }
  });
}
console.log(`✅ Deleted ${deletedDirs} obsolete showcase directories. Kept ${keptDirs} directories for the 108 gold leads.`);
