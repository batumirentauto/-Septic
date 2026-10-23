import fs from 'fs-extra'
import path from 'path'

async function enhance() {
  const filePath = path.resolve('./src/data/septicLeads.json')
  const leads = await fs.readJson(filePath)

  const bolt = leads.find((l) => l.slug === 'bolt-septic-excavation')
  if (!bolt) {
    console.error('Bolt Septic lead not found!')
    process.exit(1)
  }

  bolt.heroImage = '/showcase/bolt-septic/photo_005_opt.jpg'
  bolt.crewMembers = [
    'Cody (Owner & Lead Heavy Operator)',
    'Chris (Excavation Specialist)',
    'Will (Pipe & Drainage Technician)',
  ]
  bolt.serviceAreaList = [
    'Greenville',
    'Greer',
    'Spartanburg',
    'Simpsonville',
    'Mauldin',
    'Travelers Rest',
    'Taylors',
    'Easley',
    'Fountain Inn',
    'Inman',
  ]

  bolt.equipmentPhotos = [
    {
      title: 'CAT Mini-Excavator & Heavy Tank Setting',
      titleRu: 'Экскаватор CAT и монтаж железобетонного септика',
      badge: 'Heavy Lifting Gear',
      badgeRu: 'Тяжелая спецтехника',
      desc: 'Low-ground-pressure rubber tracks allow surgical excavation for 1,000–1,500 gallon tanks without rutting up residential lawns or cracking driveway asphalt.',
      descRu: 'Резиновые гусеницы низкого давления для аккуратной копки под резервуары 1000–1500 галлонов без колеи на газоне и повреждения асфальта.',
      image: '/showcase/bolt-septic/photo_010_opt.jpg',
    },
    {
      title: 'Laser-Graded Trenching & Washed Granite Bedding',
      titleRu: 'Лазерное нивелирование траншей и гравийная подушка',
      badge: 'Leach Field Restoration',
      badgeRu: 'Дренажные поля',
      desc: 'Perforated lateral lines leveled with high-precision optical grade lasers over clean washed crushed stone to guarantee rapid wastewater percolation.',
      descRu: 'Перфорированные рассеивающие трубы с оптическим нивелированием по слою гранитного щебня для гарантированного впитывания стоков.',
      image: '/showcase/bolt-septic/photo_011_opt.jpg',
    },
    {
      title: 'Turf Protection Mats & Final Smooth Hydro-Grade',
      titleRu: 'Защитные маты для дерна и чистовая планировка',
      badge: 'Lawn Preservation',
      badgeRu: 'Сохранность ландшафта',
      desc: 'Excavated soil is returned in compacted layers and power-raked flush with the natural yard contour so grass reseeding establishes cleanly in 14 days.',
      descRu: 'Грунт укладывается послойно с трамбовкой и чистовой планировкой под естественный уровень двора для быстрого восстановления травы.',
      image: '/showcase/bolt-septic/photo_012_opt.jpg',
    },
  ]

  bolt.galleryPhotos = [
    {
      title: 'Deep Tank Pit Excavation & Structural Vault Placement',
      titleRu: 'Котлован и монтаж монолитного железобетонного септика',
      tag: 'New Tank Installation',
      tagRu: 'Установка нового бака',
      desc: 'Complete removal of collapsed legacy tank and laser-guided placement of precast 1,250-gallon septic vault with watertight inlet risers.',
      descRu: 'Полный демонтаж аварийного септика и монтаж монолитного бака 1250 галлонов с герметичными ревизионными люками на уровень земли.',
      image: '/showcase/bolt-septic/photo_009_opt.jpg',
    },
    {
      title: 'Cast Iron to Heavy-Duty Schedule 40 PVC Conversion',
      titleRu: 'Замена хрупких чугунных труб на толстостенный ПВХ',
      tag: 'Pipe Modernization',
      tagRu: 'Модернизация магистрали',
      desc: 'Corroded 50-year-old cast iron building drains replaced with smooth-bore 4-inch PVC to eliminate grease buildup and tree root intrusion.',
      descRu: 'Ржавый чугунный выпуск заменен на гладкостенную 4-дюймовую трубу Schedule 40 PVC, исключающую зарастание корнями и жиром.',
      image: '/showcase/bolt-septic/photo_002_opt.jpg',
    },
    {
      title: 'Leach Field Lateral Trench & Stone Encapsulation',
      titleRu: 'Траншея дренажной нитки с обсыпкой гранитным щебнем',
      tag: 'Drain Field Repair',
      tagRu: 'Ремонт поля фильтрации',
      desc: 'Surgically trenching new lateral absorption lines through dense clay soil to relieve high water table pressure and restore toilet flushing.',
      descRu: 'Нарезка новой перколяционной ветки в плотном грунте для разгрузки септика и свободного ухода воды из сантехники дома.',
      image: '/showcase/bolt-septic/photo_006_opt.jpg',
    },
    {
      title: 'Perforated Effluent Line Alignment & Geotextile Wrap',
      titleRu: 'Укладка перфорированной трубы и геотекстильный барьер',
      tag: 'Subsurface Drainage',
      tagRu: 'Подземный дренаж',
      desc: 'Heavy-duty non-woven geotextile membrane shields crushed stone from silt infiltration, ensuring decades of clog-free drainage.',
      descRu: 'Плотный нетканый геотекстиль защищает щебень от заиливания грунтом, сохраняя проницаемость дренажа на десятилетия.',
      image: '/showcase/bolt-septic/photo_007_opt.jpg',
    },
  ]

  bolt.reviewsSample = [
    {
      author: 'Daniel Martinez',
      authorMeta: 'Local Guide · 92 reviews · 3 Verified Jobsite Photos',
      rating: 5,
      date: 'a year ago',
      text: 'Honest. Superb Professionalism. Competitive Pricing. Excellent Communication. Zero Mess. Cody and his team are top notch true professionals. I highly recommend.\n\n*Septic drain lines replaced, new pit, and replaced cast iron waste lines with pvc.',
      photos: [
        '/showcase/bolt-septic/photo_001_opt.jpg',
        '/showcase/bolt-septic/photo_003_opt.jpg',
        '/showcase/bolt-septic/photo_004_opt.jpg',
      ],
    },
    {
      author: 'Charles Allen',
      authorMeta: 'Local Guide · 10 reviews · Verified Jobsite Photo',
      rating: 5,
      date: 'a year ago',
      text: 'Cody and his helper Chris were extremely professional and experienced. When my septic tank was backing up and not draining properly into the leach field, they provided excellent recommendations and solutions to address the issues. What impressed me most was their transparency - they offered multiple options and were completely upfront about potential complications. The repairs they completed have been working very well.',
      photos: ['/showcase/bolt-septic/photo_008_opt.jpg'],
    },
    {
      author: 'Kim Boswood',
      authorMeta: '4 reviews · Emergency Tank Replacement',
      rating: 5,
      date: '2 years ago',
      text: 'My septic tank and leech/drain field failed in December. Cody and Will were able to accommodate their schedule to fit me in quickly. They went above and beyond and worked a couple of 17 hour days so I could have access to everything by Christmas. I also ended up with a clogged pipe and Cody worked tirelessly to find the problem and replace pvc piping for me. I cannot speak highly enough about Cody and Will as they are hard workers, respectful, on time, do incredible work and professional.',
      photos: [],
    },
    {
      author: 'Ana Alejo',
      authorMeta: '2 reviews · Verified Homeowner',
      rating: 5,
      date: '5 months ago',
      text: 'I will definitely be using again! I 100% recommend him. He is fast, very professional and kind. He finished all the work in two days. Also he made all the calls to get everything done. They did an amazing job. We really appreciate all the amazing work that he did on the septic tank. Thank so much again. You should definitely hire him for your next project!',
      photos: [],
    },
    {
      author: 'L Terrell',
      authorMeta: 'Local Guide · 23 reviews',
      rating: 5,
      date: '4 months ago',
      text: 'We were recommended Cody by some friends. He was great. He came out to see our yard right away, gave us options, and fixed our septic problem. It\'s been several weeks, and everything is working great.',
      photos: [],
    },
  ]

  await fs.writeJson(filePath, leads, { spaces: 2 })
  console.log('Successfully enhanced Bolt Septic lead with unique photos and reviews!')
}

enhance()
