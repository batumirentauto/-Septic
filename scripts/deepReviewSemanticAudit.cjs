#!/usr/bin/env node
/**
 * scripts/deepReviewSemanticAudit.cjs
 *
 * Exhaustive Semantic Customer Review Auditor for High-Ticket Septic Outreach.
 * Analyzes thousands of actual Google Maps customer reviews across all candidate leads.
 * 
 * Flags & Purges:
 * - Porta-Potty / Restroom / Dumpster rental-only companies
 * - Indoor domestic plumbers (kitchen sinks, garbage disposals, faucets, water heaters)
 * - Solo handymen / "guy in a truck" who cannot do heavy installations (The Clinton Pattern)
 * - Commercial grease trap / restaurant hood only
 * - Equipment rental yards
 * - Low-ticket routine pump-only operators who refuse major excavating/repairs
 * 
 * Qualifies:
 * - Tier 1 GOLD: Direct proof of septic system installations, drainfield / leach field replacements, heavy excavation machinery, multiple crew members, county permits.
 * - Tier 2 SILVER: Legitimate septic service & repair contractors with commercial pumper fleets, riser/baffle replacements, and verified septic teams.
 */

const fs = require('fs');
const path = require('path');

const leadsPath = path.resolve(__dirname, '../src/data/septicLeads.json');
const sentLogPath = path.resolve(__dirname, '../outreach_sent_log.json');
const callLeadsPath = path.resolve(__dirname, '../src/data/callLeads.json');

const leads = JSON.parse(fs.readFileSync(leadsPath, 'utf8'));
const sentLog = fs.existsSync(sentLogPath) ? JSON.parse(fs.readFileSync(sentLogPath, 'utf8')) : { history: {} };
const callLeads = fs.existsSync(callLeadsPath) ? JSON.parse(fs.readFileSync(callLeadsPath, 'utf8')) : [];

const callSlugs = new Set(callLeads.map(c => c.slug));
const callPhones = new Set(callLeads.map(c => c.phone ? c.phone.replace(/\D/g, '').slice(-10) : ''));

console.log(`🔍 Starting Deep Semantic Review Audit across ${leads.length} leads...`);

// High-Ticket candidates pool (315 high ticket in DB)
const candidates = leads.filter(l => l.ticketTier === 'HIGH_TICKET');

const auditResults = {
  goldTier: [],
  silverTier: [],
  disqualified: []
};

// Patterns
const REGEX_PORTA_POTTY = /porta[-\s]?potty|porta[-\s]?pottie|porta[-\s]?john|portable toilet|restroom rental|luxury restroom|wedding restroom|festival toilet|dumpster/i;
const REGEX_INDOOR_PLUMBING = /kitchen sink|garbage disposal|faucet|water heater|water softener|shower drain|bathtub|wax ring|toilet running|snaked the drain|unclogged toilet|bathroom remodel/i;
const REGEX_GREASE_TRAP = /grease trap|restaurant kitchen|grease interceptor|hood cleaning/i;
const REGEX_RENTAL_YARD = /rent a log splitter|genie tz|tool rental|rented equipment|equipment rental yard/i;

const REGEX_INSTALLATION_HIGH = /install|installed|installation|drain[-\s]?field|leach[-\s]?field|new tank|tank replacement|excavat|heavy equipment|backhoe|digger|soil test|perc test|permit|health department|lift station|distribution box|d-box/i;
const REGEX_CREW_TEAM = /the crew|crew of|team arrived|the guys|workers|operators|technicians were|staff arrived|foreman/i;
const REGEX_SOLO_MAN = /he came alone|just him|one man|clinton|by himself in a pickup|told us he couldn't fix it|referred us to another company/i;

