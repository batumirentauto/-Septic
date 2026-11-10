const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_PDF = path.join(process.cwd(), 'Turdbusters_SMS_Closing_Playbook.pdf');
const ARTIFACT_PDF = '/Users/workpc/.gemini/antigravity/brain/c532ba69-f1f6-4351-8442-ec293734333e/Turdbusters_SMS_Closing_Playbook.pdf';

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Turdbusters (Clinton) — Full SMS Outreach & Closing Playbook</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

  @page {
    size: A4;
    margin: 5mm 6mm 5mm 6mm;
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
    font-size: 7.5pt;
    line-height: 1.25;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header {
    background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
    color: #ffffff;
    padding: 6px 10px;
    border-radius: 10px;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #1e293b;
  }

  .header-left h1 {
    font-size: 13.5pt;
    font-weight: 900;
    letter-spacing: -0.3px;
    color: #ffffff;
    margin-bottom: 2px;
  }

  .header-left p {
    font-size: 8pt;
    color: #94a3b8;
    font-weight: 500;
  }

  .badge-container {
    display: flex;
    gap: 6px;
  }

  .badge {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34d399;
    padding: 3px 8px;
    border-radius: 5px;
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dossier-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 10px;
    margin-bottom: 5px;
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.3fr 1.5fr;
    gap: 8px;
  }

  .dossier-item {
    font-size: 7.8pt;
  }

  .dossier-label {
    font-size: 6.5pt;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1px;
  }

  .dossier-value {
    font-size: 8pt;
    font-weight: 800;
    color: #0f172a;
  }

  .dossier-link {
    color: #0284c7;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    text-decoration: underline;
    font-weight: 800;
  }

  .chat-box {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 6px 10px;
    margin-bottom: 5px;
  }

  .inbound-bubble {
    background: #f1f5f9;
    border-left: 3px solid #64748b;
    padding: 6px 10px;
    border-radius: 5px;
    font-size: 7.8pt;
    color: #1e293b;
    margin-bottom: 5px;
    font-style: italic;
    font-weight: 600;
  }

  .step-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 5px;
  }

  .step-header {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding: 5px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .step-num {
    font-weight: 800;
    font-size: 7.8pt;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .step-pill {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 6.5pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  .pill-now {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #86efac;
  }

  .pill-wait {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #7dd3fc;
  }

  .pill-money {
    background: #fef3c7;
    color: #b45309;
    border: 1px solid #fcd34d;
  }

  .step-body {
    padding: 6px 8px;
    background: #ffffff;
  }

  .script-copy {
    background: #090d16;
    color: #f8fafc;
    border-radius: 6px;
    padding: 6px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.8pt;
    line-height: 1.4;
    position: relative;
    border: 1px solid #1e293b;
    margin-bottom: 5px;
    white-space: pre-line;
  }

  .script-highlight {
    color: #38bdf8;
    font-weight: 700;
  }

  .script-link {
    color: #34d399;
    font-weight: 800;
    text-decoration: underline;
  }

  .logic-note {
    font-size: 7.2pt;
    color: #64748b;
    line-height: 1.3;
    background: #f8fafc;
    padding: 5px 8px;
    border-radius: 5px;
    border: 1px dashed #cbd5e1;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .psychology-box {
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
    border: 1px solid #a7f3d0;
    border-radius: 8px;
    padding: 6px 10px;
    margin-top: 6px;
  }

  .psychology-title {
    font-size: 8pt;
    font-weight: 800;
    color: #065f46;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .psychology-text {
    font-size: 7.3pt;
    color: #047857;
    line-height: 1.3;
  }

  .footer-note {
    margin-top: 6px;
    text-align: center;
    font-size: 6.8pt;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <h1>Turdbusters (Clinton) — SMS Outreach & Closing Playbook</h1>
      <p>Скрипт переписки, ссылка через zonus.co и правила закрытия на $495 (Roanoke, VA)</p>
    </div>
    <div class="badge-container">
      <div class="badge">Pure Septic Pumping</div>
      <div class="badge" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">1-Job Rule ($495)</div>
    </div>
  </div>

  <!-- DOSSIER CARD -->
  <div class="dossier-card">
    <div class="dossier-item">
      <div class="dossier-label">Владелец / Компания</div>
      <div class="dossier-value">Clinton (Turdbusters)</div>
    </div>
    <div class="dossier-item">
      <div class="dossier-label">Локация / Телефон</div>
      <div class="dossier-value">Roanoke, VA · (540) 776-3200</div>
    </div>
    <div class="dossier-item">
      <div class="dossier-label">Опыт / Репутация</div>
      <div class="dossier-value">С 2003 года (23 года) · 4.8★ (67 отз.)</div>
    </div>
    <div class="dossier-item">
      <div class="dossier-label">Прямая ссылка для клиента</div>
      <a href="https://zonus.co/turdbusters" class="dossier-link">https://zonus.co/turdbusters</a>
    </div>
  </div>

  <!-- INBOUND CONTEXT -->
  <div class="chat-box">
    <div class="dossier-label" style="color: #475569; margin-bottom: 3px;">Полученный входящий ответ от Клинтона:</div>
    <div class="inbound-bubble">
      “Please explain this site thing to me. I am un aware of this thing called site in google maps. I've been in business since 2003. Never once heard of site.”
    </div>
    <div class="logic-note">
      <strong>Контекст и психология:</strong> Клинтон работает с 2003 года по сарафану и звонкам из карт. У него есть внешний одностраничник turdbustersva.com, но он <u>не привязан к Google Maps</u> (кнопка Website в карточке отсутствует). Он искренне не понял, что за «site in google maps». Наш лендинг упакован строго под откачку септиков, чистку труб и аварийные выезды 24/7.
    </div>
  </div>

  <!-- STEP 1 -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-num"><span>ШАГ 1.</span> Ответ на вопрос Клинтона + ссылка через zonus.co</div>
      <span class="step-pill pill-now">Отправить сейчас</span>
    </div>
    <div class="step-body">
      <div class="script-copy">Fair question Clinton, and huge respect on 23 years in Roanoke! 

What I meant was having a <span class="script-highlight">"Website" button linked directly on your Google Maps listing</span> — so when local folks look you up on their phones, they can tap it to see your services and call you direct.

We put together a clean 1-page mobile preview for Turdbusters focused on septic pumping and drain clearing, featuring your top Google reviews:

<span class="script-link">https://zonus.co/turdbusters</span>

Take 10 seconds to scroll on your phone. If you have a couple of good photos of your truck or work, we can easily add those onto the page as well!

Does the info look accurate to your work?</div>
      <div class="logic-note">
        <strong>Почему это работает:</strong> Уважение к 23 годам стажа. Простое объяснение кнопки Website в Google Maps. Прямая ссылка через короткий брендовый домен <strong>zonus.co</strong>. Предложение добавить его реальные фото. Без давления на продажу.
      </div>
    </div>
  </div>

  <!-- STEP 2 GRID: SCENARIOS -->
  <div class="grid-2">
    
    <!-- 2A: Price -->
    <div class="step-card">
      <div class="step-header">
        <div class="step-num"><span>ШАГ 2А.</span> Если спросит цену ("How much is it?")</div>
        <span class="step-pill pill-money">Правило 1 выезда</span>
      </div>
      <div class="step-body">
        <div class="script-copy">It’s a flat <span class="script-highlight">$495 one-time</span> — zero monthly retainers or recurring fees, you own it 100%. 

That covers transferring the site to you, connecting the button to your Google Maps profile, and swapping in any of your own photos or text. 

In Roanoke, that’s literally <span class="script-highlight">one single pump-out or drain clear job</span>, so it pays for itself on the very first call you catch from Google. 

If you like how it looks, we can have it officially live under your name today. What do you think?</div>
        <div class="logic-note">
          <strong>Психология:</strong> Для ассенизатора $495 — это ровно 1 выезд на откачку ($350–$650). Никаких подписок ($300/мес), которых боятся ветераны.
        </div>
      </div>
    </div>

    <!-- 2B: Objection -->
    <div class="step-card">
      <div class="step-header">
        <div class="step-num"><span>ШАГ 2Б.</span> Возражение ("23 года без сайта жил")</div>
        <span class="step-pill pill-wait">Отработка сомнений</span>
      </div>
      <div class="step-body">
        <div class="script-copy">Totally understand Clinton — 23 years of word-of-mouth in Roanoke is something most businesses never achieve. 

The only reason we built it: younger homeowners who move into the area don't know the local names yet. When their sewer backs up on a Saturday, they search Google Maps and tap whichever company has a clean site with reviews. 

It's just a 1-time tool to make sure those <span class="script-highlight">$500 emergency calls</span> ring your phone instead of Roto-Rooter. Totally zero pressure either way — happy to leave it up for you to look over!</div>
        <div class="logic-note">
          <strong>Смысл:</strong> Не спорим с его опытом. Объясняем, что новые жильцы города не знают его лично и уходят сетевым конкурентам.
        </div>
      </div>
    </div>

  </div>

  <!-- STEP 3: CLOSING -->
  <div class="step-card">
    <div class="step-header">
      <div class="step-num"><span>ШАГ 3.</span> Закрытие сделки и получение оплаты ($495)</div>
      <span class="step-pill pill-money">Финал сделки</span>
    </div>
    <div class="step-body">
      <div class="script-copy">Awesome! I can send over a simple secure invoice (credit card or PayPal) for the flat $495. 

Once that's through, I'll link the site directly to your Google Maps profile so when folks tap "Website", it opens your page and calls (540) 776-3200 directly. 

What email should I send the receipt to?</div>
      <div class="logic-note">
        <strong>Действие:</strong> Отправляем инвойс Stripe/PayPal. Привязываем готовую ссылку к его Google Business Profile.
      </div>
    </div>
  </div>

  <!-- KEY PSYCHOLOGY & RULES -->
  <div class="psychology-box">
    <div class="psychology-title">💡 3 правила переписки по стандарту AGENTS.md:</div>
    <div class="psychology-text">
      <strong>1. Никаких защитных формулировок и триггеров страха:</strong> Запрещено писать «not spam», «safe link», «don't be afraid to click». Альтернативу ссылке формулировать исключительно через удобство (<em>«Happy to text over a few quick screenshots if that's easier!»</em>).<br>
      <strong>2. Ценовой якорь «1 выезд»:</strong> Для откачки ($350–$650) цена сайта зафиксирована на уровне $495 (1 средний чек).<br>
      <strong>3. Нулевые ежемесячные платежи:</strong> Подрядчики 2000-х годов закрывают диалог при слове «подписка». Только разовый выкуп с полной передачей прав.
    </div>
  </div>

  <div class="footer-note">
    Zonus Studio · Outbound Sales Playbook · Confidential Internal Document · 2026
  </div>

</body>
</html>`;

async function generatePdf() {
  console.log('Generating PDF via Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    scale: 0.88,
    margin: {
      top: '6mm',
      bottom: '6mm',
      left: '8mm',
      right: '8mm'
    }
  });

  fs.copyFileSync(OUTPUT_PDF, ARTIFACT_PDF);

  await browser.close();
  console.log(`✅ PDF successfully generated at: ${OUTPUT_PDF}`);
  console.log(`✅ Artifact saved at: ${ARTIFACT_PDF}`);
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
