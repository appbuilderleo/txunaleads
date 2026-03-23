"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Building, ArrowRight, ShieldCheck, Zap, Home } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        password: formData.password,
        plan: 'Gratuito'
      });

      if (response.data.success) {
        // Guardar o token nos Cookies para o Middleware conseguir ler
        Cookies.set('txunaleads_token', response.data.token, { expires: 7 });

        localStorage.setItem('txunaleads_token', response.data.token);
        localStorage.setItem('txunaleads_user', JSON.stringify(response.data.user));
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      alert(error.response?.data?.error || 'Erro ao criar conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      
      {/* Lado Esquerdo - Visual (Branding) */}
      <div className="hidden lg:flex w-1/2 bg-[#0A2540] p-20 flex-col justify-between text-white relative overflow-hidden">
        {/* Gráfico de Fundo Decorativo */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#2ECC71] rounded-full opacity-5 blur-[120px]" />
        
        <div>
          <div className="mb-12">
            <img src="/logo.svg" alt="TxunaLeads Logo" className="h-10 w-auto brightness-0 invert" />
            <p className="text-[9px] font-extrabold text-white/30 uppercase tracking-widest mt-2">
              INTELLIGENT CURATOR
            </p>
          </div>
          <h1 className="text-5xl font-bold font-outfit leading-tight max-w-md">
            Comece a sua jornada de <span className="text-[#2ECC71]">Vendas</span> agora.
          </h1>
          <p className="mt-8 text-white/60 text-lg max-w-sm leading-relaxed">
            Plano <span className="text-[#2ECC71] font-extrabold font-outfit">Kanimambo</span> Grátis para começar, evolua para Empreendedor quando os seus leads se tornarem Lucro.
          </p>
        </div>

        <div className="flex gap-12 items-center border-t border-white/10 pt-12">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white font-outfit tracking-tight">MZ-84</span>
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Atendimento Local</span>
            </div>
            <p className="text-sm font-medium text-white/60">
              A única plataforma de leads desenhada para a realidade do mercado de Moçambique.
            </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-20 overflow-y-auto">
        <div className="w-full max-w-md py-12">
          <div className="mb-12 flex justify-between items-start w-full">
            <div>
              <img src="/logo.svg" alt="TxunaLeads Logo" className="h-9 w-auto" />
              <p className="text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-widest mt-2">
                INTELLIGENT CURATOR
              </p>
            </div>
            <Link href="/" className="flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0A2540] transition-all bg-[#F1F5F9] px-4 py-2 rounded-lg">
              Regressar ao Início
            </Link>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Google Signup Button */}
            <button 
              type="button"
              className="w-full bg-white border border-[#E2E8F0] text-[#0A2540] py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#F8FAFC] transition-all shadow-sm active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Registar com Google
            </button>

            {/* Separator */}
            <div className="relative flex items-center gap-4 text-[#94A3B8] py-2">
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Ou crie com e-mail</span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
            </div>

            <div className="grid grid-cols-1 gap-5">
              
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider pl-1">Nome Completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#94A3B8] group-focus-within:text-[#2ECC71] transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Seu Nome"
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/5 transition-all font-medium text-[#0F172A]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider pl-1">E-mail de Trabalho</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#94A3B8] group-focus-within:text-[#2ECC71] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@empresa.mz"
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/5 transition-all font-medium text-[#0F172A]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider pl-1">Sua Empresa / Agência</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#94A3B8] group-focus-within:text-[#2ECC71] transition-colors">
                    <Building size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Nome do Negócio"
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/5 transition-all font-medium text-[#0F172A]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-wider pl-1">Criar Palavra-passe</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#94A3B8] group-focus-within:text-[#2ECC71] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2ECC71] focus:ring-4 focus:ring-[#2ECC71]/5 transition-all font-medium text-[#0F172A]"
                    required
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed pt-2">
              Ao criar conta, você aceita os nossos <a href="#" className="font-bold text-[#0A2540] hover:underline">Termos de Serviço</a> e <a href="#" className="font-bold text-[#0A2540] hover:underline">Política de Privacidade de Dados</a> em Moçambique.
            </p>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-[#2ECC71] text-[#0A2540] py-4 rounded-xl font-extrabold flex items-center justify-center gap-3 hover:translate-y-[-2px] hover:shadow-xl hover:shadow-[#2ECC71]/20 transition-all active:scale-[0.98] mt-4 shadow-lg ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              <Zap size={20} fill="#0A2540" />
              {loading ? 'A criar conta...' : 'Obter Meu Acesso Grátis'}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-sm font-medium text-[#64748B]">
              Já utiliza o TxunaLeads?{' '}
              <Link href="/auth/login" className="text-[#0A2540] font-extrabold hover:underline">
                Fazer Login
              </Link>
            </p>
            <div className="mt-12 flex items-center justify-center gap-2 text-[#94A3B8]">
              <ShieldCheck size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Servidor Moçambique (MZ) Codificado e Seguro</span>
            </div>
          </footer>
        </div>
      </div>

    </div>
  );
}
