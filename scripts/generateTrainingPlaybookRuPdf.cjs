const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_PDF = path.join(process.cwd(), 'Cold_Call_Training_Playbook_RU.pdf');
const ARTIFACT_PDF = '/Users/workpc/.gemini/antigravity/brain/c532ba69-f1f6-4351-8442-ec293734333e/Cold_Call_Training_Playbook_RU.pdf';

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Zonus Studio • Руководство по B2B-продажам и регламент холодных звонков (RU)</title>
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
      <h1>Обучающий плейбук B2B-менеджера по продажам</h1>
      <p>Специфика рынка септиков США, психология подрядчиков, УТП предложения $2,500 и красные линии</p>
    </div>
    <div class="badge">Zonus Sales Playbook · Версия 3.0</div>
  </div>

  <div class="section-title">1. Контекст ниши и психологический портрет клиента</div>
  <div class="card-grid-3">
    <div class="card">
      <div class="card-title"><span class="tag tag-blue">Кто клиент</span> Владельцы септик-бизнесов</div>
      <p>Мужчины 35–60 лет, владельцы бригад по откачке, монтажу септиков и земляным работам в США. 80% времени находятся в пикапе (Ford F-250 / Chevy Silverado) или на объекте у экскаватора.</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="tag tag-amber">Их боли</span> Осада спамерами</div>
      <p>Получают по 5–10 звонков в день от индийских агентств (<em>«Hello sir, I saw your Google Maps...»</em>). Любой намек на длинную заученную речь вызывает мгновенный сброс трубки.</p>
    </div>
    <div class="card">
      <div class="card-title"><span class="tag tag-green">Что ценят</span> Прямоту и конкретику</div>
      <p>Уважают короткий разговор (15–20 сек), равный мужской тон без заискивания, реальные цифры окупаемости и факт того, что под них уже сделана готовая работа.</p>
    </div>
  </div>

  <div class="section-title">2. Главные преимущества нашего предложения для клиента (Контекст менеджера)</div>
  <div class="card-grid-2">
    <div class="card highlight">
      <div class="card-title" style="color: #166534;">🔥 1. Сайт УЖЕ создан персонально под него (Не концепт)</div>
      <p>Мы не предлагаем «разработку с нуля». Мы уже перенесли его реальные 5★ отзывы из Google, указали его прямой телефон и точный список услуг: <strong>zonus.co/[slug]</strong>. Он смотрит готовый продукт.</p>
    </div>

    <div class="card highlight">
      <div class="card-title" style="color: #166534;">🎯 2. Психологический заход через «Проверку» (IKEA-эффект)</div>
      <p>Мы не кричим «Купи сайт!». Мы просим: <em>«Глянь, всё ли мы указали правильно, и скинь фото твоих траков — мы сразу их добавим»</em>. Подрядчик переходит по ссылке ради контроля информации.</p>
    </div>

    <div class="card highlight">
      <div class="card-title" style="color: #166534;">💰 3. Железная математика окупаемости ($2,500 под ключ)</div>
      <p>В септическом бизнесе одна замена поля фильтрации (drain field) или монтаж бака приносит <strong>$6,000 – $15,000</strong>. Сайт окупается с <strong>одного-единственного</strong> серьезного звонка.</p>
    </div>

    <div class="card highlight">
      <div class="card-title" style="color: #166534;">⚡ 4. Запуск за 24 часа и НОЛЬ ежемесячных платежей</div>
      <p>Маркетинговые агентства берут $500–$1,000/мес бесконечно. У нас — разовая оплата $2,500, никаких подписок, и сайт полностью запущен на его официальном домене в течение <strong>24 часов</strong>.</p>
    </div>
  </div>

  <div class="section-title">3. Красные линии и запреты (Strict Rules)</div>
  <div class="card-grid-3">
    <div class="card warning">
      <div class="card-title" style="color: #991b1b;">🚫 Запрет слов-страшилок</div>
      <p>Строго запрещены слова <em>«safe link»</em>, <em>«not spam»</em>, <em>«not a virus»</em>, <em>«afraid to click»</em>. Альтернативу предлагать только через удобство: <em>«Happy to text screenshots if easier!»</em></p>
    </div>
    <div class="card warning">
      <div class="card-title" style="color: #991b1b;">🚫 Запрет «Awesome!» и фальши</div>
      <p>Не использовать приторные слова колл-центров (<em>Awesome!, Amazing!, Super!</em>). Только спокойные, вежливые маркеры: <strong>«Got it»</strong>, <strong>«Sounds good»</strong>, <strong>«Fair enough»</strong>, <strong>«Perfect»</strong>.</p>
    </div>
    <div class="card warning">
      <div class="card-title" style="color: #991b1b;">🚫 Запрет «воды» про Google Maps</div>
      <p>Никаких фраз <em>«Мы смотрели ваш профиль в картах и заметили, что нет сайта»</em>. Это маркер спама. Сразу переходить к факту: мы сделали готовый сайт под вашу компанию.</p>
    </div>
  </div>

  <div class="footer-note">Страница 1 из 3 · Zonus Studio Outbound Sales Playbook · Confidential</div>

  <div class="page-break"></div>

  <!-- PAGE 2: DIALOGUE STRUCTURE, CALL 1, SMS & CALL 2 -->
  <div class="header">
    <div class="header-left">
      <h1>Структура диалога и регламент звонков (Call 1 ➔ SMS ➔ Call 2)</h1>
      <p>Пошаговый сценарий первого контакта, фиксация утреннего звонка, секрет SMS-превью и закрытие</p>
    </div>
    <div class="badge">Live Execution Scripts</div>
  </div>

  <div class="section-title">4. Звонок №1: Первый контакт (15–20 секунд максимум)</div>
  <div class="card dark">
    <div style="font-weight: 800; color: #34d399; font-size: 7.6pt; margin-bottom: 2px;">
      ЭТАЛОННЫЙ СКРИПТ ВХОДА (OPENING PITCH):
    </div>
    <div class="script-box">
