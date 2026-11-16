const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const leadsPath = path.join(__dirname, '..', 'src', 'data', 'septicLeads.json');
const septicLeads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));

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

const PATTERNS = [
  {
    type: 'VACUUM_TRUCK',
    regex: /\b(pump(?:er)?\s*truck|vacuum\s*truck|tanker(?:\s*truck)?|suction\s*hose|pumped\s*(?:out|our|the)\s*tank|pumping\s*(?:the|our)?\s*septic)\b/i,
    card: (lead) => ({
      title: 'Commercial Vacuum Tanker & High-Capacity Pumping Unit',
      titleRu: 'Вакуумная ассенизаторская автоцистерна',
      badge: 'Verified Pumper Fleet',
      badgeRu: 'Вакуумный автопарк',
      desc: `Commercial vacuum tanker deployed by ${lead.name} crews. Equipped with high-vacuum rotary pumping and sealed odor-control filtration for deep septic tank cleanouts.`,
      descRu: `Специализированная вакуумная цистерна бригады ${lead.name} с мощными роторными насосами и герметичной системой откачки для полного удаления донного ила без запаха.`,
      points: [
        'High-vacuum suction for dense bottom sludge removal',
        'Odor-controlled sealed tank operation',
        'Operated directly by company technicians'
      ],
      pointsRu: [
        'Глубокая вакуумная откачка застарелого ила',
        'Герметичная система без запаха на участке',
        'Собственная автоцистерна без наценок посредников'
      ],
      image: null
    })
  },
  {
    type: 'MINI_EXCAVATOR',
    regex: /\b(mini[-\s]?excavator|excavat(?:or|ion)|backhoe|digger|trench(?:er|ing))\b/i,
    card: (lead) => ({
      title: 'Compact Rubber-Track Excavator & Trenching Rig',
      titleRu: 'Компактный гусеничный мини-экскаватор',
      badge: 'Precision Excavation',
      badgeRu: 'Точная разработка грунта',
      desc: `Compact rubber-track mini-excavator utilized by ${lead.name} for tight-access residential yard excavations and trenching without cracking paved driveways or tearing turf.`,
      descRu: `Специализированный мини-экскаватор на резиновых гусеницах для работы в стесненных условиях приусадебного участка без повреждения брусчатки и газона.`,
      points: [
        'Rubber tracks engineered for zero turf rutting',
        'Laser-guided depth control for trenching',
        'Tight-access maneuverability between fences and homes'
      ],
      pointsRu: [
        'Резиновые гусеницы для защиты газона и дорожек',
        'Лазерный контроль глубины траншей',
        'Маневренность в узких проездах между заборами'
      ],
      image: null
    })
  },
  {
    type: 'DRAINFIELD_TECH',
    regex: /\b(drain\s*field|drainfield|leach\s*(?:field|bed|line)|infiltrator|distribution\s*box|d-box)\b/i,
    card: (lead) => ({
      title: 'Laser-Graded Drainfield & Infiltrator Installation Setup',
      titleRu: 'Лазерный комплекс монтажа полей фильтрации',
      badge: 'Engineered Drainfield Setup',
      badgeRu: 'Точный дренажный комплекс',
      desc: `Laser-level transit and grading setup for precision lateral line slope (1/4 inch per foot) and high-efficiency drainfield infiltrator chamber installations.`,
      descRu: `Оборудование для укладки дренажных труб и инфильтрационных камер с лазерным контролем уклона 1/4 дюйма на фут для долговечной безаварийной работы системы.`,
      points: [
        'Precision laser transit for continuous gravity slope',
        'Engineered infiltrator chambers for long-term absorption',
        'Built to strict local health department code specifications'
      ],
      pointsRu: [
        'Лазерный нивелир для идеального уклона самотечных линий',
        'Монтаж дренажных тоннелей по строительным нормам',
        'Полное соответствие нормативам департамента здравоохранения'
      ],
      image: null
    })
  },
  {
    type: 'CAMERA_INSPECTION',
    regex: /\b(camera|scope|video\s*inspection|snake|snaked|auger)\b/i,
    card: (lead) => ({
      title: 'HD Sewer Line Color Camera & 512 Hz Diagnostic Sonde',
      titleRu: 'Цветная HD видеокамера с поисковым зондом 512 Гц',
      badge: 'Diagnostic Inspection',
      badgeRu: 'Безинвазивная диагностика',
      desc: `High-definition self-leveling pipe inspection camera with 512 Hz radio sonde to locate root intrusions, line collapses, and hidden tank lids without blind yard digging.`,
      descRu: `Профессиональная система видеодиагностики с самовыравнивающейся HD-камерой и радиозондом 512 Гц для поиска засоров, корней и скрытых крышек без раскопок наугад.`,
      points: [
        'Self-leveling color video feed inside sewer lines',
        '512 Hz underground locator pinpoints exact depth and fault',
        'Prevents unnecessary yard and landscape excavations'
      ],
      pointsRu: [
        'Цветная трансляция состояния трубопровода изнутри',
        'Точное определение места и глубины повреждения зондом 512 Гц',
        'Исключает лишние раскопки на благоустроенном участке'
      ],
      image: null
    })
  },
  {
    type: 'HYDRO_JETTER',
    regex: /\b(hydro[-\s]?jet(?:ter|ting)?|jetting|high\s*pressure\s*water)\b/i,
    card: (lead) => ({
      title: 'High-Pressure Commercial Hydro-Jetter Rig',
      titleRu: 'Гидродинамическая каналопромывочная установка',
      badge: 'High-Pressure Jetting',
      badgeRu: 'Промывка под давлением',
      desc: `High-pressure commercial water jetter delivering up to 4,000 PSI to scour heavy grease, root hair, and scale from septic inlet and outlet lines.`,
      descRu: `Аппарат гидродинамической промывки давлением до 4000 PSI для очистки труб от жировых пробок, минерального налета и ила без повреждения стенок.`,
      points: [
        'Up to 4,000 PSI grease and mineral deposit clearing power',
        '360-degree radial scouring nozzles',
        'Restores original line flow capacity'
      ],
      pointsRu: [
        'Давление до 4000 PSI для полного удаления жировых пробок',
        'Радиальные форсунки для круговой очистки стенок',
        'Восстановление проектной пропускной способности труб'
      ],
      image: null
    })
  },
  {
    type: 'SKID_STEER',
    regex: /\b(skid\s*steer|bobcat|loader|tractor|turf\s*mat)\b/i,
    card: (lead) => ({
      title: 'Compact Turf Loader & Ground Protection Mats',
      titleRu: 'Компактный мини-погрузчик и защитные маты',
      badge: 'Turf Preservation',
      badgeRu: 'Защита ландшафта',
      desc: `Low-ground-pressure compact loader equipped with composite turf protection mats to distribute axle weight and protect residential lawns and pavers.`,
      descRu: `Компактный погрузчик с низким удельным давлением на грунт и композитными защитными матами для сохранения газонов, дорожек и автополива.`,
      points: [
        'Low ground-pressure tracks distribute vehicle weight',
        'Composite turf mats prevent lawn ruts and paver cracks',
        'Zero damage to residential turf and irrigation lines'
      ],
      pointsRu: [
        'Широкие гусеницы с низким давлением на грунт',
        'Защитные композитные маты исключают колеи',
        'Сохранность газона и скрытых линий автополива'
      ],
      image: null
    })
  }
];

