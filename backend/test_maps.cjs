const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://www.google.com/maps/search/Arquitetura%20em%20Maputo');
  await page.waitForTimeout(5000); 

  const leads = await page.evaluate(() => {
    const items = document.querySelectorAll('div[role="article"]');
    const results = [];
    
    for (let i = 0; i < Math.min(3, items.length); i++) {
        const item = items[i];
        results.push({
            title: item.querySelector('.fontHeadlineSmall')?.innerText,
            allBodyTexts: Array.from(item.querySelectorAll('.fontBodyMedium')).map(el => el.innerText),
            allText: item.innerText.replace(/\n/g, ' \\n ')
        });
    }
    return results;
  });

  console.log(JSON.stringify(leads, null, 2));
  await browser.close();
})();
