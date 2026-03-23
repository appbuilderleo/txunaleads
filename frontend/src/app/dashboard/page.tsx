"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Settings, 
  LayoutDashboard, 
  Package, 
  User, 
  Bell, 
  Zap, 
  MapPin, 
  ChevronDown, 
  Clock, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Globe, 
  Home,
  FileDown,
  MessageCircle,
  Star,
  Search,
  Check,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Menu
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import Cookies from 'js-cookie';

// --- Tipagem de Leads ---
interface Lead {
  Empresa: string;
  Morada: string;
  Telefone: string;
  Website: string;
  Score: number;
  Potencial: string;
  Rating: number;
  Reviews: number;
  ReviewSnippet: string;
  _id?: string;
  status?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nicho, setNicho] = useState('Oficinas Mecânicas');
  const [localizacao, setLocalizacao] = useState('Maputo');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Payment States ---
  const [checkoutModal, setCheckoutModal] = useState<{
    show: boolean;
    plan: string;
    price: string;
  }>({ show: false, plan: '', price: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'M-PESA' | 'E-MOLA' | 'CARD'>('M-PESA');
  const [paymentPhone, setPaymentPhone] = useState('');

  // --- Modal States ---
  const [modal, setModal] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    data?: any;
    onConfirm?: () => void;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showModal = (type: any, title: string, message: string, onConfirm?: () => void, data?: any) => {
    setModal({ show: true, type, title, message, onConfirm, data });
  };

  // --- Função de Logout ---
  const handleLogout = () => {
    Cookies.remove('txunaleads_token');
    sessionStorage.removeItem('txunaleads_token');
    sessionStorage.removeItem('txunaleads_user');
    window.location.href = '/auth/login';
  };

  // --- Recuperar dados do user e LEADS do banco ---
  const [user, setUser] = useState<any>(null);
  
  React.useEffect(() => {
    const userData = sessionStorage.getItem('txunaleads_user');
    const token = Cookies.get('txunaleads_token');

    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (token) {
      fetchLeads(token);
      
      // Sincronizar dados do lado do servidor (para garantir upgrades de plano via Webhook após redir)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      axios.get(`${apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data.success) {
          const updatedUser = res.data.user;
          setUser(updatedUser);
          sessionStorage.setItem('txunaleads_user', JSON.stringify(updatedUser));
        }
      }).catch(err => console.error('Erro ao sincronizar user:', err));
    }
  }, []);

  const fetchLeads = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.get(`${apiUrl}/api/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSavedLeads(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar leads históricos:', error);
    }
  };

  // --- Função Central de Scan ---
  const handleScan = async () => {
    const token = Cookies.get('txunaleads_token');
    if (!token) {
      showModal('warning', 'Sessão Expirada', 'Por favor, faça login novamente para continuar.');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.post(`${apiUrl}/api/scan`, {
        query: nicho,
        location: localizacao
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLeads(response.data.data);
      const { newLeads, updatedLeads, count } = response.data;
      showModal('success', 'Varredura Concluída', `Foram processados ${count} leads no total.`, undefined, {
        new: newLeads,
        updated: updatedLeads,
        total: count
      });
    } catch (error: any) {
      console.error('Erro ao buscar leads:', error);
      showModal('error', 'Falha na Varredura', error.response?.data?.error || 'Não foi possível ligar ao servidor de scraping.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token = Cookies.get('txunaleads_token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await axios.patch(`${apiUrl}/api/leads/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedLeads(prev => prev.map(l => l._id === id ? { ...l, status: newStatus } : l));
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ["Empresa", "Morada", "Telefone", "Website", "Score", "Potencial", "Rating", "Reviews"];
    const csvContent = [
      headers.join(","),
      ...leads.map(l => [
        `"${l.Empresa.replace(/"/g, '""')}"`,
        `"${l.Morada.replace(/"/g, '""')}"`,
        `"${l.Telefone}"`,
        `"${l.Website}"`,
        l.Score,
        l.Potencial,
        l.Rating,
        l.Reviews
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `txunaleads_${nicho.toLowerCase()}_${localizacao.toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * HANDLERS DE PAGAMENTO
   */
  const handleCheckoutInit = async (plan: string, price: string) => {
    setPaymentLoading(true);
    const token = Cookies.get('txunaleads_token');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await axios.post(`${apiUrl}/api/payments/checkout`, {
        plan,
        amount: parseInt(price.replace('.', '')),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
         showModal('error', 'Falha no Redirecionamento', 'Não foi recebida nenhuma resposta do gateway.');
         setPaymentLoading(false);
      }
    } catch (error: any) {
       console.error('❌ Erro no checkout:', error);
       showModal('error', 'Falha no Pagamento', 'Houve um erro ao inicializar o pagamento. Tente novamente.');
       setPaymentLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#F8FAFC] font-sans text-[#0F172A] overflow-hidden relative">
      
      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0A2540]/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Profissional (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 h-full bg-[#0A2540] p-10 flex flex-col text-white z-50 transition-transform duration-300 transform
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        <div className="flex justify-between items-center mb-12">
          <div>
            <img src="/logo.svg" alt="TxunaLeads Logo" className="h-10 w-auto brightness-0 invert" />
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2 px-1">
              INTELLIGENT CURATOR
            </p>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} />
          <NavItem icon={<Star size={20} />} label="Prospecção Premium" active={activeTab === 'premium'} onClick={() => { setActiveTab('premium'); setMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Meus Leads" active={activeTab === 'leads'} onClick={() => { setActiveTab('leads'); setMobileMenuOpen(false); if(Cookies.get('txunaleads_token')) fetchLeads(Cookies.get('txunaleads_token')!); }} />
          <NavItem icon={<BarChart3 size={20} />} label="Relatórios" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }} />

          <div className="mt-12">
            <p className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest mb-5">
              EQUIPA & CONTA
            </p>
            <NavItem icon={<Package size={20} />} label="Planos & Suporte" active={activeTab === 'plans'} onClick={() => { setActiveTab('plans'); setMobileMenuOpen(false); }} />
            <NavItem icon={<User size={20} />} label="Minha Conta" active={activeTab === 'account'} onClick={() => { setActiveTab('account'); setMobileMenuOpen(false); }} />
            
            {user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="block mt-6">
                <div className="flex items-center gap-4 px-5 py-4 bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-2xl text-[#2ECC71] font-bold text-sm hover:bg-[#2ECC71]/20 transition-all">
                  <ShieldAlert size={18} /> Admin Central
                </div>
              </Link>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        <nav className="h-[72px] bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-[#F1F5F9] rounded-xl transition-colors"
            >
              <Menu size={24} className="text-[#0A2540]" />
            </button>
            <div className="text-sm font-semibold text-[#0A2540] hidden sm:block">Painel de Inteligência</div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-8">
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-[#64748B] hover:text-[#EF4444] transition-colors hidden sm:block"
            >
              Sair
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#0A2540] leading-none mb-1">{user?.name || 'Utilizador'}</p>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">Membro Grátis</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-[#0A2540]">
                {user?.name?.[0] || 'U'}
              </div>
            </div>
          </div>
        </nav>

        <div className="p-6 lg:p-12 max-w-[1300px] mx-auto w-full">
          {activeTab === 'dashboard' && (
            <>
              <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
            <div>
              <h1 className="font-outfit text-3xl font-bold text-[#0A2540] mb-2 tracking-tight">
                Painel de Inteligência
              </h1>
              <p className="text-[#64748B] text-base font-medium">
                O mercado de Moçambique na ponta dos seus dedos.
              </p>
            </div>
            <button 
              onClick={handleScan}
              disabled={loading}
              className={`w-full lg:w-auto flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold text-base transition-all shadow-lg active:scale-95 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2ECC71] text-[#0A2540] hover:-translate-y-1 hover:shadow-2xl'
              }`}
            >
              <Zap size={20} fill={loading ? "gray" : "#0A2540"} />
              {loading ? 'SCANEANDO...' : 'Scan Txuna'}
            </button>
          </header>

          {/* Search Inputs */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex justify-between items-center hover:border-[#CBD5E1] transition-all">
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">NICHO DE NEGÓCIO</p>
                <input 
                  value={nicho} 
                  onChange={(e) => setNicho(e.target.value)}
                  className="text-lg font-semibold text-[#0A2540] outline-none" 
                />
              </div>
              <ChevronDown size={20} className="text-[#94A3B8]" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm flex justify-between items-center hover:border-[#CBD5E1] transition-all">
              <div>
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">LOCALIZAÇÃO (MZ)</p>
                <input 
                  value={localizacao} 
                  onChange={(e) => setLocalizacao(e.target.value)}
                  className="text-lg font-semibold text-[#0A2540] outline-none" 
                />
              </div>
              <MapPin size={20} className="text-[#2ECC71]" />
            </div>
          </section>


          {/* Stats bar */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            <StatCard label="Leads Varridos (Sessão)" value={leads.length} growth="+100%" icon={<Clock size={40} className="text-[#E2E8F0] opacity-50" />} />
            <StatCard label="Oportunidades Quentes" value={leads.filter(l => l.Score >= 60).length} growth="FOGO" red icon={<ShieldAlert size={40} className="text-[#E2E8F0] opacity-50" />} />
            <div className="md:col-span-2 lg:col-span-1">
              <StatCard label="Potencial de Fecho" value={leads.filter(l => l.Rating > 0 && l.Rating < 4).length} growth="ALTO" icon={<Zap size={40} className="text-[#E2E8F0] opacity-50" />} />
            </div>
          </section>

          {/* Leads Results List */}
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-l-4 border-[#2ECC71] pl-5">
              <div>
                <h2 className="font-outfit text-xl font-bold text-[#0A2540]">
                  Última Varredura: {localizacao} / {nicho}
                </h2>
                <span className="text-[13px] font-bold text-[#94A3B8]">
                  Resultados encontrados: {leads.length}
                </span>
              </div>
              {leads.length > 0 && (
                <button 
                  onClick={exportToCSV}
                  className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-white border border-[#E2E8F0] text-[#0A2540] rounded-xl text-sm font-bold hover:bg-[#F8FAFC] transition-all"
                >
                  <FileDown size={18} /> Exportar CSV
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {leads.length > 0 ? (
                leads.map((lead, i) => (
                  <LeadCard key={i} lead={lead} onUpdateStatus={handleUpdateStatus} showModal={showModal} />
                ))
              ) : (
                <div className="col-span-2 py-40 text-center bg-white rounded-3xl border-2 border-dashed border-[#E2E8F0]">
                  <Search size={48} className="mx-auto text-[#E2E8F0] mb-4" />
                  <p className="text-[#94A3B8] font-bold text-lg">Pronto para a prospecção? Clique em Scan Txuna.</p>
                </div>
              )}
            </div>
          </section>
            </>
          )}

          {activeTab === 'premium' && (
             <div className="bg-white p-8 lg:p-12 rounded-[20px] border border-[#E2E8F0] text-center shadow-lg my-12">
               <Star size={64} className="mx-auto text-[#FFC107] mb-6" />
               <h2 className="font-outfit text-2xl lg:text-3xl font-bold text-[#0A2540] mb-4">Prospecção Premium</h2>
               <p className="text-[#64748B] mb-8 max-w-lg mx-auto text-sm lg:text-base">Acesso a leads diretamente do LinkedIn, enriquecimento de e-mails em massa e inteligência artificial para copy personalizado de vendas.</p>
               <button className="w-full lg:w-auto bg-gradient-to-r from-[#FFC107] to-[#F59E0B] text-white font-bold py-4 px-8 rounded-xl shadow-xl hover:scale-105 transition-all text-sm lg:text-base">Desbloquear Premium Agora</button>
             </div>
          )}

          {activeTab === 'leads' && (
             <div>
               <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                 <div>
                   <h2 className="font-outfit text-3xl font-bold text-[#0A2540] tracking-tight">Meus Leads</h2>
                   <p className="text-[#64748B] text-base mt-1">A sua base de dados histórica de prospecção.</p>
                 </div>
                 <button onClick={() => {
                    if (savedLeads.length === 0) return;
                    const csv = ["Empresa,Morada,Telefone,Website,Score,Potencial,Rating,Reviews", ...savedLeads.map(l => `"${l.Empresa.replace(/"/g, '""')}","${l.Morada.replace(/"/g, '""')}","${l.Telefone}","${l.Website}",${l.Score},${l.Potencial},${l.Rating},${l.Reviews}`)].join("\n");
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'txunaleads_historico_completo.csv';
                    link.click();
                  }} className="w-full lg:w-auto bg-[#0A2540] text-white text-sm font-bold px-6 py-4 rounded-xl hover:bg-[#1E293B] flex items-center justify-center gap-2 transition-colors">
                   <FileDown size={18} /> Exportar Toda a Base
                 </button>
               </header>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                 {savedLeads.length > 0 ? savedLeads.map((lead, i) => <LeadCard key={`saved-${i}`} lead={lead} onUpdateStatus={handleUpdateStatus} showModal={showModal} />) : <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E2E8F0]"><Users size={48} className="mx-auto text-[#E2E8F0] mb-4"/><p className="text-[#94A3B8] font-bold text-lg">Nenhum lead encontrado no histórico.</p></div>}
               </div>
             </div>
          )}

          {activeTab === 'reports' && (
             <div>
                <h2 className="font-outfit text-3xl font-bold text-[#0A2540] mb-8 tracking-tight">Relatórios de Atividade</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                  <StatCard label="Total em Base" value={savedLeads.length} growth="+5%" icon={<Users size={32} className="text-[#E2E8F0] opacity-50" />} />
                  <StatCard label="Pipeline / Contactados" value={savedLeads.filter(l => l.status && l.status !== 'novo').length} growth="CRM" icon={<MessageCircle size={32} className="text-[#E2E8F0] opacity-50" />} />
                  <div className="md:col-span-2 lg:col-span-1">
                    <StatCard label="Média de Rating" value={savedLeads.length > 0 ? (savedLeads.reduce((acc, l) => acc + l.Rating, 0) / (savedLeads.filter(l => l.Rating > 0).length || 1)).toFixed(1) : "0"} growth="⭐" icon={<Star size={32} className="text-[#E2E8F0] opacity-50" />} />
                  </div>
                </div>
                <div className="p-8 lg:p-12 min-h-[300px] bg-white border border-[#E2E8F0] rounded-[20px] flex items-center justify-center flex-col shadow-sm text-center">
                   <BarChart3 size={48} className="text-[#E2E8F0] mb-4" />
                   <p className="text-[#64748B] font-bold text-sm lg:text-base max-w-md">Gráficos demográficos de leads serão gerados no final do período facturável.</p>
                </div>
             </div>
          )}

          {activeTab === 'plans' && (
              <div className="mt-8">
                <div className="text-center mb-12">
                  <h2 className="font-outfit text-3xl lg:text-4xl font-extrabold text-[#0A2540] mb-3 tracking-tight">Invista no seu Crescimento</h2>
                  <p className="text-[#64748B] text-base lg:text-lg font-medium px-4">Pagamentos locais simplificados via canais moçambicanos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto px-4 lg:px-0">
                  <PriceCard 
                    title="Gratuito" 
                    price="0" 
                    desc="Ideal para começar a testar o mercado hoje mesmo."
                    features={["7 leads/dia", "Acesso aos dados básicos", "Filtros Iniciais", "Recurso de Mapa"]}
                    onSelect={() => showModal('info', 'Plano Atual', 'Já está a utilizar o plano gratuito.')}
                  />
                  
                  <PriceCard 
                    title="Empreendedor" 
                    price="267" 
                    desc="Para quem vive de vendas e precisa de velocidade."
                    popular
                    onSelect={() => handleCheckoutInit('Empreendedor', '267')}
                    features={["100 leads/dia", "Dados de WhatsApp", "Filtros Avançados", "Exportação PDF/Excel"]}
                  />

                  <PriceCard 
                    title="Agência" 
                    price="2.530" 
                    desc="Acesso massivo para equipas de alta performance."
                    onSelect={() => handleCheckoutInit('Agência', '2.530')}
                    features={["Múltiplos Utilizadores", "Varrimentos de Cidades", "Prioridade de Scraping", "Suporte VIP MZ"]}
                  />
                </div>

                <div className="mt-20 bg-white p-8 lg:p-10 rounded-[32px] border border-[#E2E8F0] flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto shadow-sm gap-8 text-center lg:text-left">
                  <div>
                    <h4 className="font-outfit text-xl lg:text-2xl font-bold text-[#0A2540] mb-2">Precisa de Ajuda ou Plano customizado?</h4>
                    <p className="text-[#64748B] text-sm lg:text-base">A nossa equipa de suporte em Moçambique está disponível para o ajudar via WhatsApp ou Telefone.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-[#2ECC71] text-[#0A2540] font-bold rounded-2xl hover:scale-105 transition-all text-sm">
                      <MessageCircle size={20} /> Falar no WhatsApp
                    </button>
                    <button className="flex items-center justify-center gap-2 px-8 py-4 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0A2540] font-bold rounded-2xl hover:bg-[#F1F5F9] transition-all text-sm">
                      Enviar E-mail
                    </button>
                  </div>
                </div>
              </div>
           )}

          {activeTab === 'account' && (
             <div className="max-w-3xl mx-auto bg-white p-6 lg:p-10 rounded-[20px] border border-[#E2E8F0] shadow-sm mt-8">
               <h2 className="font-outfit text-2xl font-bold text-[#0A2540] mb-8">Configurações da Conta</h2>
               
               <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-[#E2E8F0] text-center sm:text-left">
                 <div className="w-24 h-24 bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] rounded-full flex items-center justify-center text-3xl font-bold text-[#0A2540] shadow-inner">
                   {user?.name?.[0] || 'U'}
                 </div>
                 <div>
                   <p className="text-lg font-bold text-[#0A2540]">{user?.name || 'Utilizador'}</p>
                   <p className="text-[#64748B] mb-3 text-sm">{user?.email || 'email@exemplo.com'}</p>
                   <button className="text-sm font-bold text-[#2ECC71] hover:underline">Alterar Fotografia</button>
                 </div>
               </div>

               <div className="space-y-6">
                 <div>
                   <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Nome Completo</label>
                   <input type="text" className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A2540] font-semibold outline-none focus:border-[#2ECC71] text-sm lg:text-base" defaultValue={user?.name || 'Utilizador'} />
                 </div>
                 <div>
                   <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Endereço de E-mail</label>
                   <input type="email" className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A2540] font-semibold outline-none focus:border-[#2ECC71] text-sm lg:text-base" defaultValue={user?.email || 'email@exemplo.com'} />
                 </div>
                 <div>
                   <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Senha</label>
                   <input type="password" className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0A2540] font-semibold outline-none focus:border-[#2ECC71] text-sm lg:text-base" defaultValue="********" />
                   <p className="text-right text-xs mt-2 text-[#64748B] hover:text-[#0A2540] cursor-pointer font-bold transition-colors">Redefinir Senha</p>
                 </div>
               </div>

               <div className="mt-10 pt-10 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-end gap-4">
                 <button className="px-6 py-4 font-bold text-[#64748B] hover:bg-[#F8FAFC] rounded-xl transition-colors text-sm">Cancelar</button>
                 <button className="px-6 py-4 font-bold bg-[#0A2540] text-white rounded-xl shadow-lg hover:bg-[#1E293B] hover:-translate-y-0.5 transition-all text-sm">Salvar Alterações</button>
               </div>
             </div>
          )}
        </div>
      </main>

      {/* Global Custom Modal */}
      {modal.show && (
        <CustomModal 
          type={modal.type} 
          title={modal.title} 
          message={modal.message} 
          onClose={() => setModal({ ...modal, show: false })} 
          onConfirm={modal.onConfirm}
          data={modal.data}
        />
      )}

      {/* Checkout Loading Overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0A2540]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-6">
             <div className="w-16 h-16 border-4 border-[#1E293B] border-t-[#2ECC71] rounded-full animate-spin"></div>
             <div className="text-center">
                <p className="text-xl font-bold text-white">A preparar ambiente seguro...</p>
                <p className="text-white/60 text-sm mt-2">Irá ser redirecionado para a plataforma da PaySuite.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-componentes ---

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-all mb-2 ${
      active ? 'bg-[#2ECC71] text-[#0A2540] shadow-lg shadow-[#2ECC71]/20' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`}>
      {icon}
      {label}
    </div>
  );
}

