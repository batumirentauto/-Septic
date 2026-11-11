const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Вакансия: Outbound Sales Representative (Батуми / США) — Zonus Studio</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');

  @page {
    size: A4;
    margin: 8mm 10mm 8mm 10mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #09090b;
    background: #ffffff;
    font-size: 8pt;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header {
    background: #09090b;
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 8px;
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
    letter-spacing: 5px;
  }

  .badge-tag {
    background: #ffffff;
    color: #09090b;
    font-size: 6.8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 2.5px 9px;
    border-radius: 20px;
  }

  .header h1 {
    font-size: 13.5pt;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 4px;
    letter-spacing: -0.2px;
  }

  .header p {
    font-size: 7.8pt;
    color: #a1a1aa;
    line-height: 1.35;
  }

  .meta-pills {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    font-size: 7pt;
    font-family: 'JetBrains Mono', monospace;
  }

  .meta-pill {
    background: #18181b;
    border: 1px solid #27272a;
    padding: 2px 8px;
    border-radius: 5px;
    color: #e4e4e7;
  }

  .meta-pill.highlight {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
    color: #34d399;
    font-weight: 700;
  }

  .callout-box {
    background: #ecfdf5;
    border-left: 3px solid #059669;
    padding: 6px 12px;
    border-radius: 0 6px 6px 0;
    margin-bottom: 8px;
    font-size: 7.6pt;
  }

  .callout-box strong {
    color: #065f46;
    display: block;
    margin-bottom: 1px;
    font-size: 8pt;
  }

  .section-title {
    font-size: 8.8pt;
    font-weight: 800;
    color: #09090b;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 8px 0 5px 0;
    padding-bottom: 3px;
    border-bottom: 1.2px solid #09090b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .section-title span.num {
    background: #09090b;
    color: #ffffff;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 6.8pt;
    font-weight: 800;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 6px;
  }

  .panel-card {
    background: #ffffff;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    padding: 8px 10px;
  }

  .panel-card h4 {
    font-size: 8pt;
    font-weight: 800;
    color: #09090b;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  ul.bullet-list {
    list-style: none;
    padding: 0;
  }

  ul.bullet-list li {
    position: relative;
    padding-left: 11px;
    margin-bottom: 2.5px;
    font-size: 7.3pt;
    color: #27272a;
    line-height: 1.3;
  }

  ul.bullet-list li::before {
    content: "•";
    position: absolute;
    left: 2px;
    color: #09090b;
    font-weight: 900;
    font-size: 8pt;
  }

  .test-task-card {
    background: #fafafa;
    border: 1.2px dashed #18181b;
    border-radius: 8px;
    padding: 8px 12px;
    margin-top: 6px;
  }

  .test-task-card h3 {
    font-size: 8.5pt;
    font-weight: 800;
    margin-bottom: 3px;
    color: #09090b;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .quote-script {
    background: #ffffff;
    border: 1px solid #d4d4d8;
    padding: 6px 10px;
    border-radius: 5px;
    font-style: italic;
    font-size: 7.2pt;
    color: #18181b;
    line-height: 1.35;
    margin: 4px 0;
  }

  .footer-note {
    margin-top: 6px;
    padding-top: 5px;
    border-top: 1px solid #e4e4e7;
    display: flex;
    justify-content: space-between;
    font-size: 6.5pt;
    color: #71717a;
    font-family: 'JetBrains Mono', monospace;
  }
</style>
</head>
<body>

  <div class="header">
    <div class="brand-row">
      <div class="brand-logo">ZONUS</div>
      <div class="badge-tag">Локация: Батуми, Грузия</div>
    </div>
    <h1>Outbound Sales Representative / Cold Caller</h1>
    <p>Исходящие звонки американским контракторам по прогретой базе с уже готовыми персональными сайтами. Работа под прямым контролем команды на месте в Батуми.</p>
    
    <div class="meta-pills">
      <span class="meta-pill highlight">📍 Строго Батуми (Очно / Контроль)</span>
      <span class="meta-pill">🇺🇸 Рынок: США</span>
      <span class="meta-pill">⏰ 16:30 – 21:00 (Батуми)</span>
      <span class="meta-pill">🗣 English: C1 / Fluent</span>
    </div>
  </div>

  <div class="callout-box">
    <strong>Суть оффера (Без «впаривания» вслепую):</strong>
    Под каждого клиента в базе наша студия <strong>уже заранее создала готовый персональный сайт</strong> с его реальной техникой и 5★ отзывами. Ваша цель — за 45 секунд вежливо презентовать результат и получить согласие отправить ссылку на готовый макет в SMS.
  </div>

  <div class="section-title"><span class="num">1</span> Задачи и рабочий процесс</div>
  <div class="grid-2">
    <div class="panel-card">
      <h4>📞 Звонки и коммуникация</h4>
      <ul class="bullet-list">
        <li>Исходящие звонки американским подрядчикам (септики, экскавация, сантехника) по подготовленной базе.</li>
        <li>Короткий диалог (45–60 секунд) по готовому сценарию: вежливо, уверенно, по-соседски.</li>
        <li>Моментальная отправка SMS со ссылкой на сайт заинтересованным клиентам.</li>
      </ul>
    </div>
    <div class="panel-card">
      <h4>🎯 Ведение лидов и докрутка</h4>
      <ul class="bullet-list">
        <li>Фиксация статусов в таблице/CRM (ответил, отправлено SMS, перезвонить).</li>
        <li>Короткие повторные звонки тем, кто открыл ссылку.</li>
        <li>Совместный разбор аудиозаписей разговоров с наставником: регулярное улучшение интонаций и скриптов.</li>
      </ul>
    </div>
  </div>

  <div class="section-title"><span class="num">2</span> Требования к кандидату</div>
  <div class="grid-2">
    <div class="panel-card">
      <h4>🗣 Язык и Голос</h4>
      <ul class="bullet-list">
        <li><strong>Английский строго C1 / Fluent:</strong> свободная речь без запинок и перевода в голове, понимание беглого американского акцента.</li>
        <li><strong>Нейтральный или легкий US-акцент:</strong> отсутствие выраженного славянского акцента.</li>
        <li><strong>Приятная интонация:</strong> живая, естественная подача вместо «робота по бумажке».</li>
      </ul>
    </div>
    <div class="panel-card">
      <h4>📍 Локация и Личные качества</h4>
      <ul class="bullet-list">
        <li><strong>Физическое нахождение в Батуми (Грузия):</strong> личное присутствие под прямым контролем руководства на месте.</li>
        <li><strong>Стрессоустойчивость:</strong> спокойное отношение к отказам («No thanks» — обычная часть процесса).</li>
        <li><strong>Пунктуальность:</strong> строгое соблюдение расписания звонков под часовые пояса США.</li>
      </ul>
    </div>
  </div>

  <div class="section-title"><span class="num">3</span> Условия, график и оплата</div>
  <div class="grid-2">
    <div class="panel-card">
      <h4>⏰ График работы</h4>
      <ul class="bullet-list">
        <li><strong>Понедельник – Пятница.</strong> Суббота и воскресенье — выходные.</li>
        <li><strong>Время: с 16:30 до 21:00 (по времени Батуми).</strong></li>
        <li>Всего 4.5 часа работы в золотые часы на Восточном побережье США (08:30 – 13:00 EST).</li>
      </ul>
    </div>
    <div class="panel-card">
      <h4>💰 Условия компенсации</h4>
      <ul class="bullet-list">
        <li><strong>Фиксированная ставка</strong> + высокий бонус за каждую закрытую сделку ($50–$100 с продажи).</li>
        <li>Прозрачная выплата бонусов каждую неделю.</li>
        <li>Полное обучение, готовые шпаргалки, софт и сопровождение куратора.</li>
      </ul>
    </div>
  </div>

  <div class="test-task-card">
    <h3>🎙️ Как откликнуться (Обязательное условие отбора)</h3>
    <p style="font-size: 7.2pt; color: #52525b;">Мы отбираем кандидата по голосу и произношению, поэтому текстовые резюме без аудиозаписи не рассматриваются.</p>
    
    <div class="quote-script">
      “Hi Zac! It's Sarah with Zonus Studio. Reason for the quick call: I saw your 5-star reviews for excavating in Pittsburgh and noticed you guys don't have an official website. We actually already put together a clean mobile showcase with your real machinery and services. Would you mind if I shoot you a quick text with the link right now so you can check it out in your truck?”
    </div>

    <p style="font-size: 7.4pt; font-weight: 700; color: #09090b;">
      Отправьте в Telegram: <strong>@[ВАШ_TELEGRAM]</strong> коротко о себе + <strong>голосовое сообщение (30–40 сек)</strong> с выразительным прочтением текста выше.
    </p>
  </div>

  <div class="footer-note">
    <span>Zonus Studio • Hiring Document (Internal & Public)</span>
    <span>Batumi, Georgia • zonus.co</span>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log('[PDF] Generating Single-Page Vacancy PDF for Batumi...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });

  const pdfPath = path.resolve(__dirname, '../Vacancy_Outbound_Caller_Batumi.pdf');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '6mm',
      bottom: '6mm',
      left: '8mm',
      right: '8mm'
    }
  });

  const artifactDir = '/Users/workpc/.gemini/antigravity/brain/64abcce9-d539-4958-8607-1eabe7609c14';
  const artifactPdf = path.join(artifactDir, 'Vacancy_Outbound_Caller_Batumi.pdf');
  fs.copyFileSync(pdfPath, artifactPdf);

  await browser.close();

  console.log(`✅ [SUCCESS] 1-Page Vacancy PDF generated at:`);
  console.log(`- ${pdfPath}`);
}

generatePdf().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
