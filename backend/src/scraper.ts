import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

const stealth = stealthPlugin();
chromium.use(stealth);

export interface Lead {
  Empresa: string;
  Morada: string;
  Telefone: string;
  Website: string;
  Score: number;
  Potencial: string;
  Rating: number;
  Reviews: number;
  ReviewSnippet: string;
}

export async function scanGoogleMaps(query: string, limit: number = 20): Promise<Lead[]> {
  console.log(`🚀 @data-chief: Iniciando varredura para "${query}"...`);
  
  let browser;

  try {
    console.log(`📡 @data-chief: Lançando browser (Chromium)...`);
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Importante para containers de 512MB RAM
        '--disable-gpu',
        '--hide-scrollbars',
        '--mute-audio'
      ]
    }); 
    
    console.log(`✅ @data-chief: Browser aberto. Criando contexto...`);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    console.log(`🌐 @data-chief: Navegando para: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    console.log(`⏳ @data-chief: Aguardando carregamento dos resultados...`);
    // Esperar pelo menos um artigo ou timeout
    try {
      await page.waitForSelector('div[role="article"]', { timeout: 15000 });
    } catch (e) {
      console.warn('⚠️ @data-chief: Timeout ao esperar por resultados. Tentando extrair o que houver...');
    }

    await page.waitForTimeout(5000); 

    const leads: Lead[] = await page.evaluate(() => {
      const results: Lead[] = [];
      const items = document.querySelectorAll('div[role="article"]');
      
      items.forEach((item) => {
        const fullText = (item as HTMLElement).innerText || "";
        const lines = fullText.split('\n');

        const title = lines[0] || (item.querySelector('.fontHeadlineSmall') as HTMLElement)?.innerText;
        const websiteLink = (item.querySelector('a[data-item-id="authority"]') as HTMLAnchorElement)?.href;
        
        // --- Pegar Rating e Reviews ---
        const ratingElement = item.querySelector('span[role="img"]') as HTMLElement;
        const ratingAria = ratingElement ? (ratingElement.getAttribute('aria-label') || "") : "";
        const ratingValue = parseFloat(ratingAria.split(' ')[0] || "0") || 0;

        const reviewsElement = item.querySelector('span[aria-label*="reviews"]') as HTMLElement;
        const reviewsCount = parseInt(reviewsElement?.innerText.replace(/[^0-9]/g, "")) || 0;

        // --- Pegar Telefone ---
        const phoneRegex = /(?:\+?258[\s-]?)?[28][0-9][\s-]?[0-9]{3}[\s-]?[0-9]{3,4}/g;
        const phoneMatches = fullText.match(phoneRegex);
        const phone = phoneMatches ? phoneMatches[0].trim() : "N/A";

        // --- Pegar Address ---
        let address = 'N/A';
        for (const line of lines) {
          if (line.includes('·') && !line.match(/Aberto|Fechado|24 horas/i) && !line.match(phoneRegex)) {
            const parts = line.split('·');
            address = parts[parts.length - 1].trim();
            break;
          }
        }

        // --- Pegar Comentário ---
        let snippetText = "Sem comentários recentes destacados.";
        for (const line of lines) {
          if (line.match(/^["“«]/) || (line.includes('·') && line.includes('...')) || line.includes('O ambiente') || line.includes('serviço')) {
            snippetText = line.trim();
            break;
          }
        }

        if (title) {
          let score = 0;
          if (!websiteLink) score += 50; 
          if (ratingValue > 0 && ratingValue < 4.0) score += 30; // Negócios com rating baixo são prospects

          results.push({
            Empresa: title,
            Morada: address || 'N/A',
            Telefone: phone || 'N/A',
            Website: websiteLink || 'SEM SITE 🚩',
            Score: score,
            Potencial: score >= 50 ? 'ALTO 🔥' : 'MÉDIO ⚡',
            Rating: ratingValue,
            Reviews: reviewsCount,
            ReviewSnippet: snippetText
          });
        }
      });
      return results;
    });

    console.log(`📊 @data-chief: Extração finalizada. Leads encontrados: ${leads.length}`);
    return leads;

  } catch (error: any) {
    console.error('❌ @data-chief: Erro crítico na varredura:', error.message || error);
    if (error.stack) console.error(error.stack);
    return [];
  } finally {
    if (browser) {
      console.log(`🛑 @data-chief: Fechando browser...`);
      await browser.close();
    }
  }
}
