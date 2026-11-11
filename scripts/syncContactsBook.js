import fs from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as XLSXModule from 'xlsx'

const execFileAsync = promisify(execFile)
const XLSX = XLSXModule.default || XLSXModule

const EXCEL_PATH = path.resolve('./outreach_316_high_ticket.xlsx')
const CACHE_JSON_PATH = path.resolve('./outreach_enriched_contacts.json')

function normalizePhone(raw) {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

async function main() {
  const wb = XLSX.readFile(EXCEL_PATH)
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets['Все 316 (По часам Батуми)'] || [])
  const cache = (await fs.pathExists(CACHE_JSON_PATH)) ? await fs.readJson(CACHE_JSON_PATH) : {}

  // Build a single vCard (.vcf) file or batch AppleScript to import all 316 cleanly
  const contactsPayload = allRows
    .map((r) => {
      const company = String(r['Компания (Company)'] || '').trim()
      const ownerRaw = String(r['Имя владельца (Owner)'] || '').trim()
      const cleanOwner =
        ownerRaw && !ownerRaw.includes('Hey there') && !ownerRaw.includes('—') ? ownerRaw : ''
      const cityState = `${r['Город'] || ''}, ${r['Штат'] || ''}`.trim()
      const phone = normalizePhone(r['Телефон (Phone)'])
      const enUrl = String(r['Ссылка для клиента (EN)'] || '').trim()
      const cacheKey = `${company}__${r['Город']}__${r['Штат']}`
      const enriched = cache[cacheKey] || {}
      const altPhone = normalizePhone((enriched.altPhonesAll || [])[0] || '')
      const email = (enriched.emailsAll || [])[0] || ''

      if (!company || !phone) return null
      return {
        firstName: cleanOwner ? `${cleanOwner} — ${company}` : company,
        lastName: `(${cityState})`,
        company,
        phone,
        altPhone: altPhone && altPhone !== phone ? altPhone : '',
        email,
        note: `Showcase: ${enUrl}`,
      }
    })
    .filter(Boolean)

  console.log(`📇 Синхронизация ${contactsPayload.length} подрядчиков в Contacts.app...`)

  // Run in batches of 40 so AppleScript executes fast
  const batchSize = 40
  let totalAdded = 0

  for (let i = 0; i < contactsPayload.length; i += batchSize) {
    const batch = contactsPayload.slice(i, i + batchSize)
    const jsonBatch = JSON.stringify(batch)
    const jxaScript = `
function run(argv) {
  const items = JSON.parse(argv[0]);
  const Contacts = Application("Contacts");
  let added = 0;
  for (const item of items) {
    const existing = Contacts.people.whose({ organization: item.company })();
    if (existing.length === 0) {
      const p = Contacts.Person({
        firstName: item.firstName,
        lastName: item.lastName,
        organization: item.company,
        note: item.note
      });
      Contacts.people.push(p);
      p.phones.push(Contacts.Phone({ label: "mobile", value: item.phone }));
      if (item.altPhone) {
        p.phones.push(Contacts.Phone({ label: "work", value: item.altPhone }));
      }
      if (item.email) {
        p.emails.push(Contacts.Email({ label: "work", value: item.email }));
      }
      added++;
    }
  }
  Contacts.save();
  return added;
}
`
    const { stdout } = await execFileAsync('osascript', ['-l', 'JavaScript', '-e', jxaScript, jsonBatch])
    const count = Number(stdout.trim() || 0)
    totalAdded += count
    console.log(`   Партия ${Math.floor(i / batchSize) + 1}/${Math.ceil(contactsPayload.length / batchSize)}: добавлено ${count} новых контактов`)
  }

  console.log(`✅ Готово! Всего добавлено в Contacts.app: ${totalAdded} компаний (из ${contactsPayload.length}).`)
}

main().catch(console.error)