for (const lead of candidates) {
  const name = lead.name || '';
  const cat = lead.category || '';
  const reviews = lead.reviewsSample || [];
  const reviewsCombined = reviews.map(r => r.text).join(' ');
  const dates = reviews.map(r => r.date || '');

  // Contact history
  const cleanPh = lead.phone ? lead.phone.replace(/\D/g, '').slice(-10) : '';
  const wasCalledYesterday = callSlugs.has(lead.slug) || callPhones.has(cleanPh);
  const receivedOldSms = Object.entries(sentLog.history || {}).some(([p, it]) => p.replace(/\D/g, '').slice(-10) === cleanPh || it.slug === lead.slug);

  let contactStatus = 'ZERO_CONTACT_FRESH';
  if (wasCalledYesterday) contactStatus = 'YESTERDAY_CALLED';
  else if (receivedOldSms) contactStatus = 'RECEIVED_OLD_SMS_ONLY';

  // 1. Check Date Freshness
  const isDeadStale = dates.length > 0 && dates.every(d => /\d+\s+years?\s+ago/i.test(d) && !d.includes('a year ago'));
  if (isDeadStale) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'STALE_REVIEWS_OVER_2_YEARS_OLD',
      evidence: `All reviews are old: ${dates.join(', ')}`
    });
    continue;
  }

  // 2. Check Porta Potty / Restroom Rental Bias
  const portaMatches = (name + ' ' + reviewsCombined).match(REGEX_PORTA_POTTY);
  const installMatches = (name + ' ' + reviewsCombined).match(REGEX_INSTALLATION_HIGH);

  if (portaMatches && !installMatches && !name.toLowerCase().includes('excavat')) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'PORTA_POTTY_OR_DUMPSTER_RENTAL_ONLY',
      evidence: `Reviews focus on portable toilets: "${reviewsCombined.slice(0, 150)}..."`
    });
    continue;
  }

  // 3. Strict Exclusion of Plumbers & Restaurant / Commercial Services
  const isRestaurantOrFood = /restaurant|kitchen cleaning|grease interceptor/i.test(name) || /restaurant/i.test(cat);
  if (isRestaurantOrFood && !name.toLowerCase().includes('septic')) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'RESTAURANT_COMMERCIAL_GREASE_CLEANER',
      evidence: `Company specializes in restaurant facility services, not residential septic excavation.`
    });
    continue;
  }

  const isPlumbingOnly = (/plumb/i.test(name) || /plumb/i.test(cat)) && !name.toLowerCase().includes('septic') && !name.toLowerCase().includes('excavat');
  if (isPlumbingOnly) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'PLUMBING_CONTRACTOR_NOT_SEPTIC',
      evidence: `Core trade is plumbing/pipe repair, not septic tanks and drainfield excavation.`
    });
    continue;
  }

  // Trenchless pipe lining companies (Nu Flow etc.) are pipe repair, not septic excavation
  if (/nu[-\s]?flow|pipe lining|epoxy lining/i.test(name)) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'TRENCHLESS_PIPE_LINER_NOT_SEPTIC',
      evidence: `Specializes in indoor/sewer epoxy pipe relining rather than septic tank excavation.`
    });
    continue;
  }

  // Check Indoor Domestic Plumbing Bias in reviews
  const indoorPlumbingMatches = reviewsCombined.match(REGEX_INDOOR_PLUMBING);
  if (indoorPlumbingMatches && !name.toLowerCase().includes('septic') && !name.toLowerCase().includes('excavat')) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'DOMESTIC_INDOOR_PLUMBER_SINK_TOILET',
      evidence: `Reviews cite indoor domestic repairs: "${indoorPlumbingMatches[0]}"`
    });
    continue;
  }

  // 4. Equipment Rental Yard Bias
  if (reviewsCombined.match(REGEX_RENTAL_YARD) || name.toLowerCase().includes('rental')) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'EQUIPMENT_TOOL_RENTAL_YARD',
      evidence: `Customer rented equipment/splitters, not residential septic excavation.`
    });
    continue;
  }

  // 5. Solo Handyman / Refusal to Repair (Clinton pattern)
  if (reviewsCombined.match(REGEX_SOLO_MAN)) {
    auditResults.disqualified.push({
      lead,
      contactStatus,
      reason: 'SOLO_HANDYMAN_CANNOT_DO_INSTALLS',
      evidence: `Customer stated operator works alone or referred out septic work.`
    });
    continue;
  }

  // 6. Qualification Scoring
  let score = 0;
  const matchHighlights = [];

  // Review text mentions of high-ticket work
  if (/installed a septic|new septic system|new leach field|new drain field|replaced our septic|replaced the drain field/i.test(reviewsCombined)) {
    score += 5;
    matchHighlights.push('Direct Septic / Drainfield Installation Proof');
  } else if (/install|drain[-\s]?field|leach[-\s]?field|replacement/i.test(reviewsCombined)) {
    score += 3;
    matchHighlights.push('Drainfield / Installation Keywords in Reviews');
  }

  if (/excavat|backhoe|mini-excavator|trench|heavy equipment/i.test(reviewsCombined)) {
    score += 3;
    matchHighlights.push('Excavator / Heavy Machinery Mentioned');
  }

  if (REGEX_CREW_TEAM.test(reviewsCombined)) {
    score += 3;
    matchHighlights.push('Crew / Team Multi-Tech Mentioned');
  }

  if (/permit|health dept|county inspection|engineered/i.test(reviewsCombined)) {
    score += 2;
    matchHighlights.push('County Permitted & Inspected Work');
  }

  // Name & Category credibility
  if (/excavat|septic system/i.test(name)) score += 2;
  if (cat.includes('Septic system service') || cat.includes('Excavating contractor')) score += 2;

  // Equipment photos
  const validEqPhotos = (lead.equipmentPhotos || []).filter(e => e.image).length;
  if (validEqPhotos >= 2) score += 2;

  const vettedItem = {
    slug: lead.slug,
    name: lead.name,
    city: lead.city,
    state: lead.state,
    phone: lead.phone,
    owner: lead.ownerName || '',
    category: lead.category,
    rating: lead.rating,
    reviewCount: lead.reviewCount,
    latestReviewDate: dates[0] || 'Recently',
    contactStatus,
    score,
    highlights: matchHighlights,
    sampleReview: reviews[0] ? reviews[0].text.slice(0, 140) + '...' : ''
  };

  if (score >= 6) {
    auditResults.goldTier.push(vettedItem);
  } else {
    auditResults.silverTier.push(vettedItem);
  }
}

