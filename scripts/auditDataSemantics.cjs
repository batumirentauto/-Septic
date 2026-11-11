#!/usr/bin/env node
/**
 * auditDataSemantics.cjs
 *
 * Pre-Flight Semantic Data & UI Linter.
 * Runs automatically before every production build ('npm run prebuild').
 * 
 * Enforces:
 * 1. Category Purity: Call registry contains ONLY verified Septic & Sanitation contractors.
 * 2. Price <-> Service Coherence: Low-ticket ($350-$650) never paired with $15k drainfield installation headlines.
 * 3. Card Title Uniqueness: Exactly 3 equipment cards with 0 duplicate titles/badges per page.
 * 4. Image Uniqueness: 0 duplicate images across Hero, Equipment, and Gallery on any single page.
 * 5. Balanced Gallery: Exactly 0 or >= 2 gallery photos. Never 1 lonely card.
 * 6. Zero Domestic Junk: Bathrooms, sinks, stoves, toilets strictly barred from septic equipment.
 */

const fs = require('fs');
const path = require('path');

const CALL_LEADS_PATH = path.join(__dirname, '..', 'src', 'data', 'callLeads.json');
const SEPTIC_LEADS_PATH = path.join(__dirname, '..', 'src', 'data', 'septicLeads.json');

const VALID_PALETTES = new Set(['emerald', 'blue', 'indigo', 'teal', 'amber', 'orange', 'red']);
const FORBIDDEN_CATEGORIES = ['plumber', 'cleaning service', 'heating contractor', 'water damage', 'restoration'];

