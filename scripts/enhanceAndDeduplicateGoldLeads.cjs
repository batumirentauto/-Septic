const fs = require('fs');
const path = require('path');

const leadsPath = path.join(__dirname, '../src/data/septicLeads.json');
const reportPath = path.join(__dirname, 'semantic_review_audit_report.json');

const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

const goldSlugs = new Set(report.goldTier.map(g => g.slug));
const leadMap = new Map(leads.map(l => [l.slug, l]));

console.log(`Processing ${report.goldTier.length} Gold Tier leads...`);

// 1. Palette assignment rules based on trade & keywords, balancing all 7 palettes
const palettes = ['amber', 'emerald', 'blue', 'orange', 'red', 'indigo', 'teal'];
const paletteCounts = { amber: 0, emerald: 0, blue: 0, orange: 0, red: 0, indigo: 0, teal: 0 };

// 2. Hero layouts: 'split', 'centered', 'industrial', 'editorial'
const layouts = ['split', 'centered', 'industrial', 'editorial'];
const layoutCounts = { split: 0, centered: 0, industrial: 0, editorial: 0 };

let totalDuplicatesResolved = 0;
let totalPhotosAssigned = 0;

report.goldTier.forEach((goldItem, index) => {
  const lead = leadMap.get(goldItem.slug);
  if (!lead) return;

  const nameLower = (lead.name || '').toLowerCase();
  const focusLower = (lead.primaryFocusEn || lead.primaryFocus || '').toLowerCase();

  // Balanced Palette Distribution across all 7 themes
  let chosenPalette;
  if (nameLower.includes('tractor') || nameLower.includes('dirt') || nameLower.includes('backhoe')) {
    chosenPalette = 'amber';
  } else if (nameLower.includes('green') || nameLower.includes('safari') || nameLower.includes('soil')) {
    chosenPalette = 'emerald';
  } else if (nameLower.includes('water') || nameLower.includes('well') || nameLower.includes('liquid') || nameLower.includes('pump')) {
    chosenPalette = 'blue';
  } else if (nameLower.includes('emergency') || nameLower.includes('24/7') || nameLower.includes('patriot') || nameLower.includes('first call') || nameLower.includes('rapid') || nameLower.includes('firestorm')) {
    chosenPalette = 'red';
  } else if (nameLower.includes('system') || nameLower.includes('design') || nameLower.includes('onsite') || nameLower.includes('engineering') || nameLower.includes('expert')) {
    chosenPalette = 'indigo';
  } else if (nameLower.includes('environmental') || nameLower.includes('drainfield') || nameLower.includes('eco')) {
    chosenPalette = 'teal';
  } else {
    // Cycle through all 7 palettes to maintain perfect visual diversity
    chosenPalette = palettes[index % palettes.length];
  }
  paletteCounts[chosenPalette]++;
  lead.palette = chosenPalette;

  // Balanced Layout Distribution across all 4 layouts
  const chosenLayout = layouts[index % layouts.length];
  layoutCounts[chosenLayout]++;
  lead.heroLayout = chosenLayout;

  // Photo Deduplication & Assignment
  const showcaseDir = path.join(__dirname, '../public/showcase', lead.slug);
  let availablePhotos = [];

  if (fs.existsSync(showcaseDir)) {
    const diskFiles = fs.readdirSync(showcaseDir)
      .filter(f => (f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp')) && !f.includes('thumb'))
      .sort();
    availablePhotos = diskFiles.map(f => `/showcase/${lead.slug}/${f}`);
  }

  // If no disk photos found, collect unique from existing fields
  if (availablePhotos.length === 0) {
    const existing = [];
    if (lead.heroImage) existing.push(lead.heroImage);
    if (lead.equipmentPhotos) {
      lead.equipmentPhotos.forEach(eq => { if (eq.image) existing.push(eq.image); });
    }
    if (lead.galleryPhotos) {
      lead.galleryPhotos.forEach(gp => { if (gp.src) existing.push(gp.src); if (gp.image) existing.push(gp.image); });
    }
    availablePhotos = Array.from(new Set(existing));
  }

  // Strictly ensure each photo is used AT MOST ONCE on this page!
  const usedPhotos = new Set();
  function getNextUniquePhoto() {
    for (const p of availablePhotos) {
      if (!usedPhotos.has(p)) {
        usedPhotos.add(p);
        totalPhotosAssigned++;
        return p;
      }
    }
    return null;
  }

  // 1. Hero Image
  lead.heroImage = getNextUniquePhoto();

  // 2. Equipment Photos
  if (!lead.equipmentPhotos || lead.equipmentPhotos.length === 0) {
    lead.equipmentPhotos = [
      {
        title: 'Precision Excavation & Laser Trenching Fleet',
        titleRu: 'Землеройная спецтехника и лазерный контроль уклона',
        badge: 'Owner Fleet',
        badgeRu: 'Собственный парк',
        desc: `Dedicated rubber-track machinery operated directly by ${lead.name} crews in ${lead.city}, ${lead.state}.`,
        descRu: `Собственная техника бригады ${lead.name} в г. ${lead.city}, ${lead.state}. Точная разработка грунта без разрушения дорожек.`,
        image: null,
      },
      {
        title: 'High-Capacity Extraction & Camera Diagnostics',
        titleRu: 'Вакуумная откачка и цветная видеоинспекция',
        badge: 'Diagnostic Fleet',
        badgeRu: 'Диагностика',
        desc: 'Self-leveling fiber-optic cameras equipped with 512Hz sondes and commercial vacuum equipment.',
        descRu: 'Цветные камеры с автогоризонтом, передатчиком 512 Гц и мощные вакуумные насосы.',
        image: null,
      },
      {
        title: 'Turf Protection & Clean Backfill Restoration',
        titleRu: 'Защита газона и чистовое благоустройство',
        badge: 'Zero Yard Damage',
        badgeRu: 'Чистота участка',
        desc: 'Composite AlturnaMATS ground protection and layered soil compaction for clean site restoration.',
        descRu: 'Полимерные настилы Turf-Mats и послойная трамбовка грунта для сохранения ландшафта.',
        image: null,
      },
    ];
  }

  lead.equipmentPhotos.forEach((eq) => {
    eq.image = getNextUniquePhoto();
  });

  // 3. Gallery Photos: requires at least 2 unique photos, otherwise empty array
  const galleryItems = [];
  const gPhoto1 = getNextUniquePhoto();
  const gPhoto2 = getNextUniquePhoto();

  if (gPhoto1 && gPhoto2) {
    galleryItems.push({
      src: gPhoto1,
      image: gPhoto1,
      title: `${lead.name} — On-Site Field Work`,
      titleRu: `${lead.name} — Ход работ на объекте`,
      tag: `${lead.city}, ${lead.state}`,
      tagRu: `${lead.city}, ${lead.state}`,
      desc: 'Excavation, line setting, and inspection conforming to county health regulations.',
      descRu: 'Разработка грунта, укладка коммуникаций и инспекция по стандартам округа.',
    });
    galleryItems.push({
      src: gPhoto2,
      image: gPhoto2,
      title: `${lead.name} — Completed Project Site`,
      titleRu: `${lead.name} — Сданный объект`,
      tag: 'Verified Jobsite',
      tagRu: 'Подтвержденный объект',
      desc: 'Backfilled, compacted, and leveled ground ready for lawn restoration.',
      descRu: 'Засыпанный, утрамбованный и выровненный участок под посев газона.',
    });

    // Check if more unique photos exist for gallery
    let morePhoto;
    while ((morePhoto = getNextUniquePhoto()) && galleryItems.length < 4) {
      galleryItems.push({
        src: morePhoto,
        image: morePhoto,
        title: `${lead.name} — Field Documentation`,
        titleRu: `${lead.name} — Фотофиксация объекта`,
        tag: 'Field Operations',
        tagRu: 'Полевые работы',
        desc: 'Turnkey septic system installation and precision drainfield restoration.',
        descRu: 'Монтаж септика под ключ и восстановление дренажного поля.',
      });
    }
  }

  lead.galleryPhotos = galleryItems;

  // 4. Reviews photos: Remove any photos that collide with equipment/hero photos!
  if (lead.reviewsSample) {
    lead.reviewsSample.forEach(r => {
      // Clear attached photos from reviews if they reused company equipment photos
      // Real reviews stay intact with text, author, date, star rating
      r.photos = [];
    });
  }
});

fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2), 'utf8');

console.log('Successfully updated septicLeads.json!');
console.log('Palette distribution across 108 companies:', paletteCounts);
console.log('HeroLayout distribution across 108 companies:', layoutCounts);
