const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_PDF = path.join(process.cwd(), 'Cold_Call_Training_Playbook_EN.pdf');
const ARTIFACT_PDF = '/Users/workpc/.gemini/antigravity/brain/c532ba69-f1f6-4351-8442-ec293734333e/Cold_Call_Training_Playbook_EN.pdf';

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Zonus Studio • B2B Sales Training Playbook & Outbound Calling Standard (EN)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  @page {
    size: A4;
    margin: 8mm 9mm 8mm 9mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
    background: #ffffff;
    font-size: 7.4pt;
    line-height: 1.32;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header {
    background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
    color: #ffffff;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #1e293b;
  }

  .header-left h1 {
    font-size: 13pt;
    font-weight: 900;
    letter-spacing: -0.3px;
    color: #ffffff;
    margin-bottom: 2px;
  }

  .header-left p {
    font-size: 7.5pt;
    color: #94a3b8;
  }

  .badge {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34d399;
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 7pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-title {
    font-size: 8.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #0f172a;
    margin: 8px 0 5px 0;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .section-title::before {
    content: '';
    display: inline-block;
    width: 3.5px;
    height: 11px;
    background: #10b981;
    border-radius: 2px;
  }

  .card-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 7px;
  }

  .card-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 7px;
  }

  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 6px 8px;
  }

  .card.highlight {
    background: #f0fdf4;
    border: 1.5px solid #86efac;
  }

  .card.warning {
    background: #fef2f2;
    border: 1.5px solid #fca5a5;
  }

  .card.dark {
    background: #090d16;
    color: #f8fafc;
    border: 1px solid #1e293b;
  }

  .card-title {
    font-size: 7.6pt;
    font-weight: 800;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .script-box {
    background: #1e293b;
    border-left: 3px solid #10b981;
    padding: 6px 9px;
    margin: 4px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.2pt;
    line-height: 1.38;
    color: #f1f5f9;
    border-radius: 0 5px 5px 0;
  }

  .script-box-alt {
    background: #f1f5f9;
    border-left: 3px solid #3b82f6;
    padding: 5px 8px;
    margin: 3px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.1pt;
    line-height: 1.35;
    color: #0f172a;
    border-radius: 0 5px 5px 0;
  }

  .tag {
    display: inline-block;
    padding: 1px 4px;
    border-radius: 3px;
    font-weight: 700;
    font-size: 6.3pt;
    text-transform: uppercase;
  }

  .tag-green { background: #dcfce7; color: #166534; }
  .tag-red { background: #fee2e2; color: #991b1b; }
  .tag-blue { background: #e0f2fe; color: #075985; }
  .tag-amber { background: #fef3c7; color: #92400e; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 7px;
    font-size: 6.9pt;
  }

  th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 800;
    text-align: left;
    padding: 4px 6px;
    border: 1px solid #cbd5e1;
    text-transform: uppercase;
    font-size: 6.3pt;
  }

  td {
    padding: 3.5px 6px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }

  .page-break {
    page-break-before: always;
  }

  .footer-note {
    margin-top: 6px;
    text-align: center;
    font-size: 6.4pt;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 3px;
  }
</style>
</head>
<body>

  <!-- PAGE 1: CONTEXT, PSYCHOLOGY & VALUE PROPOSITION -->
  <div class="header">
    <div class="header-left">
      <h1>Outbound B2B Sales Training Playbook</h1>
      <p>US Septic Market Dynamics, Contractor Psychology, $2,500 Offer Value & Red Lines</p>
    </div>
    <div class="badge">Zonus Sales Playbook · Edition 3.0</div>
  </div>

  <div class="section-title">1. Market Context & Contractor Mindset</div>
  <div class="card-grid-3">
    <div class="card">
      <div class="card-title"><span class="tag tag-blue">The Prospect</span> Septic & Excavation Owners</div>
      <p>Men aged 35–60 running commercial pumping, septic repair, and excavation crews. 80% of their workday is spent in their heavy-duty truck (Ford F-250 / Chevy Silverado) or actively operating machinery on jobsites.</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="tag tag-amber">Their Frustration</span> Spammer Inundation</div>
      <p>They receive 5–10 robocalls and offshore spam daily (<em>«Hello sir, I saw your Google Business Profile...»</em>). Any generic telemarketer pitch triggers an immediate hang-up.</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="tag tag-green">What Wins</span> Direct Peer Communication</div>
      <p>They respect brevity (15–20 sec), calm masculine peer-to-peer delivery, hard financial ROI, and the fact that tangible, tailored work has already been completed for them.</p>
    </div>
  </div>

  <div class="section-title">2. Core Advantages of Our Offer for the Client (Caller Context)</div>
  <div class="card-grid-2">
    <div class="card highlight">
      <div class="card-title" style="color: #166534;">🔥 1. Already Built Specifically For Them (Not a Concept)</div>
      <p>We are not pitching abstract web design. We already ported their real 5★ Google reviews, direct dispatch phone line, and verified service catalog: <strong>zonus.co/[slug]</strong>. They review a live product.</p>
    </div>

    <div class="card highlight">
      <div class="card-title" style="color: #166534;">🎯 2. Psychological «Verification» Angle (The IKEA Effect)</div>
      <p>We do not push: «Buy our website!». We ask: <em>«Take 15 seconds to double-check if we got your services right, and text over your truck photos so we can feature them»</em>. They inspect out of curiosity and ownership.</p>
    </div>

    <div class="card highlight">
      <div class="card-title" style="color: #166534;">💰 3. Rock-Solid Niche ROI ($2,500 Turnkey Package)</div>
      <p>In the US septic industry, a single drain field restoration or precast tank replacement bills at <strong>$6,000 to $15,000+</strong>. This asset completely pays for itself on the <strong>very first big call</strong> it captures.</p>
    </div>

    <div class="card highlight">
      <div class="card-title" style="color: #166534;">⚡ 4. 24-Hour Deployment & Zero Monthly Retainers</div>
      <p>Traditional web agencies charge $500–$1,000/month indefinitely. With Zonus, it is a flat one-time $2,500, zero recurring fees, and we launch live under their official domain within <strong>24 hours</strong>.</p>
    </div>
  </div>

  <div class="section-title">3. Strict Red Lines & Operational Mandates</div>
  <div class="card-grid-3">
    <div class="card warning">
      <div class="card-title" style="color: #991b1b;">🚫 Zero Fear-Based Phrasing</div>
      <p>Strictly forbidden to say <em>«safe link»</em>, <em>«not spam»</em>, <em>«not a virus»</em>, <em>«afraid to click»</em>. Always frame alternatives purely around convenience: <em>«Happy to text screenshots if that's easier!»</em></p>
    </div>
    <div class="card warning">
      <div class="card-title" style="color: #991b1b;">🚫 Banned «Awesome!» & Hype</div>
      <p>Never use high-pitched, fake call-center cheerfulness (<em>Awesome!, Amazing!, Super!</em>). Speak grounded and calm: <strong>«Got it»</strong>, <strong>«Sounds good»</strong>, <strong>«Fair enough»</strong>, <strong>«Perfect»</strong>.</p>
    </div>
    <div class="card warning">
      <div class="card-title" style="color: #991b1b;">🚫 No Fluff About Google Maps</div>
      <p>Never say <em>«We were looking at your Google Maps and noticed you have no website button»</em>. It flags you instantly as an offshore SEO scammer. State directly what we built.</p>
    </div>
  </div>

  <div class="footer-note">Page 1 of 3 · Zonus Studio Outbound Sales Playbook · Confidential Internal Training</div>

  <div class="page-break"></div>

  <!-- PAGE 2: DIALOGUE STRUCTURE, CALL 1, SMS & CALL 2 -->
  <div class="header">
    <div class="header-left">
      <h1>Dialogue Framework & Calling Cadence (Call 1 ➔ SMS ➔ Call 2)</h1>
      <p>15-Second Opening Hook, Morning Follow-Up Lock-in, 2-Step SMS Preview Card & Closing</p>
    </div>
    <div class="badge">Live Execution Scripts</div>
  </div>

  <div class="section-title">4. Call #1: Initial Contact (15–20 Seconds Maximum)</div>
  <div class="card dark">
    <div style="font-weight: 800; color: #34d399; font-size: 7.6pt; margin-bottom: 2px;">
      THE 15-SECOND OPENING PITCH (VERBATIM):
    </div>
    <div class="script-box">
“Hey [Owner Name], this is [Caller Name]. Quick call — we actually put together a custom website specifically for [Company Name].

It already has your real customer reviews, your phone number, and your exact services.

Wanted to text you the link so you can double-check if we got all your details right, and see if you have any photos of your trucks or crew you'd want added in. Is this cell good to text?”
    </div>
  </div>

  <div class="section-title">5. Post-Agreement Protocol («Yeah, send it») — Exit in 5 Seconds</div>
  <div class="card" style="background: #f0fdf4; border: 1.5px solid #86efac; margin-bottom: 7px;">
    <p><strong>DO NOT EXTEND THE CALL OR PITCH FEATURES!</strong> The contractor is behind the wheel or on a noisy site. Immediately confirm their cell number and lock in the callback for <strong>tomorrow morning at 9:30 AM (US time)</strong>. This avoids night shifts (in Europe, this is a convenient 5:30 PM).</p>
    <div class="script-box-alt">
<strong>Caller:</strong> «Got it, sending it over right now. Take a quick look tonight whenever you're off the road, and I'll give you a short buzz tomorrow morning around 9:30 to see what you think. Sound good?»<br>
<strong>Owner:</strong> «Sounds good.»<br>
<strong>Caller:</strong> «Appreciate it, [Owner Name]. Talk to you tomorrow morning.» <em>(Hang up immediately).</em>
    </div>
  </div>

  <div class="section-title">6. SMS Delivery Standard: Separate Link Message for Rich Preview Card</div>
  <div class="card-grid-2">
    <div class="card">
      <div class="card-title"><span class="tag tag-amber">Why This Matters</span> iMessage & Android Mechanics</div>
      <p>When a link is buried inside a long paragraph, mobile OS messaging apps often display a plain text string. When sent as its own message, iOS & Android crawlers fetch OpenGraph data and render a <strong>large, clickable rich graphic card</strong> showing their truck and 5★ rating!</p>
    </div>

    <div class="card">
      <div class="card-title"><span class="tag tag-green">2-Step Dispatch</span> SMS Protocol</div>
      <p><strong>Message 1:</strong> Short introduction text.<br>
      <strong>Message 2:</strong> Standalone bare URL <code>https://zonus.co/[slug]</code>.<br>
      <strong>Message 3:</strong> Action prompt (check services, add photos, morning call reminder).</p>
    </div>
  </div>

  <div class="card dark" style="margin-top: 2px;">
    <div style="color: #38bdf8; font-weight: 800; font-size: 7.2pt; margin-bottom: 2px;">SMS DISPATCH TEMPLATES:</div>
    <div class="script-box" style="font-size: 6.9pt; line-height: 1.32;">
<span style="color: #94a3b8;">// Message 1 (Intro):</span>
“Hey [Owner Name], [Caller Name] here! Here’s the custom page we put together for [Company Name]:”

<span style="color: #94a3b8;">// Message 2 (Bare Link — triggers the rich graphical card):</span>
https://zonus.co/[slug]

<span style="color: #94a3b8;">// Message 3 (Action & Timing):</span>
“Take a quick scroll tonight to make sure we got your services and contact info right. If you have any truck or crew photos you want added, we can plug them right in! I’ll give you a quick buzz tomorrow morning around 9:30 AM.”
    </div>
  </div>

  <div class="section-title">7. Call #2: Next-Morning Closing Call (9:30 AM US Time)</div>
  <div class="card" style="background: #f8fafc; border: 1.5px solid #cbd5e1;">
    <div class="script-box-alt">
<strong>Content Check Opening:</strong> «Morning [Owner Name], [Caller Name] checking back as promised. Did you get a chance to open that link last night? Did we get all your services and info right, or is there anything we should tweak?»
<br><br>
<strong>$2,500 / 24-Hour Turnkey Pitch:</strong> «We do the full turnkey setup for a flat $2,500 — we connect your official dot-com domain, set up Google indexing, fast mobile hosting, and zero monthly fees. In your business, literally one single drain field replacement or tank job brings in $6,000 to $10,000+, so it pays for itself on the first serious call. If you text me those photos today, <strong>we can have your official site fully live within 24 hours.</strong> Want us to lock this in for you?»
<br><br>
<strong>50/50 Split Downsell (When Budget is Tight):</strong> «Understood. We can split it: $1,250 today to go live with your custom domain and photos within 24 hours, and the remaining $1,250 in 30 days after you start taking calls through it. Fair enough?»
    </div>
  </div>

  <div class="footer-note">Page 2 of 3 · Zonus Studio Outbound Sales Playbook · Confidential Internal Training</div>

  <div class="page-break"></div>

  <!-- PAGE 3: COMPLETE OBJECTIONS MATRIX & CRM WORKFLOW -->
  <div class="header">
    <div class="header-left">
      <h1>Complete Objections Matrix & CRM Operational Guide</h1>
      <p>10 Word-for-Word Responses to Contractor Pushback & Zadarma Dialer Workflow</p>
    </div>
    <div class="badge">Objection Handling & Tech Guide</div>
  </div>

  <div class="section-title">8. Call #1 Objections Handling Matrix (The Hook)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Objection</th>
        <th style="width: 50%;">Verbatim Script (English)</th>
        <th style="width: 25%;">Strategic Intent</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>«How much does this cost?»</strong><br>(Price inquiry)</td>
        <td><em>«It’s completely free to check out the preview — zero obligation. If you like it and want to launch it under your official domain, it’s a flat one-time setup with zero monthly fees. Just wanted to see if you like what we put together first. Is this cell good to text?»</em></td>
        <td>Eliminate price resistance. Preview is free. Anchor zero monthly retainers.</td>
      </tr>
      <tr>
        <td><strong>«I'm busy / on a jobsite»</strong><br>(Time constraint)</td>
        <td><em>«100%, I won't hold you. I'll just text the link right now. Take a 15-second scroll tonight whenever you're off the road, and I'll give you a short buzz tomorrow morning around 9:30. Sound good?»</em></td>
        <td>Respect trade time. Secure permission for text & morning callback.</td>
      </tr>
      <tr>
        <td><strong>«We already have a site»</strong><br>(Existing provider)</td>
        <td><em>«Got it. Most contractors we work with already had an old site from 10 years ago or a slow Facebook page that takes forever on phones. Ours is built specifically for 1-tap emergency mobile calls. Take 15 seconds tonight just to compare. Fair enough to text it over?»</em></td>
        <td>Never criticize old site. Challenge mobile speed and emergency dispatch.</td>
      </tr>
      <tr>
        <td><strong>«Word-of-mouth only»</strong><br>(Referral based)</td>
        <td><em>«100% respect on 20 years — word-of-mouth is the best business there is. The only reason we put this together: younger homeowners moving into [City] don't know the local names yet. When their tank backs up, they search Google on their phone. Mind if I text it over to take a look?»</em></td>
        <td>Acknowledge reputation. Highlight new incoming residents searching on mobile.</td>
      </tr>
      <tr>
        <td><strong>«Fully booked / Swamped»</strong><br>(Capacity limit)</td>
        <td><em>«That’s a great problem to have! This isn't about getting 50 small pump-outs — it’s about filtering for the high-dollar $8,000 to $12,000 drain field replacements. Take a look tonight, and you have it in your back pocket. Good to text to this number?»</em></td>
        <td>Position the site as a filter for $10,000+ high-ticket replacement jobs.</td>
      </tr>
      <tr>
        <td><strong>«Just send an email»</strong><br>(Standard brush-off)</td>
        <td><em>«Happy to send an email as well! But since it’s built specifically for smartphones, it looks best right on your cell screen. I’ll text the link so you have it in one tap, and drop an email too. What's your best email address?»</em></td>
        <td>Accept email request, but reinforce why SMS phone screen preview is superior.</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">9. Call #2 Objections Handling Matrix (Closing for $2,500)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Objection</th>
        <th style="width: 50%;">Verbatim Script (English)</th>
        <th style="width: 25%;">Strategic Intent</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>«$2,500 is too expensive»</strong><br>(Budget pushback)</td>
        <td><em>«Understood. But in the septic business, literally one single tank replacement or drain field job brings in $6,000 to $10,000+. So this pays for itself on your very first big call. Plus, zero monthly fees. If $2,500 is tight, we can split it: $1,250 now to launch within 24 hours, and $1,250 in 30 days. Fair enough?»</em></td>
        <td>Anchor against 1 single septic job ($8k). Offer 50/50 payment split downsell.</td>
      </tr>
      <tr>
        <td><strong>«Didn't look at it yet»</strong><br>(Unopened link)</td>
        <td><em>«Totally understand, long day yesterday! Tell you what — pull it up right now on your phone while I'm on the line, takes literally 15 seconds to scroll... Let me know when it opens.» (Or reschedule for lunch at 12:30 PM).</em></td>
        <td>Guide them live on speakerphone or lock in a lunch break follow-up.</td>
      </tr>
      <tr>
        <td><strong>«Talk to wife / partner»</strong><br>(Decision maker delay)</td>
        <td><em>«100%, definitely want everyone on the same page. Just forward that text with the link to them: zonus.co/[slug]. What do you think is the main question they'll have? ... Got it. I’ll follow up tomorrow at 10 AM after you look it over together. Sound good?»</em></td>
        <td>Respect partnership. Uncover unvoiced objections. Schedule definite callback.</td>
      </tr>
      <tr>
        <td><strong>«Any monthly fees?»</strong><br>(Hidden charge fear)</td>
        <td><em>«Zero monthly fees. Traditional agencies charge $500 every single month. With us, it’s a flat one-time $2,500, we launch it within 24 hours, and it’s 100% yours forever. No recurring bills.»</em></td>
        <td>Eliminate agency subscription trauma. Full asset ownership.</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">10. CRM & Zadarma Dialer Workflow</div>
  <div class="card-grid-3">
    <div class="card">
      <div class="card-title">📞 Calling via Zadarma</div>
      <p>Click <strong>«Call Now»</strong> (launches Zadarma softphone via <code>tel:</code> / <code>sip:</code>) or use <strong>«Copy Phone»</strong> for instant pasting into the <code>my.zadarma.com</code> webphone tab.</p>
    </div>
    <div class="card">
      <div class="card-title">💾 Outcome Logging</div>
      <p>After each call, immediately tap the result: 🟢 <strong>Agreed</strong> (SMS sent), 🟡 <strong>Callback</strong> (wife/field), ⚪ <strong>No Answer</strong> (voicemail), 🔴 <strong>Declined</strong>. Data persists locally and on the server instantly.</p>
    </div>
    <div class="card">
      <div class="card-title">📝 Notes & Telegram Sync</div>
      <p>Add brief notes: <em>«Wife answered, text sent, callback 10 AM»</em>. Every status click automatically updates the team Telegram dashboard in real time with caller attribution.</p>
    </div>
  </div>

  <div class="footer-note">Page 3 of 3 · Zonus Studio Outbound Sales Playbook · Confidential Internal Training</div>

</body>
</html>`;

async function generatePdf() {
  console.log('Generating Cold Call Training Playbook EN via Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    scale: 0.94,
    margin: {
      top: '6mm',
      bottom: '6mm',
      left: '8mm',
      right: '8mm'
    }
  });

  fs.copyFileSync(OUTPUT_PDF, ARTIFACT_PDF);

  await browser.close();
  console.log(`✅ English PDF successfully generated at: ${OUTPUT_PDF}`);
  console.log(`✅ Artifact saved at: ${ARTIFACT_PDF}`);
}

generatePdf().catch(err => {
  console.error('Error generating English PDF:', err);
  process.exit(1);
});
