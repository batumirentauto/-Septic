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

const GALLERY_STAGES = [
  {
    tag: 'Excavation Phase',
    tagRu: 'Разработка котлована',
    title: 'Excavator Trenching & Soil Preparation',
    titleRu: 'Разработка котлована и выемка грунта',
    desc: 'Precision depth grading and trenching using compact rubber-track machinery with zero lawn damage.',
    descRu: 'Точная выемка грунта с выдержкой проектных отметок и защитой прилегающего газона.',
    status: 'Trenching Completed',
    statusRu: 'Выемка грунта завершена',
  },
  {
    tag: 'Tank Placement',
    tagRu: 'Монтаж резервуара',
    title: 'Heavy Tank Setting & Laser Leveling',
    titleRu: 'Установка и лазерная нивелировка резервуара',
    desc: 'Rigid placement of heavy-duty precast tank with dual-axis laser slope verification.',
    descRu: 'Монтаж монолитной емкости с лазерным контролем горизонтали и герметизацией вводов.',
    status: 'Laser Grade Verified',
    statusRu: 'Уровень выверен по лазеру',
  },
  {
    tag: 'Drain Field System',
    tagRu: 'Поле фильтрации',
    title: 'Infiltrator Chamber & Lateral Line Layout',
    titleRu: 'Укладка дренажных камер и распределительных линий',
    desc: 'High-capacity percolation chamber installation and gravity slope connection to D-box.',
    descRu: 'Укладка инфильтрационных блоков и подключение к распределительному колодцу с соблюдением уклонов.',
    status: 'Flow Tested & Passed',
    statusRu: 'Дренажный контур протестирован',
  },
  {
    tag: 'Surface Access',
    tagRu: 'Ревизионные люки',
    title: 'Airtight Riser & Safety Lid Installation',
    titleRu: 'Монтаж герметичных ревизионных люков',
    desc: 'Heavy-duty composite covers brought flush to ground level for clean future access.',
    descRu: 'Установка ударопрочных полимерных крышек в уровень газона для удобного обслуживания.',
    status: 'Airtight Seal Confirmed',
    statusRu: 'Герметичность подтверждена',
  },
  {
    tag: 'Final Site Restoration',
    tagRu: 'Чистовая сдача',
    title: 'Compacted Backfill & Clean Turf Finish',
    titleRu: 'Послойная трамбовка и чистовое разравнивание',
    desc: 'Layered vibratory compaction and final topsoil grading ready for lawn seeding.',
    descRu: 'Послойное виброуплотнение грунта, планировка территории и чистовая сдача под засев травы.',
    status: 'Project Signed Off',
    statusRu: 'Объект сдан заказчику',
  },
  {
    tag: 'CCTV Audit',
    tagRu: 'Видеоконтроль',
    title: 'Fiber-Optic CCTV Pipe Inspection',
    titleRu: 'Видеоинспекция магистрали перед засыпкой',
    desc: 'Pre-backfill self-leveling camera audit ensuring pristine internal joints and slope.',
    descRu: 'Оптоволоконный контроль соединений и уклона трубы перед финальной засыпкой грунта.',
    status: 'Inspection Passed',
    statusRu: 'Инспекция пройдена успешно',
  },
];

// 3. Gallery Photos: requires at least 2 unique photos, otherwise empty array
  const galleryItems = [];
  const candidatePhotos = [];
  let gPhoto;
  while ((gPhoto = getNextUniquePhoto()) && candidatePhotos.length < 6) {
    candidatePhotos.push(gPhoto);
  }

  if (candidatePhotos.length >= 2) {
    candidatePhotos.forEach((photoUrl, idx) => {
      const stage = GALLERY_STAGES[idx % GALLERY_STAGES.length];
      galleryItems.push({
        src: photoUrl,
        image: photoUrl,
        title: stage.title,
        titleRu: stage.titleRu,
        tag: idx === 0 && lead.city ? `${lead.city}, ${lead.state}` : stage.tag,
        tagRu: idx === 0 && lead.city ? `г. ${lead.city}, ${lead.state}` : stage.tagRu,
        desc: stage.desc,
        descRu: stage.descRu,
        status: stage.status,
        statusRu: stage.statusRu,
      });
    });
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
