/**
 * Contractor Team Size & Operations Classifier
 * 
 * Analyzes Google Reviews, photo volume, company entity names, and linguistic cues
 * to distinguish between:
 * 1. CREW_ENTERPRISE (Fleet, hired technicians, office/dispatcher - HIGH priority for lead gen)
 * 2. SMALL_CREW (2-4 techs, growing business - MEDIUM priority)
 * 3. SOLO_OPERATOR (Overburdened "guy in a truck" like Clinton who rejects more work - LOW priority)
 */

const fs = require('fs');
const path = require('path');

// 1. Lexical Patterns
const CREW_SIGNALS = [
  { pattern: /\b(crew|crews)\b/gi, weight: 3, label: 'crew mention' },
  { pattern: /\b(technician|technicians|techs?)\b/gi, weight: 2.5, label: 'technician mention' },
  { pattern: /\b(office|dispatcher|dispatch|receptionist|secretary|office staff)\b/gi, weight: 3, label: 'office/dispatcher' },
  { pattern: /\b(they arrived|they came|they sent|they were)\b/gi, weight: 1.5, label: 'plural "they"' },
  { pattern: /\b(the guys|two guys|both guys|team)\b/gi, weight: 2, label: 'team/guys' },
  { pattern: /\b(fleet|trucks|tankers)\b/gi, weight: 2.5, label: 'fleet mention' },
  { pattern: /\b(drivers?|operators?)\b/gi, weight: 1.5, label: 'operator/driver' },
  { pattern: /\b(company|business|staff)\b/gi, weight: 1, label: 'formal company' },
];

const SOLO_SIGNALS = [
  { pattern: /\b(he came|he arrived|he answered|he fixed|he was|he did)\b/gi, weight: 2, label: 'singular "he"' },
  { pattern: /\b(himself|solo|one man|one guy|just him)\b/gi, weight: 3.5, label: 'explicit solo' },
  { pattern: /\b(the owner came|the owner himself)\b/gi, weight: 2.5, label: 'owner-laborer' },
  { pattern: /\b(gentleman|fellow)\b/gi, weight: 1.5, label: 'singular gentleman' },
];

// Common American male names frequently appearing in reviews
const COMMON_NAMES = [
  'clinton', 'mike', 'dave', 'david', 'john', 'bob', 'bobby', 'chris', 'steve', 'mark',
  'dan', 'daniel', 'jim', 'jimmy', 'tom', 'tommy', 'bill', 'billy', 'joe', 'jake',
  'matt', 'tim', 'timmy', 'rob', 'robert', 'paul', 'brian', 'kevin', 'jason', 'tony',
  'scott', 'gary', 'rick', 'ricky', 'larry', 'jeff', 'ken', 'greg', 'ron', 'todd'
];

function analyzeLead(lead) {
  const reviews = lead.reviewsSample || [];
  const fullReviewText = reviews.map(r => r.text).join(' ');
  
  let crewScore = 0;
  let soloScore = 0;
  const detectedSignals = [];

  // 1. Crew signals analysis
  CREW_SIGNALS.forEach(sig => {
    const matches = fullReviewText.match(sig.pattern);
    if (matches && matches.length > 0) {
      const pts = matches.length * sig.weight;
      crewScore += pts;
      detectedSignals.push(`[+CREW] ${sig.label} (x${matches.length})`);
    }
  });

  // 2. Solo signals analysis
  SOLO_SIGNALS.forEach(sig => {
    const matches = fullReviewText.match(sig.pattern);
    if (matches && matches.length > 0) {
      const pts = matches.length * sig.weight;
      soloScore += pts;
      detectedSignals.push(`[+SOLO] ${sig.label} (x${matches.length})`);
    }
  });

  // 3. Name Variety Analysis (Single recurring name vs Multiple different names)
  const namesFound = {};
  COMMON_NAMES.forEach(name => {
    const regex = new RegExp(`\\b${name}\\b`, 'gi');
    const matches = fullReviewText.match(regex);
    if (matches && matches.length > 0) {
      namesFound[name] = matches.length;
    }
  });

  const distinctNames = Object.keys(namesFound);
  if (distinctNames.length === 1 && namesFound[distinctNames[0]] >= 2) {
    // Only ONE person's name repeats across reviews (like Clinton) -> Heavy Solo indicator
    soloScore += 4;
    detectedSignals.push(`[+SOLO] single recurring name: "${distinctNames[0]}" (x${namesFound[distinctNames[0]]})`);
  } else if (distinctNames.length >= 2) {
    // 2+ different worker names mentioned -> Strong Crew indicator
    crewScore += 3 * distinctNames.length;
    detectedSignals.push(`[+CREW] multiple techs mentioned: ${distinctNames.join(', ')}`);
  }

  // 4. Metadata heuristics (Reviews count & Photos count)
  if (lead.photosCount >= 10) {
    crewScore += 2.5;
    detectedSignals.push(`[+CREW] photos >= 10 (${lead.photosCount})`);
  } else if (lead.photosCount === 0) {
    soloScore += 2;
    detectedSignals.push(`[+SOLO] zero photos`);
  }

  if (lead.reviewCount >= 100) {
    crewScore += 3;
    detectedSignals.push(`[+CREW] high review volume (100+)`);
  } else if (lead.reviewCount <= 35) {
    soloScore += 2;
    detectedSignals.push(`[+SOLO] low review count (<35)`);
  }

  // 5. Legal / Entity Name Heuristics
  const nameLower = (lead.name || '').toLowerCase();
  if (nameLower.includes('enterprises') || nameLower.includes('environmental') || nameLower.includes('services') || nameLower.includes('systems') || nameLower.includes('solutions')) {
    crewScore += 1.5;
    detectedSignals.push(`[+CREW] enterprise naming keyword`);
  }

  // 6. Final Classification
  const netScore = crewScore - soloScore;
  let classification = 'UNCERTAIN';
  let confidence = 'MEDIUM';

  if (crewScore >= 7 && netScore >= 3) {
    classification = 'CREW_ENTERPRISE';
    confidence = netScore >= 6 ? 'HIGH' : 'MEDIUM';
  } else if (soloScore >= 5 && netScore <= -2) {
    classification = 'SOLO_OPERATOR';
    confidence = netScore <= -5 ? 'HIGH' : 'MEDIUM';
  } else if (netScore > 0) {
    classification = 'SMALL_CREW';
  } else {
    classification = 'LIKELY_SOLO';
  }

  return {
    slug: lead.slug,
    name: lead.name,
    city: lead.city,
    state: lead.state,
    phone: lead.phone,
    reviewCount: lead.reviewCount,
    photosCount: lead.photosCount,
    crewScore: Math.round(crewScore * 10) / 10,
    soloScore: Math.round(soloScore * 10) / 10,
    netScore: Math.round(netScore * 10) / 10,
    classification,
    confidence,
    signals: detectedSignals,
  };
}

