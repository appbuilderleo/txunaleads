const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://www.google.com/maps/search/Restaurante%20em%20Maputo');
  await page.waitForTimeout(5000); 

  const leads = await page.evaluate(() => {
    const items = document.querySelectorAll('div[role="article"]');
    const results = [];
    
    for (let i = 0; i < Math.min(3, items.length); i++) {
        const item = items[i];
        
        const fullText = item.innerText || "";
        const lines = fullText.split('\n');
        
        results.push({
            fullText,
            lines,
            fontBodyMediums: Array.from(item.querySelectorAll('.fontBodyMedium')).map(el => el.innerText)
        });
    }
    return results;
  });

  console.log(JSON.stringify(leads, null, 2));
  await browser.close();
})();
