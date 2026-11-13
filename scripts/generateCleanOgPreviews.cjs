const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HIGH_TICKET_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #030712;
    color: #f8fafc;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 36px 48px;
  }

  /* Ambient background glows */
  .glow-1 {
    position: absolute;
    top: -120px;
    left: -100px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(3, 7, 18, 0) 70%);
    pointer-events: none;
  }
  .glow-2 {
    position: absolute;
    bottom: -150px;
    right: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(3, 7, 18, 0) 70%);
    pointer-events: none;
  }

  /* Header bar */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    z-index: 10;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  }
  .brand-text h1 {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.3px;
    color: #ffffff;
  }
  .brand-text p {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .nav-badges {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pulse-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #34d399;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px #10b981;
  }
  .stars-badge {
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.35);
    color: #fbbf24;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Main Hero Layout */
  .hero-container {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 40px;
    align-items: center;
    position: relative;
    z-index: 10;
    margin: auto 0;
  }

  /* Left Side: Offer & Badges */
  .tagline-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .pill {
    background: #0f172a;
    border: 1px solid #1e293b;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .pill-accent {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.4);
    color: #34d399;
  }

  .main-heading {
    font-size: 38px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 14px;
    color: #ffffff;
  }
  .main-heading span {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subhead {
    font-size: 14px;
    line-height: 1.45;
    color: #94a3b8;
    margin-bottom: 20px;
    max-width: 580px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }
  .feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 700;
    color: #e2e8f0;
  }
  .check-icon {
    width: 18px;
    height: 18px;
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #34d399;
    font-size: 11px;
    font-weight: 900;
    shrink: 0;
  }

  /* Right Side: Showcase UI Card */
  .ui-card {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid #1e293b;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    position: relative;
  }
  .ui-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #1e293b;
  }
  .ui-card-title {
    font-size: 13px;
    font-weight: 800;
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .badge-fast {
    background: #030712;
    border: 1px solid #334155;
    color: #f1f5f9;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .tabs-row {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
  }
  .tab-item {
    flex: 1;
    background: #030712;
    border: 1px solid #1e293b;
    padding: 8px 6px;
    border-radius: 10px;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
  }
  .tab-item.active {
    background: rgba(16, 185, 129, 0.15);
    border-color: #10b981;
    color: #34d399;
  }

  .price-box {
    background: #030712;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 14px;
    text-align: center;
    margin-bottom: 16px;
  }
  .price-label {
    font-size: 10px;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .price-value {
    font-size: 26px;
    font-weight: 900;
    color: #ffffff;
    font-family: 'JetBrains Mono', monospace;
  }
  .price-note {
    font-size: 10px;
    color: #10b981;
    font-weight: 700;
    margin-top: 3px;
  }

  .btn-dispatch {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #022c22;
    font-weight: 900;
    font-size: 14px;
    padding: 13px;
    border-radius: 12px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    letter-spacing: -0.2px;
  }

  /* Footer bar */
  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    z-index: 10;
  }
  .guarantees {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 11.5px;
    color: #94a3b8;
    font-weight: 600;
  }
  .guarantees span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .domain-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 800;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.3);
    padding: 4px 10px;
    border-radius: 6px;
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <!-- Header -->
  <div class="top-bar">
    <div class="brand">
      <div class="brand-logo">🚜</div>
      <div class="brand-text">
        <h1>VERIFIED SEPTIC & EXCAVATION</h1>
        <p>Commercial Fleet & Mobile Showcase</p>
      </div>
    </div>
    <div class="nav-badges">
      <div class="pulse-badge">
        <span class="pulse-dot"></span>
        24/7 Priority Emergency Dispatch
      </div>
      <div class="stars-badge">
        <span>⭐ 4.9+</span>
        <span style="color: #94a3b8; font-weight: 600;">(Google Verified)</span>
      </div>
    </div>
  </div>

  <!-- Hero Body -->
  <div class="hero-container">
    <div>
      <div class="tagline-row">
        <span class="pill pill-accent">Turnkey Mobile Platform</span>
        <span class="pill">Owner-Operated Fleet</span>
        <span class="pill">Direct Contractor Pricing</span>
      </div>

      <h2 class="main-heading">
        Emergency Septic Pumping & <span>Drain Field Restoration</span>
      </h2>

      <p class="subhead">
        Instant homeowner mobile dispatch, live customer ratings, and a 10-second price estimate calculator designed specifically for established US septic contractors.
      </p>

      <div class="features-grid">
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>1-Tap Direct Phone Dispatch</span>
        </div>
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>Interactive 10-Sec Price Estimator</span>
        </div>
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>Zero Turf Damage Guarantee</span>
        </div>
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>Laser-Level Trenching & Tank Setting</span>
        </div>
      </div>
    </div>

    <!-- UI Feature Card Mockup -->
    <div class="ui-card">
      <div class="ui-card-header">
        <span class="ui-card-title">⚡ Instant 10-Sec Estimator</span>
        <span class="badge-fast">Fast Dispatch</span>
      </div>

      <div class="tabs-row">
        <div class="tab-item active">Pumping</div>
        <div class="tab-item">Drain Field</div>
        <div class="tab-item">Camera Insp</div>
      </div>

      <div class="price-box">
        <div class="price-label">Upfront Flat-Rate Range</div>
        <div class="price-value">$450 – $750</div>
        <div class="price-note">✓ 100% Zero Hidden Fees • Same-Day Service</div>
      </div>

      <div class="btn-dispatch">
        <span>📞</span>
        <span>Tap To Call Emergency Dispatch</span>
      </div>
    </div>
  </div>

  <!-- Footer Guarantees -->
  <div class="bottom-bar">
    <div class="guarantees">
      <span>🛡️ Licensed & Insured Specialists</span>
      <span>⏱️ 45–60 Min Response Arrival</span>
      <span>📜 100% Transparent Local Rates</span>
    </div>
    <div class="domain-tag">zonus.co</div>
  </div>
