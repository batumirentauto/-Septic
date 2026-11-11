// scripts/startMobileDispatcher.cjs
// Serves a fast, high-converting mobile web dispatcher for iPhone.
// Opens directly in iPhone Safari: tap once -> iOS Messages opens with pre-filled SMS -> send!

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3333;
const CANDIDATES_FILE = path.resolve(__dirname, 'morning_80_split_test.json');
const LOG_FILE = path.resolve(__dirname, '../outreach_sent_log.json');

function buildMessageText(candidate) {
  const { company, owner, variant } = candidate;
  const greeting = owner && owner.trim() ? `Hey ${owner.trim()}` : `Hey guys`;

  if (variant === 'V1_BALANCED') {
    return `${greeting}, know you're busy so I'll keep it short. Noticed you don't have a website on Google Maps, so put together a ready mobile site for ${company} with your machinery, reviews & services so local jobs don't slip to competitors.\n\nMind if I text you the link to take a quick look? If you like it, great - if not, I'll just delete it, no hard feelings.`;
  }

  if (variant === 'V2_ULTRA_SHORT') {
    return `${greeting}, know you're busy - I'll be quick. Saw no website on your Google profile, so built one for ${company} with your real trucks, reviews & services so callers don't go to competitors.\n\nGot a couple mins if I shoot over the link? If you want to keep it, awesome - if not, I'll delete it, no problem.`;
  }

  if (variant === 'V3_SAFETY_FIRST') {
    return `${greeting}, keeping this short since you're busy. Saw you don't have a site on Google Maps, so put together a live showcase for ${company} with your equipment, reviews & services to help catch jobs going to competitors.\n\nWant me to send the link over to check it out? If you like it, let me know - if not, I'll take it down, no sweat.`;
  }

  return `${greeting}, know you're busy so I'll keep it short. Noticed you don't have a website on Google Maps, so put together a ready mobile site for ${company} with your machinery, reviews & services so local jobs don't slip to competitors.\n\nMind if I text you the link to take a quick look? If you like it, great - if not, I'll just delete it, no hard feelings.`;
}

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

