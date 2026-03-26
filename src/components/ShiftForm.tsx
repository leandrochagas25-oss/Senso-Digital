import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Info, AlertTriangle, CheckCircle, History, Plus, LogOut, Shield, Search, Bell } from 'lucide-react';
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
    isolationType: 'Nenhum',
    insuranceType: '',
    allergies: 'Nega Alergias',
    pendingExams: [],
    completedExams: [],
    pending: '',
    devices: '',
    dietType: '',
    dietRoute: '',
    access: '',
    procedures: '',
    vasoactiveDrugs: '',
    vasoactiveDrugsList: [],
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

  const [newExam, setNewExam] = useState('');
  const pendingExamsRef = useRef<HTMLDivElement>(null);

  const scrollToPending = () => {
    pendingExamsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    if (shift) {
      setFormData(shift);
    }
  }, [shift]);

  const handleAddExam = () => {
    if (newExam.trim()) {
      setFormData(prev => ({
        ...prev,
        pendingExams: [...(prev.pendingExams || []), newExam.trim()]
      }));
      setNewExam('');
    }
  };

  const handleMarkExamAsCompleted = (index: number) => {
    const exam = formData.pendingExams![index];
    const completedExam: CompletedExam = {
      id: Math.random().toString(36).substr(2, 9),
      name: exam,
      date: format(new Date(), 'dd/MM/yyyy HH:mm'),
      completedAt: Date.now()
    };

    setFormData(prev => ({
      ...prev,
      pendingExams: prev.pendingExams!.filter((_, i) => i !== index),
      completedExams: [...(prev.completedExams || []), completedExam]
    }));
  };

  const handleRemovePendingExam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pendingExams: prev.pendingExams!.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveCompletedExam = (id: string) => {
    setFormData(prev => ({
      ...prev,
      completedExams: prev.completedExams!.filter(e => e.id !== id)
    }));
  };

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

  const handleAddVasoactiveDrug = () => {
    setFormData(prev => ({
      ...prev,
      vasoactiveDrugsList: [...(prev.vasoactiveDrugsList || []), { name: '', dose: '' }]
    }));
  };

  const handleRemoveVasoactiveDrug = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vasoactiveDrugsList: prev.vasoactiveDrugsList?.filter((_, i) => i !== index)
    }));
  };

  const handleVasoactiveDrugChange = (index: number, field: 'name' | 'dose', value: string) => {
    let finalValue = value;
    if (field === 'dose') {
      // Strip 'ml/h' if the user manually types it
      finalValue = value.replace(/\s*ml\/h/gi, '');
    }
    setFormData(prev => ({
      ...prev,
      vasoactiveDrugsList: prev.vasoactiveDrugsList?.map((drug, i) => i === index ? { ...drug, [field]: finalValue } : drug)
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {shift ? 'Editar Passagem de Plantão' : 'Nova Passagem de Plantão'}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-slate-500">Preencha os dados conforme o senso de enfermagem.</p>
              {(formData.pendingExams?.length || 0) > 0 && (
                <button
                  type="button"
                  onClick={scrollToPending}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase animate-pulse hover:bg-red-200 transition-colors"
                >
                  <Bell size={10} />
                  {formData.pendingExams?.length} Pendentes
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50/50">
          {/* Section: Identification */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <Info size={16} />
              Identificação e Localização
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!defaultSector && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Setor</label>
                  <select
                    required
                    name="sector"
                    value={formData.sector || ''}
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
                  value={formData.serviceNumber || ''}
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
                  value={formData.patientName || ''}
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
                  value={formData.birthDate || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Nome da Mãe</label>
                <input
                  required
                  name="motherName"
                  value={formData.motherName || ''}
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
                  value={formData.admissionDate || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Mobilidade</label>
                <select
                  name="mobility"
                  value={formData.mobility || ''}
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
                    value={formData.weight || ''}
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
                    value={formData.height || ''}
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <AlertTriangle size={16} />
              Quadro Clínico e Especialidade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Especialidade</label>
                <input
                  required
                  name="specialty"
                  value={formData.specialty || ''}
                  onChange={handleChange}
                  placeholder="Ex: Clínica Médica"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Complexidade</label>
                <select
                  name="complexity"
                  value={formData.complexity || ''}
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
                  value={formData.diagnosis || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Diagnóstico principal e comorbidades"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Tipo de Isolamento</label>
                <select
                  name="isolationType"
                  value={formData.isolationType || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                >
                  <option value="Nenhum">Nenhum</option>
                  <option value="Contato">Contato</option>
                  <option value="Gotículas">Gotículas</option>
                  <option value="Aerossóis">Aerossóis</option>
                  <option value="Padrão">Padrão</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Tipo de Convênio</label>
                <input
                  name="insuranceType"
                  value={formData.insuranceType || ''}
                  onChange={handleChange}
                  placeholder="Ex: SUS, Unimed, Bradesco"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 text-medical-red">
                  <AlertTriangle size={12} /> Alergias
                </label>
                <input
                  name="allergies"
                  value={formData.allergies || ''}
                  onChange={handleChange}
                  placeholder="Descrever Alergias ou 'Nega Alergias'"
                  className="w-full px-3 py-2 border border-medical-red/20 bg-red-50/30 rounded-lg focus:ring-2 focus:ring-medical-red focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: Procedures & Diet */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <Plus size={16} />
              Procedimentos e Dieta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Tipo de Dieta</label>
                <input
                  name="dietType"
                  value={formData.dietType || ''}
                  onChange={handleChange}
                  placeholder="Ex: Livre, Branda, Pastosa"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Via de Dieta</label>
                <input
                  name="dietRoute"
                  value={formData.dietRoute || ''}
                  onChange={handleChange}
                  placeholder="Ex: Oral, SNG, SNE, GTM"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Acesso</label>
                <input
                  name="access"
                  value={formData.access || ''}
                  onChange={handleChange}
                  placeholder="Ex: AVP, CVC, PICC"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Procedimentos</label>
                <input
                  name="procedures"
                  value={formData.procedures || ''}
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle size={16} />
              Suporte e Monitorização (UTI)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Drogas Vasoativas</label>
                  <button
                    type="button"
                    onClick={handleAddVasoactiveDrug}
                    className="p-1 bg-medical-red text-white rounded-full hover:bg-medical-red/90 transition-colors"
                    title="Adicionar Droga"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                {formData.vasoactiveDrugsList && formData.vasoactiveDrugsList.length > 0 ? (
                  <div className="space-y-2">
                    {formData.vasoactiveDrugsList.map((drug, index) => (
                      <div key={index} className="flex gap-2 items-start bg-red-50/30 p-2 rounded-lg border border-red-100">
                        <div className="flex-1 space-y-1">
                          <input
                            placeholder="Nome da Droga"
                            value={drug.name}
                            onChange={(e) => handleVasoactiveDrugChange(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-medical-red"
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <div className="relative">
                            <input
                              placeholder="Dose"
                              value={drug.dose}
                              onChange={(e) => handleVasoactiveDrugChange(index, 'dose', e.target.value)}
                              className="w-full pl-2 pr-8 py-1 border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-medical-red"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-400 pointer-events-none">ml/h</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVasoactiveDrug(index)}
                          className="p-1 text-medical-red hover:bg-red-50 rounded transition-colors"
                        >
                          <LogOut size={14} className="rotate-90" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      name="vasoactiveDrugs"
                      value={formData.vasoactiveDrugs || ''}
                      onChange={handleChange}
                      placeholder="Ex: Noradrenalina, Dobutamina, etc."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                    <p className="text-[10px] text-slate-400 italic">Dica: Clique no "+" para adicionar drogas individuais com doses.</p>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Parâmetros Ventilatórios</label>
                <input
                  name="ventilatorSettings"
                  value={formData.ventilatorSettings || ''}
                  onChange={handleChange}
                  placeholder="Ex: PCV, PEEP, FiO2, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section: Water Balance */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="w-2 h-2 rounded-full bg-medical-blue"></span>
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <Shield size={16} />
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
                      value={formData.lastFallDate || ''}
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
                      value={formData.restraintDate || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Devices & Exams */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <Search size={16} />
              Exames e Realizados
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending Exams Box */}
              <div ref={pendingExamsRef} className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-red-600 uppercase flex items-center gap-1">
                    <AlertTriangle size={12} /> Exames Pendentes
                  </label>
                  <div className="flex items-center gap-1 text-[9px] text-red-400 font-bold">
                    <Plus size={10} /> Adicionar
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExam}
                    onChange={(e) => setNewExam(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExam())}
                    placeholder="Nome do exame..."
                    className="flex-1 px-2 py-1.5 border border-red-100 rounded text-xs outline-none focus:ring-1 focus:ring-red-400 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddExam}
                    disabled={!newExam.trim()}
                    className="px-2 bg-red-500 text-white rounded text-[10px] font-bold uppercase hover:bg-red-600 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.pendingExams?.map((exam, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-2 rounded border border-red-100 shadow-sm group">
                      <span className="text-[10px] font-bold text-red-700 uppercase truncate flex-1 mr-2">{exam}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMarkExamAsCompleted(idx)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded text-[9px] font-black uppercase transition-all border border-emerald-100"
                          title="Marcar como Checado"
                        >
                          Checar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingExam(idx)}
                          className="p-1 text-red-300 hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!formData.pendingExams || formData.pendingExams.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic text-center py-4">Nenhum pendente</p>
                  )}
                </div>

                <div className="pt-3 border-t border-red-100">
                  <label className="text-[11px] font-bold text-red-600 uppercase block mb-1">Outras Pendências</label>
                  <textarea
                    name="pending"
                    value={formData.pending || ''}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Descreva outras pendências administrativas ou assistenciais..."
                    className="w-full px-3 py-2 border border-red-100 rounded-lg focus:ring-2 focus:ring-red-400 outline-none transition-all text-xs resize-none bg-white"
                  />
                </div>
              </div>

              {/* Completed Exams Box */}
              <div className="bg-green-50/30 p-4 rounded-xl border border-green-100 space-y-3">
                <label className="text-[11px] font-bold text-green-600 uppercase flex items-center gap-1">
                  <History size={12} /> Realizados
                </label>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.completedExams?.map((exam) => (
                    <div key={exam.id} className="bg-white p-2 rounded border border-green-100 flex justify-between items-center group">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700 uppercase truncate">{exam.name}</span>
                        <span className="text-[9px] font-medium text-green-600">{exam.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompletedExam(exam.id)}
                        className="p-1 text-green-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {(!formData.completedExams || formData.completedExams.length === 0) && (
                    <p className="text-[10px] text-slate-400 italic text-center py-4">Nenhum realizado</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Dispositivos</label>
              <textarea
                name="devices"
                value={formData.devices || ''}
                onChange={handleChange}
                rows={2}
                placeholder="Acessos, sondas, drenos e datas de inserção"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Section: Antibiotics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2">
                <Plus size={16} />
                Antibioticoterapia
              </h3>
              <button
                type="button"
                onClick={handleAddAntibiotic}
                className="text-xs font-bold text-medical-blue hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Adicionar
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
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <Info size={16} />
              Campo Livre / Outras Informações
            </h3>
            <textarea
              name="customField"
              value={formData.customField || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Use este espaço para qualquer outra informação relevante..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none bg-slate-50/30"
            />
          </div>

          {/* Section: Observations */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-medical-blue flex items-center gap-2 border-b border-slate-100 pb-2">
              <History size={16} />
              Observações Gerais
            </h3>
            <textarea
              name="observations"
              value={formData.observations || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Outras informações relevantes, intercorrências do plantão, etc."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm resize-none bg-slate-50/30"
            />
          </div>

          {/* Section: SBAR (Optional but Recommended) */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Info size={16} className="text-medical-blue" />
                Técnica SBAR
              </h3>
              <span className="text-[10px] text-slate-400 font-medium italic">Recomendado para situações críticas</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Situação</label>
                <input
                  name="sbar.situation"
                  value={formData.sbar?.situation || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-medical-blue outline-none"
                  placeholder="O que está acontecendo agora?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Breve Histórico</label>
                <input
                  name="sbar.background"
                  value={formData.sbar?.background || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-medical-blue outline-none"
                  placeholder="Contexto clínico do paciente"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Avaliação</label>
                <input
                  name="sbar.assessment"
                  value={formData.sbar?.assessment || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-medical-blue outline-none"
                  placeholder="O que você acha que é o problema?"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Recomendação</label>
                <input
                  name="sbar.recommendation"
                  value={formData.sbar?.recommendation || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-medical-blue outline-none"
                  placeholder="O que deve ser feito?"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-medical-blue text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-medical-blue/90 shadow-lg shadow-medical-blue/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Save size={16} />
            Salvar Plantão
          </button>
        </div>
      </div>
    </div>
  );
};

