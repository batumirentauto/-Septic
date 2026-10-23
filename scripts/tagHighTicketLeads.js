import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'

const XLSX = XLSXModule.default || XLSXModule

async function main() {
  const xlsxPath = path.resolve('./septic_repair/companies.xlsx')
  const csvPath = path.resolve('./septic_repair/companies.csv')
  const jsonPath = path.resolve('./src/data/septicLeads.json')

  if (!(await fs.pathExists(xlsxPath))) {
    console.error('companies.xlsx not found at', xlsxPath)
    process.exit(1)
  }

  const wb = XLSX.readFile(xlsxPath)
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
  console.log(`[Tagging] Processing ${rows.length} rows...`)

  let leadsJson = []
  if (await fs.pathExists(jsonPath)) {
    leadsJson = await fs.readJson(jsonPath)
  }

  const baseDir = path.resolve('./septic_repair')

  let highCount = 0
  let lowCount = 0

  const updatedRows = []

  for (const row of rows) {
    const name = row['Название']
    const folderName = row['Папка с файлами'] || name
    const compDir = path.join(baseDir, folderName)

    let fullText = (name || '').toLowerCase()
    let category = (row['Категория'] || '').toLowerCase()
    fullText += ' ' + category

    if (await fs.pathExists(compDir)) {
      const overviewPath = path.join(compDir, 'overview.txt')
      const revPath = path.join(compDir, 'reviews.json')

      if (await fs.pathExists(overviewPath)) {
        try {
          fullText += ' ' + (await fs.readFile(overviewPath, 'utf-8')).toLowerCase()
        } catch {}
      }
      if (await fs.pathExists(revPath)) {
        try {
          const revs = await fs.readJson(revPath)
          if (Array.isArray(revs)) {
            for (const r of revs) {
              fullText += ' ' + (r.text || '').toLowerCase()
            }
          }
        } catch {}
      }
    }

    const nameLower = (name || '').toLowerCase()

    const isExcavation =
      nameLower.includes('excavat') ||
      fullText.includes('excavat') ||
      fullText.includes('backhoe') ||
      fullText.includes('trench') ||
      fullText.includes('earthwork') ||
      fullText.includes('grading') ||
      fullText.includes('mini excavator') ||
      fullText.includes('bobcat')

    const isDrainField =
      fullText.includes('drain field') ||
      fullText.includes('drainfield') ||
      fullText.includes('leach field') ||
      fullText.includes('leach line') ||
      fullText.includes('leach bed') ||
      fullText.includes('absorption field') ||
      fullText.includes('lateral lines')

    const isInstallation =
      nameLower.includes('install') ||
      fullText.includes('install') ||
      fullText.includes('installation') ||
      fullText.includes('installed') ||
      fullText.includes('put in a new')

    const isReplacement =
      fullText.includes('replace') ||
      fullText.includes('replacement') ||
      fullText.includes('replaced') ||
      fullText.includes('new tank') ||
      fullText.includes('new system')

    const isSystems =
      nameLower.includes('systems') ||
      fullText.includes('septic systems') ||
      fullText.includes('engineered system') ||
      fullText.includes('aerobic system')

    const services = []
    if (isDrainField) services.push('Drain Field Restoration')
    if (isInstallation) services.push('Septic Installation')
    if (isReplacement) services.push('System Replacement')
    if (isExcavation) services.push('Excavation & Trenching')
    if (isSystems) services.push('Complete Septic Systems')

    const isPurePumperName =
      (nameLower.includes('pumping') ||
        nameLower.includes('pumper') ||
        nameLower.includes('pump service') ||
        nameLower.includes('tank cleaning') ||
        nameLower.includes('portable') ||
        nameLower.includes('porta potty') ||
        nameLower.includes('waste service')) &&
      !nameLower.includes('excavat') &&
      !nameLower.includes('install') &&
      !nameLower.includes('systems')

    let isHighTicket = false
    let ticketTier = 'LOW_TICKET'
    let ticketTierLabel = 'НИЗКИЙ ЧЕК (Откачка $350–$650)'
    let ticketRange = '$350 – $650'
    let primaryFocus = 'Только откачка и чистка (Pumping)'

    if (services.length >= 1 && !isPurePumperName) {
      isHighTicket = true
    } else if (services.length >= 2) {
      isHighTicket = true
    }

    if (isHighTicket) {
      highCount++
      ticketTier = 'HIGH_TICKET'
      ticketTierLabel = 'ВЫСОКИЙ ЧЕК ($3,000–$18,000+)'
      ticketRange = '$3,000 – $18,000+'
      if (isDrainField) primaryFocus = 'Восстановление дренажных полей (Drain Field)'
      else if (isInstallation) primaryFocus = 'Монтаж новых септиков (Installation)'
      else if (isExcavation) primaryFocus = 'Экскавация и траншеи (Excavation)'
      else if (isReplacement) primaryFocus = 'Капитальная замена системы (Replacement)'
      else primaryFocus = 'Комплексные септик-системы (Septic Systems)'
    } else {
      lowCount++
    }

    // New enriched row for Excel/CSV
    const enriched = {
      'Название': name,
      'Уровень чека': ticketTierLabel,
      'Основная специализация': primaryFocus,
      'Примерный чек': ticketRange,
      'Дорогие услуги': services.length > 0 ? services.join(', ') : 'Плановая откачка',
      'Штат': row['Штат'] || '',
      'Город': row['Город'] || '',
      'Адрес': row['Адрес'] || '',
      'Контактный номер': row['Контактный номер'] || '',
      'Оценка': row['Оценка'] || 5,
      'Количество отзывов': row['Количество отзывов'] || 0,
      'Наличие сайта': row['Наличие сайта'] || '',
      'Ссылка на сайт': row['Ссылка на сайт'] || '',
      'Проблема с сайтом': row['Проблема с сайтом'] || '',
      'Ссылка на Google Maps': row['Ссылка на Google Maps'] || '',
      'Категория': row['Категория'] || '',
      'Рабочие часы': row['Рабочие часы'] || '',
      'Собрано фото': row['Собрано фото'] || 0,
      'Собрано отзывов': row['Собрано отзывов'] || 0,
      'Папка с файлами': folderName,
    }

    updatedRows.push(enriched)

    // Update in leadsJson
    const lead = leadsJson.find((l) => l.name === name || l.folderName === folderName)
    if (lead) {
      lead.ticketTier = ticketTier
      lead.ticketTierLabel = isHighTicket ? 'High-Ticket: Installation & Drain Field' : 'Low-Ticket: Pumping Only'
      lead.ticketTierLabelRu = isHighTicket ? 'Высокий чек: Монтаж и дренажные поля' : 'Низкий чек: Только откачка'
      lead.ticketRange = ticketRange
      lead.primaryFocus = primaryFocus
      lead.highTicketServices = services
    }
  }

  console.log(`[Tagging Completed] High-Ticket: ${highCount} | Low-Ticket (Pumping Only): ${lowCount}`)

  // Write new XLSX
  const newWb = XLSX.utils.book_new()
  const newWs = XLSX.utils.json_to_sheet(updatedRows)

  // Column widths
  newWs['!cols'] = [
    { wch: 32 }, // Название
    { wch: 30 }, // Уровень чека
    { wch: 42 }, // Основная специализация
    { wch: 22 }, // Примерный чек
    { wch: 45 }, // Дорогие услуги
    { wch: 8 },  // Штат
    { wch: 18 }, // Город
    { wch: 40 }, // Адрес
    { wch: 18 }, // Контактный номер
    { wch: 8 },  // Оценка
    { wch: 14 }, // Количество отзывов
    { wch: 14 }, // Наличие сайта
    { wch: 35 }, // Ссылка на сайт
    { wch: 32 }, // Проблема с сайтом
    { wch: 35 }, // Ссылка на Google Maps
    { wch: 28 }, // Категория
    { wch: 30 }, // Рабочие часы
    { wch: 14 }, // Собрано фото
    { wch: 14 }, // Собрано отзывов
    { wch: 32 }, // Папка с файлами
  ]

  XLSX.utils.book_append_sheet(newWb, newWs, 'Септики по чекам')
  XLSX.writeFile(newWb, xlsxPath)
  console.log('Saved updated XLSX to', xlsxPath)

  // Write CSV (UTF-8 with BOM)
  const csvContent = '\uFEFF' + XLSX.utils.sheet_to_csv(newWs)
  await fs.writeFile(csvPath, csvContent, 'utf-8')
  console.log('Saved updated CSV to', csvPath)

  // Write updated septicLeads.json
  await fs.writeJson(jsonPath, leadsJson, { spaces: 2 })
  console.log('Saved updated leads dataset to', jsonPath)
}

main().catch(console.error)