function StatCard({ label, value, growth, icon, red = false }: any) {
  return (
    <div className="bg-white p-7 rounded-[20px] border border-[#E2E8F0] relative overflow-hidden group hover:shadow-xl transition-all">
      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4">{label}</p>
      <div className="text-[34px] font-extrabold text-[#0A2540] leading-none mb-2">{value}</div>
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold ${
        red ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#166534]'
      }`}>
        {growth}
      </div>
      <div className="absolute right-7 top-7 transition-all group-hover:scale-110">
        {icon}
      </div>
    </div>
  );
}

function LeadCard({ lead, onUpdateStatus, showModal }: { lead: Lead, onUpdateStatus?: (id: string, newStatus: string) => void, showModal?: any }) {
  const currentStatus = lead.status || 'novo';

  const handleWhatsApp = () => {
    if (!lead.Telefone || lead.Telefone === 'N/A') {
      if (showModal) {
        showModal('warning', 'Dados Ausentes', 'Este lead não possui um número de telefone registado na base de dados.');
      } else {
        alert('⚠️ Este lead não possui número de telefone registado.');
      }
      return;
    }
    // Remove tudo que não for dígito e garante o DDI 258 se faltar
    let cleanPhone = lead.Telefone.replace(/\D/g, '');
    if (cleanPhone.length >= 9 && cleanPhone.length <= 11 && !cleanPhone.startsWith('258')) {
      cleanPhone = `258${cleanPhone.slice(-9)}`;
    }
    const message = encodeURIComponent(`Olá ${lead.Empresa}, encontrei o vosso perfil e gostaria de saber mais sobre os vossos serviços.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    
    // Auto-update CRM status
    if (lead._id && onUpdateStatus && currentStatus === 'novo') {
      onUpdateStatus(lead._id, 'contactado');
    }
  };

  const handleDetails = () => {
    if (showModal) {
      showModal('info', 'Detalhes do Lead', 'Informações completas do perfil selecionado.', undefined, { lead });
    } else {
      alert(`🏢 ${lead.Empresa.toUpperCase()}\n\n📍 Morada: ${lead.Morada}\n📞 Telefone: ${lead.Telefone}\n🌐 Website: ${lead.Website}\n⭐ Rating: ${lead.Rating} (${lead.Reviews} avaliações)\n\n💬 Último feedback:\n"${lead.ReviewSnippet}"\n\n🎯 Score Txuna: ${lead.Score}/100 (${lead.Potencial})`);
    }
  };

  return (
    <div className="bg-white rounded-[20px] p-9 border border-[#E2E8F0] relative hover:shadow-2xl transition-all group">
      
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="bg-[#F0FDF4] text-[#166534] text-[11px] font-bold px-4 py-1.5 rounded-lg uppercase hidden sm:block">
          {lead.Potencial || 'ALTO POTENCIAL'}
        </div>
        {lead._id && (
          <select 
            value={currentStatus} 
            onChange={(e) => onUpdateStatus?.(lead._id!, e.target.value)}
            className={`text-[11px] uppercase font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-colors shadow-sm
              ${currentStatus === 'novo' ? 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]' : ''}
              ${currentStatus === 'contactado' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : ''}
              ${currentStatus === 'reuniao' ? 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]' : ''}
              ${currentStatus === 'fechado' ? 'bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]' : ''}
              ${currentStatus === 'recusado' ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]' : ''}
            `}
          >
            <option value="novo">🟣 NOVO</option>
            <option value="contactado">🟡 CONTACTADO</option>
            <option value="reuniao">🔵 REUNIÃO</option>
            <option value="fechado">🟢 FECHADO</option>
            <option value="recusado">🔴 RECUSADO</option>
          </select>
        )}
      </div>

      <div className="absolute top-8 right-8 bg-[#F8FAFC] text-[#0A2540] text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#E2E8F0]">
        <Star size={14} fill={lead.Rating > 0 ? "#FFC107" : "none"} className={lead.Rating > 0 ? "text-[#FFC107]" : "text-[#94A3B8]"} /> 
        {lead.Rating > 0 ? `${lead.Rating} (${lead.Reviews})` : 'Sem Avaliação'}
      </div>

      <div className="mt-12">
        <h3 className="font-outfit text-2xl font-bold text-[#0A2540] mb-6 group-hover:text-[#2ECC71] transition-colors">{lead.Empresa}</h3>
        <div className="flex flex-col gap-3.5 mb-6">
          <div className="flex items-center gap-3.5 text-sm font-medium text-[#64748B]">
            <MapPin size={18} className="text-[#2ECC71]" />
            {lead.Morada}
          </div>
          <div className="flex items-center gap-3.5 text-sm font-medium text-[#64748B]">
            <Phone size={18} className="text-[#2ECC71]" />
            {lead.Telefone}
          </div>
          <div className="flex items-center gap-3.5 text-sm font-medium text-[#64748B]">
            <Globe size={18} className="text-[#2ECC71]" />
            {lead.Website.includes('SEM') ? (
              <span className="bg-[#FEF2F2] text-[#EF4444] text-[11px] font-bold px-3 py-1 rounded-md border border-[#FEE2E2]">NÃO ENCONTRADO</span>
            ) : (
              <span className="text-[#0A2540] truncate max-w-[200px]" title={lead.Website}>{lead.Website}</span>
            )}
          </div>
        </div>

        {/* Snippet de Comentário */}
        <div className="bg-[#F8FAFC] p-4 rounded-xl border-l-4 border-[#E2E8F0] mb-8 italic text-xs text-[#64748B] line-clamp-2" title={lead.ReviewSnippet}>
          "{lead.ReviewSnippet}"
        </div>

        <div className="flex gap-3.5">
          <button onClick={handleDetails} className="flex-1 bg-[#F1F5F9] text-[#0A2540] font-bold py-4 rounded-xl hover:bg-[#E2E8F0] active:scale-95 transition-all">
            Ver Detalhes
          </button>
          <button onClick={handleWhatsApp} className="w-14 h-[52px] bg-[#2ECC71] flex items-center justify-center rounded-xl hover:shadow-lg transition-all active:scale-95 group-hover:-translate-y-1">
            <MessageCircle size={22} className="text-[#0A2540]" />
          </button>
        </div>
      </div>
    </div>
  );
}
function CustomModal({ type, title, message, onClose, onConfirm, data }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0A2540]/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className={`h-2 w-full ${
          type === 'success' ? 'bg-[#2ECC71]' :
          type === 'error' ? 'bg-[#EF4444]' :
          type === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'
        }`} />
        
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
            type === 'success' ? 'bg-[#F0FDF4] text-[#2ECC71]' :
            type === 'error' ? 'bg-[#FEF2F2] text-[#EF4444]' :
            type === 'warning' ? 'bg-[#FFFBEB] text-[#F59E0B]' : 'bg-[#EFF6FF] text-[#3B82F6]'
          }`}>
            {type === 'success' && <CheckCircle size={40} />}
            {type === 'error' && <XCircle size={40} />}
            {type === 'warning' && <AlertTriangle size={40} />}
            {type === 'info' && <Info size={40} />}
          </div>

          <h3 className="text-2xl font-black text-[#0A2540] mb-3">{title}</h3>
          <p className="text-[#64748B] font-medium leading-relaxed mb-8">{message}</p>

          {data && type === 'success' && data.total !== undefined && (
            <div className="grid grid-cols-3 gap-3 mb-8">
               <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Total</p>
                  <p className="text-lg font-black text-[#0A2540]">{data.total}</p>
               </div>
               <div className="bg-[#F0FDF4] p-3 rounded-2xl border border-[#2ECC71]/20">
                  <p className="text-[10px] font-bold text-[#166534] uppercase">Novos</p>
                  <p className="text-lg font-black text-[#166534]">{data.new}</p>
               </div>
               <div className="bg-[#EFF6FF] p-3 rounded-2xl border border-[#3B82F6]/20">
                  <p className="text-[10px] font-bold text-[#1E40AF] uppercase">Atual.</p>
                  <p className="text-lg font-black text-[#1E40AF]">{data.updated}</p>
               </div>
            </div>
          )}

          {data && type === 'info' && data.lead && (
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0] text-left mb-8 space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Empresa</p>
                  <p className="text-sm font-bold text-[#0A2540]">{data.lead.Empresa}</p>
               </div>
               
               {data.lead.Telefone && (
                 <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Telefone</p>
                    <p className="text-sm font-bold text-[#0A2540]">{data.lead.Telefone}</p>
                 </div>
               )}

               {data.lead.Website && (
                 <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Website</p>
                    <a href={data.lead.Website.startsWith('http') ? data.lead.Website : `https://${data.lead.Website}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#3B82F6] hover:underline break-all">
                      {data.lead.Website}
                    </a>
                 </div>
               )}

               {data.lead.Morada && (
                 <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Localização / Morada</p>
                    <p className="text-xs font-semibold text-[#64748B] leading-relaxed">{data.lead.Morada}</p>
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0]">
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Score Txuna</p>
                    <p className="text-sm font-black text-[#2ECC71]">{data.lead.Score}/100</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Status CRM</p>
                    <p className="text-sm font-bold text-[#0A2540] uppercase tracking-tighter">{data.lead.status || 'novo'}</p>
                  </div>
               </div>
            </div>
          )}

          <div className="flex gap-4">
            {onConfirm ? (
              <>
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 bg-[#F8FAFC] text-[#64748B] font-bold rounded-2xl hover:bg-[#F1F5F9] transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`flex-1 py-4 text-white font-bold rounded-2xl shadow-xl transition-all ${
                    type === 'warning' ? 'bg-[#F59E0B] shadow-[#F59E0B]/20' : 'bg-[#0A2540]'
                  }`}
                >
                  Confirmar
                </button>
              </>
            ) : (
              <button 
                onClick={onClose}
                className="w-full py-4 bg-[#0A2540] text-white font-bold rounded-2xl shadow-xl shadow-[#0A2540]/20 hover:-translate-y-1 transition-all"
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceCard({ title, price, desc, features, popular = false, onSelect }: any) {
  return (
    <div className={`p-8 lg:p-10 rounded-[40px] border transition-all h-full ${popular ? 'bg-[#0A2540] text-white border-transparent shadow-2xl relative' : 'bg-white border-[#E2E8F0]'}`}>
      {popular && (
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 bg-[#2ECC71] text-[#0A2540] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap z-10 shadow-lg">
          Recomendado
        </div>
      )}
      <div className="mb-10 text-center">
        <h3 className="text-2xl font-black mb-2">{title}</h3>
        <p className={`text-xs font-medium ${popular ? 'text-white/60' : 'text-[#64748B]'}`}>{desc}</p>
      </div>
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-bold opacity-60">MT</span>
          <span className="text-5xl font-black tracking-tight">{price}</span>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-2">Pagamento Mensal</p>
      </div>
      <ul className="space-y-4 mb-12">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-3 text-xs font-bold">
            <CheckCircle className="text-[#2ECC71] shrink-0" size={18} />
            {feature}
          </li>
        ))}
      </ul>
      <button 
        onClick={onSelect}
        className={`w-full py-5 rounded-2xl font-black text-sm active:scale-[0.98] transition-all ${popular ? 'bg-[#2ECC71] text-[#0A2540] shadow-xl shadow-[#2ECC71]/20 hover:scale-[1.02]' : 'bg-[#F8FAFC] text-[#0A2540] border border-[#E2E8F0] hover:bg-[#F1F5F9]'}`}
      >
        {price === "0" ? 'Plano Atual' : 'Obter Acesso Total'}
      </button>
    </div>
  );
}


