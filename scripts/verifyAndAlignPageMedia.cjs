#!/usr/bin/env node
/**
 * verifyAndAlignPageMedia.cjs
 *
 * Automated Multimodal AI Auditor & Auto-Aligner for Septic Showcase Pages.
 * 
 * 1. Inspects all photos on a lead's page (Hero, Equipment Cards, Gallery).
 * 2. Uses Gemini Vision (gemini-3.5-flash) to classify the photo into technical domain categories.
 * 3. Enforces strict AGENTS.md rules:
 *    - Zero irrelevant fillers (domestic gas stoves, toilets, weeds, random junk are immediately purged -> image: null).
 *    - Zero duplicate photos on the same page (Hero, Equipment, Gallery are all unique).
 *    - Automatic semantic alignment: If photo is an open tank, card title becomes "Subsurface Septic Tank & Baffle Inspection", NOT "Vacuum Pumper Truck".
 *    - Perfect Russian and English typography, badges, and specs.
 * 4. Caches classifications in scripts/photo_vision_cache.json for instantaneous re-runs.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let GoogleGenAI;
try {
  const genai = require('@google/genai');
  GoogleGenAI = genai.GoogleGenAI;
} catch (e) {
  console.error("Please ensure @google/genai is installed.");
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in environment or .env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const CACHE_FILE = path.join(__dirname, 'photo_vision_cache.json');
let visionCache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    visionCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (e) {
    visionCache = {};
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(visionCache, null, 2));
}

// Convert web URL to local filesystem path
function resolveImagePath(webUrl) {
  if (!webUrl) return null;
  const clean = webUrl.split('?')[0];
  // check public directory
  const localPath = path.join('public', clean.replace(/^\//, ''));
  if (fs.existsSync(localPath)) return localPath;
  return null;
}

// Analyze image using Gemini 3.5 Flash
async function classifyImageWithGemini(localPath) {
  const buffer = fs.readFileSync(localPath);
  const hash = require('crypto').createHash('md5').update(buffer).digest('hex');

  if (visionCache[hash]) {
    return { ...visionCache[hash], hash };
  }

  // Use thumb if available for faster network transport
  let analysisPath = localPath;
  const thumbPath = localPath.replace('_opt.jpg', '_thumb.jpg');
  if (fs.existsSync(thumbPath)) {
    analysisPath = thumbPath;
  }

  const analysisBuffer = fs.readFileSync(analysisPath);
  const prompt = `You are a strict technical auditor for septic system contractors.
Analyze this photo and classify it into EXACTLY ONE category:
1. VACUUM_TRUCK (commercial vacuum truck, pumper tanker, honey wagon, waste pumping fleet, suction hose connection)
2. EXCAVATOR_MACHINERY (mini-excavator, tracked backhoe, skid-steer trenching, heavy earthmoving equipment)
3. SEPTIC_TANK_ACCESS (open septic tank opening, concrete manhole cover, riser inspection, scum/sludge layer in tank, inlet baffle)
4. DRAINFIELD_PIPES (drain field gravel trench, perforated leaching pipes, plastic infiltrator chambers, distribution box D-box)
5. CAMERA_DIAGNOSTICS (pipe inspection camera screen, fiber-optic reel, underground 512Hz sonde locator, sewer jetter)
6. SERVICE_VAN (branded service truck, plumbing utility van, contractor dispatch vehicle, technician crew)
7. YARD_RESTORATION (clean green lawn with flush septic lids/risers, clean backfilled soil, property grading)
8. IRRELEVANT_DOMESTIC (kitchen stove, water heater in closet with toys, indoor bathroom toilet/sink, random garden fence, dark crawlspace, blurry garbage, irrelevant)

Return JSON ONLY:
{
  "category": "VACUUM_TRUCK" | "EXCAVATOR_MACHINERY" | "SEPTIC_TANK_ACCESS" | "DRAINFIELD_PIPES" | "CAMERA_DIAGNOSTICS" | "SERVICE_VAN" | "YARD_RESTORATION" | "IRRELEVANT_DOMESTIC",
  "confidence": 0.0 to 1.0,
  "summary": "1 sentence explanation of what is visually depicted in the image"
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: analysisBuffer.toString("base64")
          }
        }
      ]
    });

    const raw = response.text || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      visionCache[hash] = parsed;
      saveCache();
      return { ...parsed, hash };
    }
  } catch (err) {
    if (err.message && (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED") || err.message.includes("quota") || err.message.includes("rate limit"))) {
      console.error(`\n❌ FATAL: Gemini Vision API quota exhausted (429 RESOURCE_EXHAUSTED)!`);
      console.error(`Aborting execution immediately with exit code 1 to protect data integrity and prevent fallback pollution.`);
      process.exit(1);
    }
    console.error(`Gemini Vision error for ${localPath}:`, err.message);
    throw err;
  }
}

// Generate card metadata based on image category and company context
function getCardMetadataForCategory(category, companyName, city, state) {
  switch (category) {
    case 'VACUUM_TRUCK':
      return {
        title: `Commercial Septic Vacuum Fleet in ${city}`,
        titleRu: `Вакуумные цистерны и спецтранспорт в г. ${city}`,
        badge: "Company-Owned Fleet",
        badgeRu: "Собственный автопарк",
        desc: `High-capacity commercial vacuum trucks operated directly by ${companyName} crews in ${city}, ${state}. Engineered for deep sludge extraction and sanitary compliance.`,
        descRu: `Собственные вакуумные ассенизаторские цистерны бригады ${companyName} в г. ${city}, ${state}. Обеспечивают полную откачку донного осадка и герметичную утилизацию стоков.`
      };

    case 'EXCAVATOR_MACHINERY':
      return {
        title: `Precision Excavation & Heavy Fleet in ${city}`,
        titleRu: `Землеройная спецтехника и экскаваторы в г. ${city}`,
        badge: "Heavy Excavation",
        badgeRu: "Тяжелая спецтехника",
        desc: `Dedicated tracked excavators operated directly by ${companyName} crews for surgical trenching, tank placement, and grade control in ${city}.`,
        descRu: `Собственные компактные экскаваторы бригады ${companyName} для точной разработки траншей, монтажа резервуаров и планировки уклонов в г. ${city}.`
      };

    case 'SEPTIC_TANK_ACCESS':
      return {
        title: `Subsurface Septic Tank & Baffle Inspection`,
        titleRu: `Вскрытие резервуара и ревизия перегородок септика`,
        badge: "Tank Diagnostics",
        badgeRu: "Ревизия резервуара",
        desc: `Field inspection uncovering concrete tank access openings, inlet/outlet baffles, and sludge depth to verify watertight system integrity.`,
        descRu: `Вскрытие технологических люков септика, проверка целостности перегородок и толщины жировой шапки для оценки технического состояния емкости.`
      };

    case 'DRAINFIELD_PIPES':
      return {
        title: `Laser-Graded Drain Field Trenching & Bedding`,
        titleRu: `Лазерное нивелирование полей фильтрации и траншей`,
        badge: "Drainfield Engineering",
        badgeRu: "Дренажный контур",
        desc: `Engineered gravel bedding and perforated distribution lines laid with optical laser transits for permanent gravity wastewater dispersal.`,
        descRu: `Укладка мытого гранитного щебня и перфорированных распределительных магистралей с лазерным контролем уклона для бесперебойного самотека.`
      };

    case 'CAMERA_DIAGNOSTICS':
      return {
        title: `512Hz Sonde High-Definition Camera Inspection`,
        titleRu: `Телеинспекция магистралей и радиозонд 512 Гц`,
        badge: "Diagnostic Equipment",
        badgeRu: "Видеодиагностика",
        desc: `Color sewer camera reels with integrated 512Hz locating sondes detect pipe blockages, root intrusions, and buried tank lids without digging.`,
        descRu: `Цветные видеокамеры высокого разрешения с радиозондом 512 Гц точно определяют места засоров, трещин и закопанных крышек без лишних раскопок.`
      };

    case 'SERVICE_VAN':
      return {
        title: `Mobile Priority Dispatch & Utility Unit in ${city}`,
        titleRu: `Мобильный сервисный комплекс быстрого реагирования`,
        badge: "Priority Dispatch",
        badgeRu: "Спецтранспорт бригады",
        desc: `Fully equipped service vehicle stocked with diagnostics, pumps, and emergency tooling operated directly by ${companyName} in ${city}.`,
        descRu: `Укомплектованный сервисный автомобиль со всем необходимым ремонтным оборудованием и запчастями бригады ${companyName} в г. ${city}.`
      };

    case 'YARD_RESTORATION':
    default:
      return {
        title: `Turf Protection & Clean Backfill Restoration`,
        titleRu: `Защита ландшафта и чистовая обратная засыпка`,
        badge: "Property Preservation",
        badgeRu: "Чистота участка",
        desc: `Every project in ${city} includes layered soil compaction, grade-level access riser fitting, and smooth surface finishing so your lawn looks pristine upon completion.`,
        descRu: `Каждый выезд в г. ${city} завершается послойной трамбовкой грунта, выводом ревизионных крышек в уровень с травой и чистовым разравниванием площадки.`
      };
  }
}

// Main function to audit and auto-align a lead
async function auditAndAlignLead(lead) {
  const companyName = lead.name || lead.slug;
  const city = lead.city || 'Local Area';
  const state = lead.state || 'US';
  const slug = lead.slug;

  console.log(`\n============================================================`);
  console.log(`Auditing & Aligning Media: ${companyName} (${slug})`);
  console.log(`============================================================`);

  // Collect all candidate photo URLs from lead
  const rawUrls = [];
  if (lead.heroImage) rawUrls.push(lead.heroImage);
  (lead.equipmentPhotos || []).forEach(eq => { if (eq.image) rawUrls.push(eq.image); });
  (lead.galleryPhotos || []).forEach(g => { if (g.image) rawUrls.push(g.image); });
  (lead.photosSample || []).forEach(u => { if (u && !rawUrls.includes(u)) rawUrls.push(u); });

  // Classify all unique local images
  const classifiedPhotos = [];
  const seenHashes = new Set();

  for (const webUrl of rawUrls) {
    const localPath = resolveImagePath(webUrl);
    if (!localPath) continue;

    const classification = await classifyImageWithGemini(localPath);
    if (seenHashes.has(classification.hash)) continue;
    seenHashes.add(classification.hash);

    console.log(`  [Photo: ${path.basename(localPath)}] -> ${classification.category} (${classification.summary})`);

    // Filter out IRRELEVANT_DOMESTIC
    if (classification.category === 'IRRELEVANT_DOMESTIC') {
      console.log(`    ⚠️ PURGED: Irrelevant photo removed (${classification.summary})`);
      continue;
    }

    classifiedPhotos.push({
      webUrl,
      localPath,
      ...classification
    });
  }

  console.log(`  -> Valid verified equipment photos: ${classifiedPhotos.length}`);

  // ---------------------------------------------------------
  // STEP 1: HERO IMAGE ALIGNMENT
  // ---------------------------------------------------------
  // Hero prefers VACUUM_TRUCK, then EXCAVATOR_MACHINERY, then SERVICE_VAN, then best available
  let heroPhoto = null;
  const heroCandidates = ['VACUUM_TRUCK', 'EXCAVATOR_MACHINERY', 'SERVICE_VAN', 'DRAINFIELD_PIPES', 'SEPTIC_TANK_ACCESS'];
  for (const cat of heroCandidates) {
    const found = classifiedPhotos.find(p => p.category === cat);
    if (found) {
      heroPhoto = found;
      break;
    }
  }
  if (!heroPhoto && classifiedPhotos.length > 0) {
    heroPhoto = classifiedPhotos[0];
  }

  lead.heroImage = heroPhoto ? heroPhoto.webUrl : null;

  // Remaining photos available for equipment cards and gallery (STRICT ZERO DUPLICATES!)
  const pool = classifiedPhotos.filter(p => !heroPhoto || p.hash !== heroPhoto.hash);

  // ---------------------------------------------------------
  // STEP 2: EQUIPMENT CARDS (3 Cards) - STRICT ROLE SEPARATION
  // ---------------------------------------------------------
  // Card 1: ALWAYS Fleet & Dispatch
  // Card 2: ALWAYS Core Process / Pumping / Trenching / Camera
  // Card 3: ALWAYS Site Preservation / Risers / Sanitation
  // NO TWO CARDS CAN EVER HAVE THE SAME TITLE!
  const equipmentCards = [];
  const usedTitles = new Set();

  for (let cardIdx = 0; cardIdx < 3; cardIdx++) {
    const photo = pool[cardIdx] || null;

    let defaultCat = cardIdx === 0 ? 'VACUUM_TRUCK' : (cardIdx === 1 ? 'CAMERA_DIAGNOSTICS' : 'YARD_RESTORATION');
    let chosenCat = (photo && photo.category !== 'UNKNOWN') ? photo.category : defaultCat;

    let meta = getCardMetadataForCategory(chosenCat, companyName, city, state);

    // If title already used by previous card on this page, force slot-specific distinction!
    if (usedTitles.has(meta.title)) {
      if (cardIdx === 1) {
        meta = getCardMetadataForCategory('CAMERA_DIAGNOSTICS', companyName, city, state);
      } else {
        meta = getCardMetadataForCategory('YARD_RESTORATION', companyName, city, state);
      }
    }
    usedTitles.add(meta.title);

    equipmentCards.push({
      title: meta.title,
      titleRu: meta.titleRu,
      badge: meta.badge,
      badgeRu: meta.badgeRu,
      desc: meta.desc,
      descRu: meta.descRu,
      image: photo ? photo.webUrl : null
    });

    console.log(`  Card ${cardIdx + 1} (${chosenCat}): ${meta.title} | Image: ${photo ? photo.webUrl : 'null'}`);
  }

  lead.equipmentPhotos = equipmentCards;

  // ---------------------------------------------------------
  // STEP 3: GALLERY PHOTOS (Index 3 and beyond from pool)
  // ---------------------------------------------------------
  // A gallery requires at least 2 photos; a lonely single-card gallery looks broken and empty.
  const galleryPool = pool.slice(3, 7); // up to 4 remaining unique photos
  const galleryItems = [];

  if (galleryPool.length >= 2) {
    for (let gIdx = 0; gIdx < galleryPool.length; gIdx++) {
      const photo = galleryPool[gIdx];
      const meta = getCardMetadataForCategory(photo.category, companyName, city, state);
      galleryItems.push({
        title: meta.title,
        titleRu: meta.titleRu,
        tag: meta.badge,
        tagRu: meta.badgeRu,
        desc: meta.desc,
        descRu: meta.descRu,
        image: photo.webUrl
      });
    }
  }

  lead.galleryPhotos = galleryItems;
  lead.photosCount = classifiedPhotos.length;

  console.log(`  Summary: Hero: ${Boolean(lead.heroImage)}, Equipment with photos: ${equipmentCards.filter(c => c.image).length}/3, Gallery photos: ${galleryItems.length}`);
  return lead;
}

// CLI Execution
async function main() {
  const args = process.argv.slice(2);
  const targetSlug = args[0];

  const leadsPath = path.join('src', 'data', 'septicLeads.json');
  const masterLeads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
  const masterBySlug = {};
  masterLeads.forEach(l => masterBySlug[l.slug] = l);

  let targets = [];

  if (!targetSlug || targetSlug === '--calls') {
    const callLeads = JSON.parse(fs.readFileSync(path.join('src', 'data', 'callLeads.json'), 'utf8'));
    targets = callLeads.map(c => c.slug);
    if (!targets.includes('premier-septic-services')) targets.push('premier-septic-services');
  } else if (targetSlug === '--all') {
    targets = masterLeads.map(l => l.slug);
  } else {
    targets = [targetSlug];
  }

  console.log(`Starting media verification & auto-alignment for ${targets.length} lead(s)...`);

  for (let i = 0; i < targets.length; i++) {
    const slug = targets[i];
    const lead = masterBySlug[slug];
    if (!lead) {
      console.log(`Lead ${slug} not found, skipping.`);
      continue;
    }

    await auditAndAlignLead(lead);

    // Save progressively every 5 leads or on single lead
    if ((i + 1) % 5 === 0 || i === targets.length - 1) {
      fs.writeFileSync(leadsPath, JSON.stringify(masterLeads, null, 2));
      console.log(`Saved master leads progress (${i + 1}/${targets.length}).`);
    }
  }

  console.log(`\n🎉 Verification and alignment complete!`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { auditAndAlignLead };
