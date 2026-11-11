const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function renderAvatars() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });

  const brandDir = path.resolve(__dirname, '../public/brand');

  const files = [
    { svg: 'zonus-avatar-square-dark.svg', png: 'zonus-avatar-1024-dark.png' },
    { svg: 'zonus-avatar-square-light.svg', png: 'zonus-avatar-1024-light.png' },
  ];

  for (const item of files) {
    const svgPath = path.join(brandDir, item.svg);
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${svgContent}</body></html>`);
    const pngPath = path.join(brandDir, item.png);
    await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1024, height: 1024 } });
    console.log(`Rendered: ${pngPath}`);
  }

  await browser.close();
}

renderAvatars().catch(console.error);
