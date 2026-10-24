import fs from 'fs-extra'
import path from 'path'

async function enhance() {
  const filePath = path.resolve('./src/data/septicLeads.json')
  const leads = await fs.readJson(filePath)

  const bonzo = leads.find((l) => l.slug === 'bonzo-excavating')
  if (!bonzo) {
    console.error('Bonzo lead not found!')
    process.exit(1)
  }

  bonzo.heroImage = '/showcase/bonzo-excavating/photo_016_opt.jpg'
  bonzo.hours = 'Monday - Saturday: 7:00 AM - 7:00 PM | 24/7 Emergency Dispatch'
  bonzo.crewMembers = [
    'Zac Bonzo (Owner & Master Excavator)',
    'Stephanie Bonzo (Project Coordination & Insurance Support)',
    'Certified Heavy Equipment Crew',
  ]
  bonzo.serviceAreaList = [
    'Pittsburgh',
    'Butler County',
    'Cranberry Township',
    'Wexford',
    'Gibsonia',
    'Mars',
    'Zelienople',
    'Slippery Rock',
    'New Castle',
    'Beaver County',
    'Allegheny County',
  ]

  bonzo.equipmentPhotos = [
    {
      title: 'Heavy Hydraulic Excavator for Shale & Bedrock Formations',
      titleRu: 'Тяжелый гидравлический экскаватор для скальных пород и сланца',
      badge: 'Bedrock Excavation',
      badgeRu: 'Скалистые грунты',
      desc: 'Equipped with reinforced rock ripper teeth to cut through Western Pennsylvania shale and hardpan without explosive blasting or structural vibration.',
      descRu: 'Усиленный скальный ковш для аккуратной разработки плотных сланцевых пластов Пенсильвании без гидромолота и вибраций.',
      image: '/showcase/bonzo-excavating/photo_012_opt.jpg',
    },
    {
      title: 'Laser-Guided Sewer Trenching & Bedding Transitions',
      titleRu: 'Лазерное нивелирование траншей и монтаж магистрали',
      badge: 'Code-Approved Slope',
      badgeRu: 'Стандарты округа',
      desc: 'Calibrated 1/4-inch-per-foot fall slope ensuring self-clearing wastewater velocity from house foundation to new tank inlet.',
      descRu: 'Точный уклон 2 см на метр с лазерным контролем для свободного самотечного схода стоков из фундамента в резервуар.',
      image: '/showcase/bonzo-excavating/photo_015_opt.jpg',
    },
    {
      title: 'Precision Backfill & Multi-Acre Site Hydro-Grading',
      titleRu: 'Послойная обратная засыпка и чистовая планировка до 3 акров',
      badge: 'Property Preservation',
      badgeRu: 'Сохранность ландшафта',
      desc: 'Tightly compacted sub-base graded flush with existing terrain contours to eliminate water pooling, mud pits, and soil washouts.',
      descRu: 'Трамбовка и чистовое разравнивание грунта в естественный рельеф участка — исключает лужи, грязевые просадки и эрозию.',
      image: '/showcase/bonzo-excavating/photo_013_opt.jpg',
    },
  ]

  bonzo.galleryPhotos = [
    {
      title: '1,000-Gallon Poly Septic Vault Lowering & Leveling',
      titleRu: 'Монтаж полимерного септик-танка 1000 галлонов',
      tag: 'New Tank Setting',
      tagRu: 'Установка нового бака',
      desc: 'High-capacity heavy polyethylene tank set into bedded sand layer where wet clay conditions prohibit heavy concrete vaults.',
      descRu: 'Монтаж прочного полимерного бака 1000 галлонов на песчаную подушку на сложных влажных грунтах, где бетонный бак дал бы осадку.',
      image: '/showcase/bonzo-excavating/photo_014_opt.jpg',
    },
    {
      title: 'Terra Cotta to Schedule 40 PVC Sewer Line Upgrade',
      titleRu: 'Замена старой керамической трубы на усиленный ПВХ',
      tag: 'Pipe Modernization',
      tagRu: 'Модернизация магистрали',
      desc: 'Removal of root-choked, cracked terra cotta sewer lines and replacement with solvent-welded Schedule 40 PVC.',
      descRu: 'Демонтаж растрескавшихся керамических труб и укладка монолитного клеевого ПВХ Sch 40, на 100% герметичного от корней деревьев.',
      image: '/showcase/bonzo-excavating/photo_005_opt.jpg',
    },
    {
      title: 'Deep Shale Pit Excavation for Tank Replacement',
      titleRu: 'Разработка котлована в сланцевом грунте под септик',
      tag: 'Rock Excavation',
      tagRu: 'Скальная копка',
      desc: 'Surgical excavation in dense shale rock preparing clean vertical walls for tank placement without undermining nearby foundations.',
      descRu: 'Аккуратная выемка плотного сланца с вертикальными стенками без риска обрушения и повреждения фундамента соседних построек.',
      image: '/showcase/bonzo-excavating/photo_007_opt.jpg',
    },
    {
      title: 'Culvert & Surface Water Redirection System',
      titleRu: 'Отвод ливневых вод и монтаж водопропускных труб',
      tag: 'Drainage Protection',
      tagRu: 'Защита от затопления',
      desc: 'Heavy drainage pipe installation diverting heavy rainfall runoff away from the new septic absorption area and driveway.',
      descRu: 'Монтаж дренажной трубы для отвода дождевых потоков от дренажного поля септика и въездной дороги.',
      image: '/showcase/bonzo-excavating/photo_008_opt.jpg',
    },
  ]

  bonzo.reviewsSample = [
    {
      author: 'Daniel Umstead',
      authorMeta: 'Local Guide · 12 reviews · 4 Verified Jobsite Photos',
      rating: 5,
      date: 'Edited 3 years ago',
      text: "Zac responded very quickly and came out within a few days. Used his camera to view my septic line.\n\nMarch 20th: Zac brought in his equipment and found the ole tank in less than 1 hr.\n\nMarch 21st: I had the old tank pumped out early morning and Zac and his Operator had the old tank removed and site prepared for the new tank. Installed a 1000 gall. plastic tank and replaced old terra cotta lines with PVC. By 5:00 PM the new line was connected and I was able to use the toilet!\n\nMarch 22nd: The Sewage inspector came out and approved all the work, very pleased. Everything backfilled, graded and excess soil hauled away. 7 months later yard reseeded and looks great. Zac and Stephanie were both great to work with!",
      photos: [
        '/showcase/bonzo-excavating/photo_013_opt.jpg',
        '/showcase/bonzo-excavating/photo_014_opt.jpg',
        '/showcase/bonzo-excavating/photo_015_opt.jpg',
        '/showcase/bonzo-excavating/photo_016_opt.jpg',
      ],
    },
    {
      author: 'Heather Knapp',
      authorMeta: '2 reviews · 3 Verified Jobsite Photos',
      rating: 5,
      date: '2 years ago',
      text: "We live in Columbus, Ohio and are retiring to Pittsburgh. We recently purchased a five acre lot in October that was a disaster from previous owners. Frankly, Bonzo's estimate was the most reasonable. Stephanie and Zachariah always followed up with our questions within 24 hours. I enclosed pictures to get a sense of the astonishing work they did. We plan on having them out to complete more work!",
      photos: [
        '/showcase/bonzo-excavating/photo_009_opt.jpg',
        '/showcase/bonzo-excavating/photo_010_opt.jpg',
        '/showcase/bonzo-excavating/photo_011_opt.jpg',
      ],
    },
    {
      author: 'tessa',
      authorMeta: '2 reviews · Verified Jobsite Photo',
      rating: 5,
      date: '2 years ago',
      text: "Highly recommend Bonzo!! We had an issue with our sewage/waterlines. They were able to come out and take a look the same day we called. Their quote beat two other companies. They were able to help us go back and forth with our insurance company to get it covered. We will definitely be using them for other projects in the future!",
      photos: ['/showcase/bonzo-excavating/photo_006_opt.jpg'],
    },
    {
      author: 'Michelle Schoedel',
      authorMeta: '3 reviews · 4 Verified Jobsite Photos',
      rating: 5,
      date: 'a year ago',
      text: "Bonzo excavating has done a couple of projects for us. First was digging out our whole, shale yard to start pouring a foundation for our house. He always showed up and handled the job quickly and professionally. Our foundation company said it was one of the nicest digs for being shale. We also had a pipe for redirecting water put at the end of our driveway which was quick and cleaned up. He also did all of the grading for our yard (2-3 acres). We never have any issues with flooding. Zac has always been punctual!",
      photos: [
        '/showcase/bonzo-excavating/photo_001_opt.jpg',
        '/showcase/bonzo-excavating/photo_002_opt.jpg',
        '/showcase/bonzo-excavating/photo_003_opt.jpg',
        '/showcase/bonzo-excavating/photo_004_opt.jpg',
      ],
    },
    {
      author: 'Michael S.',
      authorMeta: '10 reviews · Verified Customer',
      rating: 5,
      date: '7 months ago',
      text: 'Great people. Top notch from start to finish. Did a quality job at a very fair price. I highly recommend Bonzo Excavating.',
      photos: [],
    },
  ]

  await fs.writeJson(filePath, leads, { spaces: 2 })
  console.log('Successfully enhanced Bonzo Excavating lead with 16 unique photos and authentic customer reviews!')
}

enhance().catch(console.error)
