const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Рынок септиков во Флориде: Аналитическое исследование и Стратегический гайд для подрядчика</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

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
    color: #0f172a;
    background: #ffffff;
    font-size: 8.5pt;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page-break {
    page-break-after: always;
  }

  .avoid-break {
    page-break-inside: avoid;
  }

  /* Header Card */
  .header-card {
    background: linear-gradient(135deg, #064e3b 0%, #047857 40%, #0f172a 100%);
    color: #ffffff;
    padding: 16px 20px;
    border-radius: 10px;
    margin-bottom: 12px;
    position: relative;
  }

  .badge-tag {
    display: inline-block;
    background: rgba(52, 211, 153, 0.2);
    border: 1px solid #34d399;
    color: #a7f3d0;
    font-size: 6.8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 2.5px 8px;
    border-radius: 20px;
    margin-bottom: 6px;
  }

  .header-card h1 {
    font-size: 15pt;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 4px;
    letter-spacing: -0.3px;
  }

  .header-card p {
    font-size: 8pt;
    color: #e2e8f0;
    line-height: 1.35;
  }

  .meta-pills {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    font-size: 7.2pt;
    color: #cbd5e1;
    font-family: 'JetBrains Mono', monospace;
  }

  .meta-pill {
    background: rgba(255, 255, 255, 0.12);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  /* Grid metrics */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }

  .metric-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 9px 12px;
    text-align: left;
  }

  .metric-val {
    font-size: 14pt;
    font-weight: 800;
    color: #064e3b;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1.1;
  }

  .metric-label {
    font-size: 7.2pt;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-top: 3px;
  }

  .metric-sub {
    font-size: 6.8pt;
    color: #64748b;
    margin-top: 2px;
  }

  /* Section Title */
  .section-title {
    font-size: 10.5pt;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 12px 0 6px 0;
    padding-bottom: 4px;
    border-bottom: 1.5px solid #064e3b;
    letter-spacing: -0.2px;
  }

  .section-title span.num {
    background: #064e3b;
    color: #fff;
    width: 17px;
    height: 17px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 7.5pt;
    font-weight: 800;
  }

  /* Tables */
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
    font-size: 7.5pt;
  }

  table.data-table th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    text-align: left;
    padding: 5px 8px;
    font-size: 7.2pt;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  table.data-table td {
    padding: 4.5px 8px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }

  table.data-table tr:nth-child(even) td {
    background: #f8fafc;
  }

  .badge-status {
    display: inline-block;
    padding: 1.5px 6px;
    border-radius: 4px;
    font-size: 6.6pt;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
  }

  .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  .badge-green { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
  .badge-yellow { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .badge-blue { background: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }

  /* Info boxes */
  .callout-box {
    background: #f0fdf4;
    border-left: 3.5px solid #059669;
    padding: 8px 12px;
    border-radius: 0 6px 6px 0;
    margin-bottom: 8px;
    font-size: 7.8pt;
  }

  .callout-box.warn {
    background: #fffbeb;
    border-left-color: #d97706;
  }

  .callout-box.danger {
    background: #fef2f2;
    border-left-color: #dc2626;
  }

  .callout-box strong {
    color: #0f172a;
    display: block;
    margin-bottom: 2px;
    font-size: 8pt;
  }

  /* Two Column layout */
  .two-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 8px;
  }

  .panel-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 9px 12px;
  }

  .panel-card h4 {
    font-size: 8.5pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  ul.bullet-list {
    list-style: none;
    padding: 0;
  }

  ul.bullet-list li {
    position: relative;
    padding-left: 14px;
    margin-bottom: 4px;
    font-size: 7.6pt;
    color: #334155;
  }

  ul.bullet-list li::before {
    content: "•";
    position: absolute;
    left: 4px;
    color: #059669;
    font-weight: 900;
    font-size: 9pt;
  }

  ul.bullet-list.danger li::before {
    color: #dc2626;
  }

  .footer-bar {
    margin-top: 10px;
    padding-top: 6px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 6.8pt;
    color: #64748b;
    font-family: 'JetBrains Mono', monospace;
  }

  .highlight-quote {
    background: #f1f5f9;
    border-left: 3px solid #475569;
    padding: 6px 10px;
    font-style: italic;
    font-size: 7.4pt;
    color: #334155;
    margin-bottom: 6px;
    border-radius: 0 4px 4px 0;
  }
</style>
</head>
<body>

  <!-- ==================== СТРАНИЦА 1 ==================== -->
  <div class="page-break">
    <div class="header-card">
      <div class="badge-tag">Отраслевое исследование • Флорида, США</div>
      <h1>Рынок септиков во Флориде: Аналитика и Стратегия</h1>
      <p>Комплексный срез 387 действующих компаний на Google Maps, разбор бизнес-модели, скрытых рисков и точек кратного роста для локального подрядчика.</p>
      <div class="meta-pills">
        <span class="meta-pill">Выборка: 387 компаний</span>
        <span class="meta-pill">12 ключевых хабов FL</span>
        <span class="meta-pill">Глубина: сайты, отзывы, законы FDEP</span>
        <span class="meta-pill">Дата: Ноябрь 2026</span>
      </div>
    </div>

    <!-- Метрики -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-val">387</div>
        <div class="metric-label">Всего игроков</div>
        <div class="metric-sub">В 12 округах штата</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">32.1%</div>
        <div class="metric-label">Сайты не работают</div>
        <div class="metric-sub">66 нет сайта, 58 с ошибкой/404</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">65.1%</div>
        <div class="metric-label">Профильные септики</div>
        <div class="metric-sub">252 узких специалиста</div>
      </div>
      <div class="metric-card">
        <div class="metric-val">4.63★</div>
        <div class="metric-label">Средний рейтинг</div>
        <div class="metric-sub">Поляризация 5★ vs 1★</div>
      </div>
    </div>

    <!-- Анализ статуса сайтов -->
    <div class="section-title"><span class="num">1</span> Анализ доступности сайтов в Google Maps</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Категория доступности</th>
          <th>Компаний</th>
          <th>Доля рынка</th>
          <th>Диагноз и практический вывод для рынка</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>ACTIVE (Живой сайт)</strong></td>
          <td>263</td>
          <td><span class="badge-status badge-green">68.0%</span></td>
          <td>Сайт отвечает кодом 200. Однако у 80% из них отсутствует мобильная конверсия (нет кнопки прямого вызова 24/7).</td>
        </tr>
        <tr>
          <td><strong>NO_SITE (Нет сайта)</strong></td>
          <td>66</td>
          <td><span class="badge-status badge-red">17.1%</span></td>
          <td>В карточке Google Maps отсутствует ссылка на сайт. Теряют до 40% клиентов, требующих онлайн-проверку цен и доверия.</td>
        </tr>
        <tr>
          <td><strong>ERROR / HTTP 4xx/5xx</strong></td>
          <td>45</td>
          <td><span class="badge-status badge-yellow">11.6%</span></td>
          <td>Ссылка ведет на упавший хостинг, страницу ошибки или заблокированный домен. Слив платного трафика из карт в никуда.</td>
        </tr>
        <tr>
          <td><strong>DEAD / TIMEOUT</strong></td>
          <td>13</td>
          <td><span class="badge-status badge-red">3.4%</span></td>
          <td>Домен просрочен, сервер не отвечает. Полностью брошенный веб-ресурс при работающем номере телефона.</td>
        </tr>
      </tbody>
    </table>

    <div class="callout-box">
      <strong>Ключевой коммерческий инсайт по сайтам:</strong>
      Среди чисто профильных септик-компаний (без гигантских сантех-сетей) <strong>ровно 32.5% не имеют функционирующего сайта</strong>. Это означает, что новый подрядчик с современным, быстрым мобильным сайтом и прозрачным позиционированием мгновенно опережает треть всех конкурентов в округе.
    </div>

    <!-- Структура конкуренции -->
    <div class="section-title"><span class="num">2</span> Сегментация игроков по объему отзывов и весу</div>
    <div class="two-cols">
      <div class="panel-card">
        <h4>🏢 Сантех- и HVAC-гиганты (34.9%)</h4>
        <ul class="bullet-list">
          <li><strong>Кто это:</strong> Frank Gay (15k+ отзывов), Snyder AC (13k+), Acree (11k+), Roto-Rooter (4k+), Wind River.</li>
          <li><strong>Специфика:</strong> Огромные корпоративные колл-центры. Септики для них — лишь повод захватить звонок на аварийную сантехнику.</li>
          <li><strong>Слабость:</strong> Домовладельцы массово жалуются на наемных сейлзов, которые навязывают замену систем за \$15k–\$25k там, где нужен копеечный ремонт.</li>
        </ul>
      </div>
      <div class="panel-card">
        <h4>🚜 Локальные профильные мастера (65.1%)</h4>
        <ul class="bullet-list">
          <li><strong>Кто это:</strong> 252 независимых подрядчика (Miller Septic, Rohrer's, Lee Kirk & Sons, Nu Septic и др.).</li>
          <li><strong>Объем отзывов:</strong> 78.4% имеют <strong>менее 100 отзывов</strong>. Семейные бизнесы на 1–3 трака.</li>
          <li><strong>Преимущество:</strong> Высочайшее доверие клиентов к конкретным мастерам по имени. Слабое звено — хаотичный маркетинг и плохой сервис на телефоне.</li>
        </ul>
      </div>
    </div>

    <div class="footer-bar">
      <span>Florida Septic Market Research • Confidential</span>
      <span>Стр. 1 из 4</span>
    </div>
  </div>

  <!-- ==================== СТРАНИЦА 2 ==================== -->
  <div class="page-break">
    <div class="section-title"><span class="num">3</span> Географическое распределение по 12 ключевым хабам Флориды</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Регион / Округ</th>
          <th>Игроков</th>
          <th>Плотность рынка</th>
          <th>Специфика грунтов и специфика спроса</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Jacksonville (Duval)</strong></td>
          <td>57</td>
          <td><span class="badge-status badge-red">Высокая</span></td>
          <td>Огромный старый жилой фонд. Частые отказы дренажных полей из-за глинистых прослоек и проливных дождей.</td>
        </tr>
        <tr>
          <td><strong>Ocala (Marion)</strong></td>
          <td>53</td>
          <td><span class="badge-status badge-red">Столица септиков</span></td>
          <td>Крупнейшая плотность частных септиков в США. Центр коневодства и загородных ранчо. Огромный объем откачек.</td>
        </tr>
        <tr>
          <td><strong>Fort Myers / Cape Coral</strong></td>
          <td>52</td>
          <td><span class="badge-status badge-yellow">Сверхдоходная</span></td>
          <td>Бурный рост новостроек. После ураганов Иэн и Милтон огромный дефицит подрядчиков на полную замену систем.</td>
        </tr>
        <tr>
          <td><strong>Orlando (Orange & Seminole)</strong></td>
          <td>48</td>
          <td><span class="badge-status badge-red">Высокая</span></td>
          <td>Зона озер. Жесткий эко-контроль стоков. Домовладельцы с высокими доходами, чувствительные к аккуратности газона.</td>
        </tr>
        <tr>
          <td><strong>Tampa Bay (Hillsborough)</strong></td>
          <td>46</td>
          <td><span class="badge-status badge-red">Жесткая</span></td>
          <td>Засилье корпоративных франшиз (Mr. Rooter, Acree). Сильный дефицит честных семейных профильных мастеров.</td>
        </tr>
        <tr>
          <td><strong>Port St. Lucie / Treasure Coast</strong></td>
          <td>38</td>
          <td><span class="badge-status badge-green">Золотая жила</span></td>
          <td>Зона лагуны Indian River. Действует приказ FDEP об обязательной замене септиков на системы снижения азота.</td>
        </tr>
        <tr>
          <td><strong>Lakeland (Polk County)</strong></td>
          <td>30</td>
          <td><span class="badge-status badge-green">Умеренная</span></td>
          <td>Связующий округ между Орландо и Тампой. Большие участки, низкая требовательность клиентов, стабильный кэш.</td>
        </tr>
        <tr>
          <td><strong>Tallahassee (Capital & Wakulla)</strong></td>
          <td>27</td>
          <td><span class="badge-status badge-green">Низкая</span></td>
          <td>Север Флориды. Близость к источникам Wakulla Springs. Огромные гранты штата на модернизацию септиков.</td>
        </tr>
        <tr>
          <td><strong>Sarasota & Manatee</strong></td>
          <td>20</td>
          <td><span class="badge-status badge-green">Премиум-рынок</span></td>
          <td>Богатейшие пригородные комьюнити. Чек на замену септика на 25–40% выше среднего по штату.</td>
        </tr>
        <tr>
          <td><strong>Deltona, Pensacola, Gainesville</strong></td>
          <td>16</td>
          <td><span class="badge-status badge-blue">Локальные ниши</span></td>
          <td>Меньше сетевиков, преобладают старые монополисты с низким качеством сервиса.</td>
        </tr>
      </tbody>
    </table>

    <!-- Анализ болей из отзывов -->
    <div class="section-title"><span class="num">4</span> Анатомия отзывов клиентов: Почему ставят 1★ и 5★</div>
    
    <div class="two-cols">
      <div class="panel-card" style="border-top: 3px solid #dc2626;">
        <h4 style="color: #991b1b;">🚫 За что ставят 1★ (Где тонут конкуренты)</h4>
        
        <div class="highlight-quote">
          «Приехали откачать бак за $400, сказали поле мертво и выставили счет на $12,000! Другие всё починили за $3,800. Развод!»
        </div>
        <ul class="bullet-list danger">
          <li><strong>Хищнический допродаж (Predatory Upsell):</strong> Попытка с порога запугать поломкой поля на \$12k–\$15k без видеодоказательств.</li>
          <li><strong>Уничтожение газона:</strong> 20-тонные траки продавливают мягкий песок, ломают полив и оставляют траншеи на газоне St. Augustine.</li>
          <li><strong>Исчезновение со связи (Ghosting):</strong> Берут аванс на замену поля, ждут пермит 5 недель и не берут трубку, пока у клиента топит дом.</li>
        </ul>
      </div>

      <div class="panel-card" style="border-top: 3px solid #059669;">
        <h4 style="color: #065f46;">⭐ За что платят тысячи долларов и ставят 5★</h4>
        
        <div class="highlight-quote">
          «Авария в субботу вечером, канализация встала. Майк и Чэд приехали сразу, аккуратно объехали деревья и спасли нас!»
        </div>
        <ul class="bullet-list">
          <li><strong>Выезд в выходные (Weekend Emergency):</strong> Готовность выехать в субботу вечером или в праздники — 100% гарантия лояльности.</li>
          <li><strong>Личный контакт с мастером:</strong> Клиенты благодарят конкретных мастеров по имени, если те объяснили проблему простым языком.</li>
          <li><strong>Идеальная чистота:</strong> Использование длинных шлангов (машина на дороге) и восстановление дерна после раскопок.</li>
        </ul>
      </div>
    </div>

    <div class="footer-bar">
      <span>Florida Septic Market Research • Confidential</span>
      <span>Стр. 2 из 4</span>
    </div>
  </div>

  <!-- ==================== СТРАНИЦА 3 ==================== -->
  <div class="page-break">
    <div class="section-title"><span class="num">5</span> Экономика услуг: Где скрыты реальные деньги, а где мышеловка</div>
    
    <div class="callout-box danger">
      <strong>«Ловушка откачки» (The Pumping Trap):</strong>
      Муниципальные полигоны Флориды (WWTP) подняли экологический сбор за слив откачанных отходов (septage disposal fees) до <strong>$0.12–$0.22 за галлон</strong>. Слив бака на 1,000 gal стоит \$120–\$220 только на въезде на станцию. Прибавив солярку и зарплату лицензированного водителя (CDL), откачка за \$350–\$450 приносит <strong>смешные \$80–\$120 чистой маржи</strong>.
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Услуга / Пакет</th>
          <th>Средний чек</th>
          <th>Себестоимость</th>
          <th>Чистая маржа</th>
          <th>Стратегическая роль в бизнесе</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Откачка бака (Pumping)</strong></td>
          <td>\$450 – \$650</td>
          <td>\$280 – \$390</td>
          <td><span class="badge-status badge-red">15 – 25%</span></td>
          <td><strong>Loss Leader (Вход в дом):</strong> Повод открыть люк и продать реальный ремонт.</td>
        </tr>
        <tr>
          <td><strong>Установка ревизионных люков (Risers)</strong></td>
          <td>\$550 – \$950</td>
          <td>\$90 – \$140</td>
          <td><span class="badge-status badge-green">75 – 80%</span></td>
          <td>Допродаж на месте за 40 мин. Клиент рад, что больше не надо копать газон.</td>
        </tr>
        <tr>
          <td><strong>Фильтр тонкой очистки (Effluent Filter)</strong></td>
          <td>\$350 – \$600</td>
          <td>\$40 – \$60</td>
          <td><span class="badge-status badge-green">80 – 85%</span></td>
          <td>Устанавливается на выходной тройник за 20 мин. Защищает дренажное поле.</td>
        </tr>
        <tr>
          <td><strong>Инспекция для риелторов (Realtor Inspection)</strong></td>
          <td>\$400 – \$750</td>
          <td>\$0 (только камера)</td>
          <td><span class="badge-status badge-green">90%+</span></td>
          <td>Чистый кэш. Формирует доверие и дружбу с топовыми агентствами недвижимости.</td>
        </tr>
        <tr>
          <td><strong>Восстановление поля (Terralift/Jetting)</strong></td>
          <td>\$2,800 – \$4,800</td>
          <td>\$300 – \$500</td>
          <td><span class="badge-status badge-green">75 – 80%</span></td>
          <td>Спасение забитого поля пневмоударом. Альтернатива замене за \$12k.</td>
        </tr>
        <tr>
          <td><strong>Замена дренажного поля (Drainfield Replacement)</strong></td>
          <td>\$8,000 – \$16,000</td>
          <td>\$3,800 – \$7,000</td>
          <td><span class="badge-status badge-blue">45 – 55%</span></td>
          <td>Основной генератор кассы. Требует пермита округа и 100 тонн песка.</td>
        </tr>
        <tr>
          <td><strong>Годовой сервисный контракт (ATU Maintenance)</strong></td>
          <td>\$350 – \$650 / год</td>
          <td>\$50 (2 выезда)</td>
          <td><span class="badge-status badge-green">85%+</span></td>
          <td><strong>Гарантированный пассивный доход (ARR):</strong> Обязателен по закону FL.</td>
        </tr>
      </tbody>
    </table>

    <!-- Геология и Климат -->
    <div class="section-title"><span class="num">6</span> Подводные камни климата и грунтов Флориды</div>
    <div class="two-cols">
      <div class="panel-card">
        <h4>🌊 Высокие грунтовые воды и «Всплытие бака»</h4>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 4px;">С июня по сентябрь (сезон ураганов) уровень воды поднимается к поверхности.</p>
        <ul class="bullet-list">
          <li><strong>Гидростатическое всплытие:</strong> Если откачать бак досуха в сезон дождей, вода снизу выдавит его, как поплавок, разорвав трубы к дому. Опытный мастер сразу заливает бак водой обратно.</li>
          <li><strong>Mounded Systems (Насыпи):</strong> В 70% случаев дренаж нельзя закапывать вглубь — его поднимают над уровнем земли, формируя насыпной холм из белого кварцевого песка.</li>
        </ul>
      </div>
      <div class="panel-card">
        <h4>🏛️ Закон FDEP и Гранты штата до $20,000</h4>
        <p style="font-size: 7.5pt; color: #475569; margin-bottom: 4px;">Закон <em>Clean Waterways Act</em> кардинально перекроил рынок септиков.</p>
        <ul class="bullet-list">
          <li><strong>Запрет обычных систем:</strong> В зонах вокруг источников (PFAs) обычные септики запрещены на участках до 1 акра. Обязательны аэрационные системы (ENR-OSTDS) за \$16k–\$25k.</li>
          <li><strong>Грантовая программа FL:</strong> Штат Флорида компенсирует домовладельцам до \$15,000–\$20,000 за замену. Подрядчик, который помогает жителям оформить этот грант, получает поток заказов без конкуренции.</li>
        </ul>
      </div>
    </div>

    <div class="footer-bar">
      <span>Florida Septic Market Research • Confidential</span>
      <span>Стр. 3 из 4</span>
    </div>
  </div>

  <!-- ==================== СТРАНИЦА 4 ==================== -->
  <div>
    <div class="section-title"><span class="num">7</span> Стратегическая дорожная карта: Как победить на рынке Флориды</div>

    <div class="two-cols">
      <div class="panel-card">
        <h4>🤝 3 секретных B2B-канала без затрат на рекламу</h4>
        <ul class="bullet-list">
          <li><strong>Сантехники (Plumbers):</strong> 80% обычных сантехников во Флориде не имеют лицензии на земляные работы и ассенизаторов. Договор с 10 сантехниками на реферальные \$300–\$500 за передачу септик-аварий дает стабильный поток без Google Ads.</li>
          <li><strong>Риелторские агентства:</strong> Предложите риелторам закрытие сделки: «Инспекция септика за 24 часа с цифровым видеоотчетом для банка». Они будут передавать каждого покупателя загородного дома.</li>
          <li><strong>База абонентского обслуживания (ARR):</strong> 400 контрактов на плановое ТО аэрационных систем генерируют **\$150,000–\$200,000 чистой прибыли в год**, которая покрывает лизинг техники и аренду базы еще до старта сезона.</li>
        </ul>
      </div>

      <div class="panel-card">
        <h4>🛡️ Доказательная диагностика (Борьба с недоверием)</h4>
        <ul class="bullet-list">
          <li><strong>Камера в руках клиента:</strong> Никогда не говорите о замене поля на словах. Опустите эндоскоп (Sewer Camera) и покажите видео на планшете. Когда клиент видит сдавленную трубу своими глазами, чек \$12,000 не вызывает сомнений.</li>
          <li><strong>Шланги 200 футов:</strong> Машина должна оставаться на асфальте. Никаких сломанных поливочных головок и развороченного дерна.</li>
          <li><strong>Фиксированные пакеты:</strong> Базовые цены на сайте снимают страх «развода» и отсекают неплатежеспособных клиентов.</li>
        </ul>
      </div>
    </div>

    <!-- Чек-лист оснащения идеальной компании -->
    <div class="section-title"><span class="num">8</span> Чек-лист оснащения конкурентоспособного подрядчика</div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>Категория</th>
          <th>Оптимальный состав оборудования / Требования</th>
          <th>Зачем это нужно во Флориде</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Технический парк</strong></td>
          <td>1 тяжелый трак 3,500 gal (Freightliner) + 1 легкий сервис-трак 1,200 gal (Ford F-550) + Мини-экскаватор с резиновыми гусеницами.</td>
          <td>Легкий трак заезжает в узкие элитные дворы без повреждения дорогого покрытия.</td>
        </tr>
        <tr>
          <td><strong>Диагностика</strong></td>
          <td>Видеосистема Ridgid SeeSnake с локатором глубины + Sludge Judge (прозрачный пробоотборник осадка).</td>
          <td>100% доказательство необходимости ремонта дренажного поля перед клиентом.</td>
        </tr>
        <tr>
          <td><strong>Шланговый резерв</strong></td>
          <td>Минимум 180–200 футов вакуумного рукава 3" на барабане с быстрым соединением Camlock.</td>
          <td>Позволяет откачивать баки на задних дворах без съезда машины с подъездной дорожки.</td>
        </tr>
        <tr>
          <td><strong>Запас в кузове</strong></td>
          <td>Набор ризеров 20"/24", герметичные крышки Polylok, адаптерные кольца, фильтры стоков.</td>
          <td>Моментальный монтаж ревизионного колодца на месте без повторного выезда (+$600 маржи).</td>
        </tr>
        <tr>
          <td><strong>Лицензирование</strong></td>
          <td>Florida Master Septic Tank Contractor License + регистрация сервисной организации FDEP.</td>
          <td>Право монтажа систем с грантами штата и заключение обязательных договоров обслуживания.</td>
        </tr>
        <tr>
          <td><strong>Цифровой фронт</strong></td>
          <td>Сайт с быстрой загрузкой (< 1.5s), Click-to-Call, форма запроса гранта штата, раздел для риелторов.</td>
          <td>Сбор клиентов, разочарованных битыми ссылками конкурентов (32% рынка).</td>
        </tr>
      </tbody>
    </table>

    <div class="callout-box" style="margin-top: 8px;">
      <strong>Итоговое резюме:</strong> Рынок септиков во Флориде чрезвычайно денежный благодаря уникальному сочетанию геологии, ураганов и экологических законов FDEP. Побеждает не тот, кто покупает дорогую рекламу, а тот, кто позиционируется как честный локальный эксперт, защищает газон клиента, помогает оформлять государственные гранты и выстраивает системную работу с сантехниками и риелторами.
    </div>

    <div class="footer-bar">
      <span>Florida Septic Market Research • Generated via Playwright • 387 Companies Dataset</span>
      <span>Стр. 4 из 4</span>
    </div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log('[PDF] Launching Chromium to generate Florida Septic Industry Report...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(HTML_CONTENT, { waitUntil: 'networkidle' });

  const outputDir = path.resolve(__dirname, '../florida_market_analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfPath = path.resolve(outputDir, 'Florida_Septic_Market_Analysis_2026.pdf');
  const rootPdfPath = path.resolve(__dirname, '../Florida_Septic_Market_Analysis_2026.pdf');

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '8mm',
      bottom: '8mm',
      left: '10mm',
      right: '10mm'
    }
  });

  fs.copyFileSync(pdfPath, rootPdfPath);
  await browser.close();

  console.log(`✅ [SUCCESS] High-resolution PDF generated at:`);
  console.log(`- ${pdfPath}`);
  console.log(`- ${rootPdfPath}`);
}

generatePdf().catch(err => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
