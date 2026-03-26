import React, { useState } from 'react';
import { Key, UserPlus, Trash2, Shield, Layout, Users, Plus, Copy, Check, X, Lock } from 'lucide-react';
import { AccessCode, Admin } from '../types';

interface AdminDashboardProps {
  accessCodes: AccessCode[];
  sectors: string[];
  admin: Admin;
  onAddCode: (code: Omit<AccessCode, 'id' | 'createdAt'>) => void;
  onDeleteCode: (id: string) => void;
  onUpdateAdmin: (admin: Admin) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  accessCodes, 
  sectors, 
  admin,
  onAddCode, 
  onDeleteCode,
  onUpdateAdmin,
  onClose
}) => {
  const [newCode, setNewCode] = useState({
    collaboratorName: '',
    sector: 'all' as string | 'all',
    code: ''
  });
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
    if (!newCode.collaboratorName || !newCode.code) return;
    
    onAddCode(newCode);
    setNewCode({ collaboratorName: '', sector: 'all', code: '' });
  };

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

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Generator */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-medical-blue" />
                Gerador de Acessos
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nome do Colaborador</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Dr. João Silva"
                    value={newCode.collaboratorName}
                    onChange={e => setNewCode({ ...newCode, collaboratorName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none transition-all text-sm font-medium shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Setor Designado</label>
                  <select
                    value={newCode.sector}
                    onChange={e => setNewCode({ ...newCode, sector: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-transparent rounded-2xl focus:ring-2 focus:ring-medical-blue outline-none transition-all text-sm font-medium shadow-sm appearance-none"
                  >
                    <option value="all">Acesso Total (Master)</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Código Vitalício</label>
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
                  Gerar Código
                </button>
              </form>
            </div>

            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
              <h4 className="text-sm font-bold text-amber-800 mb-2 uppercase tracking-tight">Dica de Segurança</h4>
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Códigos 'Master' permitem visualização e edição de todos os setores. Use-os apenas para coordenação e gerência.
              </p>
            </div>

            <div className="bg-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-800/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Lock size={20} className="text-medical-blue" />
                  Segurança do Gestor
                </h3>
                <button 
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-xs font-bold uppercase tracking-widest text-medical-blue hover:text-white transition-colors"
                >
                  {isChangingPassword ? 'Cancelar' : 'Alterar Senha'}
                </button>
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Senha Atual"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Nova Senha"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar Nova Senha"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-700 border-none rounded-xl focus:ring-2 focus:ring-medical-blue outline-none text-sm"
                  />
                  
                  {passwordError && <p className="text-[10px] text-red-400 font-bold uppercase">{passwordError}</p>}
                  {passwordSuccess && <p className="text-[10px] text-green-400 font-bold uppercase">Senha alterada com sucesso!</p>}

                  <button
                    type="submit"
                    className="w-full bg-medical-blue text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-medical-blue/90 transition-all"
                  >
                    Salvar Nova Senha
                  </button>
                </form>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Usuário:</span>
                    <span className="font-bold">{admin.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Conselho:</span>
                    <span className="font-bold">{admin.registration}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Senha:</span>
                    <span className="font-bold">••••••••</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-slate-400" />
                Gestão de Usuários Ativos
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
                        code.sector === 'all' ? 'bg-slate-800 text-white' : 'bg-medical-blue/10 text-medical-blue'
                      }`}>
                        {code.sector === 'all' ? <Shield size={20} /> : <Layout size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{code.collaboratorName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {code.sector === 'all' ? 'Acesso Total' : `Setor: ${code.sector}`}
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
      </div>
    </div>
  );
};
