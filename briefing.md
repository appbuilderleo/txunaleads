# 🚀 BRIEFING DE CONCEPÇÃO ZERO: SISTEMA DE INTELIGÊNCIA DE LEADS MZ

## 1. VISÃO GERAL
Este sistema é uma plataforma web de **Lead Intelligence & Scraping** focada no mercado de Moçambique. O objetivo é permitir que agências de marketing, vendedores e empresas encontrem clientes potenciais extraindo dados públicos de diversas fontes digitais.

## 2. O PROBLEMA & DIFERENCIAL COMPETITIVO
*   **Problema:** Ferramentas globais (Apollo, Hunter, Seamless.ai) têm poucos dados sobre pequenas e médias empresas (PMEs) em Moçambique, pois estas muitas vezes não têm LinkedIn ou site oficial.
*   **A Solução (Nosso "Secret Sauce"):** Varredura profunda em **Google Maps, Facebook Pages, Instagram Business e Diretórios Locais**. O foco é extrair o **Número de WhatsApp Business** e analisar a "presença digital" do lead para sugerir oportunidades de venda.

## 3. IDENTIDADE E BRANDING (Sugestões de Nome)
*   **TxunaLeads** (Mistura de rapidez/resolução com leads)
*   **Vizu Scan MZ** (Vizu de visualização/inteligência)
*   **LeadMap MZ** (Foco geolocalização)
*   **BizHunter MZ** (Foco caça de negócios)

## 4. MODELO DE NEGÓCIO (3 NÍVEIS DE PREÇO)
Adaptado à realidade de pagamentos móveis (M-Pesa/e-mola).

### 🥉 Nível 1 - Kanimambo (Gratuito/Amostra)
*   **Capacidade:** 10 leads por dia (visualização em tela).
*   **Dados:** Apenas Nome e Telefone.
*   **Limitação:** Sem exportação para Excel; sem análise de potencial.
*   *Objetivo:* Provar o valor imediato.

### 🥈 Nível 2 - Empreendedor (Pago Mensal - M-Pesa/e-Mola)
*   **Capacidade:** 500 leads por mês.
*   **Dados:** Email, Web, Redes Sociais completas.
*   **Recursos:** Exportação para PDF e Excel; filtros por Cidade/Província.
*   *Perfil:* Vendedores individuais e pequenos negócios.

### 🥇 Nível 3 - Agência/Empresa (Assinatura Business)
*   **Capacidade:** Varredura Ilimitada.
*   **Dados:** Relatório completo de Análise de Potencial (Ex: "Lead sem Site", "Lead com Pixel de FB em falta").
*   **Recursos:** Acesso via API; Suporte prioritário; Exportação em massa (CSV/JSON).
*   *Perfil:* Agências de publicidade e departamentos de vendas B2B.

## 5. FUNCIONALIDADES TÉCNICAS (Core)
1.  **Scanner Multi-Fonte:** Captura dados cruzando Google Maps com Redes Sociais.
2.  **Validador de Contactos:** Checagem automática se o número capturado é WhatsApp.
3.  **Lead Scoring (Análise de Potencial):** Algoritmo que pontua o lead baseado na falta de presença digital (ex: se o lead não tem site, ganha 10 pontos como "Prospect de Alta Conversão para Web Design").
4.  **Integração com CRM:** Exportação direta para ferramentas populares.

## 🧱 6. ARQUITETURA RECOMENDADA
*   **Frontend:** React ou Next.js (Dashboard administrativo).
*   **Backend:** Node.js (Express) para gerenciar as filas de scraping.
*   **Base de Dados:** MongoDB (Flexibilidade para diferentes formatos de redes sociais).
*   **Segurança:** Encriptação de dados e conformidade básica com privacidade.

## 📅 7. PRÓXIMOS PASSOS (SQUADS)
1.  **@brand-squad:** Definir Nome Final e Logo.
2.  **@data-squad:** Criar o protótipo do motor de busca (Scraper).
3.  **@design-squad:** Desenhar o Dashboard focado em usabilidade móvel/web.
4.  **@hormozi-squad:** Refinar os preços dos planos para o mercado local.
