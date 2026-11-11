const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_PDF = path.join(process.cwd(), 'Cold_Call_Candidates_Analysis_and_Trial_Brief.pdf');
const ARTIFACT_PDF = '/Users/workpc/.gemini/antigravity/brain/c532ba69-f1f6-4351-8442-ec293734333e/Cold_Call_Candidates_Analysis_and_Trial_Brief.pdf';

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Cold Call Candidates Evaluation & 35-Lead Live Trial Brief</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

  @page {
    size: A4;
    margin: 6mm 8mm 6mm 8mm;
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
    font-size: 7.6pt;
    line-height: 1.3;
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

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 8px;
    font-size: 7pt;
  }

  th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 800;
    text-align: left;
    padding: 4px 6px;
    border: 1px solid #cbd5e1;
    text-transform: uppercase;
    font-size: 6.4pt;
    letter-spacing: 0.4px;
  }

  td {
    padding: 3.5px 6px;
    border: 1px solid #e2e8f0;
    vertical-align: middle;
  }

  tr:nth-child(even) {
    background: #f8fafc;
  }

  .top-row {
    background: #f0fdf4 !important;
    font-weight: 600;
  }

  .score-badge {
    display: inline-block;
    padding: 1.5px 5px;
    border-radius: 4px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    font-size: 6.8pt;
  }

  .score-green {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #86efac;
  }

  .score-blue {
    background: #e0f2fe;
    color: #0369a1;
    border: 1px solid #7dd3fc;
  }

  .score-yellow {
    background: #fef3c7;
    color: #b45309;
    border: 1px solid #fcd34d;
  }

  .score-red {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fca5a5;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 8px;
  }

  .candidate-card {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px 8px;
    background: #ffffff;
  }

  .candidate-card.featured {
    border: 1.5px solid #10b981;
    background: #fafffc;
  }

  .cand-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 3px;
  }

  .cand-name {
    font-size: 7.8pt;
    font-weight: 800;
    color: #0f172a;
  }

  .cand-stat {
    font-size: 6.5pt;
    color: #64748b;
    margin-bottom: 3px;
    line-height: 1.25;
  }

  .cand-desc {
    font-size: 6.8pt;
    color: #334155;
    line-height: 1.25;
  }

  .brief-box {
    background: #090d16;
    color: #f8fafc;
    border-radius: 8px;
    padding: 8px 12px;
    margin-bottom: 8px;
    border: 1px solid #1e293b;
  }

  .brief-title {
    font-size: 8pt;
    font-weight: 800;
    color: #38bdf8;
    margin-bottom: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .script-box {
    background: #1e293b;
    border-left: 3px solid #10b981;
    padding: 5px 8px;
    margin: 5px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.1pt;
    line-height: 1.35;
    color: #e2e8f0;
    border-radius: 0 5px 5px 0;
    white-space: pre-line;
  }

  .rules-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 8px;
  }

  .rule-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 6px 8px;
    font-size: 6.9pt;
  }

  .rule-card strong {
    color: #0f172a;
    display: block;
    margin-bottom: 1px;
  }

  .footer-note {
    margin-top: 6px;
    text-align: center;
    font-size: 6.5pt;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 3px;
  }

  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

  <!-- PAGE 1: EVALUATION REPORT -->
  <div class="header">
    <div class="header-left">
      <h1>Отбор соискателей на холодные B2B-звонки в США</h1>
      <p>Комплексный анализ более 20 соискателей, шорт-лист топ-лидеров и бриф тестового задания на 35 лидов</p>
    </div>
    <div class="badge">20+ Кандидатов · 4 Финалиста</div>
  </div>

  <div class="section-title">1. Полный рейтинг соискателей по группам</div>
  <table>
    <thead>
      <tr>
        <th style="width: 4%;">#</th>
        <th style="width: 20%;">Кандидат / Источник</th>
        <th style="width: 10%;">Оценка</th>
        <th style="width: 46%;">Бэкграунд, специфика и язык</th>
        <th style="width: 20%;">Вердикт</th>
      </tr>
    </thead>
    <tbody>
      <tr class="top-row">
        <td><strong>1</strong></td>
        <td><strong>Динара</strong></td>
        <td><span class="score-badge score-green">9.9 / 10</span></td>
        <td><strong>4 года жила и училась в США</strong>. Американский акцент, 6 лет в B2B-продажах (SaaS/FinTech), закрывает сделки сама</td>
        <td><strong style="color: #15803d;">ФИНАЛИСТ №1 (Тест)</strong></td>
      </tr>
      <tr class="top-row">
        <td><strong>2</strong></td>
        <td><strong>Татьяна</strong> (IMG_3265)</td>
        <td><span class="score-badge score-green">9.8 / 10</span></td>
        <td><strong>8+ лет продаж в США</strong> (full-desk B2B рекрутинг), фаундер EdTech, привыкла к жесткому холоду и отказам</td>
        <td><strong style="color: #15803d;">ФИНАЛИСТ №2 (Тест)</strong></td>
      </tr>
      <tr class="top-row">
        <td><strong>3</strong></td>
        <td><strong>Jane</strong> (Пачка 2, #4)</td>
        <td><span class="score-badge score-green">9.8 / 10</span></td>
        <td><strong>10+ лет B2B cold calling</strong>, 7 лет удаленки (Sarova Hotels), авторитетный солидный голос, зрелый переговорщик</td>
        <td><strong style="color: #15803d;">ФИНАЛИСТ №3 (Тест)</strong></td>
      </tr>
      <tr class="top-row">
        <td><strong>4</strong></td>
        <td><strong>Ани (Ani)</strong> (IMG_3275/73)</td>
        <td><span class="score-badge score-green">9.5 / 10</span></td>
        <td><strong>4 года в US Home Services</strong> + реальный опыт сбора баз с Google и холодки в США. Жила в США, C2 English</td>
        <td><strong style="color: #15803d;">ФИНАЛИСТ №4 (Тест)</strong></td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Steffy Wambui</strong> (Пачка 2, #5)</td>
        <td><span class="score-badge score-blue">9.5 / 10</span></td>
        <td>5 лет Outbound B2B SDR, C2 English, мастер выхода на Decision Makers и работы с возражениями</td>
        <td>Резерв топ-уровня</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Jeanette</strong> (Пачка 4, #2)</td>
        <td><span class="score-badge score-blue">9.0 / 10</span></td>
        <td>Degree in Mass Comm, 3+ года в туризме, рекорд конверсии 80% (при плане 55%), четкий outbound</td>
        <td>Резерв</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Shaniska Gendo</strong> (Пачка 1, #2)</td>
        <td><span class="score-badge score-blue">9.0 / 10</span></td>
        <td>Опыт холодных звонков в США, обработка возражений, четкая поставленная дикция колл-центра</td>
        <td>Резерв</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>Riana</strong> (Пачка 1, #5)</td>
        <td><span class="score-badge score-blue">8.5 / 10</span></td>
        <td>Native English speaker (Нигерия / Минск), отличная живая разговорная энергетика, теплая подача</td>
        <td>Резерв</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Inibelle Alexandra</strong> (Пачка 4, #1)</td>
        <td><span class="score-badge score-blue">8.0 / 10</span></td>
        <td>Native English, опыт телефонной диспетчеризации для клиентов США, готова к ночным сменам</td>
        <td>Резерв (Саппорт)</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Luce</strong> (Пачка 3, #1)</td>
        <td><span class="score-badge score-yellow">7.8 / 10</span></td>
        <td>Отличная бизнес-лексика, но профиль — Retention / Customer Success (не агрессивный холод)</td>
        <td>Аккаунтинг / Саппорт</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>Елизавета</strong> (IMG_3276)</td>
        <td><span class="score-badge score-yellow">7.0 / 10</span></td>
        <td>B2B квалификация в Hypervsn и iGaming, но спокойный европейский темп и заметный славянский акцент</td>
        <td>Второй эшелон</td>
      </tr>
      <tr>
        <td>12</td>
        <td><strong>Kate</strong> (IMG_3271)</td>
        <td><span class="score-badge score-yellow">6.8 / 10</span></td>
        <td>Холодные звонки девелоперам в Дубае (PropTech), сертификаты TEFL, но русский акцент и грамматические сбои</td>
        <td>Второй эшелон</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>Инга Великанова</strong> (IMG_3270)</td>
        <td><span class="score-badge score-yellow">6.0 / 10</span></td>
        <td>20 лет опыта (переводчик в нефтегазе, координатор поставок), академический тон, не для холодки</td>
        <td>Отказ (Не та роль)</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>Тахмина / Эллен / Тиша</strong></td>
        <td><span class="score-badge score-red">5.0 – 6.0</span></td>
        <td>Сильные акценты, работа только на теплых B2C лидах или в отелях, не выдержат давления прорабов</td>
        <td>Отказ</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>Камилла / Айла / Титилайо</strong></td>
        <td><span class="score-badge score-red">4.0 / 10</span></td>
        <td>Студентки (18–22 года) с нулевым или минимальным опытом в продажах (Ростелеком, медвузы)</td>
        <td>Отказ</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">2. Детальные профили топ-4 финалистов для боевого теста</div>
  <div class="grid-4">
    
    <div class="candidate-card featured">
      <div class="cand-header">
        <span class="cand-name">🥇 Динара</span>
        <span class="score-badge score-green">9.9</span>
      </div>
      <div class="cand-stat"><strong>Опыт:</strong> 4 года в США · 6 лет B2B</div>
      <div class="cand-desc">
        Абсолютный лидер. Жила и училась в США. Полный цикл: от холода до закрытия сделок. Американский тембр и мышление клоузера.
      </div>
    </div>

    <div class="candidate-card featured">
      <div class="cand-header">
        <span class="cand-name">🥇 Татьяна</span>
        <span class="score-badge score-green">9.8</span>
      </div>
      <div class="cand-stat"><strong>Опыт:</strong> 8+ лет США · Full-Desk</div>
      <div class="cand-desc">
        Редкий профиль: 8 лет B2B продаж именно в США. Основатель стартапа. Открыто заявляет: привыкла к отказам, говорит уверенно.
      </div>
    </div>

    <div class="candidate-card featured">
      <div class="cand-header">
        <span class="cand-name">🥈 Jane</span>
        <span class="score-badge score-green">9.8</span>
      </div>
      <div class="cand-stat"><strong>Опыт:</strong> 10+ лет B2B · 7 лет Remote</div>
      <div class="cand-desc">
        Ветеран холодных продаж. Глубокий, солидный голос. Американские владельцы воспримут ее как зрелого партнера.
      </div>
    </div>

    <div class="candidate-card featured">
      <div class="cand-header">
        <span class="cand-name">🥈 Ани (Ani)</span>
        <span class="score-badge score-green">9.5</span>
      </div>
      <div class="cand-stat"><strong>Опыт:</strong> 4 года Home Services США</div>
      <div class="cand-desc">
        Профильный бэкграунд в нашей нише Home Services. Собирала базы с Google и делала холодку. Жила в США, легкий C2 английский.
      </div>
    </div>

  </div>

  <div class="page-break"></div>

  <!-- PAGE 2: TEST TRIAL BRIEF FOR 35 LEADS -->
  <div class="header">
    <div class="header-left">
      <h1>Бриф тестового задания: Прозвон 35 целевых лидов (США)</h1>
      <p>Инструкция для финалиста, скрипт первого контакта и ключевые KPI оценки звонков</p>
    </div>
    <div class="badge">Live 35-Call Trial Run</div>
  </div>

  <div class="brief-box">
    <div class="brief-title">🎯 Задача оператора на 35 тестовых звонков:</div>
    <p style="font-size: 7.4pt; line-height: 1.35; color: #cbd5e1;">
      Связаться с владельцем или менеджером септической компании из базы проверенных бригад (исключая соло-одиночек), за 30 секунд озвучить комплимент их 5★ репутации в Google Maps, предложить взглянуть на готовый мобильный сайт-витрину на <strong>zonus.co/[slug]</strong> и получить согласие на отправку SMS со ссылкой.
    </p>
    
    <div style="margin-top: 6px; font-weight: 800; font-size: 7.6pt; color: #34d399;">
      ГОТОВЫЙ 30-СЕКУНДНЫЙ СКРИПТ ВХОДА (OPENING SCRIPT):
    </div>
    <div class="script-box">
“Hi [Owner Name], my name is [Caller Name]. Quick call — I saw you guys have an awesome 4.9-star rating in [City], but noticed your Google Maps listing doesn't have a direct website button. 

We actually put together a clean 1-page mobile showcase for [Company Name] featuring your top reviews and a 10-second estimate tool: zonus.co/[slug]

Mind if I text over a few quick screenshots or the link to this cell so you can take 10 seconds to look over lunch?”
    </div>
  </div>

  <div class="section-title">3. Отработка 3 главных возражений американских подрядчиков</div>
  <div class="rules-grid">
    
    <div class="rule-card">
      <strong>1. «I'm busy / on a jobsite right now» (Занят на объекте):</strong>
      <p style="color: #475569; margin-top: 1px;">
        <em>«Totally get it! I won't hold you. I'll just text the link to this cell so you can scroll it later whenever you're back in the truck. Sound good?»</em><br>
        <strong>Смысл:</strong> Не задерживаем, проявляем уважение к труду, фиксируем отправку ссылки в SMS.
      </p>
    </div>

    <div class="rule-card">
      <strong>2. «We've been in business 20 years, don't need a site»:</strong>
      <p style="color: #475569; margin-top: 1px;">
        <em>«100% respect on 20 years! The only reason we built it: younger homeowners moving into [City] don't know the local names yet and tap whoever has a clean page on Maps. Just wanted to show your crew first!»</em><br>
        <strong>Смысл:</strong> Не спорим с опытом, объясняем приток новых молодых жильцов города.
      </p>
    </div>

    <div class="rule-card">
      <strong>3. «How much is this going to cost me?»:</strong>
      <p style="color: #475569; margin-top: 1px;">
        <em>«It’s a flat $495 one-time — zero subscriptions or monthly fees. That’s literally one single pump-out or cleanout job in [City], so it pays for itself on the first call. Take a look at the preview first and see what you think!»</em><br>
        <strong>Смысл:</strong> Якорь цены $495 равен ровно 1 выезду. Отсутствие скрытых абонентских плат.
      </p>
    </div>

    <div class="rule-card">
      <strong>4. Золотое правило AGENTS.md (No Fear-Based Framing):</strong>
      <p style="color: #b91c1c; margin-top: 1px;">
        <strong>СТРОГО ЗАПРЕЩЕНО</strong> говорить слова <em>«safe link»</em>, <em>«not spam»</em>, <em>«not a virus»</em>, <em>«afraid to click»</em>. Альтернативу предлагать исключительно через удобство: <em>«Happy to text over a few quick screenshots if that's easier!»</em>
      </p>
    </div>

  </div>

  <div class="section-title">4. Критерии оценки и KPI тестового задания (35 звонков)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Метрика</th>
        <th style="width: 25%;">Норма на 35 лидов</th>
        <th style="width: 50%;">На что обращать внимание при оценке</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Контактность (Pick-up rate)</strong></td>
        <td><strong>10 – 16 соединений</strong></td>
        <td>Умение обходить диспетчера/секретаря и выходить на владельца компании.</td>
      </tr>
      <tr>
        <td><strong>Согласие на SMS (Link sent)</strong></td>
        <td><strong>4 – 8 согласий</strong></td>
        <td>Главный KPI теста: владелец согласился получить ссылку или скриншоты по SMS.</td>
      </tr>
      <tr>
        <td><strong>Скорость и ритм звонков</strong></td>
        <td><strong>35 звонков за 1.5 – 2 часа</strong></td>
        <td>Не зависает между звонками, быстро вносит статус в таблицу / CRM.</td>
      </tr>
      <tr>
        <td><strong>Стрессоустойчивость</strong></td>
        <td><strong>Спокойная реакция на отказы</strong></td>
        <td>Не тушуется при жестких ответах прорабов, не спорит, вежливо завершает диалог.</td>
      </tr>
    </tbody>
  </table>

  <div class="footer-note">
    Zonus Studio · Outbound Sales Playbook · Confidential Internal Document · 2026
  </div>

</body>
</html>`;

async function generatePdf() {
  console.log('Generating updated Candidates Analysis & Trial Brief PDF via Playwright...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });

  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    scale: 0.94,
    margin: {
      top: '5mm',
      bottom: '5mm',
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
