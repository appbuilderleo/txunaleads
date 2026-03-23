import type { Lead } from './scraper.js';
import { chromium } from 'playwright';

/**
 * Social Media Lead Scraper - TxunaLeads
 * 
 * Estratégia FINAL: Usa o Microsoft Edge REAL instalado no Windows
 * via Playwright channel API. Isso torna o bot praticamente 
 * indistinguível de um humano, pois usa o mesmo binário do browser.
 */

export async function scanSocialMedia(query: string, location: string, source: string, limit: number = 20): Promise<Lead[]> {
  console.log(`🚀 @social-chief: Varredura ${source.toUpperCase()} -> "${query}" em "${location}"...`);

  let siteDomain = "";
  if (source === 'facebook') siteDomain = "facebook.com";
  if (source === 'instagram') siteDomain = "instagram.com";
  if (source === 'x') siteDomain = "x.com";
  if (source === 'linkedin') siteDomain = "linkedin.com";

  const searchTerm = source === 'x'
    ? `(site:twitter.com OR site:x.com) "${query}" "${location}"`
    : `site:${siteDomain} "${query}" "${location}"`;

  // Usar o Edge real do Windows (channel: 'msedge')
  let browser;
  try {
    browser = await chromium.launch({
      channel: 'msedge',  // Usa o Edge instalado no Windows!
      headless: false,     // Edge real NÃO suporta headless stealth, mas...
      args: [
        '--window-position=-2400,-2400',  // Mover janela pra fora da tela
        '--window-size=1280,720',         // Tamanho normal
        '--disable-blink-features=AutomationControlled'
      ]
    });
    console.log(`🌐 @social-chief: Microsoft Edge REAL ativado!`);
  } catch (e) {
    // Fallback: Chromium padrão com stealth flags
    console.log(`⚠️ @social-chief: Edge não disponível. Usando Chromium stealth...`);
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox'
      ]
    });
  }

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    locale: 'pt-MZ',
    viewport: { width: 1366, height: 768 }
  });

  // Remover o navigator.webdriver (principal forma de detecção)
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    // Simular plugins normais
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    // Simular linguagens
    Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'] });
  });

  const page = await context.newPage();

  try {
    // ===== ESTRATÉGIA: Google via navegação humana com Edge =====
    console.log(`🔎 @social-chief: Navegando para Google como humano...`);
    
    await page.goto('https://www.google.com', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000 + Math.random() * 2000); // Delay humano aleatório

    // Aceitar cookies (se houver)
    try {
      const acceptBtn = page.locator('button:has-text("Aceitar tudo"), button:has-text("Accept all"), button:has-text("Concordo")');
      if (await acceptBtn.first().isVisible({ timeout: 2000 })) {
        await acceptBtn.first().click();
        await page.waitForTimeout(500);
      }
    } catch (e) {}

    // Encontrar e preencher o campo de busca
    const searchBox = page.locator('textarea[name="q"], input[name="q"]').first();
    await searchBox.click();
    await page.waitForTimeout(300);
    
    // Digitar caractere por caractere (mais humano)
    await searchBox.fill('');
    for (const char of searchTerm) {
      await searchBox.type(char, { delay: 30 + Math.random() * 70 });
    }
    
    await page.waitForTimeout(500 + Math.random() * 1000);
    await page.keyboard.press('Enter');

    // Esperar resultados
    try {
      await page.waitForSelector('h3', { timeout: 15000 });
      console.log(`✅ @social-chief: Resultados carregados no Google!`);
    } catch (e) {
      // Verificar se é CAPTCHA
      const pageContent = await page.content();
      if (pageContent.includes('unusual traffic') || pageContent.includes('captcha') || pageContent.includes('recaptcha')) {
        console.log(`🔒 @social-chief: CAPTCHA detectado. Tentando Bing...`);
        
        // Fallback para Bing
        const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}&count=30`;
        await page.goto(bingUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(3000);
        
        try {
          await page.waitForSelector('.b_algo', { timeout: 10000 });
          console.log(`✅ @social-chief: Resultados do Bing carregados!`);
          
          const bingLeads = await extractBingResults(page, siteDomain, source, query);
          await browser.close();
          return bingLeads.slice(0, limit);
        } catch (e2) {
          console.log(`❌ @social-chief: Bing também falhou.`);
          await browser.close();
          return [];
        }
      }
      console.log(`⚠️ @social-chief: Nenhum resultado encontrado.`);
      await browser.close();
      return [];
    }

    await page.waitForTimeout(1000);

    // Extrair resultados do Google
    const leads: Lead[] = await page.evaluate((dom: string, src: string, q: string) => {
      const results: any[] = [];
      const items = document.querySelectorAll('div.g');
      
      items.forEach((item: Element) => {
        const titleEl = item.querySelector('h3');
        const linkEl = item.querySelector('a') as HTMLAnchorElement;
        const snippetEl = item.querySelector('div.VwiC3b, .yWG4Xb') as HTMLElement;

        const title = titleEl?.innerText || "";
        const link = linkEl?.href || "";
        const snippet = snippetEl?.innerText || "";

        const isDomainMatch = dom === ''
          ? (link.includes('twitter.com') || link.includes('x.com'))
          : link.includes(dom);

        if (title && link && isDomainMatch) {
          const phoneRegex = /(\+?258[\s-]?)?[28][0-9][\s-]?[0-9]{3}[\s-]?[0-9]{3,4}/g;
          const foundPhone = snippet.match(phoneRegex);

          let cleanTitle = title
            .replace(/\s*[-|–—]\s*(Facebook|Instagram|LinkedIn|Twitter|X).*$/gi, '')
            .replace(/@\w+\s*/g, '')
            .trim();

          const sourceLabel = src === 'facebook' ? 'Facebook' : src === 'instagram' ? 'Instagram' : src === 'x' ? 'X/Twitter' : 'LinkedIn';
          let score = 40;
          if (snippet.toLowerCase().includes(q.toLowerCase())) score += 15;

          results.push({
            Empresa: cleanTitle || title.substring(0, 60),
            Morada: `Via ${sourceLabel}`,
            Telefone: (foundPhone && foundPhone[0]) ? foundPhone[0].trim() : 'N/A',
            Website: link,
            Score: score,
            Potencial: score >= 45 ? 'ALTO 🔥' : 'MÉDIO ⚡',
            Rating: 0,
            Reviews: 0,
            ReviewSnippet: snippet.substring(0, 160) || `Perfil encontrado via ${sourceLabel}`
          });
        }
      });
      return results;
    }, source === 'x' ? '' : siteDomain, source, query);

    console.log(`📊 @social-chief: ${leads.length} leads extraídos em ${source.toUpperCase()}.`);
    await browser.close();
    return leads.slice(0, limit);

  } catch (error) {
    console.error('❌ @social-chief: Erro geral:', error);
    await browser.close();
    return [];
  }
}

// Função auxiliar para extrair resultados do Bing
async function extractBingResults(page: any, domain: string, source: string, query: string): Promise<Lead[]> {
  return await page.evaluate((dom: string, src: string, q: string) => {
    const results: any[] = [];
    const items = document.querySelectorAll('.b_algo, li.b_algo');
    
    items.forEach((item: Element) => {
      const titleEl = item.querySelector('h2 a, h2') as HTMLAnchorElement;
      const linkEl = item.querySelector('h2 a, a[href]') as HTMLAnchorElement;
      const snippetEl = item.querySelector('.b_caption p, p') as HTMLElement;

      const title = titleEl?.innerText || "";
      const link = linkEl?.href || "";
      const snippet = snippetEl?.innerText || "";

      const isDomainMatch = dom === ''
        ? (link.includes('twitter.com') || link.includes('x.com'))
        : link.includes(dom);

      if (title && link && isDomainMatch) {
        const phoneRegex = /(\+?258[\s-]?)?[28][0-9][\s-]?[0-9]{3}[\s-]?[0-9]{3,4}/g;
        const foundPhone = snippet.match(phoneRegex);

        let cleanTitle = title
          .replace(/\s*[-|–—]\s*(Facebook|Instagram|LinkedIn|Twitter|X).*$/gi, '')
          .trim();

        const sourceLabel = src === 'facebook' ? 'Facebook' : src === 'instagram' ? 'Instagram' : src === 'x' ? 'X/Twitter' : 'LinkedIn';
        let score = 40;
        if (snippet.toLowerCase().includes(q.toLowerCase())) score += 15;

        results.push({
          Empresa: cleanTitle || title.substring(0, 60),
          Morada: `Via ${sourceLabel}`,
          Telefone: (foundPhone && foundPhone[0]) ? foundPhone[0].trim() : 'N/A',
          Website: link,
          Score: score,
          Potencial: score >= 45 ? 'ALTO 🔥' : 'MÉDIO ⚡',
          Rating: 0,
          Reviews: 0,
          ReviewSnippet: snippet.substring(0, 160) || `Perfil encontrado via ${sourceLabel}`
        });
      }
    });
    return results;
  }, domain, source, query);
}
