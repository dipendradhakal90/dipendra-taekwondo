const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

async function snapshot() {
  // Try to use system Chrome/Edge if playwright browsers are not installed
  const chromePath = findChrome();
  const launchOptions = chromePath ? { executablePath: chromePath, headless: true, args: ['--no-sandbox'] } : { headless: true };
  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();
  const base = process.env.URL || 'http://localhost:3000';
  const pages = ['/', '/updates', '/gallery'];

  for (const p of pages) {
    const url = base + p;
    console.log('\nVisiting', url);
    await page.goto(url, { waitUntil: 'networkidle' });
    // Force light mode for this check
    await page.evaluate(() => {
      try { localStorage.setItem('dark-mode', JSON.stringify(false)); } catch {}
      document.documentElement.classList.remove('dark');
    });

  // helper to safely get computed color of a selector
  async function colorOf(sel) {
    try {
      const handle = await page.$(sel);
      if (!handle) return null;
      return await page.evaluate((el) => window.getComputedStyle(el).color, handle);
    } catch (e) {
      return null;
    }
  }

  // collect elements that include text-white or text-black in class
  const problematic = await page.$$('[class*="text-white"], [class*="text-black"]');
  async function dumpList(list) {
    const out = [];
    for (let i = 0; i < Math.min(list.length, 200); i++) {
      const el = list[i];
      const cls = await el.getAttribute('class');
      const color = await page.evaluate((e) => window.getComputedStyle(e).color, el);
      const bg = await page.evaluate((e) => {
        function getEffectiveBg(elm) {
          if (!elm) return window.getComputedStyle(document.body).backgroundColor;
          const bgc = window.getComputedStyle(elm).backgroundColor;
          if (bgc && bgc !== 'rgba(0, 0, 0, 0)' && bgc !== 'transparent') return bgc;
          return getEffectiveBg(elm.parentElement);
        }
        return getEffectiveBg(e);
      }, el);
      const text = await page.evaluate((e) => e.innerText && e.innerText.trim().slice(0,80), el);
      out.push({ index: i, class: cls, color, background: bg, text });
    }
    return out;
  }

    const beforeList = await dumpList(problematic);
    console.log('BEFORE_LIST_COUNT:', beforeList.length);
    console.log('BEFORE_LIST_SAMPLE:', JSON.stringify(beforeList.slice(0,12), null, 2));

    // Find elements with low contrast in light mode (both color and bg near white)
    const lowContrast = beforeList.filter((it) => {
      function toNum(c) {
        const m = c && c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return 0;
        return (parseInt(m[1]) + parseInt(m[2]) + parseInt(m[3])) / 3;
      }
      const col = toNum(it.color);
      const bg = toNum(it.background);
      return col >= 220 && bg >= 220;
    });
    console.log('LOW_CONTRAST_LIGHT_COUNT:', lowContrast.length);
    if (lowContrast.length) console.log('LOW_CONTRAST_SAMPLE:', JSON.stringify(lowContrast.slice(0,8), null, 2));

  // toggle theme using first toggle button
  const toggle = await page.$('button[aria-label="Toggle dark mode"]');
  if (!toggle) {
    console.log('No toggle button found');
    await browser.close();
    process.exit(2);
  }

  await toggle.click();
  await page.waitForTimeout(350);

    const problematicAfter = await page.$$('[class*="text-white"], [class*="text-black"]');
    const afterList = await dumpList(problematicAfter);
    console.log('AFTER_LIST_COUNT:', afterList.length);
    console.log('AFTER_LIST_SAMPLE:', JSON.stringify(afterList.slice(0,12), null, 2));
  }

  await browser.close();
}

snapshot().catch((err) => {
  console.error(err);
  process.exit(1);
});
