import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

async function prepare() {
  const srcDir = path.resolve('./septic_repair/Bonzo Excavating/photos/owner')
  const destDir = path.resolve('./public/showcase/bonzo-excavating')
  await fs.ensureDir(destDir)

  const files = (await fs.readdir(srcDir)).filter(
    (f) => f.startsWith('photo_') && f.endsWith('.jpg')
  )

  console.log(`[Bonzo Photos] Found ${files.length} photos. Processing...`)

  for (const f of files) {
    const full = path.join(srcDir, f)
    const base = f.replace('.jpg', '')
    const optName = `${base}_opt.jpg`
    const thumbName = `${base}_thumb.jpg`

    const optPath = path.join(destDir, optName)
    const thumbPath = path.join(destDir, thumbName)

    // 1600px max web version
    execSync(`sips -s format jpeg -s formatOptions 85 -Z 1600 "${full}" --out "${optPath}"`)
    // 600px thumbnail
    execSync(`sips -s format jpeg -s formatOptions 80 -Z 600 "${full}" --out "${thumbPath}"`)
  }

  console.log('Successfully generated optimized and thumbnail photos in public/showcase/bonzo-excavating!')
}

prepare().catch(console.error)
