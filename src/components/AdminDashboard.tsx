import React, { useState } from 'react';
import { Key, UserPlus, Trash2, Shield, Layout, Users, Plus, Copy, Check, X, Lock, History, Search, Calendar as CalendarIcon, Filter, AlertCircle } from 'lucide-react';
import { AccessCode, Admin, ShiftHandover, AuditLog } from '../types';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  accessCodes: AccessCode[];
  sectors: string[];
  shifts: ShiftHandover[];
  admin: Admin;
  admins: Admin[];
  onAddCode: (code: Omit<AccessCode, 'id' | 'createdAt'>) => void;
  onDeleteCode: (id: string) => void;
  onAddSector: (name: string) => void;
  onDeleteSector: (name: string) => void;
  onUpdateAdmin: (admin: Admin) => void;
  onAddAdmin: (admin: Admin) => void;
  onDeleteAdmin: (registration: string) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  accessCodes, 
  sectors, 
  shifts,
  admin,
  admins,
  onAddCode, 
  onDeleteCode,
  onAddSector,
  onDeleteSector,
  onUpdateAdmin,
  onAddAdmin,
  onDeleteAdmin,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'users' | 'audit' | 'history'>('users');
  const [activeUserSubView, setActiveUserSubView] = useState<'access' | 'admins' | 'sectors'>('access');
  const [newCode, setNewCode] = useState({
    collaboratorName: '',
    category: 'Enfermeiro(a)',
    registration: '',
    sectors: [] as string[],
    code: ''
  });
  const [newCodeError, setNewCodeError] = useState('');
  const [newAdmin, setNewAdmin] = useState<Admin>({
    name: '',
    registration: '',
    type: 'Gerente',
    password: ''
  });
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [newSector, setNewSector] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code: result });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewCodeError('');
    if (!newCode.collaboratorName || !newCode.code || !newCode.registration || (newCode.sectors || []).length === 0) {
      setNewCodeError('Por favor, preencha todos os campos e selecione ao menos um setor.');
      return;
    }
    
    onAddCode(newCode);
    setNewCode({ 
      collaboratorName: '', 
      category: 'Enfermeiro(a)',
      registration: '',
      sectors: [], 
      code: '' 
    });
  };

  const toggleSectorSelection = (sector: string) => {
    if (sector === 'all') {
      setNewCode(prev => ({
        ...prev,
        sectors: (prev.sectors || []).includes('all') ? [] : ['all']
      }));
      return;
    }

    setNewCode(prev => {
      const filtered = (prev.sectors || []).filter(s => s !== 'all');
      if (filtered.includes(sector)) {
        return { ...prev, sectors: filtered.filter(s => s !== sector) };
      } else {
        return { ...prev, sectors: [...filtered, sector] };
      }
    });
  };

  const allAuditLogs = shifts.flatMap(s => s.auditLogs || []).sort((a, b) => b.timestamp - a.timestamp);
  const [auditSearch, setAuditSearch] = useState('');
  const [historySector, setHistorySector] = useState('all');

  const filteredLogs = allAuditLogs.filter(log => 
    (log.userName || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
    (log.userRegistration || '').includes(auditSearch)
  );

  const historyShifts = shifts.filter(s => historySector === 'all' || s.sector === historySector);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.currentPassword !== admin.password) {
      setPasswordError('Senha atual incorreta');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordError('A nova senha deve ter pelo menos 4 caracteres');
      return;
    }

    onUpdateAdmin({
      ...admin,
      password: passwordForm.newPassword
    });

    setPasswordSuccess(true);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-3 rounded-2xl text-white shadow-lg shadow-slate-800/20">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Painel do Administrador</h2>
              <p className="text-sm text-slate-500 font-medium">Gerenciamento de Acessos e Permissões</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-100 p-1.5 flex mx-8 mb-4 rounded-2xl">
          <button
            onClick={() => setActiveView('users')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeView === 'users' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveView('audit')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeView === 'audit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            Audit Trail
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeView === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            Histórico Senso
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === 'users' && (
            <div className="space-y-8">
              {/* Sub-Tabs for User Management */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-2">
                <button
                  onClick={() => setActiveUserSubView('access')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                    activeUserSubView === 'access' ? "bg-medical-blue text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Key size={18} />
                  Acessos Profissionais
                </button>
                <button
                  onClick={() => setActiveUserSubView('admins')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                    activeUserSubView === 'admins' ? "bg-slate-800 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Shield size={18} />
                  Gestores & Segurança
                </button>
                <button
                  onClick={() => setActiveUserSubView('sectors')}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                    activeUserSubView === 'sectors' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Layout size={18} />
                  Unidades & Setores
                </button>
              </div>

              {activeUserSubView === 'access' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
                  {/* Left Column: Generator */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-medical-blue" />
                        Novo Cadastro de Acesso
                      </h3>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {newCodeError && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex items-center gap-2">
                            <AlertCircle size={14} />
                            {newCodeError}
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
                          <input
                            required
                            type="text"
                            placeholder="Ex: João Silva Sauro"
                            value={newCode.collaboratorName}
                            onChange={e => setNewCode({ ...newCode, collaboratorName: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none transition-all text-sm font-medium shadow-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Categoria</label>
                            <select
                              value={newCode.category}
                              onChange={e => setNewCode({ ...newCode, category: e.target.value })}
                              className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none transition-all text-sm font-medium shadow-sm appearance-none"
                            >
                              <option value="Enfermeiro(a)">Enfermeiro(a)</option>
                              <option value="Médico(a)">Médico(a)</option>
                              <option value="Técnico(a) de Enfermagem">Técnico(a) de Enfermagem</option>
                              <option value="Fisioterapeuta">Fisioterapeuta</option>
                              <option value="Administrativo">Administrativo</option>
                              <option value="Outros">Outros</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nº Registro/Conselho</label>
                            <input
                              required
                              type="text"
                              placeholder="Ex: 123456"
                              value={newCode.registration}
                              onChange={e => setNewCode({ ...newCode, registration: e.target.value })}
                              className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none transition-all text-sm font-medium shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Setores Designados</label>
                          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 max-h-48 overflow-y-auto">
                            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                              <input
                                type="checkbox"
                                checked={(newCode.sectors || []).includes('all')}
                                onChange={() => toggleSectorSelection('all')}
                                className="w-4 h-4 rounded border-slate-300 text-medical-blue focus:ring-medical-blue"
                              />
                              <span className="text-sm font-bold text-slate-700">Acesso Total (Master)</span>
                            </label>
                            <div className="h-px bg-slate-100 my-2" />
                            {sectors.map(s => (
                              <label key={s} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                                <input
                                  type="checkbox"
                                  checked={(newCode.sectors || []).includes(s)}
                                  onChange={() => toggleSectorSelection(s)}
                                  disabled={(newCode.sectors || []).includes('all')}
                                  className="w-4 h-4 rounded border-slate-300 text-medical-blue focus:ring-medical-blue disabled:opacity-50"
                                />
                                <span className="text-sm font-medium text-slate-600">{s}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Código de Acesso</label>
                          <div className="flex gap-2">
                            <input
                              required
                              type="text"
                              placeholder="CÓDIGO"
                              value={newCode.code}
                              onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                              className="flex-1 px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none transition-all text-sm font-bold tracking-widest uppercase shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={generateRandomCode}
                              className="p-3 bg-slate-200 text-slate-600 rounded-2xl hover:bg-slate-300 transition-all shadow-sm"
                              title="Gerar Aleatório"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-medical-blue text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-medical-blue/20 hover:bg-medical-blue/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          <Key size={18} />
                          Salvar Cadastro
                        </button>
                      </form>
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                      <h4 className="text-sm font-bold text-amber-800 mb-2 uppercase tracking-tight">Dica de Segurança</h4>
                      <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        Códigos 'Master' permitem visualização e edição de todos os setores. Use-os apenas para coordenação e gerência.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Users size={20} className="text-slate-400" />
                        Usuários Ativos (Acessos)
                      </h3>
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        {accessCodes.length} Acessos
                      </span>
                    </div>

                    <div className="space-y-3">
                      {accessCodes.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                          <Users className="mx-auto text-slate-300 mb-3" size={48} />
                          <p className="text-slate-400 font-medium">Nenhum código gerado ainda.</p>
                        </div>
                      ) : (
                        accessCodes.map(code => (
                          <div 
                            key={code.id}
                            className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                (code.sectors || []).includes('all') ? 'bg-slate-800 text-white' : 'bg-medical-blue/10 text-medical-blue'
                              }`}>
                                {(code.sectors || []).includes('all') ? <Shield size={20} /> : <Layout size={20} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">{code.collaboratorName}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                                    {code.category}
                                  </span>
                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                                    Reg: {code.registration}
                                  </span>
                                  <span className="text-slate-200">•</span>
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {(code.sectors || []).includes('all') ? 'Acesso Total' : `Setores: ${(code.sectors || []).join(', ')}`}
                                  </span>
                                  <span className="text-slate-200">•</span>
                                  <span className="text-xs font-medium text-slate-400">
                                    {new Date(code.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="bg-slate-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-slate-100">
                                <code className="text-sm font-bold text-slate-600 tracking-widest">{code.code}</code>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => copyToClipboard(code.code, code.id)}
                                    className="p-1.5 text-slate-400 hover:text-medical-blue transition-colors"
                                    title="Copiar Código"
                                  >
                                    {copiedId === code.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const url = `${window.location.origin}${window.location.pathname}?code=${code.code}`;
                                      navigator.clipboard.writeText(url);
                                      setCopiedId(`${code.id}-link`);
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-medical-blue transition-colors"
                                    title="Copiar Link de Acesso"
                                  >
                                    {copiedId === `${code.id}-link` ? <Check size={16} className="text-green-500" /> : <Layout size={16} />}
                                  </button>
                                </div>
                              </div>
                              <button 
                                onClick={() => onDeleteCode(code.id)}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                title="Excluir Acesso"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeUserSubView === 'admins' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-800/20">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <Shield size={24} className="text-medical-blue" />
                        Gestão de Gestores
                      </h3>
                      <button 
                        onClick={() => setIsAddingAdmin(!isAddingAdmin)}
                        className="text-xs font-bold uppercase tracking-widest text-medical-blue hover:text-white transition-colors flex items-center gap-2"
                      >
                        {isAddingAdmin ? <X size={16} /> : <Plus size={16} />}
                        {isAddingAdmin ? 'Cancelar' : 'Novo Gestor'}
                      </button>
                    </div>

                    {isAddingAdmin ? (
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newAdmin.name || !newAdmin.registration || !newAdmin.password) return;
                          onAddAdmin(newAdmin);
                          setNewAdmin({ name: '', registration: '', type: 'Gerente', password: '' });
                          setIsAddingAdmin(false);
                        }} 
                        className="space-y-4 bg-slate-700/30 p-6 rounded-3xl border border-slate-600/30"
                      >
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nome do Gestor</label>
                          <input
                            required
                            placeholder="Ex: Dr. Roberto Silva"
                            value={newAdmin.name}
                            onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Login (Registro)</label>
                            <input
                              required
                              placeholder="000000"
                              value={newAdmin.registration}
                              onChange={e => setNewAdmin({ ...newAdmin, registration: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Cargo/Tipo</label>
                            <select
                              value={newAdmin.type}
                              onChange={e => setNewAdmin({ ...newAdmin, type: e.target.value as any })}
                              className="w-full px-4 py-3 bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm appearance-none"
                            >
                              <option value="Gerente">Gerente</option>
                              <option value="Coordenador">Coordenador</option>
                              <option value="Diretor">Diretor</option>
                              <option value="Administrativo">Administrativo</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Senha de Acesso</label>
                          <input
                            required
                            type="password"
                            placeholder="••••••••"
                            value={newAdmin.password}
                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-medical-blue text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-medical-blue/90 transition-all shadow-lg shadow-medical-blue/20"
                        >
                          Criar Novo Gestor
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {admins.map(a => (
                          <div key={a.registration} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-2xl border border-slate-600/30 hover:bg-slate-700 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center text-slate-300">
                                <Shield size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{a.name}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{a.type} • {a.registration}</p>
                              </div>
                            </div>
                            {a.registration !== admin.registration && (
                              <button 
                                onClick={() => onDeleteAdmin(a.registration)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-800/20">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <Lock size={24} className="text-medical-blue" />
                        Minha Segurança
                      </h3>
                      <button 
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="text-xs font-bold uppercase tracking-widest text-medical-blue hover:text-white transition-colors flex items-center gap-2"
                      >
                        {isChangingPassword ? <X size={16} /> : <Key size={16} />}
                        {isChangingPassword ? 'Cancelar' : 'Alterar Senha'}
                      </button>
                    </div>

                    {isChangingPassword ? (
                      <form onSubmit={handlePasswordChange} className="space-y-4 bg-slate-700/30 p-6 rounded-3xl border border-slate-600/30">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Senha Atual</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={passwordForm.currentPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nova Senha</label>
                          <input
                            type="password"
                            placeholder="Mínimo 4 caracteres"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
                          <input
                            type="password"
                            placeholder="Repita a nova senha"
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-700 border-none rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                          />
                        </div>
                        
                        {passwordError && <p className="text-[10px] text-red-400 font-bold uppercase text-center">{passwordError}</p>}
                        {passwordSuccess && <p className="text-[10px] text-green-400 font-bold uppercase text-center">Senha alterada com sucesso!</p>}

                        <button
                          type="submit"
                          className="w-full bg-medical-blue text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-medical-blue/90 transition-all"
                        >
                          Salvar Nova Senha
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-slate-700/50 p-6 rounded-3xl border border-slate-600/30 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Nome de Exibição</span>
                            <span className="text-sm font-bold">{admin.name}</span>
                          </div>
                          <div className="h-px bg-slate-600/30" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Login de Acesso</span>
                            <span className="text-sm font-bold">{admin.registration}</span>
                          </div>
                          <div className="h-px bg-slate-600/30" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Senha</span>
                            <span className="text-sm font-bold tracking-tighter">••••••••</span>
                          </div>
                        </div>
                        <div className="p-4 bg-medical-blue/10 rounded-2xl border border-medical-blue/20">
                          <p className="text-[10px] text-medical-blue font-bold uppercase leading-relaxed text-center">
                            Suas credenciais são pessoais e intransferíveis. Mantenha sua senha segura.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeUserSubView === 'sectors' && (
                <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <Layout size={24} className="text-medical-blue" />
                      Gerenciamento de Unidades
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Nome da Nova Unidade (ex: UTI Coronariana)"
                          value={newSector}
                          onChange={e => setNewSector(e.target.value)}
                          className="flex-1 px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none text-sm font-medium shadow-inner"
                        />
                        <button
                          onClick={() => {
                            if (newSector) {
                              onAddSector(newSector);
                              setNewSector('');
                            }
                          }}
                          className="px-6 bg-medical-blue text-white rounded-2xl hover:bg-medical-blue/90 transition-all shadow-lg shadow-medical-blue/20 flex items-center gap-2 font-bold text-sm"
                        >
                          <Plus size={20} />
                          Adicionar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sectors.map(s => (
                          <div key={s} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100 group hover:border-medical-blue/30 transition-all">
                            <span className="text-sm font-bold text-slate-700">{s}</span>
                            <button
                              onClick={() => onDeleteSector(s)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        {activeView === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <History size={24} className="text-medical-blue" />
                Audit Trail - Histórico de Alterações
              </h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por usuário..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Data/Hora</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alterações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700">{new Date(log.timestamp).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{log.userName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{log.userRegistration}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {log.changes.map((change, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-bold text-medical-blue uppercase text-[10px] tracking-tight mr-2">{change.field}:</span>
                              <span className="text-slate-400 line-through mr-2">{change.oldValue || 'N/A'}</span>
                              <span className="text-slate-700 font-medium">→ {change.newValue}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layout size={24} className="text-medical-blue" />
                Histórico de Senso por Setor
              </h3>
              <select
                value={historySector}
                onChange={e => setHistorySector(e.target.value)}
                className="px-4 py-2 bg-slate-100 border-transparent rounded-xl focus:ring-2 focus:ring-medical-blue outline-none text-sm font-bold"
              >
                <option value="all">Todos os Setores</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {historyShifts.map(shift => (
                <div key={shift.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{shift.patientName}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{shift.sector} • Leito {shift.bed}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      shift.isArchived ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-600'
                    }`}>
                      {shift.isArchived ? 'Arquivado' : 'Ativo'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Diagnóstico:</span>
                      <span className="font-bold text-slate-700 text-right max-w-[200px] truncate">{shift.diagnosis}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Admissão:</span>
                      <span className="font-bold text-slate-700">{shift.admissionDate}</span>
                    </div>
                    {shift.dischargeInfo && (
                      <div className="pt-3 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-medical-blue uppercase tracking-widest mb-1">Informações de Saída</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Tipo:</span>
                          <span className="font-bold text-slate-700 uppercase">{shift.dischargeInfo.type === 'death' ? 'Óbito' : 'Alta'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Data:</span>
                          <span className="font-bold text-slate-700">{new Date(shift.dischargeInfo.date).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
};
