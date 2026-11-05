const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cold Calling Master Guide & Script - Septic & Excavation Contractors</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

  @page {
    size: A4;
    margin: 12mm 14mm 12mm 14mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #0f172a;
    background: #ffffff;
    font-size: 8.8pt;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Page Break Control */
  .page-1 { page-break-after: always; }
  .page-2 { page-break-after: always; }
  .page-3 { page-break-after: avoid; }

  /* Header Card */
  .header-card {
    background: linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%);
    color: #ffffff;
    padding: 16px 20px;
    border-radius: 10px;
    margin-bottom: 12px;
  }

  .badge-tag {
    display: inline-block;
    background: rgba(16, 185, 129, 0.25);
    border: 1px solid #10b981;
    color: #34d399;
    font-size: 7pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 3px 8px;
    border-radius: 20px;
    margin-bottom: 6px;
  }

  h1 {
    font-size: 15.5pt;
    font-weight: 800;
    letter-spacing: -0.4px;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 8.8pt;
    color: #93c5fd;
    font-weight: 500;
  }

  .meta-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    font-size: 7.5pt;
    color: #cbd5e1;
  }

  .meta-bar span strong { color: #ffffff; }

  /* Headings */
  h2 {
    font-size: 11pt;
    font-weight: 800;
    color: #064e3b;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 3px;
    margin-top: 10px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  h3 {
    font-size: 9.5pt;
    font-weight: 700;
    color: #1e293b;
    margin-top: 8px;
    margin-bottom: 4px;
  }

  p { margin-bottom: 6px; }

  /* Callout boxes */
  .box {
    border-radius: 6px;
    padding: 9px 12px;
    margin: 6px 0 9px 0;
  }

  .box-golden {
    background: #fefce8;
    border-left: 3.5px solid #eab308;
    color: #713f12;
    font-size: 8.5pt;
  }

  .box-golden strong { color: #854d0e; }

  .box-script {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 3.5px solid #0284c7;
    color: #0f172a;
    font-size: 8.6pt;
    line-height: 1.42;
    margin-bottom: 7px;
  }

  .box-script-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #0369a1;
    margin-bottom: 4px;
  }

  .box-pro-tip {
    background: #f0fdf4;
    border-left: 3.5px solid #10b981;
    color: #065f46;
    font-size: 8.5pt;
  }

  /* Two Column Layout */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 6px 0 8px 0;
  }

  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 9px 11px;
  }

  .card-title {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
  }

  .card-emerald .card-title { color: #047857; }
  .card-sky .card-title { color: #0369a1; }

  .price-highlight {
    font-size: 13pt;
    font-weight: 800;
    color: #047857;
    margin: 2px 0 4px 0;
  }

  ul, ol {
    margin-left: 15px;
    margin-bottom: 6px;
  }

  li { margin-bottom: 3px; }

  .dialogue-you { font-weight: 800; color: #0369a1; }
  .dialogue-client { font-weight: 800; color: #b45309; }

  .dialogue-text {
    font-style: italic;
    color: #1e293b;
    display: block;
    margin: 3px 0 4px 0;
    background: #ffffff;
    padding: 6px 9px;
    border-radius: 5px;
    border: 1px solid #e2e8f0;
  }

  .table-custom {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px 0;
    font-size: 8pt;
    line-height: 1.35;
  }

  .table-custom th {
    background: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 6px 8px;
    font-weight: 700;
  }

  .table-custom td {
    padding: 6px 8px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
  }

  .table-custom tr:nth-child(even) { background: #f8fafc; }

  .tag {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 7pt;
    font-weight: 700;
  }
  .tag-green { background: #dcfce7; color: #15803d; }
  .tag-yellow { background: #fef9c3; color: #854d0e; }
  .tag-red { background: #ffe4e6; color: #be123c; }

  .footer-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
    margin-top: 10px;
    font-size: 7.5pt;
    color: #94a3b8;
  }
</style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="page-1">
    <!-- Header Card -->
    <div class="header-card">
      <div class="badge-tag">Confidential Sales Playbook • US Septic & Excavation Niche</div>
      <h1>Cold Calling Master Guide & Script</h1>
      <div class="subtitle">Complete Psychological Blueprint, 20-Second Phone Pitch & High-Ticket Objection Vault</div>
      <div class="meta-bar">
        <span><strong>Target:</strong> US Septic & Excavation Contractors</span>
        <span><strong>Offer:</strong> $2,500 Flat or $249/mo</span>
        <span><strong>Live CRM:</strong> septic.up.railway.app/call</span>
        <span><strong>Caller Role:</strong> Outbound Rep</span>
      </div>
    </div>

    <!-- SECTION 1 -->
    <h2>1. Executive Summary & The #1 Golden Rule</h2>
    
    <div class="box box-golden">
      <strong>⚡ THE #1 GOLDEN RULE:</strong><br>
      <strong>NEVER attempt to close a $2,500 sale on the phone!</strong> A contractor working in a trench or operating an excavator will not pull out a credit card while on the line. 
      Your <em>sole objective</em> is to sell <strong>30 SECONDS OF CURIOSITY</strong> — earn his permission to text his custom showcase link, and have him open it on his smartphone. The showcase sells itself because he sees his own trucks, equipment, and 5-star Google reviews.
    </div>

    <p>We build turnkey, high-performance mobile showcases for verified local contractors with 4.7★–5.0★ Google ratings whose websites are either non-existent or broken on mobile devices.</p>

    <!-- SECTION 2 -->
    <h2>2. Contractor Psychology & Mindset</h2>
    
    <div class="grid-2">
      <div class="card card-emerald">
        <div class="card-title">Who They Are</div>
        <ul>
          <li><strong>Self-Made Tradesmen:</strong> 40–55 year old men who built their business with physical grit. They take deep pride in their fleet and crew reputation.</li>
          <li><strong>Always In The Field:</strong> Answering while operating excavators, trenching pipe, or driving service trucks.</li>
          <li><strong>Allergic to Marketing Buzzwords:</strong> Instant hang-up on "SEO synergy", "digital transformation", or scripted robots.</li>
        </ul>
      </div>

      <div class="card card-sky">
        <div class="card-title">Their Hidden Pain & Fears</div>
        <ul>
          <li><strong>Agency Retainer Trauma:</strong> Burned by paying $1,500/mo agency retainers that delivered zero real jobs.</li>
          <li><strong>Fear of Time Sinks:</strong> "Building a site" sounds like weeks of questionnaires and endless revisions.</li>
          <li><strong>Secret Guilt:</strong> They privately know their web presence is missing or embarrassing, but lack time to fix it.</li>
        </ul>
      </div>
    </div>

    <div class="box box-pro-tip">
      <strong>👑 Why Being a Female Caller is Your Secret Advantage:</strong><br>
      Blue-collar contractors naturally drop their aggressive defense mechanisms when speaking with a warm, polite, confident woman. While a pushy male salesperson gets hung up on in 3 seconds, you will receive 20 seconds of genuine, respectful attention. Speak with casual peer-to-peer confidence, warmth, and brevity.
    </div>

    <!-- SECTION 3 -->
    <h2>3. The Done-For-You Offer & Dual-Pricing Model</h2>
    
    <p>We do not sell "web design services." We sell a <strong>completed, live digital asset</strong> ready for immediate takeover:</p>

    <div class="grid-2">
      <div class="card card-emerald">
        <div class="card-title">Option 1: Outright Ownership (Best Deal)</div>
        <div class="price-highlight">$2,500 Flat One-Time</div>
        <p style="font-size:8pt; color:#475569;">100% turnkey buyout via card/PayPal. Zero ongoing agency fees or monthly retainers ever. Full transfer of domain, code, and printable high-res truck decal QR codes.</p>
      </div>

      <div class="card card-sky">
        <div class="card-title">Option 2: 12-Month Installment Plan</div>
        <div class="price-highlight">$249 / Month (12 Mos)</div>
        <p style="font-size:8pt; color:#475569;">Zero-interest operational cash flow plan. $249/mo is less than the price of a single standard tank pumping job ($350–$450). It pays for itself with literally one service call.</p>
      </div>
    </div>

    <div class="footer-bar">
      <span>Septic & Excavation Outreach Playbook</span>
      <span>Page 1 of 3</span>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page-2">
    <h2>4. The Master Phone Script (Step-by-Step)</h2>

    <h3>Step 1: The 10-Second Icebreaker (Pattern Interrupt)</h3>
    <p>Glance at your CRM screen for the specific customer review hook before dialing. This proves you are a real person who researched their business.</p>

    <div class="box box-script">
      <div class="box-script-header">
        <span>Opening Hook • Target: 10–12 Seconds</span>
        <span>Step 1</span>
      </div>
      <span class="dialogue-you">You:</span>
      <span class="dialogue-text">
        “Hi [Owner Name / there]! It’s [Your Name]. I know you’re probably out in the field so I’ll be super brief —<br>
        I was just checking out your work in [City] and saw that review from <strong>[Customer Name from CRM]</strong> about how you guys [specific deed: came out in an emergency / left the yard spotless / replaced the drain line cleanly] — really awesome work!”
      </span>
      <span style="font-size:7.5pt; color:#64748b;">(Pause 1 second. Contractor will react: "Oh thanks / Yeah / Who's this?")</span>
    </div>

    <h3>Step 2: The Hook & Why You Are Calling</h3>
    <p>Frame the problem through revenue loss: high-ticket jobs slip away to competitors when customers search on phones.</p>

    <div class="box box-script">
      <div class="box-script-header">
        <span>Value Delivery & Micro-Commitment • Target: 12 Seconds</span>
        <span>Step 2</span>
      </div>
      <span class="dialogue-you">You:</span>
      <span class="dialogue-text">
        “The reason I'm calling: your reputation is top-notch, but I noticed you guys don’t have an active website right now.<br>
        And when local folks look you up on their phones, high-ticket jobs can slip away to competitors. So we actually went ahead and <strong>already built a custom mobile showcase for [Company Name]</strong> — with your equipment, reviews, and a 10-second quote calculator.<br>
        Do you have 30 seconds on your phone to take a quick peek?”
      </span>
    </div>

    <h3>Step 3: Handling The Immediate Response</h3>

    <div class="box box-script">
      <div class="box-script-header"><span>Branch A: Positive / Curious</span><span>Outcome A</span></div>
      <span class="dialogue-client">Contractor:</span> <span class="dialogue-text">“Sure / Yeah, shoot it over / What is it?”</span>
      <span class="dialogue-you">You:</span>
      <span class="dialogue-text">
        “Awesome! Is this your direct cell — can I text it right here?”<br>
        <em>(Tap the blue <strong>Send Link SMS</strong> button in your CRM)</em><br>
        “Just texted it over from this number. Did that ping through on your screen?”<br>
        <strong>• If received:</strong> “Great! It showcases your fleet, emergency dispatch, and direct click-to-call. Take a quick scroll — does everything look accurate?”<br>
        <strong>• If carrier delay:</strong> “Looks like the carrier takes a few seconds. If you're on your phone, you can also just tap Safari and type <strong>zonus.co/[slug]</strong> — it’s super short!”
      </span>
    </div>

    <div class="box box-script">
      <div class="box-script-header"><span>Branch B: Busy / In The Field</span><span>Outcome B</span></div>
      <span class="dialogue-client">Contractor:</span> <span class="dialogue-text">“I’m driving right now / I’m on a job site with an excavator.”</span>
      <span class="dialogue-you">You:</span>
      <span class="dialogue-text">
        “Totally get it, I know you guys are busy out there! I just texted the link over to this number. When you shut off the truck tonight, take 20 seconds on your phone to check it out. If you like it, just text me back. Have a great day out there!”
      </span>
    </div>

    <div class="box box-script">
      <div class="box-script-header"><span>Branch C: Price Question</span><span>Outcome C</span></div>
      <span class="dialogue-client">Contractor:</span> <span class="dialogue-text">“How much does this cost?”</span>
      <span class="dialogue-you">You:</span>
      <span class="dialogue-text">
        “It’s $2,500 flat one-time for complete ownership with zero monthly fees. Or if you prefer monthly, it's just $249 a month for 12 months.<br>
        Take a quick look on your phone first to see if you even like it! Can I text it over?”
      </span>
    </div>

    <div class="footer-bar">
      <span>Septic & Excavation Outreach Playbook</span>
      <span>Page 2 of 3</span>
    </div>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page-3">
    <h2>5. High-Ticket Objection Handling Vault</h2>

    <table class="table-custom">
      <thead>
        <tr>
          <th style="width: 28%;">Contractor Objection</th>
          <th style="width: 28%;">Underlying Psychology</th>
          <th style="width: 44%;">Exact Word-for-Word Response</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>“We have plenty of work / We run 100% on word-of-mouth.”</strong></td>
          <td>Fears getting overwhelmed by cheap tire-kickers who haggle over $100.</td>
          <td><em>“And that’s exactly why we reached out — you have a great reputation! But this isn't for cheap tire-kickers. It's built specifically to capture those <strong>high-ticket $10,000–$15,000 replacement and drain field jobs</strong> when people look you up on their phones after a referral. Take 20 seconds to see how it looks — if it's not for you, I’ll take it down tomorrow, no hard feelings at all!”</em></td>
        </tr>
        <tr>
          <td><strong>“Are you an SEO / Marketing agency?”</strong></td>
          <td>Traumatized by paying $1,500/mo retainer fees with zero tangible return.</td>
          <td><em>“Not at all! We hate those $1,500 monthly agency retainers. We don't charge subscriptions. We built a turnkey digital asset for your company: the mobile showcase, domain, and truck decal QR codes. You own it 100%.”</em></td>
        </tr>
        <tr>
          <td><strong>“I already have a website.”</strong></td>
          <td>Defensive about money already spent on an old desktop site.</td>
          <td><em>“Gotcha! Most older websites take 8 seconds to load on mobile and don't highlight real equipment. We built an ultra-fast showcase designed specifically for homeowners calling from their phones in an emergency. Take 15 seconds to compare it to yours!”</em></td>
        </tr>
        <tr>
          <td><strong>“Send me an email, I’ll look later.”</strong></td>
          <td>Polite brush-off. He knows he won't check email for 2 weeks.</td>
          <td><em>“I won’t spam your inbox — I know in the trades you don't sit in front of email all day. I just texted a short link directly to this cell. It takes literally 20 seconds to scroll. Take a peek between jobs, sounds good?”</em></td>
        </tr>
        <tr>
          <td><strong>“Not interested / No thanks.”</strong></td>
          <td>Default defense mechanism or firm disinterest.</td>
          <td><em>“Totally understand! We're cleaning up our staging server tomorrow so I'll take down the demo files. Wish you all the best!”</em><br><small style="color:#64748b;">(Never argue, never beg. Remain cheerful and unbothered).</small></td>
        </tr>
      </tbody>
    </table>

    <!-- SECTION 6 -->
    <h2>6. Using the Call Dispatcher CRM Portal</h2>

    <p>All leads, phone numbers, customer review hooks, and live links are centralized in your mobile dispatch tool:</p>

    <div class="box box-pro-tip">
      <strong>📍 Live Web Portal URL:</strong> <code style="font-family:'JetBrains Mono',monospace; background:#e2e8f0; padding:2px 6px; border-radius:4px;">https://septic.up.railway.app/call</code><br>
      Open this URL on your phone or laptop. Supports English/Russian toggle, 1-tap dialing, 1-tap SMS, and real-time logging.
    </div>

    <div class="grid-2">
      <div class="card card-emerald">
        <div class="card-title">Pre-Call Routine (3 Seconds)</div>
        <ol style="margin-left:14px; font-size:7.8pt;">
          <li>Note the <strong>Owner Name</strong> and <strong>City</strong>.</li>
          <li>Glance at the <strong>🔥 5-Sec Icebreaker Hook</strong> (Customer Name + Quote).</li>
          <li>Tap the green <strong>📞 Call Now</strong> button to place the call.</li>
        </ol>
      </div>

      <div class="card card-sky">
        <div class="card-title">Logging the Outcome (1 Tap)</div>
        <ul style="margin-left:14px; font-size:7.8pt; list-style:none;">
          <li><span class="tag tag-green">🟢 Agreed</span> Link sent, looking at showcase.</li>
          <li><span class="tag tag-yellow">🟡 Callback</span> Busy in field / asked to call later.</li>
          <li><span class="tag" style="background:#f1f5f9; color:#475569;">⚪ No Answer</span> Ringing / Voicemail.</li>
          <li><span class="tag tag-red">🔴 Declined</span> Not interested / Firm no.</li>
        </ul>
        <p style="font-size:7.5pt; color:#64748b; margin-top:4px;">Add an optional quick note and tap <strong>💾 Save & Next Lead</strong>.</p>
      </div>
    </div>

    <div class="box box-golden" style="margin-top:8px; text-align:center; padding:7px 10px;">
      <strong>Confidence &bull; Brevity &bull; Respect for Tradesmen</strong><br>
      Keep calls under 60 seconds. Sell curiosity, not the website. Let the live showcase do the heavy lifting!
    </div>

    <div class="footer-bar">
      <span>Septic & Excavation Outreach Playbook</span>
      <span>Page 3 of 3</span>
    </div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log('Generating compact 3-page high-quality PDF with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });

  const pdfPath = path.resolve(__dirname, '../Cold_Calling_Master_Guide_Script.pdf');
  const publicPdfDir = path.resolve(__dirname, '../public/docs');
  if (!fs.existsSync(publicPdfDir)) {
    fs.mkdirSync(publicPdfDir, { recursive: true });
  }
  const publicPdfPath = path.resolve(publicPdfDir, 'Cold_Calling_Master_Guide_Script.pdf');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '12mm',
      right: '12mm'
    }
  });

  fs.copyFileSync(pdfPath, publicPdfPath);
  await browser.close();

  console.log(`✅ PDF successfully generated at: ${pdfPath}`);
  console.log(`✅ Public copy generated at: ${publicPdfPath}`);
}

generatePdf().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