function getCandidatesWithText() {
  const raw = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
  const logData = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };
  const history = logData.history || {};

  return raw.map((c, idx) => ({
    id: idx + 1,
    ...c,
    text: buildMessageText(c),
    isSent: !!(history[c.phone] && history[c.phone].status === 'SENT'),
    encodedSmsUrl: `sms:${c.phone}&body=${encodeURIComponent(buildMessageText(c))}`
  }));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/candidates') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(getCandidatesWithText()));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/mark-sent') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { phone, variant, company, slug } = JSON.parse(body);
        const logData = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) : { history: {} };
        if (!logData.history) logData.history = {};
        logData.history[phone] = {
          company,
          phone,
          slug,
          variant,
          channel: 'IPHONE_CELLULAR_SMS',
          sentAt: new Date().toISOString(),
          status: 'SENT'
        };
        fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ ok: true, phone }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.url === '/' || req.url === '/index.html') {
    const candidates = getCandidatesWithText();
    const localIp = getLocalIp();

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Zonus SMS Dispatcher (80)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 16px; padding-bottom: 80px; min-height: 100vh; }
    .header { text-align: center; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    
    .progress-bar { background: #334155; border-radius: 999px; height: 10px; margin: 16px 0; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #38bdf8, #22c55e); height: 100%; width: 0%; transition: width 0.3s ease; }
    .stats-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #cbd5e1; }
    
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); margin-top: 12px; }
    .badge-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; }
    .badge-tz { background: #1e3a8a; color: #93c5fd; }
    .badge-group { background: #064e3b; color: #6ee7b7; }
    .badge-owner { background: #4c1d95; color: #c4b5fd; }
    
    .company { font-size: 22px; font-weight: 800; color: #f8fafc; line-height: 1.2; }
    .location { font-size: 14px; color: #94a3b8; margin-top: 4px; }
    .phone { font-size: 16px; font-weight: 700; color: #38bdf8; margin-top: 8px; letter-spacing: 0.5px; }
    
    .message-box { background: #0f172a; border-radius: 12px; padding: 14px; margin: 16px 0; border: 1px solid #1e293b; }
    .message-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
    .message-text { font-size: 14px; line-height: 1.5; color: #e2e8f0; white-space: pre-wrap; word-break: break-word; }
    
    .btn-send { display: block; width: 100%; background: #22c55e; color: #ffffff; text-align: center; padding: 18px; border-radius: 14px; font-size: 18px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4); active: transform: scale(0.98); }
    .btn-send:active { background: #16a34a; }
    
    .nav-buttons { display: flex; gap: 10px; margin-top: 14px; }
    .btn-sec { flex: 1; background: #334155; color: #cbd5e1; border: none; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; }
    .btn-sec:active { background: #475569; }
    
    .sent-indicator { text-align: center; font-size: 13px; color: #22c55e; font-weight: 700; margin-top: 12px; display: none; }
    .all-done { display: none; text-align: center; padding: 40px 20px; }
    .all-done h2 { font-size: 26px; color: #22c55e; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">🚀 Zonus Mobile Dispatcher</div>
    <div class="subtitle">Отправка 80 утренних SMS с iPhone eSIM</div>
    <div class="progress-bar">
      <div id="progressFill" class="progress-fill"></div>
    </div>
    <div class="stats-row">
      <span id="progressText">Контакт 1 из 80</span>
      <span id="sentCounter">Отправлено: 0</span>
    </div>
  </div>

  <div id="cardContainer" class="card">
    <div class="badge-row">
      <span id="tzBadge" class="badge badge-tz">EST</span>
      <span id="variantBadge" class="badge badge-group">V1_BALANCED</span>
      <span id="ownerBadge" class="badge badge-owner" style="display:none;">Owner</span>
    </div>
    <div id="companyName" class="company">Fletcher Sewer & Drain</div>
    <div id="locationText" class="location">Ludlow, MA</div>
    <div id="phoneText" class="phone">+1 (413) 788-7200</div>

    <div class="message-box">
      <div class="message-label">Текст SMS для отправки:</div>
      <div id="messageText" class="message-text"></div>
    </div>

    <a id="sendBtn" href="#" class="btn-send" onclick="handleSendClick()">
      📲 ОТПРАВИТЬ SMS
    </a>

    <div id="sentIndicator" class="sent-indicator">✅ Отмечено как отправленное</div>

    <div class="nav-buttons">
      <button class="btn-sec" onclick="prevCandidate()">◀ Назад</button>
      <button class="btn-sec" onclick="skipCandidate()">Пропустить ▶</button>
    </div>
  </div>

  <div id="allDoneContainer" class="all-done">
    <h2>🎉 ВСЕ 80 SMS ОТПРАВЛЕНЫ!</h2>
    <p style="color: #94a3b8; font-size: 15px; margin-top: 8px;">Все утренние контакты успешно обработаны. Переходим к отслеживанию ответов на радаре!</p>
  </div>

  <script>
    const candidates = ${JSON.stringify(candidates)};
    let currentIndex = 0;
    let sentCount = candidates.filter(c => c.isSent).length;

    // Find first unsent
    const firstUnsent = candidates.findIndex(c => !c.isSent);
    if (firstUnsent !== -1) currentIndex = firstUnsent;

    function updateUI() {
      if (currentIndex >= candidates.length) {
        document.getElementById('cardContainer').style.display = 'none';
        document.getElementById('allDoneContainer').style.display = 'block';
        return;
      }

      const c = candidates[currentIndex];
      document.getElementById('companyName').innerText = c.company;
      document.getElementById('locationText').innerText = c.city + ', ' + c.state;
      document.getElementById('phoneText').innerText = c.phone;
      document.getElementById('tzBadge').innerText = c.tzCategory || 'EST';
      document.getElementById('variantBadge').innerText = c.variant;

      if (c.owner) {
        document.getElementById('ownerBadge').style.display = 'inline-block';
        document.getElementById('ownerBadge').innerText = 'Owner: ' + c.owner;
      } else {
        document.getElementById('ownerBadge').style.display = 'none';
      }

      document.getElementById('messageText').innerText = c.text;
      
      // iOS Messages URL scheme
      document.getElementById('sendBtn').href = 'sms:' + c.phone + '&body=' + encodeURIComponent(c.text);

      // Progress
      const pct = Math.round(((currentIndex) / candidates.length) * 100);
      document.getElementById('progressFill').style.width = pct + '%';
      document.getElementById('progressText').innerText = 'Контакт ' + (currentIndex + 1) + ' из ' + candidates.length;
      document.getElementById('sentCounter').innerText = 'Отправлено: ' + sentCount;

      document.getElementById('sentIndicator').style.display = c.isSent ? 'block' : 'none';
    }

    function handleSendClick() {
      const c = candidates[currentIndex];
      if (!c.isSent) {
        c.isSent = true;
        sentCount++;
        fetch('/api/mark-sent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: c.phone,
            variant: c.variant,
            company: c.company,
            slug: c.slug
          })
        }).catch(console.error);
      }

      setTimeout(() => {
        if (currentIndex < candidates.length - 1) {
          currentIndex++;
          updateUI();
        } else {
          currentIndex++;
          updateUI();
        }
      }, 1500);
    }

    function skipCandidate() {
      if (currentIndex < candidates.length - 1) {
        currentIndex++;
        updateUI();
      }
    }

    function prevCandidate() {
      if (currentIndex > 0) {
        currentIndex--;
        updateUI();
      }
    }

    updateUI();
  </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log('========================================================================');
  console.log(`📱 MOBILE DISPATCHER SERVER ACTIVE ON PORT ${PORT}`);
  console.log(`Open in Safari on iPhone (connected to same Wi-Fi):`);
  console.log(`👉 http://${localIp}:${PORT}`);
  console.log('========================================================================');
});
