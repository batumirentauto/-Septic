import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

// Curated dictionary of authentic American first names for owner/technician extraction
const FIRST_NAMES = new Set([
  'Aaron', 'Adam', 'Adrian', 'Alan', 'Albert', 'Alex', 'Alexander', 'Allen', 'Andrew', 'Andy',
  'Anthony', 'Arthur', 'Austin', 'Barry', 'Ben', 'Benjamin', 'Bill', 'Billy', 'Blake', 'Bob',
  'Bobby', 'Brad', 'Bradley', 'Brandon', 'Brent', 'Brett', 'Brian', 'Bruce', 'Bryan', 'Bryce',
  'Caleb', 'Calvin', 'Cameron', 'Carl', 'Carlos', 'Casey', 'Chad', 'Charles', 'Charlie', 'Chase',
  'Chester', 'Chris', 'Christian', 'Christopher', 'Chuck', 'Clay', 'Clayton', 'Cliff', 'Clint',
  'Clyde', 'Cody', 'Colby', 'Cole', 'Collin', 'Connor', 'Corey', 'Cory', 'Craig', 'Curtis',
  'Dale', 'Dallas', 'Dalton', 'Damon', 'Dan', 'Daniel', 'Danny', 'Darrell', 'Darren', 'Darryl',
  'Dave', 'David', 'Dean', 'Dennis', 'Derek', 'Derrick', 'Devin', 'Devon', 'Don', 'Donald',
  'Donnie', 'Doug', 'Douglas', 'Drew', 'Duane', 'Dustin', 'Dwayne', 'Dwight', 'Dylan', 'Earl',
  'Ed', 'Eddie', 'Edgar', 'Edward', 'Edwin', 'Eli', 'Elijah', 'Emanuel', 'Eric', 'Erik',
  'Ernest', 'Ethan', 'Eugene', 'Evan', 'Everett', 'Floyd', 'Frank', 'Frankie', 'Fred', 'Freddie',
  'Gabriel', 'Gage', 'Garrett', 'Gary', 'Gavin', 'Gene', 'George', 'Gerald', 'Gilbert', 'Glen',
  'Glenn', 'Gordon', 'Grant', 'Greg', 'Gregory', 'Guy', 'Hank', 'Harold', 'Harry', 'Harvey',
  'Heath', 'ector', 'Henry', 'Herbert', 'Howard', 'Hugh', 'Hunter', 'Ian', 'Isaac', 'Isaiah',
  'Jack', 'Jackson', 'Jacob', 'Jake', 'James', 'Jamie', 'Jared', 'Jason', 'Jay', 'Jeff',
  'Jeffery', 'Jeffrey', 'Jeremy', 'Jerome', 'Jerry', 'Jesse', 'Jessie', 'Jim', 'Jimmie', 'Jimmy',
  'Joe', 'Joel', 'Joey', 'John', 'Johnathan', 'Johnny', 'Jon', 'Jonathan', 'Jonathon', 'Jordan',
  'Jose', 'Joseph', 'Josh', 'Joshua', 'Juan', 'Julian', 'Justin', 'Karl', 'Keith', 'Kelly',
  'Ken', 'Kenneth', 'Kenny', 'Kent', 'Kevin', 'Kirk', 'Kurt', 'Kyle', 'Lance', 'Larry',
  'Lawrence', 'Lee', 'Leo', 'Leon', 'Leonard', 'Leroy', 'Leslie', 'Levi', 'Lewis', 'Liam',
  'Lloyd', 'Logan', 'Lonnie', 'Lucas', 'Luis', 'Luke', 'Lyle', 'Mack', 'Manual', 'Manuel',
  'Marc', 'Marcus', 'Mario', 'Marion', 'Mark', 'Marshall', 'Martin', 'Marvin', 'Mason', 'Mathew',
  'Matt', 'Matthew', 'Maurice', 'Max', 'Melvin', 'Micah', 'Michael', 'Micheal', 'Miguel', 'Mike',
  'Milton', 'Mitch', 'Mitchell', 'Morgan', 'Morris', 'Nate', 'Nathan', 'Nathaniel', 'Neal', 'Neil',
  'Nelson', 'Nicholas', 'Nick', 'Noah', 'Norman', 'Oliver', 'Omar', 'Oscar', 'Otis', 'Owen',
  'Parker', 'Pat', 'Patrick', 'Paul', 'Pedro', 'Perry', 'Pete', 'Peter', 'Phil', 'Philip',
  'Phillip', 'Preston', 'Quentin', 'Ralph', 'Ramon', 'Randall', 'Randy', 'raul', 'Ray', 'Raymond',
  'Reed', 'Reggie', 'Reginald', 'Rex', 'Rich', 'Richard', 'Richi', 'Richie', 'Rick', 'Rickey',
  'Ricky', 'Riley', 'Rob', 'Robbie', 'Robert', 'Roberto', 'Robin', 'Rocco', 'Rocky', 'Rod',
  'Rodney', 'Roger', 'Roland', 'Ron', 'Ronald', 'Ronnie', 'Rory', 'Ross', 'Roy', 'Ruben',
  'Rudy', 'Russell', 'Rusty', 'Ryan', 'Sam', 'Sammy', 'Samuel', 'Scott', 'Scotty', 'Sean',
  'Sergio', 'Seth', 'Shane', 'Shannon', 'Shaun', 'Shawn', 'Sidney', 'Spencer', 'Stacy', 'Stan',
  'Stanley', 'Stephen', 'Steve', 'Steven', 'Stewart', 'Stuart', 'Tanner', 'Taylor', 'Ted', 'Teddy',
  'Terrance', 'Terrence', 'Terry', 'Thad', 'Theodore', 'Thomas', 'Tim', 'Timmy', 'Timothy', 'Toby',
  'Todd', 'Tom', 'Tommy', 'Tony', 'Tracey', 'Tracy', 'Travis', 'Trent', 'Trevor', 'Trey',
  'Tristan', 'Troy', 'Tucker', 'Ty', 'Tyler', 'Tyrone', 'Vance', 'Vernon', 'Vic', 'Victor',
  'Vince', 'Vincent', 'Virgil', 'Vito', 'Wade', 'Wallace', 'Walt', 'Walter', 'Warren', 'Wayne',
  'Wes', 'Wesley', 'Will', 'Willard', 'William', 'Willie', 'Wyatt', 'Zac', 'Zach', 'Zachary', 'Zane',
  'Sara', 'Sarah', 'Stephanie', 'Jessica', 'Amanda', 'Amber', 'Amy', 'Andrea', 'Angela', 'ashley',
  'Becky', 'Beth', 'Brenda', 'cheyenne', 'Christina', 'Cindy', 'Crystal', 'Dana', 'Dawn', 'Debbie',
  'Denise', 'Diana', 'Donna', 'Erin', 'Heather', 'Holly', 'Jackie', 'Jamie', 'Jen', 'Jennifer',
  'Jill', 'Julie', 'Karen', 'Katie', 'Kelly', 'Kim', 'Krystal', 'Laura', 'Lauren', ' Leslie', 'Linda',
  'Lisa', 'Lori', 'Mary', 'Megan', 'Melissa', 'Michelle', 'Mindy', 'Monica', 'Nancy', 'Nichole',
  'Nicole', 'Pam', 'Patricia', 'Rachel', 'Rebecca', 'Renee', 'Robin', 'Samantha', 'Sandra', 'Shannon',
  'Sharon', 'Shelly', 'Sherry', 'Stacey', 'Stacy', 'Susan', 'Tammy', 'Tara', 'Teresa', 'Terri',
  'Tiffany', 'Tina', 'Tonya', 'Tracy', 'Valerie', 'Vanessa', 'Vicki', 'Wendy', 'Spud', 'Dee', 'Kip',
  'Chet', 'Dirk', 'Duke', 'Hank', 'Jed', 'Judd', 'Mitch', 'Monty', 'Ned', 'Sonny', 'Zeke', 'Hector'
])