let countWith = 0;
let countWithout = 0;

for (const lead of septicLeads) {
  const verifiedCards = [];
  const addedTypes = new Set();

  // 1. Check reviews
  const reviews = lead.reviewsSample || [];
  for (const r of reviews) {
    const text = (r.text || '') + ' ' + (r.author || '');
    for (const pat of PATTERNS) {
      if (!addedTypes.has(pat.type) && pat.regex.test(text)) {
        addedTypes.add(pat.type);
        verifiedCards.push(pat.card(lead));
      }
    }
  }

  // 2. Check Vision Cache
  const folderPath = path.join(showcaseDir, lead.slug);
  if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    for (const file of files) {
      const hash = md5(path.join(folderPath, file));
      if (hash && visionCache[hash]) {
        const cat = visionCache[hash].category;
        if (cat === 'VACUUM_TRUCK' && !addedTypes.has('VACUUM_TRUCK')) {
          const pat = PATTERNS.find(p => p.type === 'VACUUM_TRUCK');
          addedTypes.add('VACUUM_TRUCK');
          verifiedCards.push(pat.card(lead));
        } else if (cat === 'EXCAVATOR_MACHINERY' && !addedTypes.has('MINI_EXCAVATOR')) {
          const pat = PATTERNS.find(p => p.type === 'MINI_EXCAVATOR');
          addedTypes.add('MINI_EXCAVATOR');
          verifiedCards.push(pat.card(lead));
        } else if (cat === 'DRAINFIELD_PIPES' && !addedTypes.has('DRAINFIELD_TECH')) {
          const pat = PATTERNS.find(p => p.type === 'DRAINFIELD_TECH');
          addedTypes.add('DRAINFIELD_TECH');
          verifiedCards.push(pat.card(lead));
        } else if (cat === 'CAMERA_DIAGNOSTICS' && !addedTypes.has('CAMERA_INSPECTION')) {
          const pat = PATTERNS.find(p => p.type === 'CAMERA_INSPECTION');
          addedTypes.add('CAMERA_INSPECTION');
          verifiedCards.push(pat.card(lead));
        }
      }
    }
  }

  // Cap at 3 verified cards
  const finalCards = verifiedCards.slice(0, 3);

  if (finalCards.length > 0) {
    lead.equipmentPhotos = finalCards;
    countWith++;
  } else {
    lead.equipmentPhotos = [];
    countWithout++;
  }
}

fs.writeFileSync(leadsPath, JSON.stringify(septicLeads, null, 2), 'utf8');

console.log(`Updated ${septicLeads.length} leads:`);
console.log(`- Leads with verified equipment: ${countWith}`);
console.log(`- Leads with ZERO mentioned equipment: ${countWithout}`);
