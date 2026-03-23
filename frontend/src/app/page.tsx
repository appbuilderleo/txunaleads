"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Target, 
  Search, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  PlayCircle, 
  MessageCircle, 
  Flame,
  Globe,
  Settings
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-[#2ECC71] selection:text-[#0A2540] overflow-x-hidden">
      
      {/* Header / Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#E2E8F0] px-6 lg:px-8 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="TxunaLeads Logo" className="h-8 lg:h-10 w-auto" />
        </div>
        <nav className="hidden lg:flex items-center gap-10 text-sm font-bold text-[#64748B]">
          <a href="#funcionalidades" className="hover:text-[#0A2540] transition-colors cursor-pointer">Funcionalidades</a>
          <a href="#precos" className="hover:text-[#0A2540] transition-colors cursor-pointer">Preços</a>
          <a href="#sobre" className="hover:text-[#0A2540] transition-colors cursor-pointer">Sobre Nós</a>
        </nav>
        <div className="flex items-center gap-3 lg:gap-4">
          <Link href="/auth/login" className="text-sm font-bold text-[#0A2540] hover:text-[#2ECC71] transition-colors px-2 lg:px-4">Login</Link>
          <Link href="/auth/signup" className="bg-[#0A2540] text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-bold shadow-lg hover:bg-[#162e49] hover:-translate-y-0.5 transition-all">Começar</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 lg:pt-48 pb-12 lg:pb-24 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative">
        <div className="absolute top-10 left-[-10%] w-[600px] h-[600px] bg-[#2ECC71] rounded-full opacity-5 blur-[120px] pointer-events-none" />
        
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAFCF1] text-[#166534] rounded-full text-[10px] lg:text-[11px] font-extrabold uppercase tracking-wider mb-6 lg:mb-8 border border-[#2ECC71]/20">
            <Zap size={14} fill="#166534" /> Inteligência de Vendas (MZ)
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-outfit leading-tight lg:leading-[1.1] mb-6 lg:mb-8 text-[#0A2540]">
            Acelere as suas <span className="text-[#2ECC71]">Vendas</span> em Moçambique.
          </h1>
          <p className="text-base lg:text-xl text-[#64748B] mb-8 lg:mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
            Descubra as melhore oportunidades de negócio em Maputo, Matola e além. O motor TxunaLeads minera dados reais para que você venda mais rápido em qualquer nicho.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/auth/signup" className="bg-[#2ECC71] text-[#0A2540] px-8 lg:px-10 py-4 lg:py-5 rounded-2xl text-base lg:text-lg font-black shadow-2xl shadow-[#2ECC71]/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3">
              Experimentar Grátis <ArrowRight size={20} />
            </Link>
            <button className="bg-white border-2 border-[#E2E8F0] text-[#0A2540] px-8 lg:px-10 py-4 lg:py-5 rounded-2xl text-base lg:text-lg font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-3">
              <PlayCircle size={20} /> Demonstração
            </button>
          </div>
        </div>

        <div className="lg:w-1/2 relative">
            <div className="bg-white rounded-[32px] shadow-[0_50px_100px_-20px_rgba(10,37,64,0.15)] border border-[#E2E8F0] p-6 relative z-10">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3" alt="Dashboard Preview" className="rounded-2xl w-full border border-[#E2E8F0]" />
              <div className="absolute top-20 right-[-40px] bg-[#2ECC71] text-[#0A2540] p-6 rounded-2xl shadow-2xl hidden md:flex items-center gap-3 animate-pulse">
                <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-60">Lead Score</p>
                    <p className="text-3xl font-black font-outfit">ALTO</p>
                </div>
                <Flame size={40} fill="#0A2540" strokeWidth={0} />
              </div>
            </div>
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-[#0A2540] rounded-3xl -z-0 opacity-5" />
        </div>
      </section>

      {/* Payments Bar - Fixed */}
      <section className="py-8 lg:py-12 border-y border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap justify-center items-center gap-10 lg:gap-20 opacity-40 grayscale contrast-125 scale-75 lg:scale-100">
          <span className="text-xl lg:text-2xl font-black font-outfit text-[#0A2540]">M-PESA</span>
          <span className="text-xl lg:text-2xl font-black font-outfit text-[#0A2540]">E-MOLA</span>
          <span className="text-xl lg:text-2xl font-black font-outfit text-[#0A2540]">M-KESH</span>
          <span className="text-xl lg:text-2xl font-black font-outfit text-[#0A2540]">PONTO 24</span>
          <span className="text-xl lg:text-2xl font-black font-outfit text-[#0A2540]">STRIPE</span>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 px-8 max-w-7xl mx-auto">
        <header className="text-center mb-20 px-8">
          <h2 className="text-4xl font-bold font-outfit text-[#0A2540] mb-6">Poder de Fogo em Qualque Nicho</h2>
          <p className="text-lg text-[#64748B] max-w-2xl mx-auto font-medium">De mecânicos e restaurantes a imobiliárias de luxo, o TxunaLeads adapta-se à sua estratégia de vendas.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8">
          <FeatureCard 
            icon={<Search className="text-[#2ECC71]" size={32} />} 
            title="Mineração Inteligente" 
            desc="Escaneie cidades e bairros específicos integrando dados reais do Google Maps para encontrar decisores." 
          />
          <FeatureCard 
            icon={<Target className="text-[#2ECC71]" size={32} />} 
            title="Alta Conversão" 
            desc="Seja qual for o seu ramo, filtramos apenas os clientes que têm o potencial imediato de fechar negócio." 
          />
          <FeatureCard 
            icon={<MessageCircle className="text-[#2ECC71]" size={32} />} 
            title="Integração WhatsApp" 
            desc="Extraia o contato direto do WhatsApp Business e inicie a conversa sem esperas." 
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 px-8 bg-[#0A2540] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#2ECC71] rounded-full opacity-[0.03] blur-[100px]" />
        
        <div className="max-w-7xl mx-auto text-center px-8">
            <header className="mb-16">
              <h2 className="text-4xl font-bold font-outfit mb-6 text-white text-center">Invista no seu Crescimento</h2>
              <p className="text-white/60 text-lg font-medium">Pagamentos locais simplificados via canais moçambicanos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 items-center">
              
              <PriceCard 
                title="Gratuito" 
                price="0" 
                desc="Ideal para começar a testar o mercado hoje mesmo."
                features={["7 leads/dia", "Acesso aos dados básicos", "Filtros Iniciais", "Recurso de Mapa"]}
              />
              
              <PriceCard 
                title="Empreendedor" 
                price="267" 
                desc="Para quem vive de vendas e precisa de velocidade."
                popular
                features={["100 leads/dia", "Dados de WhatsApp", "Filtros Avançados", "Exportação PDF/Excel"]}
              />

              <PriceCard 
                title="Agência" 
                price="2.530" 
                desc="Acesso massivo para equipas de alta performance."
                features={["Múltiplos Utilizadores", "Varrimentos de Cidades", "Prioridade de Scraping", "Suporte VIP MZ"]}
              />

            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-[#E2E8F0] mt-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <img src="/logo.svg" alt="TxunaLeads Logo" className="h-8 lg:h-10 w-auto mb-6" />
            <p className="text-[#64748B] max-w-xs font-medium font-sans leading-relaxed">Redefinindo a prospecção de vendas em Moçambique com inteligência e precisão em qualquer mercado.</p>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-6 font-outfit">Sistema</h3>
            <ul className="space-y-4 text-sm font-bold text-[#0A2540]">
              <li><Link href="/">Tela de Início</Link></li>
              <li><Link href="/dashboard">Painel de Leads</Link></li>
              <li><Link href="#precos">Tabela de Preços</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-6 font-outfit">Suporte</h3>
            <ul className="space-y-4 text-sm font-bold text-[#0A2540]">
              <li><a href="#" className="cursor-pointer">Privacidade</a></li>
              <li><a href="#" className="cursor-pointer">Termos</a></li>
              <li><a href="#" className="cursor-pointer text-[#2ECC71]">Contato MZ</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[#E2E8F0] mt-16 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <p className="text-xs font-bold text-[#94A3B8]">© 2026 TxunaLeads MZ. Desenvolvido para o Sucesso.</p>
            <div className="flex gap-4 text-[#94A3B8]">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Plataforma Segura e Encriptada</span>
            </div>
        </div>
      </footer>

    </div>
  );
}

// --- Componentes ---

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-10 rounded-3xl border border-[#E2E8F0] hover:border-[#2ECC71] hover:shadow-2xl transition-all group cursor-default h-full bg-white">
      <div className="mb-6 w-16 h-16 bg-[#EAFCF1] rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#0A2540] mb-4 font-outfit">{title}</h3>
      <p className="text-[#64748B] font-medium leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function PriceCard({ title, price, desc, features, popular = false }: any) {
  return (
    <div className={`p-8 md:p-10 rounded-[40px] border relative transition-all h-full ${
      popular ? 'bg-white text-[#0A2540] border-[#2ECC71] md:scale-105 shadow-[0_40px_80px_-20px_rgba(46,204,113,0.3)]' : 'bg-[#0F172A] border-white/10 text-white'
    }`}>
      {popular && (
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-[#2ECC71] text-[#0A2540] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap z-10">
          O Mais Popular (MZ)
        </div>
      )}
      <h3 className={`text-2xl font-bold font-outfit mb-4 ${popular ? 'text-[#0A2540]' : 'text-[#2ECC71]'}`}>{title}</h3>
      <div className="mb-6">
        <span className="text-5xl font-black font-outfit">MT {price}</span>
        <span className="text-sm opacity-60 font-bold"> / mês</span>
      </div>
      <p className={`text-sm opacity-70 mb-10 min-h-[40px] font-medium font-sans`}>{desc}</p>
      
      <ul className="text-left space-y-4 mb-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm font-bold">
            <CheckCircle size={18} className='text-[#2ECC71]' />
            {f}
          </li>
        ))}
      </ul>

      <Link href="/auth/signup" className={`w-full block py-5 rounded-2xl font-black transition-all active:scale-95 text-center ${
        popular ? 'bg-[#0A2540] text-white shadow-xl hover:bg-[#162e49]' : 'bg-white/10 text-white hover:bg-white/20'
      }`}>
        {price === "0" ? 'Começar Grátis' : 'Obter Acesso'}
      </Link>
    </div>
  );
}