</body>
</html>`;

const PUMPING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    background: #030712;
    color: #f8fafc;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 36px 48px;
  }

  .glow-1 {
    position: absolute;
    top: -120px;
    left: -100px;
    width: 550px;
    height: 550px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(3, 7, 18, 0) 70%);
    pointer-events: none;
  }
  .glow-2 {
    position: absolute;
    bottom: -150px;
    right: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(3, 7, 18, 0) 70%);
    pointer-events: none;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    z-index: 10;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
  }
  .brand-text h1 {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.3px;
    color: #ffffff;
  }
  .brand-text p {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .nav-badges {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .pulse-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    background: rgba(14, 165, 233, 0.12);
    border: 1px solid rgba(14, 165, 233, 0.35);
    color: #38bdf8;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
  }
  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 8px #38bdf8;
  }
  .stars-badge {
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.35);
    color: #fbbf24;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .hero-container {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 40px;
    align-items: center;
    position: relative;
    z-index: 10;
    margin: auto 0;
  }

  .tagline-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .pill {
    background: #0f172a;
    border: 1px solid #1e293b;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .pill-accent {
    background: rgba(14, 165, 233, 0.15);
    border-color: rgba(14, 165, 233, 0.4);
    color: #38bdf8;
  }

  .main-heading {
    font-size: 38px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 14px;
    color: #ffffff;
  }
  .main-heading span {
    background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subhead {
    font-size: 14px;
    line-height: 1.45;
    color: #94a3b8;
    margin-bottom: 20px;
    max-width: 580px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }
  .feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 700;
    color: #e2e8f0;
  }
  .check-icon {
    width: 18px;
    height: 18px;
    background: rgba(14, 165, 233, 0.2);
    border: 1px solid rgba(14, 165, 233, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #38bdf8;
    font-size: 11px;
    font-weight: 900;
    shrink: 0;
  }

  .ui-card {
    background: rgba(15, 23, 42, 0.85);
    border: 1px solid #1e293b;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    position: relative;
  }
  .ui-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #1e293b;
  }
  .ui-card-title {
    font-size: 13px;
    font-weight: 800;
    color: #38bdf8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .badge-fast {
    background: #030712;
    border: 1px solid #334155;
    color: #f1f5f9;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .tabs-row {
    display: flex;
    gap: 6px;
    margin-bottom: 16px;
  }
  .tab-item {
    flex: 1;
    background: #030712;
    border: 1px solid #1e293b;
    padding: 8px 6px;
    border-radius: 10px;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
  }
  .tab-item.active {
    background: rgba(14, 165, 233, 0.15);
    border-color: #0284c7;
    color: #38bdf8;
  }

  .price-box {
    background: #030712;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 14px;
    text-align: center;
    margin-bottom: 16px;
  }
  .price-label {
    font-size: 10px;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 700;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .price-value {
    font-size: 26px;
    font-weight: 900;
    color: #ffffff;
    font-family: 'JetBrains Mono', monospace;
  }
  .price-note {
    font-size: 10px;
    color: #38bdf8;
    font-weight: 700;
    margin-top: 3px;
  }

  .btn-dispatch {
    width: 100%;
    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
    color: #ffffff;
    font-weight: 900;
    font-size: 14px;
    padding: 13px;
    border-radius: 12px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
    letter-spacing: -0.2px;
  }

  .bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    position: relative;
    z-index: 10;
  }
  .guarantees {
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 11.5px;
    color: #94a3b8;
    font-weight: 600;
  }
  .guarantees span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .domain-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 800;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.3);
    padding: 4px 10px;
    border-radius: 6px;
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <!-- Header -->
  <div class="top-bar">
    <div class="brand">
      <div class="brand-logo">💧</div>
      <div class="brand-text">
        <h1>COMMERCIAL SEPTIC PUMPING</h1>
        <p>Rapid Vacuum Fleet & Cleanout Service</p>
      </div>
    </div>
    <div class="nav-badges">
      <div class="pulse-badge">
        <span class="pulse-dot"></span>
        24/7 Priority Emergency Dispatch
      </div>
      <div class="stars-badge">
        <span>⭐ 4.9+</span>
        <span style="color: #94a3b8; font-weight: 600;">(Google Verified)</span>
      </div>
    </div>
  </div>

  <!-- Hero Body -->
  <div class="hero-container">
    <div>
      <div class="tagline-row">
        <span class="pill pill-accent">High-Capacity Vacuum Fleet</span>
        <span class="pill">Upfront Fixed Rates</span>
        <span class="pill">Direct Dispatch</span>
      </div>

      <h2 class="main-heading">
        Emergency Septic Pumping & <span>Line Hydro-Jetting</span>
      </h2>

      <p class="subhead">
        Instant homeowner direct calling, upfront flat pricing, and color sewer camera diagnostic tools. Built to highlight your crew's verified 5-star reputation.
      </p>

      <div class="features-grid">
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>1-Tap Direct Phone Dispatch</span>
        </div>
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>Instant 10-Sec Price Estimator</span>
        </div>
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>EPA-Certified Waste Disposal</span>
        </div>
        <div class="feature-item">
          <div class="check-icon">✓</div>
          <span>High-Pressure Hydro-Jetting & Scrub</span>
        </div>
      </div>
    </div>

    <!-- UI Feature Card Mockup -->
    <div class="ui-card">
      <div class="ui-card-header">
        <span class="ui-card-title">⚡ Instant 10-Sec Estimator</span>
        <span class="badge-fast">Fast Dispatch</span>
      </div>

      <div class="tabs-row">
        <div class="tab-item active">Tank Pump-Out</div>
        <div class="tab-item">Hydro-Jet</div>
        <div class="tab-item">Camera Insp</div>
      </div>

      <div class="price-box">
        <div class="price-label">Upfront Flat-Rate Range</div>
        <div class="price-value">$350 – $650</div>
        <div class="price-note">✓ 100% Zero Hidden Fees • Same-Day Service</div>
      </div>

      <div class="btn-dispatch">
        <span>📞</span>
        <span>Tap To Call Emergency Dispatch</span>
      </div>
    </div>
  </div>

  <!-- Footer Guarantees -->
  <div class="bottom-bar">
    <div class="guarantees">
      <span>🛡️ Licensed & Insured Technicians</span>
      <span>⏱️ 45–60 Min Response Arrival</span>
      <span>📜 Certified EPA Manifest Disposal</span>
    </div>
    <div class="domain-tag">zonus.co</div>
  </div>
</body>
</html>`;

async function generateCleanOgPreviews() {
  console.log('Generating clean 1200x630 UI Showcase OG Previews via Playwright...');
  const browser = await chromium.launch({ headless: true });

  // 1. High-Ticket Preview
  const page1 = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page1.setContent(HIGH_TICKET_HTML, { waitUntil: 'networkidle' });
  const out1 = path.join(process.cwd(), 'public', 'og-preview.jpg');
  await page1.screenshot({ path: out1, quality: 92, type: 'jpeg' });
  console.log('✅ Generated public/og-preview.jpg');

  // 2. Pumping Preview
  const page2 = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page2.setContent(PUMPING_HTML, { waitUntil: 'networkidle' });
  const out2 = path.join(process.cwd(), 'public', 'og-preview-pumping.jpg');
  await page2.screenshot({ path: out2, quality: 92, type: 'jpeg' });
  console.log('✅ Generated public/og-preview-pumping.jpg');

  await browser.close();
  console.log('🎉 Clean UI OG Previews generated successfully!');
}

generateCleanOgPreviews().catch(err => {
  console.error('Error generating OG previews:', err);
  process.exit(1);
});