function extractOwnerName(companyName, reviews) {
  // 1. Check company name first (e.g. "Jesse Pigeon Plumbing" or "Chris' Rooter" or "Hectors septic")
  const cleanCo = companyName
    .replace(/['’]s\b/gi, '')
    .replace(/\bhectors\b/i, 'Hector')
    .replace(/[^a-zA-Z\s]/g, ' ')
  const coWords = cleanCo.split(/\s+/).filter(Boolean)
  if (coWords.length > 0) {
    const firstCap = coWords[0].charAt(0).toUpperCase() + coWords[0].slice(1).toLowerCase()
    if (FIRST_NAMES.has(firstCap)) {
      return firstCap
    }
  }

  // 2. Scan positive reviews for thanked/praised technicians/owners
  const nameCounts = {}
  const contextPatterns = [
    /\b(?:thank you|thanks|thank|recommend|appreciate)\s+([A-Z][a-z]{2,11})\b/g,
    /\b([A-Z][a-z]{2,11}),?\s+(?:thank you|thanks)\b/g,
    /\b([A-Z][a-z]{2,11})\s*\(\s*owner\s*\)/gi,
    /\b([A-Z][a-z]{2,11})\s+(?:and his|& his|and the|& the|and [A-Z][a-z]+|& [A-Z][a-z]+|came|arrived|showed|was|is|did|fixed|installed|pumped|explained|helped|saved|took|quoted|provided|answered|returned|called|worked|went|gave|has|had|made|located|found|repaired|dug|cleared|walked)\b/g,
    /\b(?:owner|operator|tech|technician|master)\s+\(?([A-Z][a-z]{2,11})\)?\b/g,
    /\b(?:ask for|called|spoke with|talked to|dealt with|met with)\s+([A-Z][a-z]{2,11})\b/g,
  ]

  for (const rev of reviews) {
    if (!rev.text || rev.rating < 4) continue
    for (const pat of contextPatterns) {
      let match
      while ((match = pat.exec(rev.text)) !== null) {
        const candidate = match[1]
        if (FIRST_NAMES.has(candidate)) {
          nameCounts[candidate] = (nameCounts[candidate] || 0) + 1
        }
      }
    }
  }

  const sorted = Object.entries(nameCounts).sort((a, b) => b[1] - a[1])
  if (sorted.length > 0) {
    return sorted[0][0]
  }

  return null
}

function analyzeCompanyProfile(lead, positiveReviews) {
  const combinedText = positiveReviews.map((r) => r.text || '').join(' ').toLowerCase()
  const nameLower = lead.name.toLowerCase()
  const focusLower = (lead.primaryFocus || '').toLowerCase()

  const hasDrainField = /drain\s*field|leach|field\s*line|lateral|percolat|mound|absorption|d-box|distribution\s*box/.test(combinedText) || focusLower.includes('дренаж')
  const hasInstall = /install|new\s*tank|replace|system\s*install|1000\s*gal|1500\s*gal|concrete\s*tank|poly\s*tank|chamber/.test(combinedText) || focusLower.includes('монтаж')
  const hasExcavation = /excavat|backhoe|mini\s*ex|trench|dig|dug|grading|bulldoz|land\s*clear/.test(combinedText) || nameLower.includes('excavat') || focusLower.includes('экскавац')
  const hasRisers = /riser|lid|cover|access\s*port|baffle|filter/.test(combinedText)
  const hasPumpsAerobic = /aerobic|effluent\s*pump|lift\s*station|alarm|float|aerato|control\s*panel|electrical|pump\s*replace/.test(combinedText) || nameLower.includes('aerobic')
  const hasCameraLocate = /camera|locate|found\s*the\s*tank|inspection|real\s*estate|scope|closing|escrow/.test(combinedText)
  const hasJetting = /jet|hydro|root|main\s*line|cast\s*iron|pvc|clog|backed\s*up|cleanout/.test(combinedText) || nameLower.includes('rooter') || nameLower.includes('drain')

  const hasFastResponse = /same\s*day|next\s*day|within\s*an\s*hour|within\s*hours|sunday|weekend|emergency|right\s*away|quickly|prompt/.test(combinedText)
  const hasFairPrice = /fair\s*price|honest|quoted|reasonable|saved\s*us|best\s*price|competitive|no\s*upsell|half\s*the\s*price/.test(combinedText)
  const hasCleanYard = /clean|tidy|neat|grass|yard|lawn|driveway|no\s*mess|filled\s*in|careful/.test(combinedText)
  const hasEducation = /explain|informative|knowledgeable|showed\s*me|walked\s*me\s*through|taught/.test(combinedText)

  // Determine English primary focus
  let primaryFocusEn = 'Septic System Installation, Drain Field Restoration & Excavation'
  if (hasInstall && hasExcavation) {
    primaryFocusEn = 'Complete Septic System Installation & Heavy Excavation'
  } else if (hasDrainField) {
    primaryFocusEn = 'Drain Field Restoration, Leach Line Repair & Septic Service'
  } else if (hasPumpsAerobic) {
    primaryFocusEn = 'Aerobic Septic Systems, Lift Stations & Tank Replacement'
  } else if (hasJetting) {
    primaryFocusEn = 'Septic Line Replacement, Hydro-Jetting & System Repair'
  }

  // Build tailored competitive advantages (3 items)
  const advEn = []
  const advRu = []

  if (lead.ownerName) {
    advEn.push(`Led Directly by ${lead.ownerName} — Zero Subcontractors`)
    advRu.push(`Личный контроль мастера (${lead.ownerName}) без посредников`)
  }
  if (hasFastResponse) {
    advEn.push('Same-Day Priority Emergency Dispatch')
    advRu.push('Экстренный выезд в день обращения')
  }
  if (hasFairPrice) {
    advEn.push('Honest Upfront Quoted Pricing — Zero Upsells')
    advRu.push('Честная фиксированная смета без накруток')
  }
  if (hasCleanYard) {
    advEn.push('Clean Excavation & 100% Yard Preservation')
    advRu.push('Бережная раскопка и чистота участка')
  }
  if (hasEducation) {
    advEn.push('Transparent On-Site Diagnostics & Walkthrough')
    advRu.push('Понятная диагностика и показ проблемы на месте')
  }

  // Fill up to 3 if needed
  const fallbackEn = [
    'Turf Protection Mats & Clean Backfill',
    'Upfront Fixed Estimate Before Digging',
    'Full County Health Code Compliance',
  ]
  const fallbackRu = [
    'Защитные настилы газона и аккуратная засыпка',
    'Фиксированная смета до начала работ',
    'Соблюдение санитарных норм округа',
  ]
  for (let i = 0; i < 3; i++) {
    if (advEn.length < 3 && !advEn.includes(fallbackEn[i])) {
      advEn.push(fallbackEn[i])
      advRu.push(fallbackRu[i])
    }
  }

  // Pool of tailored services
  const servicePool = [
    {
      key: 'install',
      active: hasInstall || hasExcavation,
      iconName: 'Wrench',
      title: 'Complete Septic System Installation & Tank Replacement',
      titleRu: 'Капитальный монтаж и полная замена септиков',
      desc: `Turnkey excavation and installation of 1,000–1,500+ gallon concrete and heavy-duty poly septic tanks in ${lead.city}, ${lead.state}. Includes soil perc testing coordination, county permits, and laser-graded bedding.`,
      descRu: `Полный цикл земляных работ и монтаж бетонных и полимерных резервуаров 1000–1500+ галлонов в г. ${lead.city}, ${lead.state}. Оформление разрешений округа и лазерное выравнивание подушки.`,
      specs: '1,000–1,500+ Gal Tanks | Full County Permitting',
      specsRu: 'Резервуары 1000–1500+ галлонов | Стандарты округа',
    },
    {
      key: 'drainField',
      active: hasDrainField,
      iconName: 'Activity',
      title: 'Drain Field Restoration & Leach Line Excavation',
      titleRu: 'Восстановление и замена дренажных полей фильтрации',
      desc: `Eliminating surface water pooling, soggy grass, and slow indoor drains. Precision trenching of perforated lateral lines, washed stone bedding, and distribution box (D-Box) leveling.`,
      descRu: `Устранение застоя воды на газоне и медленного слива в доме. Прокладка перфорированных дренажных веток на подушке из мытого щебня и выравнивание распределительных коробок (D-Box).`,
      specs: 'Chamber & Stone Trench Systems | D-Box Replacement',
      specsRu: 'Камерные и щебеночные поля | Замена D-Box',
    },
    {
      key: 'pumps',
      active: hasPumpsAerobic,
      iconName: 'Sparkles',
      title: 'Lift Station, Effluent Pump & High-Water Alarm Repair',
      titleRu: 'Ремонт насосных станций, аэраторов и аварийной автоматики',
      desc: `Rapid troubleshooting of septic high-water alarms, burned-out submersible effluent pumps, float switches, and waterproof electrical control boxes for conventional and aerobic systems.`,
      descRu: `Оперативная диагностика аварийной сигнализации септика, замена погружных фекальных и дренажных насосов, поплавковых датчиков и герметичных щитков управления.`,
      specs: 'Commercial Submersible Pumps | Float & Alarm Repair',
      specsRu: 'Насосы повышенной мощности | Ремонт автоматики',
    },
    {
      key: 'risers',
      active: hasRisers,
      iconName: 'Filter',
      title: 'Grade-Level Riser Installation & Baffle Repair',
      titleRu: 'Монтаж ревизионных люков (Risers) и ремонт перегородок',
      desc: `Upgrading buried concrete tank lids with watertight, flush-mounted poly access risers and washable effluent filters so your yard never has to be dug up again for routine service.`,
      descRu: `Вывод подземных крышек септика на уровень газона с помощью герметичных полимерных горловин и установка промывных фильтров. Больше никаких раскопок участка при обслуживании.`,
      specs: '24" Watertight Poly Risers | Inlet/Outlet Baffle Rebuild',
      specsRu: 'Герметичные люки 24" | Замена входных/выходных тройников',
    },
    {
      key: 'camera',
      active: hasCameraLocate,
      iconName: 'Video',
      title: 'Electronic Tank Locating & Camera Line Diagnostics',
      titleRu: 'Электронный поиск септика и видеодиагностика труб',
      desc: `512Hz sonde transmitter locating to pinpoint buried septic tanks and collapsed pipes without tearing up your yard, plus complete septic inspections for home buyers and realtors.`,
      descRu: `Точное обнаружение скрытых под землей крышек септика и проломов магистрали зондом 512 Гц без лишних раскопок, а также полная инспекция септиков при покупке дома.`,
      specs: '512Hz Sonde Locating | Real Estate Septic Certifications',
      specsRu: 'Локатор 512 Гц | Сертификация для сделок с недвижимостью',
    },
    {
      key: 'jetting',
      active: hasJetting,
      iconName: 'Sparkles',
      title: 'Main Sewer Line Replacement & High-Pressure Jetting',
      titleRu: 'Замена канализационных магистралей и гидропромывка',
      desc: `Replacing root-crushed terra cotta and corroded cast iron building drains with heavy-wall Schedule 40 PVC, plus 4,000 PSI hydro-jetting to clear stubborn blockages.`,
      descRu: `Замена продавленных корнями керамических и чугунных выпусков из дома на толстостенный ПВХ Schedule 40, а также пробивка засоров гидродинамической установкой 4000 PSI.`,
      specs: 'Schedule 40 PVC Conversion | 4,000 PSI Root Jetting',
      specsRu: 'Переход на трубу Sch 40 PVC | Гидропромывка 4000 PSI',
    },
    {
      key: 'pumping',
      active: true,
      iconName: 'Droplet',
      title: 'Deep Vacuum Tank Pumping & Complete Sludge Removal',
      titleRu: 'Глубокая вакуумная откачка и очистка резервуаров',
      desc: `Thorough extraction of compacted bottom sludge, heavy grease crusts, and liquid effluent using commercial vacuum tankers with 200-ft lawn-safe hose reach.`,
      descRu: `Полная выкачка плотного донного ила, жировой корки и стоков мощными вакуумными цистернами с подачей шлангов до 200 футов без заезда тяжелого грузовика на газон.`,
      specs: 'High-CFM Vacuum Tankers | 200-ft Hose Reach',
      specsRu: 'Мощные вакуумные насосы | Шланги до 200 футов',
    },
  ]

  // Sort active services first, take 6
  const sortedServices = [
    ...servicePool.filter((s) => s.active),
    ...servicePool.filter((s) => !s.active),
  ].slice(0, 6)

  return {
    primaryFocusEn,
    competitiveAdvantages: { en: advEn.slice(0, 3), ru: advRu.slice(0, 3) },
    customServices: sortedServices.map(({ key, active, ...rest }) => rest),
    flags: { hasDrainField, hasInstall, hasExcavation, hasRisers, hasPumpsAerobic, hasCameraLocate, hasJetting }
  }
}

function buildEquipmentAndGallery(lead, photoUrls, flags) {
  // photoUrls[0] is used for heroImage if available
  // Build 3 equipment cards using photoUrls[1..3] (or photoUrls[0..2] if few photos)
  const eqPhotos = photoUrls.length >= 4
    ? [photoUrls[1], photoUrls[2], photoUrls[3]]
    : photoUrls.length === 3
    ? [photoUrls[1], photoUrls[2], null]
    : photoUrls.length === 2
    ? [photoUrls[1], null, null]
    : [null, null, null]

  const equipmentPhotos = [
    {
      title: flags.hasExcavation || flags.hasInstall
        ? `Precision Excavation & Tank Setting Fleet in ${lead.city}`
        : `Commercial Septic Service & Field Dispatch Unit`,
      titleRu: flags.hasExcavation || flags.hasInstall
        ? `Землеройная спецтехника и монтаж резервуаров в г. ${lead.city}`
        : `Специализированный комплекс обслуживания септиков`,
      badge: 'Company-Owned Fleet',
      badgeRu: 'Собственный автопарк',
      desc: `Dedicated field machinery operated directly by ${lead.name} crews in ${lead.city}, ${lead.state}. Engineered for surgical trenching, heavy tank placement, and zero damage to residential driveways and lawns.`,
      descRu: `Собственная техника бригады ${lead.name} в г. ${lead.city}, ${lead.state}. Обеспечивает точную разработку грунта, монтаж емкостей и полную сохранность подъездных дорожек и газона.`,
      image: eqPhotos[0],
    },
    {
      title: flags.hasDrainField
        ? 'Laser-Graded Drain Field & Lateral Line Equipment'
        : 'High-Capacity Vacuum Extraction & Line Diagnostics',
      titleRu: flags.hasDrainField
        ? 'Оборудование для лазерного нивелирования полей фильтрации'
        : 'Мощная вакуумная откачка и телеинспекция магистралей',
      badge: flags.hasDrainField ? 'Code-Compliant Grading' : 'Deep Sludge Extraction',
      badgeRu: flags.hasDrainField ? 'Точный уклон по СНиП' : 'Глубокая очистка',
      desc: flags.hasDrainField
        ? `Optical grade lasers and washed aggregate bedding setup ensuring uniform gravity flow across all lateral absorption trenches without standing water.`
        : `High-displacement vacuum extraction combined with 512Hz underground locating and camera diagnostics to pinpoint issues before any digging begins.`,
      descRu: flags.hasDrainField
        ? `Лазерный контроль уклона дренажных траншей и отсыпка мытым гранитным щебнем для идеального распределения стоков без застоя воды.`
        : `Глубокая вакуумная выкачка донного осадка в сочетании с электронным поиском люков 512 Гц и видеодиагностикой труб до начала раскопок.`,
      image: eqPhotos[1],
    },
    {
      title: 'Turf Protection & Clean Backfill Restoration',
      titleRu: 'Защита ландшафта и чистовая обратная засыпка',
      badge: 'Property Preservation',
      badgeRu: 'Чистота участка',
      desc: `Every project in ${lead.city} includes layered soil compaction, grade-level access riser fitting, and smooth surface finishing so your yard looks clean and settled upon completion.`,
      descRu: `Каждый выезд в г. ${lead.city} завершается послойной трамбовкой грунта, выводом ревизионных крышек в уровень с травой и чистовым разравниванием площадки.`,
      image: eqPhotos[2],
    },
  ]

  // Remaining photos (from index 4 up to 7) go to galleryPhotos
  const extraPhotos = photoUrls.slice(4, 8)
  const galleryTemplates = [
    {
      title: `On-Site Septic System Execution in ${lead.city}, ${lead.state}`,
      titleRu: `Выполнение работ на объекте в г. ${lead.city}, ${lead.state}`,
      tag: 'Verified Jobsite',
      tagRu: 'Реальный объект',
      desc: `Documented field work completed by ${lead.name} adhering to ${lead.state} environmental and county health standards.`,
      descRu: `Подтвержденный фотоотчет с объекта компании ${lead.name}, выполненный по санитарным стандартам штата ${lead.state}.`,
    },
    {
      title: 'Subsurface Line & Tank Access Preparation',
      titleRu: 'Подготовка подземных коммуникаций и горловин',
      tag: 'System Integrity',
      tagRu: 'Герметичность узлов',
      desc: `Inspection of inlet/outlet baffles, watertight connections, and structural tank integrity during field service.`,
      descRu: `Проверка впускных и выпускных перегородок, герметизация стыков и контроль целостности резервуара.`,
    },
    {
      title: 'Excavation, Bedding & Drainage Alignment',
      titleRu: 'Земляные работы и выравнивание дренажного контура',
      tag: 'Field Engineering',
      tagRu: 'Инженерный монтаж',
      desc: `Careful trenching and soil management by the ${lead.name} crew ensuring long-term wastewater flow and zero yard settling.`,
      descRu: `Аккуратная разработка траншей бригадой ${lead.name} с сохранением правильного уклона и защитой грунта от просадок.`,
    },
    {
      title: 'Final Site Grading & Property Handover',
      titleRu: 'Чистовая планировка и сдача объекта заказчику',
      tag: 'Clean Finish',
      tagRu: 'Чистовая сдача',
      desc: `Completed service site in ${lead.city} with backfilled soil and clean terrain ready for everyday residential use.`,
      descRu: `Завершенный объект в г. ${lead.city} с обратной засыпкой и аккуратным восстановлением территории.`,
    },
  ]

  const galleryPhotos = extraPhotos.map((imgUrl, idx) => ({
    ...galleryTemplates[idx % galleryTemplates.length],
    image: imgUrl,
  }))

  return { equipmentPhotos, galleryPhotos }
}

async function optimizeImage(srcPath, destPath) {
  if (await fs.pathExists(destPath)) return true
  try {
    await execFileAsync('sips', [
      '-s', 'format', 'jpeg',
      '-s', 'formatOptions', '70',
      '-Z', '1000',
      srcPath,
      '--out', destPath,
    ])
    return true
  } catch (err) {
    try {
      await fs.copy(srcPath, destPath)
      return true
    } catch {
      return false
    }
  }
}

async function run() {
  const leadsPath = path.resolve('./src/data/septicLeads.json')
  const leads = await fs.readJson(leadsPath)

  let enrichedCount = 0
  let photosOptimizedCount = 0
  let ownersFoundCount = 0

  for (const lead of leads) {
    if (lead.ticketTier !== 'HIGH_TICKET') continue

    // Keep Bonzo and Bolt custom photos intact, only add ownerName & primaryFocusEn & customServices
    const isFlagship = lead.slug === 'bonzo-excavating' || lead.slug === 'bolt-septic-excavation'

    const companyDir = path.resolve('./septic_repair', lead.folderName)
    let rawReviews = lead.reviewsSample || []
    let companyMeta = null

    if (await fs.pathExists(path.join(companyDir, 'reviews.json'))) {
      try {
        rawReviews = await fs.readJson(path.join(companyDir, 'reviews.json'))
      } catch {}
    }
    if (await fs.pathExists(path.join(companyDir, 'company.json'))) {
      try {
        companyMeta = await fs.readJson(path.join(companyDir, 'company.json'))
      } catch {}
    }

    // 1. Filter reviews strictly to 4★ and 5★
    const positiveReviews = rawReviews.filter((r) => Number(r.rating) >= 4)
    const badAuthors = new Set(
      rawReviews.filter((r) => Number(r.rating) < 4).map((r) => (r.author || '').trim().toLowerCase())
    )

    // 2. Extract Owner Name
    if (lead.slug === 'bonzo-excavating') {
      lead.ownerName = 'Zac'
    } else if (lead.slug === 'bolt-septic-excavation') {
      lead.ownerName = 'Cody'
    } else {
      const detectedOwner = extractOwnerName(lead.name, positiveReviews)
      if (detectedOwner) {
        lead.ownerName = detectedOwner
        ownersFoundCount++
        if (!lead.crewMembers || lead.crewMembers.length === 0) {
          lead.crewMembers = [
            `${detectedOwner} (Lead Septic Specialist & Field Supervisor)`,
            `Certified Excavation & Drainage Crew`,
          ]
        }
      } else if (!lead.crewMembers || lead.crewMembers.length === 0) {
        lead.crewMembers = [
          `${lead.name} Master Field Technician`,
          `Licensed Excavation & Septic Crew`,
        ]
      }
    }

    // 3. Analyze profile & reviews for services & competitive advantages
    const analysis = analyzeCompanyProfile(lead, positiveReviews)
    lead.primaryFocusEn = analysis.primaryFocusEn
    lead.competitiveAdvantages = analysis.competitiveAdvantages
    lead.customServices = analysis.customServices

    // Service area list
    if (!lead.serviceAreaList || lead.serviceAreaList.length === 0) {
      const city = lead.city || 'Metro Area'
      const st = lead.state || ''
      lead.serviceAreaList = [
        `${city}, ${st}`,
        `Greater ${city} Area`,
        `North ${city} County`,
        `South ${city} Limits`,
        `Surrounding Rural & Residential Acreage`,
        `24/7 Emergency Dispatch Territory`,
      ]
    }

    if (isFlagship) {
      enrichedCount++
      continue
    }

    // 4. Collect and optimize valid local photos (owner + 4★/5★ review photos)
    const candidateFiles = []
    const ownerDir = path.join(companyDir, 'photos', 'owner')
    if (await fs.pathExists(ownerDir)) {
      const files = (await fs.readdir(ownerDir))
        .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
        .sort()
      for (const f of files) {
        candidateFiles.push({ src: path.join(ownerDir, f), type: 'owner', author: null })
      }
    }

    const revPhotoDir = path.join(companyDir, 'photos', 'reviews')
    const reviewPhotosMeta = companyMeta?.photos?.reviews || []
    if (await fs.pathExists(revPhotoDir)) {
      const files = (await fs.readdir(revPhotoDir))
        .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
        .sort()
      for (const f of files) {
        const metaItem = reviewPhotosMeta.find((m) => m.file === f)
        const authorName = metaItem?.author ? metaItem.author.trim().toLowerCase() : null
        // Skip photo if uploaded by a 1★-3★ reviewer!
        if (authorName && badAuthors.has(authorName)) continue
        candidateFiles.push({
          src: path.join(revPhotoDir, f),
          type: 'review',
          author: metaItem?.author || null,
        })
      }
    }

    // Optimize up to 8 photos for this company
    const selectedCandidates = candidateFiles.slice(0, 8)
    const publicShowcaseDir = path.resolve('./public/showcase', lead.slug)
    const localPhotoUrls = []
    const authorPhotoMap = {}

    if (selectedCandidates.length > 0) {
      await fs.ensureDir(publicShowcaseDir)
      for (let i = 0; i < selectedCandidates.length; i++) {
        const item = selectedCandidates[i]
        const outName = `photo_${String(i + 1).padStart(3, '0')}_opt.jpg`
        const destPath = path.join(publicShowcaseDir, outName)
        const ok = await optimizeImage(item.src, destPath)
        if (ok) {
          const publicUrl = `/showcase/${lead.slug}/${outName}`
          localPhotoUrls.push(publicUrl)
          photosOptimizedCount++
          if (item.author) {
            if (!authorPhotoMap[item.author]) authorPhotoMap[item.author] = []
            authorPhotoMap[item.author].push(publicUrl)
          }
        }
      }
    }

    // Update reviewsSample with clean positive reviews and non-expiring local photo URLs
    lead.reviewsSample = positiveReviews.slice(0, 6).map((r) => {
      const localRevPhotos = authorPhotoMap[r.author] || []
      return {
        author: r.author || 'Verified Homeowner',
        authorMeta: r.authorMeta || 'Verified Google Customer',
        rating: Number(r.rating) || 5,
        date: r.date || 'Verified Review',
        text: r.text || 'Outstanding septic service, fast response, and fair pricing.',
        photos: localRevPhotos,
      }
    })

    lead.photosSample = localPhotoUrls

    if (localPhotoUrls.length > 0) {
      lead.heroImage = localPhotoUrls[0]
      const { equipmentPhotos, galleryPhotos } = buildEquipmentAndGallery(lead, localPhotoUrls, analysis.flags)
      lead.equipmentPhotos = equipmentPhotos
      lead.galleryPhotos = galleryPhotos
    } else {
      lead.heroImage = undefined
      const { equipmentPhotos } = buildEquipmentAndGallery(lead, [], analysis.flags)
      lead.equipmentPhotos = equipmentPhotos
      lead.galleryPhotos = []
    }

    enrichedCount++
    if (enrichedCount % 25 === 0) {
      console.log(`[Progress] Enriched ${enrichedCount}/316 high-ticket leads (${photosOptimizedCount} photos optimized)...`)
    }
  }

  await fs.writeJson(leadsPath, leads, { spaces: 2 })
  console.log(`\n✅ Completed! Enriched ${enrichedCount} High-Ticket leads, extracted ${ownersFoundCount + 2} personal owner names, and optimized ${photosOptimizedCount} real jobsite photos!`)
}

run().catch(console.error)