// Run analysis on targets
function main() {
  const callLeadsPath = path.join(__dirname, '../src/data/callLeads.json');
  const septicLeadsPath = path.join(__dirname, '../src/data/septicLeads.json');

  const callLeads = JSON.parse(fs.readFileSync(callLeadsPath, 'utf8'));
  const septicLeads = JSON.parse(fs.readFileSync(septicLeadsPath, 'utf8'));

  console.log('================================================================');
  console.log('🔍 CONTRACTOR TEAM SIZE & OPERATIONS CLASSIFIER');
  console.log('================================================================\n');

  // Test on Clinton (Turdbusters) first
  const tb = septicLeads.find(l => l.slug === 'turdbusters');
  if (tb) {
    const tbRes = analyzeLead(tb);
    console.log(`📌 BENCHMARK TEST: ${tbRes.name} (${tbRes.city}, ${tbRes.state})`);
    console.log(`   Classification: ${tbRes.classification} (Confidence: ${tbRes.confidence})`);
    console.log(`   Crew Score: ${tbRes.crewScore} | Solo Score: ${tbRes.soloScore} (Net: ${tbRes.netScore})`);
    console.log(`   Signals: ${tbRes.signals.join(' | ')}`);
    console.log('----------------------------------------------------------------\n');
  }

  // Analyze active call leads registry
  const fullCallLeads = callLeads.map(cl => {
    const full = septicLeads.find(sl => sl.slug === cl.slug);
    return full ? analyzeLead(full) : null;
  }).filter(Boolean);

  const crews = fullCallLeads.filter(l => l.classification === 'CREW_ENTERPRISE' || l.classification === 'SMALL_CREW');
  const solos = fullCallLeads.filter(l => l.classification === 'SOLO_OPERATOR' || l.classification === 'LIKELY_SOLO');
  const uncertain = fullCallLeads.filter(l => l.classification === 'UNCERTAIN');

  console.log(`📊 ACTIVE CALL CAMPAIGN ANALYSIS (${fullCallLeads.length} Leads):`);
  console.log(`   🚀 Multi-Person Crews / Enterprises (IDEAL): ${crews.length} (${Math.round((crews.length / fullCallLeads.length) * 100)}%)`);
  console.log(`   ⚠️ Likely Solo Operators (Risk of Clinton effect): ${solos.length} (${Math.round((solos.length / fullCallLeads.length) * 100)}%)`);
  console.log(`   ❓ Uncertain / Neutral: ${uncertain.length}`);
  console.log('\n----------------------------------------------------------------');
  console.log('🏆 TOP 10 CONFIRMED CREW / FLEET ENTERPRISES (Best targets):');
  crews
    .sort((a, b) => b.netScore - a.netScore)
    .slice(0, 10)
    .forEach((c, idx) => {
      console.log(` ${idx + 1}. [Net: +${c.netScore}] ${c.name} (${c.city}, ${c.state}) • ${c.reviewCount} revs, ${c.photosCount} photos`);
      console.log(`    Signals: ${c.signals.slice(0, 3).join(' | ')}`);
    });

  console.log('\n----------------------------------------------------------------');
  console.log('⚠️ IDENTIFIED HIGH-RISK SOLO OPERATORS:');
  solos
    .sort((a, b) => a.netScore - b.netScore)
    .slice(0, 5)
    .forEach((s, idx) => {
      console.log(` ${idx + 1}. [Net: ${s.netScore}] ${s.name} (${s.city}, ${s.state}) • ${s.reviewCount} revs`);
      console.log(`    Signals: ${s.signals.slice(0, 3).join(' | ')}`);
    });

  console.log('\n================================================================\n');
}

main();
