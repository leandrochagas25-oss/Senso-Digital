import React, { useState } from 'react';
import { Shield, User, Key, Lock, ChevronRight, AlertCircle, Stethoscope } from 'lucide-react';
import { Admin, AccessCode, AuthSession } from '../types';

interface LoginPortalProps {
  onLogin: (session: AuthSession) => void;
  admins: Admin[];
  accessCodes: AccessCode[];
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin, admins, accessCodes }) => {
  const [activeTab, setActiveTab] = useState<'guest' | 'admin'>('guest');
  const [error, setError] = useState<string | null>(null);

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    registration: '',
    type: 'Administrativo' as Admin['type'],
    password: ''
  });

  // Guest Form State
  const [guestForm, setGuestForm] = useState({
    name: '',
    category: '',
    code: new URLSearchParams(window.location.search).get('code')?.toUpperCase() || ''
  });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const admin = admins.find(a => 
      a.registration === adminForm.registration && 
      a.password.toUpperCase() === adminForm.password.toUpperCase() &&
      a.type === adminForm.type
    );

    if (admin) {
      onLogin({
        type: 'admin',
        name: admin.name,
        registration: admin.registration,
        sector: 'all'
      });
    } else {
      setError('Credenciais administrativas inválidas.');
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = accessCodes.find(c => c.code.toUpperCase() === guestForm.code.toUpperCase());

    if (code) {
      onLogin({
        type: 'guest',
        name: guestForm.name,
        category: guestForm.category,
        sector: code.sector
      });
    } else {
      setError('Código de acesso inválido ou expirado.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-medical-blue rounded-2xl shadow-lg shadow-medical-blue/20 mb-4">
            <Stethoscope className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Senso Digital</h1>
          <p className="text-slate-500 mt-2 font-medium">Gestão Inteligente de Unidades</p>
        </div>

        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex mb-6">
          <button
            onClick={() => { setActiveTab('guest'); setError(null); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guest' ? 'bg-medical-blue text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <User size={18} />
            Convidado
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError(null); }}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Shield size={18} />
            Gestor
            <span className="bg-medical-blue text-[8px] px-1.5 py-0.5 rounded-full text-white">PRO</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </div>
            )}

            {activeTab === 'guest' ? (
              <form onSubmit={handleGuestLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Seu nome"
                      value={guestForm.name}
                      onChange={e => setGuestForm({ ...guestForm, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Categoria Profissional</label>
                  <select
                    required
                    value={guestForm.category}
                    onChange={e => setGuestForm({ ...guestForm, category: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-slate-800 font-medium appearance-none"
                  >
                    <option value="">Selecione sua categoria</option>
                    <option value="Enfermeiro">Enfermeiro(a)</option>
                    <option value="Técnico de Enfermagem">Técnico(a) de Enfermagem</option>
                    <option value="Médico">Médico(a)</option>
                    <option value="Fisioterapeuta">Fisioterapeuta</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Código de Acesso</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Ex: CLI-MED-2024"
                      value={guestForm.code}
                      onChange={e => setGuestForm({ ...guestForm, code: e.target.value.toUpperCase() })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-slate-800 font-bold tracking-widest uppercase"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-medical-blue text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-medical-blue/20 hover:bg-medical-blue/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Acessar Unidade
                  <ChevronRight size={20} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo Registro</label>
                    <select
                      required
                      value={adminForm.type}
                      onChange={e => setAdminForm({ ...adminForm, type: e.target.value as Admin['type'] })}
                      className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-slate-800 font-medium appearance-none"
                    >
                      <option value="Administrativo">Admin</option>
                      <option value="COREN">COREN</option>
                      <option value="CRM">CRM</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nº Registro</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: 123456"
                      value={adminForm.registration}
                      onChange={e => setAdminForm({ ...adminForm, registration: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      type="password"
                      value={adminForm.password}
                      onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-slate-800/20 hover:bg-slate-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Entrar como Gestor
                  <ChevronRight size={20} />
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          &copy; 2026 Senso Digital Pro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};