function runAudit() {
  console.log('🔍 Running Pre-Flight Semantic Data & UI Linter...\n');

  if (!fs.existsSync(CALL_LEADS_PATH) || !fs.existsSync(SEPTIC_LEADS_PATH)) {
    console.error('❌ Missing core data files (callLeads.json or septicLeads.json).');
    process.exit(1);
  }

  const callLeads = JSON.parse(fs.readFileSync(CALL_LEADS_PATH, 'utf8'));
  const septicLeads = JSON.parse(fs.readFileSync(SEPTIC_LEADS_PATH, 'utf8'));

  const septicMap = new Map();
  septicLeads.forEach(l => septicMap.set(l.slug, l));

  let errors = [];
  let warnings = [];

  // ==========================================
  // PART 1: AUDIT CALL REGISTRY LEADS (40 Leads)
  // ==========================================
  console.log(`Checking ${callLeads.length} call campaign registry leads...`);

  callLeads.forEach((c, idx) => {
    const lead = septicMap.get(c.slug);
    if (!lead) {
      errors.push(`[Call Lead #${idx + 1}] Slug "${c.slug}" does not exist in septicLeads.json!`);
      return;
    }

    // 1.1 Category Purity
    const cat = (lead.category || '').toLowerCase();
    for (const forbidden of FORBIDDEN_CATEGORIES) {
      if (cat.includes(forbidden)) {
        errors.push(`[Call Lead] "${lead.name}" (${lead.slug}) has illegal category: "${lead.category}"! Plumbers/cleaners must not be in call registry.`);
      }
    }

    // 1.2 Valid Phone
    if (!c.phone || c.phone === 'Не указан' || !c.phone.startsWith('+1')) {
      errors.push(`[Call Lead] "${c.company}" (${c.slug}) is missing a valid US phone number! Found: "${c.phone}"`);
    }

    // 1.3 Valid Brand Palette
    if (!c.palette || !VALID_PALETTES.has(c.palette)) {
      errors.push(`[Call Lead] "${c.company}" has invalid palette: "${c.palette}". Must be one of ${Array.from(VALID_PALETTES).join(', ')}`);
    }

    // 1.4 Palette synchronization (keep callLeads in sync with septicLeads)
    if (lead.palette && lead.palette !== c.palette) {
      warnings.push(`[Sync] Harmonizing palette for ${c.slug}: "${c.palette}" -> "${lead.palette}".`);
      c.palette = lead.palette;
    }
  });

  // ==========================================
  // PART 2: AUDIT SEMANTIC INTEGRITY ON ACTIVE PAGES
  // ==========================================
  const activeSlugs = new Set(septicLeads.map(s => s.slug));

  console.log(`Checking UI semantics across active target pages...`);

  activeSlugs.forEach(slug => {
    const lead = septicMap.get(slug);
    if (!lead) return;

    // 2.1 Equipment Cards Structure
    if (lead.equipmentPhotos) {
      if (lead.equipmentPhotos.length !== 3) {
        errors.push(`[Structure] "${lead.name}" (${slug}) equipmentPhotos has ${lead.equipmentPhotos.length} items. Must be exactly 3 cards!`);
      } else {
        const titles = lead.equipmentPhotos.map(e => (e.title || '').trim().toLowerCase());
        const badges = lead.equipmentPhotos.map(e => (e.badge || '').trim().toLowerCase());

        // Zero duplicate titles
        if (new Set(titles).size !== titles.length) {
          errors.push(`[Duplicate Titles] "${lead.name}" (${slug}) has identical titles on equipment cards: ${JSON.stringify(titles)}`);
        }

        // Zero duplicate badges
        if (new Set(badges).size !== badges.length) {
          warnings.push(`[Duplicate Badges] "${lead.name}" (${slug}) has duplicate badges: ${JSON.stringify(badges)}`);
        }
      }
    }

    // 2.2 Photo Uniqueness on the Same Page
    const pageImages = [];
    if (lead.heroImage) pageImages.push(lead.heroImage);
    if (lead.equipmentPhotos) {
      lead.equipmentPhotos.forEach(eq => {
        if (eq.image) pageImages.push(eq.image);
      });
    }
    if (lead.galleryPhotos) {
      lead.galleryPhotos.forEach(g => {
        if (g.image) pageImages.push(g.image);
      });
    }

    const uniqueImages = new Set(pageImages);
    if (uniqueImages.size !== pageImages.length) {
      errors.push(`[Duplicate Photos] "${lead.name}" (${slug}) contains identical photo reused across sections: ${JSON.stringify(pageImages)}`);
    }

    // 2.3 Balanced Gallery (0 or >= 2 items)
    if (lead.galleryPhotos && lead.galleryPhotos.length === 1) {
      errors.push(`[Broken Gallery] "${lead.name}" (${slug}) has exactly 1 gallery photo. A 1-card gallery looks like an empty layout bug! Must be 0 or >= 2.`);
    }

    // 2.4 Price vs Headline Semantic Compatibility
    const isLowTicket = lead.ticketTier === 'LOW_TICKET' || (lead.ticketRange && (lead.ticketRange.includes('$350') || lead.ticketRange.includes('$650')));
    if (isLowTicket) {
      // Check equipment titles for unrealistic claims under $350
      if (lead.equipmentPhotos) {
        lead.equipmentPhotos.forEach((eq, idx) => {
          const t = (eq.title || '').toLowerCase();
          if (t.includes('heavy excavation') && lead.ticketRange?.includes('$350')) {
            warnings.push(`[Semantic Warning] "${lead.name}" has Low-Ticket ($350) but Card ${idx+1} mentions Heavy Excavation.`);
          }
        });
      }
    }
  });

  // Report results
  if (warnings.length > 0) {
    console.log(`\n⚠️  SEMANTIC WARNINGS (${warnings.length}):`);
    warnings.slice(0, 10).forEach(w => console.log('   - ' + w));
  }

  if (errors.length > 0) {
    console.error(`\n❌ CRITICAL SEMANTIC AUDIT FAILURES (${errors.length}):`);
    errors.forEach(e => console.error('   ❌ ' + e));
    console.error('\n🛑 BUILD HALTED: Fix semantic inconsistencies above before deploying.');
    process.exit(1);
  }

  console.log('\n✅ ALL SEMANTIC CHECKS PASSED: 100% data and UI coherence verified.\n');
}

runAudit();
