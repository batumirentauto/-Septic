#!/usr/bin/env node
import { Command } from 'commander'
import path from 'path'
import { createBrowser } from './utils/browser.js'
import { runFullSepticLeadGeneration } from './scrapers/leadHunter.js'
import { TARGET_CITIES_ALL_STATES } from './data/targetCities.js'

const program = new Command()

program
  .name('septic-scraper')
  .description('Google Maps Scraper for Septic Repair Leads across all US states')
  .version('1.0.0')

program
  .option('-s, --state <code/name>', 'Filter to a specific US state (e.g. FL, TX, CA)')
  .option('-c, --city <name>', 'Filter to a specific city (e.g. Orlando, Houston)')
  .option('-p, --photos <number>', 'Max photos to download per business', '100')
  .option('-r, --reviews <number>', 'Max reviews to scrape per business', '250')
  .option('-o, --output <dir>', 'Output directory', 'septic_repair')
  .option('--no-headless', 'Run with visible browser window')
  .action(async (opts) => {
    let browserInstance
    try {
      console.log(`======================================================`)
      console.log(`  SEPTIC REPAIR LEAD GENERATION PIPELINE`)
      console.log(`======================================================`)
      console.log(`• Rating filter:   4.6 to 5.0`)
      console.log(`• Reviews filter:  25 to 200`)
      console.log(`• Website filter:  No website OR Facebook OR Broken site`)
      console.log(`• Photos/Reviews:  All photos & reviews saved`)
      console.log(`• Output path:     ${path.resolve(opts.output)}`)
      console.log(`======================================================\n`)

      let cities = TARGET_CITIES_ALL_STATES
      if (opts.state) {
        const stateUpper = opts.state.toUpperCase()
        cities = cities.filter((c) => c.state === stateUpper)
        console.log(`[Filter] Filtered to state "${stateUpper}" (${cities.length} cities)`)
      }
      if (opts.city) {
        const cityLower = opts.city.toLowerCase()
        cities = cities.filter((c) => c.city.toLowerCase().includes(cityLower))
        console.log(`[Filter] Filtered to city "${opts.city}" (${cities.length} cities)`)
      }

      const browser = await createBrowser({ headless: opts.headless })
      browserInstance = browser

      await runFullSepticLeadGeneration(browser, {
        photos: parseInt(opts.photos, 10),
        reviews: parseInt(opts.reviews, 10),
        outputDir: path.resolve(opts.output),
        cities,
      })
    } catch (err) {
      console.error('[Error] Scraper encountered fatal error:', err)
      process.exit(1)
    } finally {
      if (browserInstance) await browserInstance.close()
    }
  })

program.parse(process.argv)
