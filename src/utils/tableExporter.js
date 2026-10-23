import fs from 'fs-extra'
import path from 'path'
import * as XLSXModule from 'xlsx'

const XLSX = XLSXModule.default || XLSXModule

export const TABLE_HEADERS = [
  'Название',
  'Штат',
  'Город',
  'Адрес',
  'Контактный номер',
  'Оценка',
  'Количество отзывов',
  'Наличие сайта',
  'Ссылка на сайт',
  'Проблема с сайтом',
  'Ссылка на Google Maps',
  'Категория',
  'Рабочие часы',
  'Собрано фото',
  'Собрано отзывов',
  'Папка с файлами',
]

/**
 * Extract US State code from address or fallback
 */
export function extractState(address, fallbackState = '') {
  if (address) {
    const match = address.match(/,\s*([A-Z]{2})\s+\d{5}/)
    if (match) return match[1]
  }
  return fallbackState || ''
}

/**
 * Extract US City from address or fallback
 */
export function extractCity(address, fallbackCity = '') {
  if (address) {
    const match = address.match(/,\s*([^,]+),\s*[A-Z]{2}\s+\d{5}/)
    if (match) return match[1].trim()
  }
  return fallbackCity || ''
}

/**
 * Format hours array into readable string
 */
export function formatHours(hours) {
  if (!hours || !Array.isArray(hours) || hours.length === 0) return 'Не указаны'
  return hours.map((h) => `${h.day}: ${h.hours}`).join(' | ')
}

/**
 * Maps raw company information into structured table row
 */
export function formatCompanyRow(company) {
  const hasWebsite = Boolean(company.website && company.website.trim().length > 0)
  const state = extractState(company.address, company.state)
  const city = extractCity(company.address, company.city)

  return {
    'Название': company.name || 'Без названия',
    'Штат': state,
    'Город': city,
    'Адрес': company.address || 'Не указан',
    'Контактный номер': company.phone || 'Не указан',
    'Оценка':
      company.rating !== null && company.rating !== undefined && company.rating !== ''
        ? Number(company.rating)
        : '',
    'Количество отзывов':
      company.reviewCount !== null && company.reviewCount !== undefined && company.reviewCount !== ''
        ? Number(company.reviewCount)
        : 0,
    'Наличие сайта': hasWebsite ? 'Есть' : 'Отсутствует',
    'Ссылка на сайт': hasWebsite ? company.website : '—',
    'Проблема с сайтом':
      company.websiteIssue ||
      company['Проблема с сайтом'] ||
      (hasWebsite ? 'Не проверялось' : 'Сайт отсутствует в карточке'),
    'Ссылка на Google Maps': company.url || company.targetUrl || '',
    'Категория': company.category || 'Septic system service',
    'Рабочие часы': company.hoursFormatted || formatHours(company.hours),
    'Собрано фото': company.totalPhotosDownloaded || 0,
    'Собрано отзывов': company.totalReviewsScraped || 0,
    'Папка с файлами': company.folderName || (company.companyDir ? path.basename(company.companyDir) : ''),
  }
}

/**
 * Escape CSV fields according to RFC 4180
 */
function escapeCsvField(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Save full table to .xlsx and .csv in outputDir
 */
export async function saveCompaniesTable(companies, outputDir, baseFileName = 'companies') {
  if (!companies || companies.length === 0) return null

  await fs.ensureDir(outputDir)

  // Standardize rows
  const rows = companies.map((c) => ('Название' in c && 'Штат' in c ? c : formatCompanyRow(c)))

  // 1. Generate CSV (UTF-8 with BOM for instant Excel / Numbers / Sheets compatibility)
  const csvLines = []
  csvLines.push(TABLE_HEADERS.map(escapeCsvField).join(','))
  for (const row of rows) {
    const line = TABLE_HEADERS.map((h) => escapeCsvField(row[h] !== undefined ? row[h] : '')).join(',')
    csvLines.push(line)
  }
  const csvContent = '\uFEFF' + csvLines.join('\r\n')
  const csvFilePath = path.join(outputDir, `${baseFileName}.csv`)
  await fs.writeFile(csvFilePath, csvContent, 'utf-8')

  // 2. Generate XLSX (native Excel workbook)
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: TABLE_HEADERS })

  // Auto-calculate column widths
  const colWidths = TABLE_HEADERS.map((header) => {
    let maxLen = header.length
    for (const r of rows) {
      const valStr = String(r[header] || '')
      if (valStr.length > maxLen) maxLen = valStr.length
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 65) }
  })
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Компании Septic Repair')
  const xlsxFilePath = path.join(outputDir, `${baseFileName}.xlsx`)
  XLSX.writeFile(workbook, xlsxFilePath)

  return {
    csvFilePath,
    xlsxFilePath,
    rowCount: rows.length,
  }
}

/**
 * Append or update a single company in the table files
 */
export async function appendOrUpdateCompanyInTable(companyInfo, outputDir, baseFileName = 'companies') {
  await fs.ensureDir(outputDir)
  const xlsxFilePath = path.join(outputDir, `${baseFileName}.xlsx`)

  let rows = []
  if (await fs.pathExists(xlsxFilePath)) {
    try {
      const wb = XLSX.readFile(xlsxFilePath)
      const firstSheetName = wb.SheetNames[0]
      if (firstSheetName) {
        rows = XLSX.utils.sheet_to_json(wb.Sheets[firstSheetName])
      }
    } catch (err) {
      console.warn(`[TableExporter] Notice: Could not read existing xlsx: ${err.message}`)
    }
  }

  const newRow = formatCompanyRow(companyInfo)
  const existingIdx = rows.findIndex(
    (r) =>
      (r['Ссылка на Google Maps'] && newRow['Ссылка на Google Maps'] && r['Ссылка на Google Maps'] === newRow['Ссылка на Google Maps']) ||
      (r['Название'] && newRow['Название'] && r['Название'].toLowerCase() === newRow['Название'].toLowerCase() && r['Штат'] === newRow['Штат'])
  )

  if (existingIdx >= 0) {
    rows[existingIdx] = newRow
  } else {
    rows.push(newRow)
  }

  return await saveCompaniesTable(rows, outputDir, baseFileName)
}
