const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const https = require("https");

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on("finish", () => {
        stream.close();
        resolve();
      });
    }).on("error", reject);
  });
}

const callLeads = JSON.parse(fs.readFileSync("src/data/callLeads.json", "utf8"));
const masterLeads = JSON.parse(fs.readFileSync("src/data/septicLeads.json", "utf8"));
const masterBySlug = {};
masterLeads.forEach(l => masterBySlug[l.slug] = l);

const targetSlugs = [
  "millennium-plumbing-specialist-inc",
  "keele-sanitation",
  "tucson-plumbing-solutions",
  "above-and-beyond-plumbing-llc",
  "xtreme-drainworks-inc",
  "triple-t-septic",
  "superior-vac-septic",
  "hamm-septic-services",
  "one-call-services-inc",
  "fix-family-enterprises-ltd",
  "towers",
  "roto-rooter",
  "extra-care-plumbing-llc",
  "affordable-septic-tank-pumping",
  "herr-septic-services",
  "land-perc",
  "lindseys-septic-tank-services",
  "greens-septic-service",
  "straights-septic-service",
  "cape-cod-septic-inspections",
  "tri-star-septic-pumping-llc"
];

async function run() {
  console.log(`Starting Google Maps photo scraping for ${targetSlugs.length} leads...`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    locale: "en-US"
  });

  const results = {};

  for (let idx = 0; idx < targetSlugs.length; idx++) {
    const slug = targetSlugs[idx];
    const lead = masterBySlug[slug];
    if (!lead || !lead.mapsUrl) {
      console.log(`[${idx + 1}/${targetSlugs.length}] ${slug}: No mapsUrl found, skipping.`);
      results[slug] = 0;
      continue;
    }

    console.log(`\n==================================================`);
    console.log(`[${idx + 1}/${targetSlugs.length}] ${lead.name} (${slug})`);
    console.log(`Maps URL: ${lead.mapsUrl}`);

    const folderName = lead.folderName || lead.name;
    const destDir = path.join("septic_repair", folderName, "photos", "owner");
    fs.mkdirSync(destDir, { recursive: true });

    const page = await context.newPage();
    try {
      await page.goto(lead.mapsUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(3500);

      // Check if photo button exists
      const photoBtn = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        for (const b of btns) {
          const aria = (b.getAttribute("aria-label") || "").toLowerCase();
          const txt = (b.innerText || "").toLowerCase();
          if (aria.includes("photo") || txt.includes("photo")) {
            return { aria: b.getAttribute("aria-label"), text: b.innerText };
          }
        }
        return null;
      });

      if (!photoBtn) {
        console.log(`  -> No photo button on listing. Genuine 0 photos.`);
        results[slug] = 0;
        await page.close();
        continue;
      }

      console.log(`  -> Found photo button: aria="${photoBtn.aria}" text="${photoBtn.text}"`);

      // Click photo button to open gallery
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        for (const b of btns) {
          const aria = (b.getAttribute("aria-label") || "").toLowerCase();
          const txt = (b.innerText || "").toLowerCase();
          if (aria.includes("photo") || txt.includes("photo")) {
            b.click();
            return true;
          }
        }
        return false;
      });

      if (clicked) {
        await page.waitForTimeout(4000);
      }

      // Collect image URLs
      const imgUrls = await page.evaluate(() => {
        const set = new Set();
        document.querySelectorAll("*").forEach(el => {
          const bg = el.style && el.style.backgroundImage;
          if (bg && bg.includes("googleusercontent.com")) {
            const m = bg.match(/url\(["\x27]?([^"\x27]+)["\x27]?\)/);
            if (m) set.add(m[1]);
          }
          if (el.tagName === "IMG" && el.src && el.src.includes("googleusercontent.com")) {
            set.add(el.src);
          }
        });
        return Array.from(set);
      });

      // Filter and clean URLs
      const cleanUrls = imgUrls
        .map(u => u.startsWith("//") ? "https:" + u : u)
        .filter(u => u.includes("googleusercontent.com") && !u.includes("/a/ACg8") && !u.includes("/grass-cs/"));

      console.log(`  -> Detected ${cleanUrls.length} candidate photo URLs.`);

      let downloadedCount = 0;
      for (let i = 0; i < cleanUrls.length; i++) {
        let u = cleanUrls[i];
        // upgrade to high resolution
        u = u.replace(/=w\d+-h\d+[^=]*/, "=s1600").replace(/=s\d+[^=]*/, "=s1600");
        const filePath = path.join(destDir, `gmaps_${String(downloadedCount + 1).padStart(3, "0")}.jpg`);

        try {
          await downloadFile(u, filePath);
          const stat = fs.statSync(filePath);
          if (stat.size > 25000) {
            downloadedCount++;
            console.log(`    + Saved photo ${downloadedCount} (${Math.round(stat.size / 1024)} KB)`);
          } else {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          // ignore individual download failure
        }
      }

      console.log(`  -> Successfully saved ${downloadedCount} high-res photos for ${lead.name}.`);
      results[slug] = downloadedCount;

    } catch (err) {
      console.log(`  -> Error processing ${slug}:`, err.message);
      results[slug] = 0;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log("\n==================================================");
  console.log("FINAL RESULTS SUMMARY:");
  console.log("==================================================");
  let totalWithPhotos = 0;
  for (const [slug, count] of Object.entries(results)) {
    console.log(`${slug.padEnd(45)}: ${count} photos`);
    if (count > 0) totalWithPhotos++;
  }
  console.log(`\nFound and saved photos for ${totalWithPhotos} of ${targetSlugs.length} leads!`);
  
  fs.writeFileSync("scripts/zero_leads_scrape_results.json", JSON.stringify(results, null, 2));
}

run().catch(console.error);
