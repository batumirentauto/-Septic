const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const septicLeads = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'septicLeads.json'), 'utf8'));

let visionCache = {};
try {
  visionCache = JSON.parse(fs.readFileSync(path.join(__dirname, 'photo_vision_cache.json'), 'utf8'));
} catch (e) {}

function md5(filePath) {
  try {
    return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
  } catch (e) {
    return null;
  }
}

const showcaseDir = path.join(__dirname, '..', 'public', 'showcase');

const results = [];

// Equipment patterns in reviews
const PATTERNS = [
  { type: 'VACUUM_TRUCK', regex: /\b(pump(?:er)?\s*truck|vacuum\s*truck|tanker(?:\s*truck)?|suction\s*hose|pumped\s*(?:out|our|the)\s*tank)\b/i, labelEn: 'Commercial Vacuum Tanker & Pumping Unit', labelRu: 'Ассенизаторская вакуумная автоцистерна' },
  { type: 'MINI_EXCAVATOR', regex: /\b(mini[-\s]?excavator|excavat(?:or|ion)|backhoe|digger|trench(?:er|ing))\b/i, labelEn: 'Compact Rubber-Track Excavator', labelRu: 'Компактный мини-экскаватор' },
  { type: 'SKID_STEER', regex: /\b(skid\s*steer|bobcat|loader|tractor)\b/i, labelEn: 'Compact Skid-Steer & Turf Loader', labelRu: 'Компактный гусеничный погрузчик' },
  { type: 'CAMERA_INSPECTION', regex: /\b(camera|scope|video\s*inspection|snake|snaked|auger)\b/i, labelEn: 'Sewer Line Color Camera & Diagnostic Sonde', labelRu: 'Цветная видеоинспекционная камера с зондом' },
  { type: 'HYDRO_JETTER', regex: /\b(hydro[-\s]?jet(?:ter|ting)?|jetting|high\s*pressure\s*water)\b/i, labelEn: 'High-Pressure Line Hydro-Jetter', labelRu: 'Гидродинамическая каналопромывочная установка' },
  { type: 'DRAINFIELD_TECH', regex: /\b(drain\s*field|drainfield|leach\s*(?:field|bed|line)|infiltrator|distribution\s*box|d-box)\b/i, labelEn: 'Laser-Graded Drainfield & Trenching Setup', labelRu: 'Лазерный комплекс укладки полей фильтрации' }
];

for (const lead of septicLeads) {
  const verifiedItems = [];
  const sources = [];

  // 1. Check Reviews
  const reviews = lead.reviewsSample || [];
  for (const r of reviews) {
    const text = r.text || '';
    for (const pat of PATTERNS) {
      const m = text.match(pat.regex);
      if (m && !verifiedItems.some(v => v.type === pat.type)) {
        verifiedItems.push({
          type: pat.type,
          labelEn: pat.labelEn,
          labelRu: pat.labelRu,
          matchedTerm: m[0],
          evidence: `Review by ${r.author}: "${text.slice(0, 110)}..."`
        });
        sources.push(`Review (${m[0]})`);
      }
    }
  }

  // 2. Check Showcase Photos with Vision Cache
  const folderPath = path.join(showcaseDir, lead.slug);
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    for (const file of files) {
      const hash = md5(path.join(folderPath, file));
      if (hash && visionCache[hash]) {
        const cat = visionCache[hash].category;
        const summary = visionCache[hash].summary;

        if (cat === 'VACUUM_TRUCK' && !verifiedItems.some(v => v.type === 'VACUUM_TRUCK')) {
          verifiedItems.push({
            type: 'VACUUM_TRUCK',
            labelEn: 'Commercial Vacuum Tanker Truck',
            labelRu: 'Вакуумная цистерна для откачки ила',
            matchedTerm: 'Photo: Vacuum Truck',
            evidence: summary
          });
          sources.push('Photo: Vacuum Truck');
        } else if (cat === 'EXCAVATOR_MACHINERY' && !verifiedItems.some(v => v.type === 'MINI_EXCAVATOR')) {
          verifiedItems.push({
            type: 'MINI_EXCAVATOR',
            labelEn: 'Tracked Mini-Excavator & Trenching Rig',
            labelRu: 'Гусеничный мини-экскаватор',
            matchedTerm: 'Photo: Excavator',
            evidence: summary
          });
          sources.push('Photo: Excavator');
        } else if (cat === 'DRAINFIELD_PIPES' && !verifiedItems.some(v => v.type === 'DRAINFIELD_TECH')) {
          verifiedItems.push({
            type: 'DRAINFIELD_TECH',
            labelEn: 'Laser-Guided Drainfield Chamber & Lateral Equipment',
            labelRu: 'Оборудование для укладки дренажных камер и труб',
            matchedTerm: 'Photo: Drainfield Chambers',
            evidence: summary
          });
          sources.push('Photo: Drainfield');
        } else if (cat === 'CAMERA_DIAGNOSTICS' && !verifiedItems.some(v => v.type === 'CAMERA_INSPECTION')) {
          verifiedItems.push({
            type: 'CAMERA_INSPECTION',
            labelEn: 'Pipeline Video Camera Diagnostic Rig',
            labelRu: 'Видеоинспекционная система труб',
            matchedTerm: 'Photo: Camera Inspection',
            evidence: summary
          });
          sources.push('Photo: Camera');
        }
      }
    }
  }

  results.push({
    slug: lead.slug,
    name: lead.name,
    hasEquipment: verifiedItems.length > 0,
    items: verifiedItems,
    sources
  });
}

const withEq = results.filter(r => r.hasEquipment);
const withoutEq = results.filter(r => !r.hasEquipment);

console.log(`=========================================`);
console.log(`TOTAL LEADS: ${results.length}`);
console.log(`LEADS WITH VERIFIED EQUIPMENT: ${withEq.length}`);
console.log(`LEADS WITHOUT MENTIONED EQUIPMENT: ${withoutEq.length}`);
console.log(`=========================================`);

console.log(`\nSample Leads with Verified Equipment:`);
withEq.slice(0, 8).forEach(l => {
  console.log(`\n🏢 ${l.name} (${l.slug}):`);
  l.items.forEach(i => console.log(`   - [${i.type}]: ${i.labelEn} (evidence: ${i.evidence})`));
});

console.log(`\nSample Leads with ZERO mentioned equipment:`);
withoutEq.slice(0, 10).forEach(l => console.log(`   - ${l.name} (${l.slug})`));
