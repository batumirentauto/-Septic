import { recordShowcaseVideos } from './recordShowcaseVideos.js'

async function main() {
  const slugs = ['miller-environmental-services', 'kd-services-excavation-septic']
  for (const slug of slugs) {
    console.log(`Recording videos for: ${slug}...`)
    await recordShowcaseVideos({
      slug,
      baseUrl: 'https://septic.up.railway.app'
    })
    console.log(`✅ Recorded: ${slug}`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