console.log('\n============================================================');
console.log('📊 SEMANTIC AUDIT SUMMARY RESULTS:');
console.log('============================================================');
console.log(`❌ Disqualified (Irrelevant / Plumbers / Porta-Potty / Stale): ${auditResults.disqualified.length}`);
console.log(`🥇 GOLD TIER (Verified Heavy Installation, Drainfield & Excavation Crews): ${auditResults.goldTier.length}`);
console.log(`🥈 SILVER TIER (Solid Septic & Tank Contractors): ${auditResults.silverTier.length}`);

// Breakdown of Gold Tier by outreach readiness
const goldZeroContact = auditResults.goldTier.filter(x => x.contactStatus === 'ZERO_CONTACT_FRESH');
const goldVoiceFresh = auditResults.goldTier.filter(x => x.contactStatus === 'RECEIVED_OLD_SMS_ONLY');
const goldYesterday = auditResults.goldTier.filter(x => x.contactStatus === 'YESTERDAY_CALLED');

console.log('\n--- 🥇 GOLD TIER READY FOR CALLS ---');
console.log(`• 100% Zero-Contact (Ни звонков, ни SMS): ${goldZeroContact.length}`);
console.log(`• Голосовой Zero-Contact (было только старое робот-SMS 2 недели назад): ${goldVoiceFresh.length}`);
console.log(`• Вчерашний пул обзвона: ${goldYesterday.length}`);

// Write full audit report
const reportPath = path.resolve(__dirname, 'semantic_review_audit_report.json');
fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
console.log(`\n💾 Saved detailed audit log to ${reportPath}`);

// Display Disqualified sample with reasons
console.log('\n🚨 Sample of Disqualified Leads & Specific Reasons:');
auditResults.disqualified.slice(0, 10).forEach((d, i) => {
  console.log(`${i+1}. [${d.reason}] ${d.lead.name} (${d.lead.city}, ${d.lead.state}) - Evidence: ${d.evidence}`);
});

// Display Gold Tier sample
console.log('\n🌟 Sample of Top Gold Tier Leads (High-Ticket Heavy Crews):');
goldZeroContact.concat(goldVoiceFresh).slice(0, 8).forEach((g, i) => {
  console.log(`${i+1}. ${g.name} (${g.city}, ${g.state}) | Ph: ${g.phone} | Score: ${g.score} | [${g.highlights.join(', ')}]`);
});
