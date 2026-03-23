"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Zap, 
  LogOut,
  ShieldCheck,
  TrendingUp,
  Search,
  Check,
  Database,
  ArrowRight,
  UserPlus,
  Trash2,
  Lock,
  DollarSign,
  Activity,
  Globe,
  Settings,
  MoreVertical,
  Cpu,
  BarChart2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Menu
} from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Modal States ---
  const [modal, setModal] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showModal = (type: any, title: string, message: string, onConfirm?: () => void) => {
    setModal({ show: true, type, title, message, onConfirm });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const token = Cookies.get('txunaleads_token');
    if (!token) {
        window.location.href = '/auth/login';
        return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${apiUrl}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${apiUrl}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        showModal('error', 'Acesso Negado', 'Esta área é exclusiva para administradores.');
        setTimeout(() => { window.location.href = '/dashboard'; }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (userId: string, plan: string) => {
    setProcessingId(userId);
    const token = Cookies.get('txunaleads_token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.patch(`${apiUrl}/api/admin/users/${userId}/plan`, { plan }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showModal('success', 'Plano Atualizado', 'A subscrição do utilizador foi alterada com sucesso.');
      fetchAdminData();
    } catch (error) {
      showModal('error', 'Falha na Atualização', 'Não foi possível alterar o plano do utilizador.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setProcessingId(userId);
    const token = Cookies.get('txunaleads_token');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.patch(`${apiUrl}/api/admin/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showModal('success', 'Cargo Atualizado', 'O nível de acesso do utilizador foi modificado.');
      fetchAdminData();
    } catch (error) {
      showModal('error', 'Erro Crítico', 'Falha ao processar alteração de cargo.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    showModal(
        'warning', 
        'Eliminar Utilizador?', 
        'Atenção! Esta ação irá apagar permanentemente o utilizador e todos os seus leads. Deseja continuar?',
        async () => {
            setProcessingId(userId);
            const token = Cookies.get('txunaleads_token');
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
              await axios.delete(`${apiUrl}/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              showModal('success', 'Limpeza Concluída', 'O utilizador e os seus dados foram removidos da base central.');
              fetchAdminData();
            } catch (error) {
              showModal('error', 'Falha na Remoção', 'Não foi possível apagar os dados do sistema.');
            } finally {
              setProcessingId(null);
            }
        }
    );
  };

  const handleLogout = () => {
    Cookies.remove('txunaleads_token');
    localStorage.removeItem('txunaleads_user');
    window.location.href = '/auth/login';
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBillingUsers = () => users.filter(u => u.plan !== 'Gratuito');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-outfit">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#0A2540] border-t-[#2ECC71] rounded-full animate-spin"></div>
          <p className="font-bold text-[#0A2540]">A carregar Inteligência Central...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col lg:flex-row font-outfit relative overflow-hidden">
      
      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0A2540]/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Admin High-End (Responsive) */}
      <aside className={`
        fixed inset-y-0 left-0 w-80 bg-[#0A2540] text-white flex flex-col p-8 z-50 transition-transform duration-300 transform
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex h-full shadow-2xl
      `}>
        <div className="flex justify-between items-center mb-14 px-2">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="TxunaLeads Admin" className="h-10 w-auto brightness-0 invert" />
            <div className="border-l border-white/20 pl-4">
              <p className="text-[10px] text-white/50 font-bold tracking-[0.3em] uppercase">Command</p>
              <p className="text-[10px] text-white/50 font-bold tracking-[0.3em] uppercase">Center</p>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<Activity size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Utilizadores" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }} />
          <NavItem icon={<DollarSign size={20} />} label="Faturamento MZ" active={activeTab === 'billing'} onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }} />
          <NavItem icon={<Settings size={20} />} label="Configurações" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} />
        </nav>

        <div className="mt-auto">
          <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/10">
             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">System Health</p>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
                <span className="text-xs font-bold text-white/80">API Google/Maps 100%</span>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 text-white/50 hover:text-white transition-all w-full text-sm font-bold bg-white/5 rounded-2xl hover:bg-white/10"
          >
            <LogOut size={20} /> Terminar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 bg-[#F8FAFC] overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-3 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm hover:bg-[#F8FAFC] transition-all"
              >
                <Menu size={24} className="text-[#0A2540]" />
              </button>
              <div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0A2540] tracking-tight">Intelligence Center</h2>
                <p className="text-[#64748B] text-base lg:text-lg mt-2 font-medium">Controlo estratégico de operações em Moçambique.</p>
              </div>
            </div>
            <div className="flex gap-4 w-full lg:w-auto">
               <div className="flex-1 lg:flex-none bg-white px-6 py-4 rounded-3xl border border-[#E2E8F0] shadow-sm flex items-center justify-between lg:justify-start gap-4">
                  <div className="text-left lg:text-right">
                     <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Receita Real</p>
                     <p className="font-black text-[#0A2540]">{stats?.estimatedRevenue?.toLocaleString()} MT</p>
                  </div>
                  <TrendingUp className="text-[#2ECC71]" size={24} />
               </div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               {/* Global Stats Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  <StatCard label="Base de Utilizadores" value={stats?.totalUsers} growth="+5%" icon={<Users size={28} className="text-[#3B82F6]" />} color="blue" />
                  <StatCard label="Leads Varridos" value={stats?.totalLeads} growth="+24%" icon={<Database size={28} className="text-[#2ECC71]" />} color="green" />
                  <StatCard label="Taxa de Conversão" value={`${Math.round(((stats?.planCounts?.find((p:any)=>p._id!=='Gratuito')?.count || 0) / (stats?.totalUsers || 1)) * 100)}%`} growth="Premium" icon={<Zap size={28} className="text-[#F59E0B]" />} color="yellow" />
                  <StatCard label="Faturamento Total" value={`${stats?.estimatedRevenue?.toLocaleString()} MT`} growth="Atual" icon={<DollarSign size={28} className="text-[#10B981]" />} color="teal" />
               </div>

               {/* Charts & Distributions */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 bg-white p-6 lg:p-10 rounded-[40px] border border-[#E2E8F0] shadow-xl relative overflow-hidden">
                     <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-[#0A2540]">Atividade de Prospecção MZ (7d)</h3>
                        <BarChart2 className="text-[#94A3B8]" />
                     </div>
                     <div className="h-64 flex items-end gap-6 overflow-hidden">
                        {(stats?.dailyActivity || []).map((day: any, i: number) => {
                           const maxLeads = Math.max(...(stats?.dailyActivity || []).map((d: any) => d.count), 1);
                           const height = (day.count / maxLeads) * 100;
                           return (
                              <div key={i} className="flex-1 bg-gradient-to-t from-[#0A2540] to-[#2ECC71] rounded-t-2xl transition-all hover:scale-105 cursor-pointer relative group/bar" style={{ height: `${Math.max(height, 5)}%` }}>
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0A2540] text-white text-[10px] font-black px-2 py-1 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                   {day.count} leads
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                     <div className="flex justify-between mt-6 px-2 text-[11px] font-bold text-[#94A3B8]">
                        {(stats?.dailyActivity || []).map((day: any, i: number) => (
                           <span key={i} className="flex-1 text-center">{day.label}</span>
                        ))}
                     </div>

                  </div>

                  <div className="bg-[#0B1221] p-10 rounded-[40px] shadow-2xl flex flex-col border border-white/5">
                     <h3 className="text-xl font-bold text-[#2ECC71] mb-8">Status dos Planos</h3>
                     <div className="space-y-8 flex-1">
                        {stats?.planCounts?.sort((a:any, b:any) => b.count - a.count).map((p: any) => (
                           <div key={p._id}>
                              <div className="flex justify-between text-xs font-bold text-white/70 mb-2 uppercase tracking-widest">
                                 <span>{p._id || 'Incompleto'}</span>
                                 <span>{p.count} users</span>
                              </div>
                              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                 <div 
                                    className={`h-full rounded-full ${p._id === 'Gratuito' ? 'bg-white/20' : 'bg-gradient-to-r from-[#2ECC71] to-[#27AE60]'}`} 
                                    style={{ width: `${(p.count / stats.totalUsers) * 100}%` }}
                                 />
                              </div>
                           </div>
                        ))}
                     </div>
                     <button className="w-full py-4 mt-8 bg-[#2ECC71] text-[#0A2540] font-bold rounded-2xl hover:bg-[#27AE60] transition-all">Ver Relatório Completo</button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-[40px] border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
               <div className="p-6 lg:p-10 border-b border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#F8FAFC]/50 backdrop-blur-xl sticky top-0 z-10">
                  <div>
                    <h3 className="text-2xl font-black text-[#0A2540]">Gestão de Utilizadores</h3>
                    <p className="text-[#64748B] text-sm font-medium">Controlo total de permissões e subscrições.</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-[#E2E8F0] w-full md:w-[450px] shadow-sm focus-within:ring-2 focus-within:ring-[#2ECC71]/20 focus-within:border-[#2ECC71] transition-all">
                       <Search size={22} className="text-[#94A3B8]" />
                       <input 
                        type="text" 
                        placeholder="Pesquisar utilizador..." 
                        className="bg-transparent border-none outline-none text-sm lg:text-base font-semibold w-full text-[#0A2540]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-0">
                    <thead>
                      <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] border-b text-center">
                        <th className="px-10 py-6 text-left">Utilizador</th>
                        <th className="px-10 py-6">Cargo / Role</th>
                        <th className="px-10 py-6">Upgrade de Plano</th>
                        <th className="px-10 py-6">Leads</th>
                        <th className="px-10 py-6">Data Registo</th>
                        <th className="px-10 py-6">Moderador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-[#F8FAFC] transition-all group">
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-2xl flex items-center justify-center font-black text-[#64748B] shadow-sm transform group-hover:rotate-6 transition-all">
                                  {u.name[0].toUpperCase()}
                               </div>
                               <div>
                                  <p className="font-black text-[#0A2540] text-lg">{u.name}</p>
                                  <p className="text-sm font-semibold text-[#64748B]">{u.email}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-10 py-7 text-center">
                             <select 
                                disabled={processingId === u._id}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all cursor-pointer outline-none ${
                                  u.role === 'admin' ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                                }`}
                                value={u.role}
                                onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                             >
                                <option value="user">USER</option>
                                <option value="admin">ADMIN</option>
                             </select>
                          </td>
                          <td className="px-10 py-7 text-center">
                            <select 
                              disabled={processingId === u._id}
                              className={`bg-white border text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl outline-none transition-all cursor-pointer ${
                                u.plan === 'Empreendedor' ? 'border-[#2ECC71] text-[#166534]' : 'border-[#E2E8F0] text-[#0A2540]'
                              }`}
                              value={u.plan}
                              onChange={(e) => handleUpdatePlan(u._id, e.target.value)}
                            >
                              <option value="Gratuito">Gratuito</option>
                              <option value="Empreendedor">Empreendedor</option>
                              <option value="Agência">Agência</option>
                            </select>
                          </td>
                          <td className="px-10 py-7 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] rounded-xl font-black text-[#0A2540] text-sm">
                               <Database size={16} className="text-[#3B82F6]" /> {u.leadCount || 0}
                            </div>
                          </td>
                          <td className="px-10 py-7 text-center text-sm font-bold text-[#64748B]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-10 py-7 text-center">
                             <button 
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={processingId === u._id}
                                className="w-10 h-10 bg-[#FEF2F2] text-[#EF4444] rounded-xl flex items-center justify-center hover:bg-[#EF4444] hover:text-white transition-all shadow-sm mx-auto"
                             >
                               <Trash2 size={20} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <div className="bg-white p-8 rounded-[32px] border-b-8 border-b-[#2ECC71] shadow-xl">
                     <p className="text-[10px] font-black text-[#94A3B8] uppercase mb-4 tracking-widest text-center">Faturação MZ Real</p>
                     <p className="text-4xl font-black text-[#0A2540] text-center mb-6">{stats?.estimatedRevenue?.toLocaleString()} MT</p>
                     <div className="flex justify-between text-xs font-bold text-[#64748B]">
                        <span>Empreendedores: {stats?.planCounts?.find((p:any)=>p._id==='Empreendedor')?.count || 0}</span>
                        <span>Agências: {stats?.planCounts?.find((p:any)=>p._id==='Agência')?.count || 0}</span>
                     </div>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border-b-8 border-b-[#3B82F6] shadow-xl">
                     <p className="text-[10px] font-black text-[#94A3B8] uppercase mb-4 tracking-widest text-center">Ticket Médio</p>
                     <p className="text-4xl font-black text-[#0A2540] text-center mb-6">
                        {Math.round(stats?.estimatedRevenue / (stats?.planCounts?.filter((p:any)=>p._id!=='Gratuito')?.reduce((a:any, b:any)=>a+b.count, 0) || 1)).toLocaleString()} MT
                     </p>
                     <p className="text-center text-xs font-bold text-[#64748B]">Por subscritor pagante</p>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border-b-8 border-b-[#F59E0B] shadow-xl flex flex-col items-center justify-center">
                      <Zap size={32} className="text-[#F59E0B] mb-2" />
                      <p className="font-black text-[#0A2540]">Gateway de Pagamento</p>
                      <p className="text-xs font-bold text-[#64748B]">M-Pesa / E-Mola (Manual)</p>
                  </div>
               </div>

               <div className="bg-white rounded-[40px] border border-[#E2E8F0] shadow-2xl overflow-hidden">
                  <div className="p-10 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                     <h3 className="text-2xl font-black text-[#0A2540]">Lista de Pagadores</h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                              <th className="px-10 py-5">Cliente</th>
                              <th className="px-10 py-5">Plano Ativo</th>
                              <th className="px-10 py-5">Valor MZ</th>
                              <th className="px-10 py-5">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                           {getBillingUsers().map((u: any) => (
                              <tr key={u._id} className="hover:bg-[#F8FAFC] transition-colors">
                                 <td className="px-10 py-6">
                                    <p className="font-black text-[#0A2540]">{u.name}</p>
                                    <p className="text-xs text-[#64748B]">{u.email}</p>
                                 </td>
                                 <td className="px-10 py-6">
                                    <span className="font-bold text-[#0A2540]">{u.plan}</span>
                                 </td>
                                 <td className="px-10 py-6 font-black text-[#166534]">
                                    {(u.plan === 'Empreendedor' ? 267 : 2530).toLocaleString()} MT
                                 </td>
                                 <td className="px-10 py-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0FDF4] text-[#166534] rounded-full text-[10px] font-bold">
                                       <Check size={12} /> ATIVO
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           {getBillingUsers().length === 0 && (
                              <tr>
                                 <td colSpan={4} className="px-10 py-20 text-center font-bold text-[#94A3B8]">Nenhuma subscrição paga activa no momento.</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="bg-white p-10 rounded-[40px] border border-[#E2E8F0] shadow-xl">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-[#0A2540] text-[#2ECC71] rounded-2xl flex items-center justify-center">
                       <Settings size={28} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-[#0A2540]">Configuração do Sistema</h3>
                       <p className="text-[#64748B] font-medium">Controlo técnico e variáveis globais.</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                     <div className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0]">
                        <div>
                           <p className="font-black text-[#0A2540] mb-1">Manutenção do Sistema</p>
                           <p className="text-sm text-[#64748B]">Coloque o TxunaLeads em modo offline para actualizações.</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 accent-[#2ECC71] cursor-pointer" />
                     </div>

                     <div className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0]">
                        <div>
                           <p className="font-black text-[#0A2540] mb-1">Novos Registos</p>
                           <p className="text-sm text-[#64748B]">Permitir ou bloquear a criação de novas contas.</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#2ECC71] cursor-pointer" />
                     </div>

                     <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0]">
                        <p className="font-black text-[#0A2540] mb-4">Master Google Maps API Key</p>
                        <div className="flex gap-4">
                           <input type="password" value="************************" className="flex-1 bg-white border border-[#E2E8F0] p-4 rounded-xl outline-none font-bold text-[#0A2540]" readOnly />
                           <button className="bg-[#0A2540] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#1E293B] transition-colors">Gerir Chaves</button>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 flex justify-end">
                     <button className="bg-[#2ECC71] text-[#0A2540] px-12 py-5 rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all">Salvar Alterações Críticas</button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Global Custom Modal for Admin */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0A2540]/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`h-2 w-full ${
              modal.type === 'success' ? 'bg-[#2ECC71]' :
              modal.type === 'error' ? 'bg-[#EF4444]' :
              modal.type === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'
            }`} />
            
            <div className="p-8 text-center">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${
                modal.type === 'success' ? 'bg-[#F0FDF4] text-[#2ECC71]' :
                modal.type === 'error' ? 'bg-[#FEF2F2] text-[#EF4444]' :
                modal.type === 'warning' ? 'bg-[#FFFBEB] text-[#F59E0B]' : 'bg-[#EFF6FF] text-[#3B82F6]'
              }`}>
                {modal.type === 'success' && <CheckCircle size={40} />}
                {modal.type === 'error' && <XCircle size={40} />}
                {modal.type === 'warning' && <AlertTriangle size={40} />}
                {modal.type === 'info' && <Info size={40} />}
              </div>

              <h3 className="text-2xl font-black text-[#0A2540] mb-3">{modal.title}</h3>
              <p className="text-[#64748B] font-medium leading-relaxed mb-8">{modal.message}</p>

              <div className="flex gap-4">
                {modal.onConfirm ? (
                  <>
                    <button 
                      onClick={() => setModal({ ...modal, show: false })}
                      className="flex-1 py-4 bg-[#F8FAFC] text-[#64748B] font-bold rounded-2xl hover:bg-[#F1F5F9] transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => { modal.onConfirm!(); setModal({ ...modal, show: false }); }}
                      className={`flex-1 py-4 text-white font-bold rounded-2xl shadow-xl transition-all ${
                        modal.type === 'warning' ? 'bg-[#F59E0B] shadow-[#F59E0B]/20' : 'bg-[#0A2540]'
                      }`}
                    >
                      Confirmar
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setModal({ ...modal, show: false })}
                    className="w-full py-4 bg-[#0A2540] text-white font-bold rounded-2xl shadow-xl shadow-[#0A2540]/20 hover:-translate-y-1 transition-all"
                  >
                    Entendido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-5 rounded-[24px] text-sm font-black cursor-pointer transition-all mb-3 border ${
        active 
          ? 'bg-[#2ECC71] text-[#0A2540] border-[#2ECC71] shadow-2xl shadow-[#2ECC71]/20 transform translate-x-2' 
          : 'text-white/40 border-transparent hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`${active ? 'scale-110' : ''} transition-all`}>{icon}</div>
      {label}
    </div>
  );
}

function StatCard({ label, value, growth, icon, color }: any) {
  const colors: any = {
    blue: 'border-b-[#3B82F6]',
    green: 'border-b-[#2ECC71]',
    yellow: 'border-b-[#F59E0B]',
    teal: 'border-b-[#10B981]'
  };

  return (
    <div className={`bg-white p-9 rounded-[40px] border border-[#E2E8F0] border-b-[12px] ${colors[color]} relative overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
       <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-4">{label}</p>
       <p className="text-4xl font-black text-[#0A2540] mb-3">{value}</p>
       <div className={`flex items-center gap-2 text-xs font-black px-3 py-1.5 rounded-xl w-fit ${
          growth.includes('+') ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F1F5F9] text-[#64748B]'
       }`}>
          <TrendingUp size={14} /> {growth}
       </div>
       <div className="absolute right-9 top-9 w-14 h-14 bg-[#F8FAFC] border border-[#F1F5F9] rounded-[22px] flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm">
          {icon}
       </div>
    </div>
  );
}
