const fs = require('fs');
const path = require('path');

const leadsPath = path.join('src', 'data', 'septicLeads.json');
const masterLeads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));

const callLeads = JSON.parse(fs.readFileSync('src/data/callLeads.json', 'utf8'));
const targetSlugs = callLeads.map(c => c.slug);
if (!targetSlugs.includes('premier-septic-services')) targetSlugs.push('premier-septic-services');

console.log(`Auditing and fixing equipment card logic for ${targetSlugs.length} leads...`);

let fixedCount = 0;

targetSlugs.forEach(slug => {
  const lead = masterLeads.find(l => l.slug === slug);
  if (!lead) return;

  const companyName = lead.name || slug;
  const city = lead.city || 'Local Area';
  const state = lead.state || 'US';

  // Determine trade profile
  const slugLower = slug.toLowerCase();
  const nameLower = companyName.toLowerCase();
  let tradeProfile = 'SEPTIC';
  if (slugLower.includes('excavat') || nameLower.includes('excavat') || slugLower.includes('perc')) {
    tradeProfile = 'EXCAVATION';
  } else if (
    slugLower.includes('plumb') || nameLower.includes('plumb') ||
    slugLower.includes('drain') || nameLower.includes('drain') ||
    slugLower.includes('rooter') || nameLower.includes('rooter') ||
    slugLower.includes('pipe') || nameLower.includes('pipe') ||
    slugLower.includes('inspect') || nameLower.includes('inspect')
  ) {
    tradeProfile = 'PLUMBING';
  }

  // Define 3 strictly distinct cards for each profile
  let card1, card2, card3;

  if (tradeProfile === 'EXCAVATION') {
    card1 = {
      title: `Precision Excavation & Heavy Fleet in ${city}`,
      titleRu: `Землеройная спецтехника и экскаваторы в г. ${city}`,
      badge: "Heavy Excavation",
      badgeRu: "Тяжелая спецтехника",
      desc: `Dedicated tracked excavators and backhoes operated directly by ${companyName} crews in ${city}, ${state}. Engineered for precision trenching, tank placement, and grade control.`,
      descRu: `Собственные компактные и полноразмерные экскаваторы бригады ${companyName} в г. ${city}, ${state}. Обеспечивают точную разработку траншей, монтаж тяжелых емкостей и соблюдение проектных отметок.`
    };
    card2 = {
      title: "Laser-Graded Drain Field & Soil Bedding",
      titleRu: "Лазерное нивелирование полей фильтрации и дренажа",
      badge: "Drainfield Engineering",
      badgeRu: "Дренажный контур",
      desc: "Optical laser transits and washed stone aggregate bedding ensure flawless gravity wastewater dispersal without surface standing water.",
      descRu: "Лазерный контроль уклона траншей и укладка мытого гранитного щебня гарантируют естественный самотек сточных вод без застоя."
    };
    card3 = {
      title: "Turf Protection & Clean Backfill Restoration",
      titleRu: "Защита ландшафта и чистовая обратная засыпка",
      badge: "Property Preservation",
      badgeRu: "Чистота участка",
      desc: `Every project in ${city} includes layered soil compaction, grade-level access riser fitting, and smooth surface finishing so your yard looks clean and settled upon completion.`,
      descRu: `Каждый выезд в г. ${city} завершается послойной трамбовкой грунта, выводом ревизионных крышек в уровень с травой и чистовым разравниванием площадки.`
    };
  } else if (tradeProfile === 'PLUMBING') {
    card1 = {
      title: `Mobile Priority Dispatch & Utility Unit in ${city}`,
      titleRu: `Мобильный сервисный комплекс в г. ${city}`,
      badge: "Priority Dispatch",
      badgeRu: "Спецтранспорт бригады",
      desc: `Fully equipped utility service vehicle stocked with diagnostics, high-pressure jetting gear, and replacement parts operated directly by ${companyName} in ${city}, ${state}.`,
      descRu: `Оснащенный сервисный автомобиль бригады ${companyName} со всем необходимым диагностическим и ремонтным оборудованием для оперативного выезда в г. ${city}, ${state}.`
    };
    card2 = {
      title: "512Hz Sonde High-Definition Camera Diagnostics",
      titleRu: "Цветная телеинспекция и зонд-локатор 512 Гц",
      badge: "Diagnostic Equipment",
      badgeRu: "Видеодиагностика",
      desc: "Self-leveling waterproof fiber-optic cameras pinpoint line bellies, root intrusions, and buried tank lids without invasive digging.",
      descRu: "Самовыравнивающиеся видеокамеры высокого разрешения с радиозондом находят скрытые засоры, трещины и закопанные люки без лишних раскопок."
    };
    card3 = {
      title: "Clean Cleanout Access & Property Preservation",
      titleRu: "Чистовой монтаж ревизий и защита территории",
      badge: "Property Preservation",
      badgeRu: "Чистота участка",
      desc: `Every plumbing and septic project in ${city} includes clean site containment, watertight cleanout fitting, and immaculate property restoration.`,
      descRu: `Каждый выезд в г. ${city} включает аккуратную защиту отделки и ландшафта, герметичную установку ревизионных люков и уборку рабочего места.`
    };
  } else {
    // Standard SEPTIC / PUMPING
    // Check if this company is a sanitation / portable restroom provider (like Keele Sanitation)
    const isSanitation = nameLower.includes('sanitation') || slugLower.includes('sanitation');

    card1 = {
      title: `Commercial Septic Vacuum Fleet in ${city}`,
      titleRu: `Вакуумные цистерны и спецтранспорт в г. ${city}`,
      badge: "Company-Owned Fleet",
      badgeRu: "Собственный автопарк",
      desc: `High-capacity commercial vacuum trucks operated directly by ${companyName} crews in ${city}, ${state}. Designed for high-displacement sludge extraction and sanitary compliance.`,
      descRu: `Мощные вакуумные ассенизаторские цистерны бригады ${companyName} в г. ${city}, ${state}. Обеспечивают полную откачку донного ила и герметичную транспортировку стоков.`
    };

    if (isSanitation) {
      card2 = {
        title: "Commercial Pumping & Dedicated Sanitary Fleet",
        titleRu: "Специализированная вакуумная откачка и транспорт",
        badge: "Sanitary Pumping",
        badgeRu: "Откачка и очистка",
        desc: `Heavy-displacement vacuum rotary blowers lift dense settled sludge and heavy scum layers from residential and commercial tanks without residue.`,
        descRu: `Высокопроизводительные вакуумные насосы поднимают застарелый плотный осадок и тяжелые жировые фракции со дна резервуара за один заезд.`
      };
      card3 = {
        title: "Portable Restroom & Jobsite Sanitation Fleet",
        titleRu: "Мобильные санитарные комплексы и обслуживание объектов",
        badge: "Sanitation Service",
        badgeRu: "Санитарная служба",
        desc: `Clean, fully serviced commercial portable restroom units delivered, sanitized, and maintained directly by ${companyName} throughout ${city} and surrounding areas.`,
        descRu: `Чистые, полностью обслуженные мобильные санитарные кабины с регулярной доставкой, дезинфекцией и откачкой бригадой ${companyName} в г. ${city}.`
      };
    } else {
      card2 = {
        title: "High-Capacity Vacuum Sludge & Scum Extraction",
        titleRu: "Глубокая вакуумная откачка донного ила и жира",
        badge: "Deep Extraction",
        badgeRu: "Глубокая очистка",
        desc: "Heavy-displacement vacuum rotary blowers lift dense solid settled sludge and scum layers from deep residential and commercial tanks without residue.",
        descRu: "Высокопроизводительные насосы поднимают застарелый плотный осадок и тяжелые жировые фракции со дна резервуара за один заезд."
      };
      card3 = {
        title: "Turf Protection & Clean Backfill Restoration",
        titleRu: "Защита ландшафта и чистовая обратная засыпка",
        badge: "Property Preservation",
        badgeRu: "Чистота участка",
        desc: `Every project in ${city} includes layered soil compaction, grade-level access riser fitting, and smooth surface finishing so your yard looks clean and settled upon completion.`,
        descRu: `Каждый выезд в г. ${city} завершается послойной трамбовкой грунта, выводом ревизионных крышек в уровень с травой и чистовым разравниванием площадки.`
      };
    }
  }

  // Preserve existing unique images for each slot
  const currentCards = lead.equipmentPhotos || [];
  const img1 = currentCards[0] ? currentCards[0].image : null;
  const img2 = currentCards[1] ? currentCards[1].image : null;
  const img3 = currentCards[2] ? currentCards[2].image : null;

  card1.image = img1;
  card2.image = img2;
  card3.image = img3;

  // Check if photos in card 2 or 3 are specific
  // If card 2 image is an open tank or camera, adjust title to be ultra-accurate:
  if (img2 && img2.includes('photo_002') && slug === 'premier-septic-services') {
    card2.title = "Subsurface Septic Tank & Baffle Inspection";
    card2.titleRu = "Вскрытие резервуара и ревизия перегородок септика";
    card2.badge = "Tank Diagnostics";
    card2.badgeRu = "Ревизия резервуара";
    card2.desc = "Field inspection uncovering concrete tank access openings, inlet/outlet baffles, and sludge depth to verify watertight system integrity.";
    card2.descRu = "Вскрытие технологических люков септика, проверка целостности перегородок и толщины жировой шапки для оценки технического состояния емкости.";
  }

  lead.equipmentPhotos = [card1, card2, card3];
  fixedCount++;
});

fs.writeFileSync(leadsPath, JSON.stringify(masterLeads, null, 2));
console.log(`\nSuccessfully audited and restored 3 unique, logical cards across all ${fixedCount} leads!`);
