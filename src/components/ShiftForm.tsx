import React, { useState, useEffect } from 'react';
import { X, Save, Info, AlertTriangle, CheckCircle, History, Plus, LogOut } from 'lucide-react';
import { ShiftHandover, CompletedExam } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface ShiftFormProps {
  shift?: ShiftHandover;
  sectors: string[];
  defaultSector?: string | null;
  onSave: (shift: ShiftHandover) => void;
  onClose: () => void;
}

export const ShiftForm: React.FC<ShiftFormProps> = ({ shift, sectors, defaultSector, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<ShiftHandover>>({
    bed: '',
    sector: defaultSector || '',
    patientName: '',
    birthDate: '',
    motherName: '',
    serviceNumber: '',
    specialty: '',
    diagnosis: '',
    allergies: 'Nega Alergias',
    exams: '',
    completedExams: [],
    pending: '',
    devices: '',
    dietType: '',
    dietRoute: '',
    access: '',
    procedures: '',
    vasoactiveDrugs: '',
    ventilatorSettings: '',
    complexity: 'medium',
    mobility: 'bedridden',
    fallRisk: false,
    lastFallDate: '',
    isRestrained: false,
    restraintDate: '',
    weight: '',
    height: '',
    customField: '',
    admissionDate: format(new Date(), 'yyyy-MM-dd'),
    antibiotics: [],
    drains: [],
    waterBalance: {
      gain: 0,
      loss: 0,
      total: 0
    },
    observations: '',
    sectorHistory: [],
    sbar: {
      situation: '',
      background: '',
      assessment: '',
      recommendation: ''
    }
  });

  useEffect(() => {
    if (shift) {
      setFormData(shift);
    }
  }, [shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData as ShiftHandover,
      id: shift?.id || Math.random().toString(36).substr(2, 9),
      updatedAt: Date.now()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('sbar.')) {
      const sbarField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        sbar: {
          ...prev.sbar!,
          [sbarField]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddAntibiotic = () => {
    setFormData(prev => ({
      ...prev,
      antibiotics: [...(prev.antibiotics || []), { name: '', startDate: format(new Date(), 'yyyy-MM-dd') }]
    }));
  };

  const handleRemoveAntibiotic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      antibiotics: prev.antibiotics?.filter((_, i) => i !== index)
    }));
  };

  const handleAddDrain = () => {
    setFormData(prev => ({
      ...prev,
      drains: [...(prev.drains || []), { type: '', volume: '' }]
    }));
  };

  const handleDrainChange = (index: number, field: 'type' | 'volume', value: string) => {
    setFormData(prev => ({
      ...prev,
      drains: prev.drains?.map((drain, i) => i === index ? { ...drain, [field]: value } : drain)
    }));
  };

  const handleRemoveDrain = (index: number) => {
    setFormData(prev => ({
      ...prev,
      drains: prev.drains?.filter((_, i) => i !== index)
    }));
  };

  const handleAntibioticChange = (index: number, field: 'name' | 'startDate', value: string) => {
    setFormData(prev => ({
      ...prev,
      antibiotics: prev.antibiotics?.map((atb, i) => i === index ? { ...atb, [field]: value } : atb)
    }));
  };

  const handleWaterBalanceChange = (field: 'gain' | 'loss', value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => {
      const newBalance = {
        ...prev.waterBalance || { gain: 0, loss: 0, total: 0 },
        [field]: numValue
      };
      newBalance.total = newBalance.gain - newBalance.loss;
      return {
        ...prev,
        waterBalance: newBalance
      };
    });
  };

  const handleMarkAsCompleted = () => {
    if (!formData.exams?.trim()) return;
    
    const newCompletedExam: CompletedExam = {
      name: formData.exams,
      completedAt: Date.now()
    };

    setFormData(prev => ({
      ...prev,
      exams: '',
      completedExams: [...(prev.completedExams || []), newCompletedExam]
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {shift ? 'Editar Passagem de Plantão' : 'Nova Passagem de Plantão'}
            </h2>
            <p className="text-sm text-slate-500">Preencha os dados conforme o senso de enfermagem.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Section: Identification */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Identificação e Localização
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!defaultSector && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Setor</label>
                  <select
                    required
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                  >
                    <option value="">Selecione o Setor</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div className={cn("space-y-1", defaultSector ? "md:col-span-1" : "")}>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Leito (Nº)</label>
                    <input
                      required
                      placeholder="Ex: 201"
                      value={formData.bed?.split('-')[0] || ''}
                      onChange={(e) => {
                        const currentLetter = formData.bed?.split('-')[1] || '';
                        const newNum = e.target.value;
                        setFormData(prev => ({ ...prev, bed: currentLetter ? `${newNum}-${currentLetter}` : newNum }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Letra/Box</label>
                    <input
                      placeholder="Ex: B"
                      value={formData.bed?.split('-')[1] || ''}
                      onChange={(e) => {
                        const currentNum = formData.bed?.split('-')[0] || '';
                        const newLetter = e.target.value.toUpperCase();
                        setFormData(prev => ({ ...prev, bed: newLetter ? `${currentNum}-${newLetter}` : currentNum }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Nº Atendimento</label>
                <input
                  required
                  name="serviceNumber"
                  value={formData.serviceNumber}
                  onChange={handleChange}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Nome do Paciente</label>
                <input
                  required
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Nome Completo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Data de Nascimento</label>
                <input
                  required
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Nome da Mãe</label>
                <input
                  required
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  placeholder="Nome Completo"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Data de Internação</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Mobilidade</label>
                <select
                  name="mobility"
                  value={formData.mobility}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                >
                  <option value="bedridden">Acamado</option>
                  <option value="walks">Deambula</option>
                  <option value="assistance">Auxílio</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Peso (kg)</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Ex: 70"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Altura (cm)</label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Ex: 175"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {formData.sectorHistory && formData.sectorHistory.length > 0 && (
                <div className="md:col-span-2 space-y-2 mt-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <History size={14} />
                    Histórico de Permanência por Setor
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {formData.sectorHistory.map((stay, idx) => (
                      <div key={idx} className="flex flex-col bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-[10px] font-bold text-medical-blue uppercase leading-tight">{stay.sector}</span>
                        <span className="text-lg font-black text-slate-800 my-1">{stay.durationDays} dias</span>
                        <div className="flex flex-col text-[9px] text-slate-400 font-medium">
                          <span>Entrada: {format(new Date(stay.entryDate), 'dd/MM/yyyy')}</span>
                          <span>Saída: {format(new Date(stay.exitDate), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Clinical */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Quadro Clínico e Especialidade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Especialidade</label>
                <input
                  required
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Ex: Clínica Médica"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Complexidade</label>
                <select
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Diagnóstico</label>
                <textarea
                  required
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Diagnóstico principal e comorbidades"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 text-medical-red">
                  <AlertTriangle size={12} /> Alergias
                </label>
                <input
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="Descrever Alergias ou 'Nega Alergias'"
                  className="w-full px-3 py-2 border border-medical-red/20 bg-red-50/30 rounded-lg focus:ring-2 focus:ring-medical-red focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: Procedures & Diet */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Procedimentos e Dieta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Tipo de Dieta</label>
                <input
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleChange}
                  placeholder="Ex: Livre, Branda, Pastosa"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Via de Dieta</label>
                <input
                  name="dietRoute"
                  value={formData.dietRoute}
                  onChange={handleChange}
                  placeholder="Ex: Oral, SNG, SNE, GTM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Acesso</label>
                <input
                  name="access"
                  value={formData.access}
                  onChange={handleChange}
                  placeholder="Ex: AVP, CVC, PICC"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Procedimentos</label>
                <input
                  name="procedures"
                  value={formData.procedures}
                  onChange={handleChange}
                  placeholder="Ex: Curativos, Drenagens, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Drenos</label>
                  <button
                    type="button"
                    onClick={handleAddDrain}
                    className="p-1 bg-medical-blue text-white rounded-full hover:bg-medical-blue/90 transition-colors"
                    title="Adicionar Dreno"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                {formData.drains && formData.drains.length > 0 ? (
                  <div className="space-y-2">
                    {formData.drains.map((drain, index) => (
                      <div key={index} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div className="flex-1 space-y-1">
                          <input
                            placeholder="Modelo/Tipo"
                            value={drain.type}
                            onChange={(e) => handleDrainChange(index, 'type', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-medical-blue"
                          />
                        </div>
                        <div className="w-24 space-y-1">
                          <input
                            placeholder="Volume"
                            value={drain.volume}
                            onChange={(e) => handleDrainChange(index, 'volume', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-medical-blue"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDrain(index)}
                          className="p-1 text-medical-red hover:bg-red-50 rounded transition-colors"
                        >
                          <LogOut size={14} className="rotate-90" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Nenhum dreno registrado.</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: ICU Support */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Suporte e Monitorização (UTI)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Drogas Vasoativas</label>
                <input
                  name="vasoactiveDrugs"
                  value={formData.vasoactiveDrugs}
                  onChange={handleChange}
                  placeholder="Ex: Noradrenalina, Dobutamina, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Parâmetros Ventilatórios</label>
                <input
                  name="ventilatorSettings"
                  value={formData.ventilatorSettings}
                  onChange={handleChange}
                  placeholder="Ex: PCV, PEEP, FiO2, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: Water Balance */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Balanço Hídrico (24h)
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Ganhos (ml)
                  </label>
                  <input
                    type="number"
                    value={formData.waterBalance?.gain || ''}
                    onChange={(e) => handleWaterBalanceChange('gain', e.target.value)}
                    placeholder="Total de ganhos"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Perdas (ml)
                  </label>
                  <input
                    type="number"
                    value={formData.waterBalance?.loss || ''}
                    onChange={(e) => handleWaterBalanceChange('loss', e.target.value)}
                    placeholder="Total de perdas"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Resultado do Balanço</label>
                  <div className={cn(
                    "w-full px-3 py-2 rounded-lg border font-bold text-sm flex items-center justify-between",
                    (formData.waterBalance?.total || 0) > 0 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : (formData.waterBalance?.total || 0) < 0 
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                  )}>
                    <span>{formData.waterBalance?.total || 0} ml</span>
                    <span className="text-[10px] uppercase">
                      {(formData.waterBalance?.total || 0) > 0 
                        ? "Positivo" 
                        : (formData.waterBalance?.total || 0) < 0 
                          ? "Negativo" 
                          : "Neutro"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Safety */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Segurança e Medidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fallRisk"
                    name="fallRisk"
                    checked={formData.fallRisk}
                    onChange={handleChange}
                    className="w-4 h-4 text-medical-blue border-slate-300 rounded focus:ring-medical-blue"
                  />
                  <label htmlFor="fallRisk" className="text-sm font-bold text-slate-700 uppercase">Risco de Queda</label>
                </div>
                {formData.fallRisk && (
                  <div className="space-y-1 pl-6">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Data da Última Queda</label>
                    <input
                      type="date"
                      name="lastFallDate"
                      value={formData.lastFallDate}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-xs"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRestrained"
                    name="isRestrained"
                    checked={formData.isRestrained}
                    onChange={handleChange}
                    className="w-4 h-4 text-medical-blue border-slate-300 rounded focus:ring-medical-blue"
                  />
                  <label htmlFor="isRestrained" className="text-sm font-bold text-slate-700 uppercase">Contido no Leito</label>
                </div>
                {formData.isRestrained && (
                  <div className="space-y-1 pl-6">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Data da Contenção</label>
                    <input
                      type="date"
                      name="restraintDate"
                      value={formData.restraintDate}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Devices & Exams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
                <span className="w-6 h-px bg-medical-blue/30"></span>
                Exames e Realizados
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Exames Pendentes / Em curso</label>
                  <div className="flex gap-2">
                    <textarea
                      name="exams"
                      value={formData.exams}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Listar exames feitos no plantão"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleMarkAsCompleted}
                      disabled={!formData.exams?.trim()}
                      className="px-3 bg-medical-green text-white rounded-lg hover:bg-medical-green/90 disabled:opacity-50 flex flex-col items-center justify-center text-[10px] font-bold uppercase"
                    >
                      <CheckCircle size={20} />
                      Realizado
                    </button>
                  </div>
                </div>

                {/* Completed Exams List */}
                {formData.completedExams && formData.completedExams.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <History size={12} /> Exames Realizados
                    </label>
                    <div className="space-y-1">
                      {formData.completedExams.map((exam, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-100 p-2 rounded-lg flex justify-between items-center text-[11px]">
                          <span className="font-medium text-green-800">{exam.name}</span>
                          <span className="text-green-600 font-mono">{format(exam.completedAt, 'dd/MM HH:mm')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Dispositivos</label>
                  <textarea
                    name="devices"
                    value={formData.devices}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Acessos, sondas, drenos e datas de inserção"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-medical-red flex items-center gap-2">
                <span className="w-6 h-px bg-medical-red/30"></span>
                Pendências (🚩 Atenção)
              </h3>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-medical-red uppercase">O que ficou pendente?</label>
                <textarea
                  name="pending"
                  value={formData.pending}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Jejum, transporte para exame, aguardando parecer, medicação não administrada..."
                  className="w-full px-3 py-2 border border-medical-red/20 bg-red-50/10 rounded-lg focus:ring-2 focus:ring-medical-red focus:border-transparent outline-none transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Antibiotics */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
                <span className="w-6 h-px bg-medical-blue/30"></span>
                Antibioticoterapia
              </h3>
              <button
                type="button"
                onClick={handleAddAntibiotic}
                className="text-xs font-bold text-medical-blue hover:underline"
              >
                + Adicionar Antibiótico
              </button>
            </div>
            <div className="space-y-3">
              {formData.antibiotics?.map((atb, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Antibiótico</label>
                    <input
                      value={atb.name}
                      onChange={(e) => handleAntibioticChange(index, 'name', e.target.value)}
                      placeholder="Ex: Ceftriaxona"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Data de Início</label>
                    <input
                      type="date"
                      value={atb.startDate}
                      onChange={(e) => handleAntibioticChange(index, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAntibiotic(index)}
                    className="p-2 text-medical-red hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              {(!formData.antibiotics || formData.antibiotics.length === 0) && (
                <p className="text-xs text-slate-400 italic">Nenhum antibiótico registrado.</p>
              )}
            </div>
          </div>

          {/* Section: Custom Field */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Campo Livre / Outras Informações
            </h3>
            <textarea
              name="customField"
              value={formData.customField}
              onChange={handleChange}
              rows={3}
              placeholder="Use este espaço para qualquer outra informação relevante que não se encaixe nos campos acima..."
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none bg-slate-50/50"
            />
          </div>

          {/* Section: Observations */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-medical-blue flex items-center gap-2">
              <span className="w-6 h-px bg-medical-blue/30"></span>
              Observações Gerais
            </h3>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={3}
              placeholder="Outras informações relevantes, intercorrências do plantão, etc."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* Section: SBAR (Optional but Recommended) */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-2">
                <Info size={14} /> Técnica SBAR (Opcional)
              </h3>
              <span className="text-[10px] text-slate-400 italic">Recomendado para situações críticas</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Situação</label>
                <input
                  name="sbar.situation"
                  value={formData.sbar?.situation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Breve Histórico</label>
                <input
                  name="sbar.background"
                  value={formData.sbar?.background}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Avaliação</label>
                <input
                  name="sbar.assessment"
                  value={formData.sbar?.assessment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Recomendação</label>
                <input
                  name="sbar.recommendation"
                  value={formData.sbar?.recommendation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-medical-blue text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-medical-blue/90 shadow-lg shadow-medical-blue/20 flex items-center gap-2 transition-all"
          >
            <Save size={18} />
            Salvar Plantão
          </button>
        </div>
      </div>
    </div>
  );
};