“Hey [Owner Name], this is [Caller Name]. Quick call — we actually put together a custom website specifically for [Company Name].

It already has your real customer reviews, your phone number, and your exact services.

Wanted to text you the link so you can double-check if we got all your details right, and see if you have any photos of your trucks or crew you'd want added in. Is this cell good to text?”
    </div>
  </div>

  <div class="section-title">5. Что делать после согласия клиента («Yeah, send it») — Выход за 5 секунд</div>
  <div class="card" style="background: #f0fdf4; border: 1.5px solid #86efac; margin-bottom: 7px;">
    <p><strong>НИ В КОЕМ СЛУЧАЕ НЕ ПРОДОЛЖАТЬ ПРЕЗЕНТАЦИЮ!</strong> Клиент за рулем или на объекте. Немедленно фиксируем номер и время перезвона на <strong>следующее утро в 9:30 AM (US time)</strong>. Это избавляет операторов от ночной работы (в Европе это комфортные 17:30).</p>
    <div class="script-box-alt">
<strong>Продавец:</strong> «Got it, sending it over right now. Take a quick look tonight whenever you're off the road, and I'll give you a short buzz tomorrow morning around 9:30 to see what you think. Sound good?»
<strong>Клиент:</strong> «Sounds good.»
<strong>Продавец:</strong> «Appreciate it, [Owner Name]. Talk to you tomorrow morning.» <em>(Сразу сброс звонка).</em>
    </div>
  </div>

  <div class="section-title">6. Секрет доставки SMS: Ссылка ОТДЕЛЬНЫМ сообщением для генерации превью</div>
  <div class="card-grid-2">
    <div class="card">
      <div class="card-title"><span class="tag tag-amber">Почему это важно</span> Алгоритм iMessage / Android</div>
      <p>Если ссылка спрятана в длинном абзаце текста, смартфоны часто не подгружают графическую карточку. Когда ссылка идет отдельным коротким сообщением, iOS и Android генерируют <strong>огромную интерактивную превью-карточку</strong> с фото трака и рейтингом 5★!</p>
    </div>

    <div class="card">
      <div class="card-title"><span class="tag tag-green">Двухэтапная отправка</span> Регламент SMS</div>
      <p><strong>Сообщение 1:</strong> Текст с представлением.<br>
      <strong>Сообщение 2:</strong> Чистая ссылка <code>zonus.co/[slug]</code>.<br>
      <strong>Сообщение 3:</strong> Предложение проверить инфу и напоминание про утренний звонок в 9:30.</p>
    </div>
  </div>

  <div class="card dark" style="margin-top: 2px;">
    <div style="color: #38bdf8; font-weight: 800; font-size: 7.2pt; margin-bottom: 2px;">ШАБЛОНЫ СООБЩЕНИЙ ДЛЯ ОТПРАВКИ:</div>
    <div class="script-box" style="font-size: 6.9pt; line-height: 1.32;">
<span style="color: #94a3b8;">// Сообщение 1 (Интро):</span>
“Hey [Owner Name], [Caller Name] here! Here’s the custom page we put together for [Company Name]:”

