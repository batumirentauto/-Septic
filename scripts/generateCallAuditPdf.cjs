const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Разбор холодных звонков и Новый скрипт — Zonus Studio</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  @page {
    size: A4;
    margin: 10mm 12mm 10mm 12mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #18181b;
    background: #ffffff;
    font-size: 8.5pt;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header {
    background: #09090b;
    color: #ffffff;
    padding: 16px 20px;
    border-radius: 10px;
    margin-bottom: 12px;
  }

  .brand-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .brand-logo {
    font-size: 15pt;
    font-weight: 900;
    letter-spacing: 4px;
    color: #ffffff;
  }

  .badge-tag {
    background: #27272a;
    color: #38bdf8;
    border: 1px solid #3f3f46;
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 6px;
    letter-spacing: 0.5px;
  }

  .doc-title {
    font-size: 14pt;
    font-weight: 800;
    line-height: 1.25;
    margin-bottom: 4px;
  }

  .doc-sub {
    font-size: 8pt;
    color: #a1a1aa;
    font-weight: 500;
  }

  .alert-box {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-left: 4px solid #2563eb;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 12px;
    font-size: 8.5pt;
  }

  .alert-title {
    font-weight: 800;
    color: #1e3a8a;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .section-title {
    font-size: 10.5pt;
    font-weight: 800;
    color: #09090b;
    border-bottom: 2px solid #e4e4e7;
    padding-bottom: 4px;
    margin-top: 14px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
  }

  .call-card {
    background: #fafafa;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    padding: 9px 12px;
  }

  .call-card.win {
    background: #f0fdf4;
    border-color: #86efac;
  }

  .call-card.fail {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .call-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .call-title {
    font-size: 8.5pt;
    font-weight: 800;
    color: #09090b;
  }

  .call-badge {
    font-size: 6.5pt;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .badge-win { background: #dcfce7; color: #166534; }
  .badge-fail { background: #fee2e2; color: #991b1b; }

  .call-text {
    font-size: 7.8pt;
    color: #3f3f46;
    line-height: 1.35;
  }

  .call-text strong {
    color: #09090b;
  }

  .rule-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 3px solid #0f172a;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 8pt;
  }

  .rule-card strong {
    color: #0f172a;
  }

  .script-step {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  }

  .step-header {
    font-size: 8.5pt;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
  }

  .dialogue-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.8pt;
    line-height: 1.4;
    color: #0f172a;
  }

  .dialogue-box .caller {
    color: #0284c7;
    font-weight: 600;
  }

  .dialogue-box .target {
    color: #475569;
  }

  .dialogue-box .action {
    color: #16a34a;
    font-weight: 700;
  }

  .footer-note {
    margin-top: 14px;
    text-align: center;
    font-size: 7.5pt;
    color: #71717a;
    border-top: 1px solid #e4e4e7;
    padding-top: 8px;
  }

  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand-row">
      <div class="brand-logo">ZONUS STUDIO</div>
      <div class="badge-tag">Sales Ops & Call Audit</div>
    </div>
    <div class="doc-title">Разбор холодных звонков и Новый регламент звонящего</div>
    <div class="doc-sub">Анализ звонков за 9 ноября 2026 г. | Отработка ошибок оператора Ходы (Hoda) | Практический скрипт</div>
  </div>

  <!-- SUMMARY ALERT -->
  <div class="alert-box">
    <div class="alert-title">
      <span>🎯</span> Главный вывод аудита: Модель полностью жизнеспособна
    </div>
    Звонок №3 подтвердил: подрядчики готовы получать SMS с ссылкой на превью прямо в поле. Но прямо сейчас конверсия срезается на 80% из-за стандартных спам-триггеров в первые 15 секунд. Устранение этих ошибок выведет оператора на стабильные согласия.
  </div>

  <!-- SECTION 1 -->
  <div class="section-title">1. Главный диагноз: почему подрядчики бросают трубку</div>
  <p style="font-size: 8.2pt; color: #3f3f46; margin-bottom: 8px;">
    Американские владельцы септик-бизнесов получают <strong>по 5–10 звонков в день</strong> из Индии и с Филиппин со стандартными фразами: <em>«Hello sir, I found your business on Google, you don't have a website, can we make you one?»</em>. У них выработан мгновенный рефлекс: <strong>сброс и фраза «Not interested, bye»</strong>. Хода звучит именно так, поэтому клиенты вешают трубку до того, как узнают, что сайт уже готов.
  </p>

  <!-- SECTION 2 -->
  <div class="section-title">2. Детальный разбор звонков по пунктам</div>

  <div class="grid-2">
    <!-- Call 1 -->
    <div class="call-card fail">
      <div class="call-header">
        <span class="call-title">Звонок 1: JC Septic</span>
        <span class="call-badge badge-fail">Срыв звонка</span>
      </div>
      <div class="call-text">
        • <strong>Ошибка:</strong> Фраза <em>«I know you're in the field, so I will be super brief. Do you have a moment?»</em>. Спрашивать разрешение на разговор в B2B США фатально — ответ всегда «No».<br>
        • Собеседник переспрашивает: <em>«Who is this again?»</em> — имя и цель были сказаны невнятно или слишком тихо.
      </div>
    </div>

    <!-- Call 2 -->
    <div class="call-card fail">
      <div class="call-header">
        <span class="call-title">Звонок 2: Four Mile Septic</span>
        <span class="call-badge badge-fail">«Not Interested»</span>
      </div>
      <div class="call-text">
        • <strong>Фальшивый восторг:</strong> На фразу «Это Four Mile Septic» Хода отвечает: <em>«Amazing!»</em>. Это звучит неестественно.<br>
        • <strong>Ломаный язык:</strong> <em>«I I some some good reviews catch my attention...»</em>. Заикания и неуверенность.<br>
        • <strong>Спам-триггер:</strong> <em>«I noticed no website link on Google»</em> ➔ Мать Коди мгновенно сбрасывает.
      </div>
    </div>

    <!-- Call 3 -->
    <div class="call-card win">
      <div class="call-header">
        <span class="call-title">Звонок 3: Согласие на SMS</span>
        <span class="call-badge badge-win">Успех / Победа</span>
      </div>
      <div class="call-text">
        • <strong>Победа:</strong> Клиент сам сказал: <em>«Give me your name, I'll have the owner call... text me»</em>. Хода предложила SMS, клиент ответил <em>«Okay»</em>. <strong>Цель звонка достигнута!</strong><br>
        • <strong>Оверселлинг:</strong> После согласия Хода продолжила продавать: <em>«It's like 20 sec... like showcasing... like...»</em>. Правило: <strong>получил «Да» — сразу закрывай звонок и шли SMS!</strong>
      </div>
    </div>

    <!-- Call 4 & 5 -->
    <div class="call-card fail">
      <div class="call-header">
        <span class="call-title">Звонки 4 и 5: Subtech & Звонок 5</span>
        <span class="call-badge badge-fail">Допрос и Глухота</span>
      </div>
      <div class="call-text">
        • <strong>Допрос:</strong> <em>«Any particular reason? Do you have any website?»</em> — звучит агрессивно и свысока.<br>
        • <strong>Полная глухота к клиенту:</strong> В звонке №5 клиент прямо говорит: <em>«We do have a website... But who is this?»</em>. Хода проигнорировала вопрос «Кто вы?», проигнорировала сайт, и посреди фразы ляпнула <em>«How are you doing today?»</em>.
      </div>
    </div>
  </div>

  <!-- SECTION 3 -->
  <div class="section-title">3. Четыре железных правила для оператора</div>

  <div class="rule-card">
    <strong>1. Категорический запрет на слово «Amazing!»:</strong> На бытовые ответы («Да, это компания X») отвечать спокойно и профессионально: <em>«Got it»</em>, <em>«Sounds good»</em>, <em>«Sure»</em>. Никаких наигранных восторгов.
  </div>

  <div class="rule-card">
    <strong>2. Запрет на фразу «I noticed you have no website on Google»:</strong> Это красная тряпка для спам-фильтра. Заходить нужно исключительно через уже выполненную работу: <em>«We already built a live mobile demo for your business»</em>.
  </div>

  <div class="rule-card">
    <strong>3. Активное слушание вместо чтения по бумажке:</strong> Если клиент спросил <em>«Who is this?»</em> — немедленно назвать компанию. Если сказал <em>«У нас есть сайт»</em> — не спорить, а сказать: <em>«Отлично! Мы как раз сделали мобильный апгрейд для аварийных вызовов»</em>.
  </div>

  <div class="rule-card">
    <strong>4. Искоренить слова-паразиты и вовремя класть трубку:</strong> Убрать бесконечные <em>«like, like, like»</em>. Как только клиент сказал <em>«Okay, send it»</em> — сказать спасибо, положить трубку и моментально отправить SMS со ссылкой.
  </div>

  <!-- PAGE BREAK FOR CLEAN SCRIPT -->
  <div class="page-break"></div>

  <!-- SCRIPT SECTION -->
  <div class="header" style="margin-top: 4px;">
    <div class="brand-row">
      <div class="brand-logo">ZONUS STUDIO</div>
      <div class="badge-tag">Official Call Script</div>
    </div>
    <div class="doc-title">Эталонный скрипт холодного звонка для оператора</div>
    <div class="doc-sub">Тайминг: 15–20 секунд | Единственная цель: согласие на получение 1 SMS со ссылкой на превью</div>
  </div>

  <!-- SCRIPT STEPS -->
  <div class="script-step">
    <div class="step-header">
      <span>ШАГ 1: Естественное и уверенное начало (без восторгов и пауз)</span>
      <span style="color: #64748b; font-size: 7.5pt;">Тайминг: 0–7 сек</span>
    </div>
    <div class="dialogue-box">
      <span class="caller">Hoda:</span> "Hi, is this [Owner Name / Business Name]?"<br>
      <span class="target">Recipient:</span> "Yes, it is."<br>
      <span class="caller">Hoda:</span> "Hey! My name is Hoda with Zonus Studio. Look, I’ll be 15 seconds — our team actually just built a quick live website demo for your septic business, using your real trucks and local reviews."
    </div>
  </div>

  <div class="script-step">
    <div class="step-header">
      <span>ШАГ 2: Прямой Call to Action на отправку SMS</span>
      <span style="color: #64748b; font-size: 7.5pt;">Тайминг: 8–15 сек</span>
    </div>
    <div class="dialogue-box">
      <span class="caller">Hoda:</span> "Mind if I just text you a quick 10-second link to look at while you're in the field?"
    </div>
  </div>

  <div class="section-title">ШАГ 3: Отработка ответов клиента (Branching)</div>

  <!-- Scenario A -->
  <div class="script-step" style="border-left: 3px solid #16a34a;">
    <div class="step-header">
      <span style="color: #166534;">Сценарий А: Клиент согласен («Sure», «Okay», «Send it over»)</span>
      <span class="call-badge badge-win">Целевое действие</span>
    </div>
    <div class="dialogue-box">
      <span class="target">Recipient:</span> "Yeah, sure, you can send it."<br>
      <span class="caller">Hoda:</span> "Awesome! Texting it to this number right now. Take a look whenever you have a minute. Have a great day!"<br>
      <span class="action">➔ ДЕЙСТВИЕ: Сразу сбросить вызов и отправить SMS со ссылкой на zonus.co/[slug]! Больше ничего не говорить!</span>
    </div>
  </div>

  <!-- Scenario B -->
  <div class="script-step" style="border-left: 3px solid #2563eb;">
    <div class="step-header">
      <span style="color: #1e40af;">Сценарий Б: «У нас уже есть сайт» («We already have a website»)</span>
      <span class="call-badge" style="background: #dbeafe; color: #1e40af;">Отработка возражения</span>
    </div>
    <div class="dialogue-box">
      <span class="target">Recipient:</span> "We already have a website, we're all good."<br>
      <span class="caller">Hoda:</span> "Totally hear you! We actually saw that, but we built this specifically as a high-speed mobile upgrade to convert more emergency pumping calls. Can I just shoot you the link so you can compare?"
    </div>
  </div>

  <!-- Scenario C -->
  <div class="script-step" style="border-left: 3px solid #eab308;">
    <div class="step-header">
      <span style="color: #854d0e;">Сценарий В: «Кто вы вообще такие?» («Who is this? What company?»)</span>
      <span class="call-badge" style="background: #fef9c3; color: #854d0e;">Уточнение</span>
    </div>
    <div class="dialogue-box">
      <span class="target">Recipient:</span> "Wait, who is this again? What are you selling?"<br>
      <span class="caller">Hoda:</span> "We're Zonus Studio — we build custom web pages specifically for septic and pumping contractors. No sales pitch today at all, we just already put together the mockup for your company."
    </div>
  </div>

  <!-- Scenario D -->
  <div class="script-step" style="border-left: 3px solid #64748b;">
    <div class="step-header">
      <span style="color: #334155;">Сценарий Г: Отказ («Not interested», «We're good»)</span>
      <span class="call-badge" style="background: #f1f5f9; color: #475569;">Мягкий выход + SMS</span>
    </div>
    <div class="dialogue-box">
      <span class="target">Recipient:</span> "No, we're not interested, thank you."<br>
      <span class="caller">Hoda:</span> "No worries at all! Just didn't want the work to go to waste. I'll leave the link in a quick text just in case you ever need it. Have a great day!"<br>
      <span class="action">➔ ДЕЙСТВИЕ: Всё равно отправить вежливое SMS со ссылкой. В 15% случаев перезванивают через пару дней.</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer-note">
    Zonus Studio Outbound Operations &bull; Документ подготовлен для внутреннего инструктажа операторов &bull; Ноябрь 2026
  </div>

</body>
</html>
`;

async function generatePdf() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });

  const rootPdfPath = path.resolve('Cold_Calls_Audit_and_Script_Guide.pdf');
  const artifactPdfPath = path.resolve('/Users/workpc/.gemini/antigravity/brain/64abcce9-d539-4958-8607-1eabe7609c14/Cold_Calls_Audit_and_Script_Guide.pdf');

  await page.pdf({
    path: rootPdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '10mm',
      bottom: '10mm',
      left: '12mm',
      right: '12mm'
    }
  });

  fs.copyFileSync(rootPdfPath, artifactPdfPath);
  await browser.close();

  console.log('✅ PDF generated successfully:');
  console.log('1.', rootPdfPath);
  console.log('2.', artifactPdfPath);
}

generatePdf().catch(console.error);
