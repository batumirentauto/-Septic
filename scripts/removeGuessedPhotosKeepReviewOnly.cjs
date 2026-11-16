const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'septicLeads.json');
const BACKUP_PATH = path.join(__dirname, '..', 'src', 'data', 'septicLeads.backup.json');

const leads = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

// Save safety backup
fs.writeFileSync(BACKUP_PATH, JSON.stringify(leads, null, 2), 'utf8');
console.log(`Safety backup saved to ${BACKUP_PATH}`);

let updatedCount = 0;

for (const lead of leads) {
  lead.heroImage = null;
  lead.galleryPhotos = [];
  lead.photosSample = [];

  if (lead.equipmentPhotos && Array.isArray(lead.equipmentPhotos)) {
    lead.equipmentPhotos = lead.equipmentPhotos.map(item => ({
      ...item,
      image: null
    }));
  }

  // Reviews: strictly keep photos only if they belong to that review
  if (lead.reviewsSample && Array.isArray(lead.reviewsSample)) {
    lead.reviewsSample = lead.reviewsSample.map(r => ({
      ...r,
      photos: Array.isArray(r.photos) ? r.photos.filter(p => typeof p === 'string' && p.trim().length > 0) : []
    }));
  }

  updatedCount++;
}

fs.writeFileSync(DATA_PATH, JSON.stringify(leads, null, 2), 'utf8');
console.log(`✅ Successfully updated ${updatedCount} leads in ${DATA_PATH}:`);
console.log(`   - heroImage set to null`);
console.log(`   - galleryPhotos set to []`);
console.log(`   - equipmentPhotos images set to null`);
console.log(`   - photos in reviews preserved strictly if attached to review`);
