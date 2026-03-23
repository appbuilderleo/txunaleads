const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://www.google.com/maps/search/Restaurante%20em%20Maputo');
  await page.waitForTimeout(5000); 

  const html = await page.evaluate(() => {
    const item = document.querySelectorAll('div[role="article"]')[0];
    if (!item) return "";
    return item.innerHTML;
  });

  console.log(html.substring(0, 1500) + "\n... TRUNCATED");
  await browser.close();
})();
