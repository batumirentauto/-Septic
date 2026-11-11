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
    margin: 8mm 10mm 8mm 10mm;
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
    font-size: 8.2pt;
    line-height: 1.35;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .header {
    background: linear-gradient(135deg, #090d16 0%, #0f172a 100%);
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #1e293b;
  }

  .header-left h1 {
    font-size: 14pt;
    font-weight: 900;
    letter-spacing: -0.3px;
    color: #ffffff;
    margin-bottom: 3px;
  }

  .header-left p {
    font-size: 8pt;
    color: #94a3b8;
  }

  .badge {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.4);
    color: #34d399;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-title {
    font-size: 9pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #0f172a;
    margin: 10px 0 6px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .section-title::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 12px;
    background: #10b981;
    border-radius: 2px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
    font-size: 7.5pt;
  }

  th {
    background: #f1f5f9;
    color: #334155;
    font-weight: 800;
    text-align: left;
    padding: 5px 8px;
    border: 1px solid #cbd5e1;
    text-transform: uppercase;
    font-size: 6.8pt;
    letter-spacing: 0.4px;
  }

  td {
    padding: 5px 8px;
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
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.2pt;
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

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 10px;
  }

  .candidate-card {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 8px 10px;
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
    margin-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
  }

  .cand-name {
    font-size: 8.5pt;
    font-weight: 800;
    color: #0f172a;
  }

  .cand-stat {
    font-size: 7pt;
    color: #64748b;
    margin-bottom: 4px;
    line-height: 1.3;
  }

  .cand-desc {
    font-size: 7.2pt;
    color: #334155;
    line-height: 1.3;
  }

  .brief-box {
    background: #090d16;
    color: #f8fafc;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 10px;
    border: 1px solid #1e293b;
  }

  .brief-title {
    font-size: 8.5pt;
    font-weight: 800;
    color: #38bdf8;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .script-box {
    background: #1e293b;
    border-left: 3px solid #10b981;
    padding: 6px 10px;
    margin: 6px 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.4pt;
    line-height: 1.4;
    color: #e2e8f0;
    border-radius: 0 6px 6px 0;
    white-space: pre-line;
  }

  .rules-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 10px;
  }

  .rule-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 7.2pt;
  }

  .rule-card strong {
    color: #0f172a;
    display: block;
    margin-bottom: 2px;
  }

  .footer-note {
    margin-top: 8px;
    text-align: center;
    font-size: 6.8pt;
    color: #94a3b8;
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
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
      <h1>Отбор соискателей на холодные звонки в США (B2B Outbound)</h1>
      <p>Анализ 16 кандидатов, шорт-лист финалистов и программа тестового задания на 35 лидов</p>
    </div>
    <div class="badge">16 Кандидатов · 3 Финалиста</div>
  </div>

  <div class="section-title">1. Полный рейтинг кандидатов (16 человек)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 20%;">Кандидат / Источник</th>
        <th style="width: 10%;">Оценка</th>
        <th style="width: 45%;">Бэкграунд и навыки</th>
        <th style="width: 20%;">Вердикт</th>
      </tr>
    </thead>
    <tbody>
      <tr class="top-row">
        <td><strong>1</strong></td>
        <td><strong>Татьяна</strong> (IMG_3265)</td>
        <td><span class="score-badge score-green">9.8 / 10</span></td>
        <td><strong>8+ лет продаж в США</strong> (full-desk B2B рекрутинг), фаундер EdTech, привыкла к отказам</td>
        <td><strong style="color: #15803d;">ФИНАЛИСТ №1 (Тест)</strong></td>
      </tr>
      <tr class="top-row">
        <td><strong>2</strong></td>
        <td><strong>Jane</strong> (Пачка 2, #4)</td>
        <td><span class="score-badge score-green">9.8 / 10</span></td>
        <td><strong>10+ лет B2B cold calling</strong>, 7 лет удаленки, отличный зрелый авторитетный тембр</td>
        <td><strong style="color: #15803d;">ФИНАЛИСТ №2 (Тест)</strong></td>
      </tr>
      <tr class="top-row">
        <td><strong>3</strong></td>
        <td><strong>Steffy Wambui</strong> (Пачка 2, #5)</td>
        <td><span class="score-badge score-green">9.5 / 10</span></td>
        <td><strong>5 лет Outbound SDR</strong>, уровень C2, знает выход на Decision Makers и ведение по воронке</td>
        <td><strong style="color: #15803d;">ФИНАЛИСТ №3 (Тест)</strong></td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Shaniska Gendo</strong> (Пачка 1, #2)</td>
        <td><span class="score-badge score-blue">9.0 / 10</span></td>
        <td>Опыт холодных звонков в США, обработка возражений, четкая поставленная дикция</td>
        <td>Резерв №1</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Riana</strong> (Пачка 1, #5)</td>
        <td><span class="score-badge score-blue">8.5 / 10</span></td>
        <td>Native English speaker (Нигерия / Минск), отличная живая разговорная энергетика</td>
        <td>Резерв №2</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Inibelle Alexandra</strong> (Пачка 4, #1)</td>
        <td><span class="score-badge score-blue">8.0 / 10</span></td>
        <td>Native English, опыт с рынком США, готова работать в ночную смену (по дню в США)</td>
        <td>Резерв №3</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Luce</strong> (Пачка 3, #1)</td>
        <td><span class="score-badge score-yellow">7.8 / 10</span></td>
        <td>Отличная бизнес-лексика, но профиль — Retention / Customer Success (не агрессивный холод)</td>
        <td>Саппорт / Аккаунтинг</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>Hope Onoja</strong> (Пачка 2, #3)</td>
        <td><span class="score-badge score-yellow">7.0 / 10</span></td>
        <td>5 лет опыта, Business Administration, но подача администратора ресепшена</td>
        <td>Клиентский сервис</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Adele Faith</strong> (Пачка 1, #4)</td>
        <td><span class="score-badge score-yellow">6.5 / 10</span></td>
        <td>Опыт в стройматериалах, но слишком тихий и мягкий голос для пробивки американцев</td>
        <td>Клиентский сервис</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Tisha</strong> (Пачка 2, #2)</td>
        <td><span class="score-badge score-red">6.0 / 10</span></td>
        <td>Опыт в Дубае, но сильный акцент и грамматические ошибки (американцы будут сбрасывать)</td>
        <td>Отказ</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>Sumaira</strong> (IMG_3266)</td>
        <td><span class="score-badge score-red">5.0 / 10</span></td>
        <td>Пакистанский акцент, ошибки в базовой грамматике, опыт в крипто-рекавери и казино</td>
        <td>Отказ (риск спам-триггера)</td>
      </tr>
      <tr>
        <td>12</td>
        <td><strong>Precious Cyril</strong> (Пачка 1, #3)</td>
        <td><span class="score-badge score-red">5.0 / 10</span></td>
        <td>Преподаватель английского, чтение биографии по бумажке, нет хватки продажника</td>
        <td>Отказ</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>Ziyoda</strong> (Пачка 3, #2)</td>
        <td><span class="score-badge score-red">4.5 / 10</span></td>
        <td>СНГ-акцент, запинки, опыт только в обзвоне бонусов онлайн-казино Pin-Up</td>
        <td>Отказ</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>Medical Graduate</strong> (Пачка 2, #1)</td>
        <td><span class="score-badge score-red">4.5 / 10</span></td>
        <td>Курский медвуз, ресторанный саппорт, очень сонный и неуверенный голос</td>
        <td>Отказ</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>Kamilla</strong> (IMG_3263 / 64)</td>
        <td><span class="score-badge score-red">4.0 / 10</span></td>
        <td>18 лет, приятный британский язык, но 0 опыта в реальных B2B продажах</td>
        <td>Отказ</td>
      </tr>
      <tr>
        <td>16</td>
        <td><strong>Akhmaral</strong> (Пачка 1, #1)</td>
        <td><span class="score-badge score-red">3.0 / 10</span></td>
        <td>Сильный акцент, заикания, призналась, что нет опыта в продажах</td>
        <td>Отказ</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">2. Детальные профили топ-3 финалистов для тестового прозвона</div>
  <div class="grid-3">
    
    <div class="candidate-card featured">
      <div class="cand-header">
        <span class="cand-name">🥇 Татьяна</span>
        <span class="score-badge score-green">9.8 / 10</span>
      </div>
      <div class="cand-stat"><strong>Опыт:</strong> 8+ лет в США · Full-Desk Recruiter</div>
      <div class="cand-desc">
        Идеальное попадание: 8 лет B2B звонков именно по США. Не боится отказов. Звучит уверенно, структурно и по-деловому. Готова вести переговоры с владельцами бизнеса на равных.
      </div>
    </div>

    <div class="candidate-card featured">
      <div class="cand-header">
        <span class="cand-name">🥇 Jane</span>
        <span class="score-badge score-green">9.8 / 10</span>
      </div>
      <div class="cand-stat"><strong>Опыт:</strong> 10+ лет B2B Sales · 7 лет Remote</div>
      <div class="cand-desc">
        Ветеран B2B cold calling. Глубокий, авторитетный тембр голоса. Владелец американской компании воспримет ее как зрелого партнера. Закрывала крупные корпоративные сделки.
      </div>
    </div>

    <div class="candidate-card featured">
      <div class="cand-header">
        <span class="cand-name">🥈 Steffy Wambui</span>
        <span class="score-badge score-green">9.5 / 10</span>
      </div>
      <div class="cand-stat"><strong>Опыт:</strong> 5 лет Outbound SDR · C2 English</div>
      <div class="cand-desc">
        Безупречный английский уровня C2. Говорит на языке воронки продаж: выход на Decision Makers, квалификация лидов, обход секретарей. Высокая энергетика и позитив.
      </div>
    </div>

  </div>

  <div class="page-break"></div>

  <!-- PAGE 2: TEST TRIAL BRIEF FOR 35 LEADS -->
  <div class="header">
    <div class="header-left">
      <h1>Бриф тестового задания: Прозвон 35 целевых лидов (США)</h1>
      <p>Инструкция для кандидата, скрипт первого контакта и ключевые KPI оценки</p>
    </div>
    <div class="badge">Live 35-Call Trial Run</div>
  </div>

  <div class="brief-box">
    <div class="brief-title">🎯 Задача оператора на 35 тестовых звонков:</div>
    <p style="font-size: 7.8pt; line-height: 1.4; color: #cbd5e1;">
      Связаться с владельцем или менеджером септической компании, за 30 секунд озвучить комплимент их 5★ репутации в Google Maps, предложить взглянуть на готовый мобильный сайт-витрину на <strong>zonus.co/[slug]</strong> и получить согласие на отправку SMS со ссылкой.
    </p>
    
    <div style="margin-top: 8px; font-weight: 800; font-size: 8pt; color: #34d399;">
      ГОТОВЫЙ 30-СЕКУНДНЫЙ СКРИПТ ВХОДА (OPENING SCRIPT):
    </div>
    <div class="script-box">
“Hi [Owner Name], my name is [Caller Name]. Quick call — I saw you guys have an awesome 4.9-star rating in [City], but noticed your Google Maps listing doesn't have a direct website button. 

We actually put together a clean 1-page mobile showcase for [Company Name] featuring your top reviews and a 10-second estimate tool: zonus.co/[slug]

Mind if I text over a few quick screenshots or the link to this cell so you can take 10 seconds to look over lunch?”
    </div>
  </div>

  <div class="section-title">3. Отработка 3 главных возражений (Objection Handling)</div>
  <div class="rules-grid">
    
    <div class="rule-card">
      <strong>1. «I'm busy / on a jobsite right now» (Занят на объекте):</strong>
      <p style="color: #475569; margin-top: 2px;">
        <em>«Totally get it! I won't hold you. I'll just text the link to this cell so you can scroll it later whenever you're back in the truck. Sound good?»</em><br>
        <strong>Смысл:</strong> Не задерживаем, проявляем уважение к труду, фиксируем отправку ссылки в SMS.
      </p>
    </div>

    <div class="rule-card">
      <strong>2. «We've been in business 20 years, don't need a site»:</strong>
      <p style="color: #475569; margin-top: 2px;">
        <em>«100% respect on 20 years! The only reason we built it: younger homeowners moving into [City] don't know the local names yet and tap whoever has a clean page on Maps. Just wanted to show your crew first!»</em><br>
        <strong>Смысл:</strong> Не спорим, объясняем приток новых молодых жильцов города.
      </p>
    </div>

    <div class="rule-card">
      <strong>3. «How much is this going to cost me?»:</strong>
      <p style="color: #475569; margin-top: 2px;">
        <em>«It’s a flat $495 one-time — zero subscriptions or monthly fees. That’s literally one single pump-out or cleanout job in [City], so it pays for itself on the first call. Take a look at the preview first and see what you think!»</em><br>
        <strong>Смысл:</strong> Якорь цены $495 равен ровно 1 выезду. Отсутствие скрытых подписок.
      </p>
    </div>

    <div class="rule-card">
      <strong>4. Золотое правило AGENTS.md (No Fear-Based Framing):</strong>
      <p style="color: #b91c1c; margin-top: 2px;">
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
  console.log('Generating Candidates Analysis & Trial Brief PDF via Playwright...');
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
  console.log(`✅ PDF successfully generated at: ${OUTPUT_PDF}`);
  console.log(`✅ Artifact saved at: ${ARTIFACT_PDF}`);
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