<span style="color: #94a3b8;">// Сообщение 2 (Только ссылка — для красивого превью):</span>
https://zonus.co/[slug]

<span style="color: #94a3b8;">// Сообщение 3 (Действие):</span>
“Take a quick scroll tonight to make sure we got your services and contact info right. If you have any truck or crew photos you want added, we can plug them right in! I’ll give you a quick buzz tomorrow morning around 9:30 AM.”
    </div>
  </div>

  <div class="section-title">7. Звонок №2: Закрытие на следующее утро (9:30 AM US Time / 17:30 MSK)</div>
  <div class="card" style="background: #f8fafc; border: 1.5px solid #cbd5e1;">
    <div class="script-box-alt">
<strong>Вход через проверку:</strong> «Morning [Owner Name], [Caller Name] checking back as promised. Did you get a chance to open that link last night? Did we get all your services and info right, or is there anything we should tweak?»
<br><br>
<strong>Питч $2,500 за 24 часа:</strong> «We do the full turnkey setup for a flat $2,500 — we connect your official dot-com domain, set up Google indexing, fast mobile hosting, and zero monthly fees. In your business, literally one single drain field replacement or tank job brings in $6,000 to $10,000+, so it pays for itself on the first serious call. If you text me those photos today, <strong>we can have your official site fully live within 24 hours.</strong> Want us to lock this in for you?»
<br><br>
<strong>Сплит 50/50 (Downsell при сомнениях):</strong> «Understood. We can split it: $1,250 today to go live with your custom domain and photos within 24 hours, and the remaining $1,250 in 30 days after you start taking calls through it. Fair enough?»
    </div>
  </div>

  <div class="footer-note">Страница 2 из 3 · Zonus Studio Outbound Sales Playbook · Confidential</div>

  <div class="page-break"></div>

  <!-- PAGE 3: COMPLETE OBJECTIONS MATRIX & CRM WORKFLOW -->
  <div class="header">
    <div class="header-left">
      <h1>Матрица отработки возражений и регламент CRM</h1>
      <p>10 готовых ответов на сопротивление клиентов и правила работы в звонилке Zadarma</p>
    </div>
    <div class="badge">Objection Handling & Tech Guide</div>
  </div>

  <div class="section-title">8. Отработка возражений на ЗВОНКЕ №1 (Вход на SMS)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Возражение</th>
        <th style="width: 50%;">Готовый ответ на английском (Скрипт)</th>
        <th style="width: 25%;">Смысл и логика</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>«How much does this cost?»</strong><br>(Сколько это стоит?)</td>
        <td><em>«It’s completely free to check out the preview — zero obligation. If you like it and want to launch it under your official domain, it’s a flat one-time setup with zero monthly fees. Just wanted to see if you like what we put together first. Is this cell good to text?»</em></td>
        <td>Снимаем барьер. Просмотр бесплатный. Фиксируем отсутствие абонентки.</td>
      </tr>
      <tr>
        <td><strong>«I'm busy / on a jobsite»</strong><br>(Я на объекте / занят)</td>
        <td><em>«100%, I won't hold you. I'll just text the link right now. Take a 15-second scroll tonight whenever you're off the road, and I'll give you a short buzz tomorrow morning around 9:30. Sound good?»</em></td>
        <td>Уважение ко времени. Фиксация отправки ссылки и звонка на утро.</td>
      </tr>
      <tr>
        <td><strong>«We already have a site»</strong><br>(У нас уже есть сайт)</td>
        <td><em>«Got it. Most contractors we work with already had an old site from 10 years ago or a slow Facebook page that takes forever on phones. Ours is built specifically for 1-tap emergency mobile calls. Take 15 seconds tonight just to compare. Fair enough to text it over?»</em></td>
        <td>Не критикуем старый сайт. Предлагаем сравнить с молниеносной мобильной версией.</td>
      </tr>
      <tr>
        <td><strong>«Word-of-mouth only»</strong><br>(Только сарафанка)</td>
        <td><em>«100% respect on 20 years — word-of-mouth is the best business there is. The only reason we put this together: younger homeowners moving into [City] don't know the local names yet. When their tank backs up, they search Google on their phone. Mind if I text it over to take a look?»</em></td>
        <td>Признаем авторитет. Указываем на новых жильцов города, ищущих через телефон.</td>
      </tr>
      <tr>
        <td><strong>«Fully booked / No time»</strong><br>(Завал работы)</td>
        <td><em>«That’s a great problem to have! This isn't about getting 50 small pump-outs — it’s about filtering for the high-dollar $8,000 to $12,000 drain field replacements. Take a look tonight, and you have it in your back pocket. Good to text to this number?»</em></td>
        <td>Позиционируем сайт как фильтр на высокочековые объекты $10,000+.</td>
      </tr>
      <tr>
        <td><strong>«Just send an email»</strong><br>(Скиньте на почту)</td>
        <td><em>«Happy to send an email as well! But since it’s built specifically for smartphones, it looks best right on your cell screen. I’ll text the link so you have it in one tap, and drop an email too. What's your best email address?»</em></td>
        <td>Соглашаемся на email, но аргументируем удобство просмотра по SMS.</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">9. Отработка возражений на ЗВОНКЕ №2 (Закрытие на $2,500)</div>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Возражение</th>
        <th style="width: 50%;">Готовый ответ на английском (Скрипт)</th>
        <th style="width: 25%;">Смысл и логика</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>«$2,500 is too expensive»</strong><br>(Слишком дорого)</td>
        <td><em>«Understood. But in the septic business, literally one single tank replacement or drain field job brings in $6,000 to $10,000+. So this pays for itself on your very first big call. Plus, zero monthly fees. If $2,500 is tight, we can split it: $1,250 now to launch within 24 hours, and $1,250 in 30 days. Fair enough?»</em></td>
        <td>Привязка к математике окупаемости ниши (1 объект = 3x возврат) + сплит 50/50.</td>
      </tr>
      <tr>
        <td><strong>«Didn't have time to look»</strong><br>(Не успел посмотреть)</td>
        <td><em>«Totally understand, long day yesterday! Tell you what — pull it up right now on your phone while I'm on the line, takes literally 15 seconds to scroll... Let me know when it opens.» (Или перенос на обед в 12:30).</em></td>
        <td>Открываем вместе за 15 секунд прямо на линии либо фиксируем обеденный перерыв.</td>
      </tr>
      <tr>
        <td><strong>«Talk to wife / partner»</strong><br>(Посоветуюсь с женой)</td>
        <td><em>«100%, definitely want everyone on the same page. Just forward that text with the link to them: zonus.co/[slug]. What do you think is the main question they'll have? ... Got it. I’ll follow up tomorrow at 10 AM after you look it over together. Sound good?»</em></td>
        <td>Уважение к партнерам. Выявление скрытых сомнений. Фиксация звонка.</td>
      </tr>
      <tr>
        <td><strong>«Any monthly fees?»</strong><br>(Есть ли ежемесячные?)</td>
        <td><em>«Zero monthly fees. Traditional agencies charge $500 every single month. With us, it’s a flat one-time $2,500, we launch it within 24 hours, and it’s 100% yours forever. No recurring bills.»</em></td>
        <td>Убийственное УТП против агентств. Владение сайтом навсегда без подписок.</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">10. Регламент работы в CRM-звонилке и Zadarma</div>
  <div class="card-grid-3">
    <div class="card">
      <div class="card-title">📞 Звонки через Zadarma</div>
      <p>Нажимайте кнопку <strong>«Call Now»</strong> (открывает приложение Zadarma по протоколу <code>tel:</code> или <code>sip:</code>) либо копируйте номер кнопкой <strong>«Copy Phone»</strong> для вставки в веб-фон <code>my.zadarma.com</code>.</p>
    </div>
    <div class="card">
      <div class="card-title">💾 Фиксация результатов</div>
      <p>После каждого звонка обязательно нажимайте статус: 🟢 <strong>Agreed</strong> (согласен на SMS), 🟡 <strong>Callback</strong> (перезвонить), ⚪ <strong>No Answer</strong> (не ответил), 🔴 <strong>Declined</strong> (отказ). Данные сохраняются мгновенно!</p>
    </div>
    <div class="card">
      <div class="card-title">📝 Заметки и Telegram</div>
      <p>В поле заметки кратко пишите суть: <em>«жена взяла трубку, набрать в 10:00»</em>. Все нажатия кнопок логируются в защищенную базу и моментально дублируются в Telegram руководства.</p>
    </div>
  </div>

  <div class="footer-note">Страница 3 из 3 · Zonus Studio Outbound Sales Playbook · Confidential Internal Training</div>

</body>
</html>`;

async function generatePdf() {
  console.log('Generating Cold Call Training Playbook RU via Playwright...');
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
  console.log(`✅ Russian PDF successfully generated at: ${OUTPUT_PDF}`);
  console.log(`✅ Artifact saved at: ${ARTIFACT_PDF}`);
}

generatePdf().catch(err => {
  console.error('Error generating Russian PDF:', err);
  process.exit(1);
});
