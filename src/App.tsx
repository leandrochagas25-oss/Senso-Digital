import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ClipboardList, 
  Search, 
  Filter, 
  Activity, 
  LogOut, 
  Info, 
  Printer, 
  LayoutGrid, 
  List, 
  ChevronLeft, 
  MapPin, 
  History, 
  Skull, 
  Send, 
  AlertCircle,
  Shield,
  User,
  Settings,
  Lock,
  Key
} from 'lucide-react';
import { ShiftHandover, AuthSession, Admin, AccessCode, AuditLog } from './types';
import { ShiftCard } from './components/ShiftCard';
import { ShiftForm } from './components/ShiftForm';
import { PrintView } from './components/PrintView';
import { TransferModal } from './components/TransferModal';
import { DeathModal } from './components/DeathModal';
import { DischargeModal } from './components/DischargeModal';
import { LoginPortal } from './components/LoginPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { translateDischargeType } from './lib/translations';

export default function App() {
  /* 
   * PERSISTÊNCIA DE DADOS (DATABASE)
   * Atualmente este sistema utiliza o LocalStorage do navegador para salvar os dados.
   * Isso significa que as informações ficam salvas apenas no computador/celular onde foram inseridas.
   * 
   * PARA CONECTAR AO FIREBASE (Nuvem):
   * 1. Crie um projeto no console.firebase.google.com
   * 2. Adicione o SDK do Firebase ao projeto (npm install firebase)
   * 3. Substitua os 'useEffect' abaixo por chamadas ao Firestore (db.collection('shifts').add(...))
   * 4. Utilize o Firebase Auth para gerenciar os logins de forma segura.
   */

  // Load initial state from localStorage or use defaults
  const [sectors, setSectors] = useState<string[]>(() => {
    const saved = localStorage.getItem('enf_sectors');
    return saved ? JSON.parse(saved) : ['UTI Adulto', 'UTI Pediátrica', 'Enfermaria A', 'Enfermaria B', 'Pronto Socorro', 'Centro Cirúrgico', 'Setor de Demonstração'];
  });

  const [shifts, setShifts] = useState<ShiftHandover[]>(() => {
    const saved = localStorage.getItem('enf_shifts');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [shiftsToPrint, setShiftsToPrint] = useState<ShiftHandover[]>([]);
  const [transferringShift, setTransferringShift] = useState<ShiftHandover | undefined>(undefined);
  const [dyingShift, setDyingShift] = useState<ShiftHandover | undefined>(undefined);
  const [dischargingShift, setDischargingShift] = useState<ShiftHandover | undefined>(undefined);
  const [editingShift, setEditingShift] = useState<ShiftHandover | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newSectorName, setNewSectorName] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Auth & Management State
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('enf_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem('enf_admins');
    let currentAdmins: Admin[] = [];
    
    if (saved) {
      currentAdmins = JSON.parse(saved);
      // Migration: if the old default admin exists, replace it with the new one
      const oldAdminIdx = currentAdmins.findIndex(a => a.registration === '000000' && a.password === 'admin');
      if (oldAdminIdx !== -1) {
        currentAdmins[oldAdminIdx] = {
          name: 'ADMIN',
          registration: '123456',
          type: 'Administrativo',
          password: 'ADMIN'
        };
        localStorage.setItem('enf_admins', JSON.stringify(currentAdmins));
      }
      return currentAdmins;
    }
    
    // Default admin for first access
    return [{
      name: 'ADMIN',
      registration: '123456',
      type: 'Administrativo',
      password: 'ADMIN'
    }];
  });

  const [accessCodes, setAccessCodes] = useState<AccessCode[]>(() => {
    const saved = localStorage.getItem('enf_access_codes');
    if (!saved) return [];
    
    const codes: any[] = JSON.parse(saved);
    // Migration: ensure all codes have 'sectors' array instead of single 'sector'
    return codes.map(code => {
      if (!code.sectors && code.sector) {
        return {
          ...code,
          sectors: [code.sector]
        };
      }
      return {
        ...code,
        sectors: code.sectors || []
      };
    });
  });

  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Persistence Effects
  // These effects ensure that every change to the state is automatically saved to localStorage.
  // To connect to a database like Firebase, you would replace these localStorage.setItem calls
  // with database update functions (e.g., setDoc in Firestore).
  useEffect(() => {
    localStorage.setItem('enf_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('enf_access_codes', JSON.stringify(accessCodes));
  }, [accessCodes]);

  useEffect(() => {
    localStorage.setItem('enf_sectors', JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    localStorage.setItem('enf_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('enf_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('enf_session');
    }
  }, [session]);

  // Initial Data Setup (Mock Data for Demo)
  useEffect(() => {
    const hasDemo = shifts.some(s => s.sector === 'Setor de Demonstração');
    
    if (shifts.length === 0 && !hasDemo) {
      // Mock data for initial view if empty
      const initialMock: ShiftHandover[] = [
        {
          id: '1',
          bed: '101-A',
          sector: 'Enfermaria A',
          patientName: 'José da Silva Sauro',
          birthDate: '1955-05-15',
          motherName: 'Maria das Dores',
          serviceNumber: '123456',
          specialty: 'Clínica Médica',
          diagnosis: 'Pneumonia Comunitária, HAS, DM2.',
          allergies: 'Penicilina',
          pendingExams: ['RX Tórax', 'Hemograma'],
          completedExams: [],
          pending: 'Aguardando transporte para TC de Tórax às 14h.',
          devices: 'AVP em MSE (18/03), SVD (19/03).',
          dietType: 'Livre',
          dietRoute: 'Oral',
          access: 'AVP em MSE',
          procedures: 'Curativo em calcâneo D',
          complexity: 'medium',
          mobility: 'bedridden',
          fallRisk: false,
          isRestrained: false,
          updatedAt: Date.now()
        },
        {
          id: '2',
          bed: '105-B',
          sector: 'Enfermaria B',
          patientName: 'Ana Paula Oliveira',
          birthDate: '1988-10-22',
          motherName: 'Francisca Oliveira',
          serviceNumber: '789012',
          specialty: 'Cirúrgica',
          diagnosis: 'Pós-op imediato de Apendicectomia.',
          allergies: 'Nega Alergias',
          pendingExams: [],
          completedExams: [{ id: 'mock-1', name: 'Hemograma', date: '22/03/2026 10:00', completedAt: Date.now() }],
          pending: '',
          devices: 'AVP em MSD (21/03).',
          dietType: 'Leve',
          dietRoute: 'Oral',
          access: 'AVP em MSD',
          procedures: 'Nenhum',
          complexity: 'low',
          mobility: 'walks',
          fallRisk: false,
          isRestrained: false,
          drains: [],
          updatedAt: Date.now()
        },
        {
          id: '3',
          bed: '301-A',
          sector: 'UTI Adulto',
          patientName: 'Severino dos Santos',
          birthDate: '1962-03-12',
          motherName: 'Luzia dos Santos',
          serviceNumber: '456789',
          specialty: 'Intensivista',
          diagnosis: 'Choque Séptico de foco abdominal, Insuficiência Renal Aguda (IRA), DHE.',
          allergies: 'Nega Alergias',
          pendingExams: ['Gasometria', 'Lactato', 'Creatinina'],
          completedExams: [],
          pending: 'Aguardando avaliação da Nefrologia para Hemodiálise.',
          devices: 'TOT (VM), CVC Subclávia D, PAI Radial E, SVD, SNE, Dreno de Penrose.',
          dietType: 'Enteral (SNE)',
          dietRoute: 'SNE',
          access: 'CVC Subclávia D',
          procedures: 'Aspiração traqueal, Curativo em dreno, Balanço Hídrico rigoroso.',
          vasoactiveDrugs: 'Noradrenalina (0.5 mcg/kg/min), Vasopressina (0.04 UI/min).',
          ventilatorSettings: 'PCV: Pinsp 18, PEEP 8, FiO2 40%, FR 14.',
          complexity: 'high',
          mobility: 'bedridden',
          fallRisk: true,
          lastFallDate: '2026-03-05',
          isRestrained: true,
          restraintDate: '2026-03-10',
          admissionDate: '2026-03-10',
          antibiotics: [
            { name: 'Meropenem', startDate: '2026-03-12' },
            { name: 'Vancomicina', startDate: '2026-03-12' }
          ],
          drains: [{ type: 'Penrose', volume: '200ml purulento' }],
          observations: 'Paciente em isolamento por KPC.',
          sbar: {
            situation: 'Paciente instável, em choque séptico refratário.',
            background: 'Pós-op de laparotomia exploradora por apendicite supurada.',
            assessment: 'Piora da função renal e necessidade de aumento de aminas.',
            recommendation: 'Manter vigilância hemodinâmica e aguardar Nefro.'
          },
          updatedAt: Date.now()
        },
        {
          id: '4',
          bed: '302-B',
          sector: 'UTI Adulto',
          patientName: 'Maria Helena Ferreira',
          birthDate: '1958-07-20',
          motherName: 'Benedita Ferreira',
          serviceNumber: '987654',
          specialty: 'Cardiologia',
          diagnosis: 'Pós-operatório imediato de Revascularização do Miocárdio (RM).',
          allergies: 'Iodo (Contraste)',
          pendingExams: ['ECG de controle', 'Troponina em curva'],
          completedExams: [{ id: 'mock-2', name: 'RX de Tórax Leito', date: '22/03/2026 09:30', completedAt: Date.now() }],
          pending: 'Retirar dreno de mediastino amanhã se débito < 100ml.',
          devices: 'CVC Jugular Interna D, PAI Radial D, SVD, Dreno de Mediastino.',
          dietType: 'Leve para Cardiopata',
          dietRoute: 'Oral',
          access: 'CVC Jugular Interna D',
          procedures: 'Controle rigoroso de débito de dreno e diurese.',
          vasoactiveDrugs: 'Nitroglicerina (Tridil) 5ml/h.',
          ventilatorSettings: 'Extubada - Cateter de O2 2L/min.',
          complexity: 'medium',
          mobility: 'assistance',
          fallRisk: false,
          isRestrained: false,
          admissionDate: '2026-03-18',
          antibiotics: [
            { name: 'Cefazolina', startDate: '2026-03-18' }
          ],
          drains: [{ type: 'Mediastino', volume: '50ml serosanguinolento' }],
          observations: 'Previsão de alta para enfermaria amanhã.',
          sbar: {
            situation: 'Paciente em POI de RM, hemodinamicamente estável.',
            background: 'Histórico de DAC triarterial, submetida a 3 pontes (Mamária e Safenas).',
            assessment: 'Boa perfusão periférica, dreno com débito serosanguinolento baixo.',
            recommendation: 'Manter monitorização contínua e iniciar deambulação precoce amanhã.'
          },
          updatedAt: Date.now()
        }
      ];

      // Generate 20 demo patients for the presentation sector
      const demoPatients: ShiftHandover[] = [
        'João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa', 'Lucas Pereira',
        'Julia Rodrigues', 'Carlos Souza', 'Beatriz Lima', 'Marcos Ferreira', 'Fernanda Alves',
        'Ricardo Gomes', 'Camila Martins', 'Gabriel Barbosa', 'Larissa Castro', 'Thiago Melo',
        'Vanessa Rocha', 'André Silva', 'Patrícia Nunes', 'Felipe Moraes', 'Renata Carvalho'
      ].map((name, i) => ({
        id: `demo-${i}`,
        bed: `${101 + i}-${['A', 'B', 'C', 'D'][i % 4]}`,
        sector: 'Setor de Demonstração',
        patientName: name,
        birthDate: `${1950 + i}-01-15`,
        motherName: `Mãe de ${name}`,
        serviceNumber: `100${i}`,
        specialty: i % 2 === 0 ? 'Clínica Médica' : 'Cirurgia Geral',
        diagnosis: i % 3 === 0 ? 'Pneumonia, HAS, DM2' : i % 3 === 1 ? 'Pós-op Colecistectomia' : 'Insuficiência Cardíaca Congestiva',
        allergies: i % 4 === 0 ? 'Dipirona' : 'Nega alergias',
        pendingExams: ['Hemograma', 'Eletrólitos', 'RX Tórax'],
        completedExams: [],
        pending: i % 5 === 0 ? 'Aguardando parecer da Cardiologia' : '',
        devices: 'AVP em MSD, SVD.',
        dietType: 'Livre',
        dietRoute: 'Oral',
        access: 'AVP em MSD',
        procedures: 'Monitorização de sinais vitais.',
        complexity: (['low', 'medium', 'high'][i % 3]) as any,
        mobility: (['bedridden', 'walks', 'assistance'][i % 3]) as any,
        fallRisk: i % 4 === 0,
        isRestrained: i % 5 === 0,
        admissionDate: `2026-03-${(10 + (i % 10)).toString().padStart(2, '0')}`,
        antibiotics: i % 4 === 0 ? [{ name: 'Ceftriaxona', startDate: '2026-03-15' }] : [],
        drains: i % 6 === 0 ? [{ type: 'Dreno de Tórax', volume: '100ml' }] : [],
        observations: i % 7 === 0 ? 'Paciente colaborativo, mas com episódios de desorientação noturna.' : '',
        sbar: {
          situation: 'Paciente estável em enfermaria.',
          background: 'Histórico de doenças crônicas controladas.',
          assessment: 'Sem intercorrências no último plantão.',
          recommendation: 'Manter conduta atual.'
        },
        updatedAt: Date.now()
      }));

      setShifts([...initialMock, ...demoPatients]);
    }
  }, []);

  const handleSave = (shift: ShiftHandover) => {
    const now = Date.now();
    const updatedShift = { ...shift, updatedAt: now };

    if (editingShift) {
      // Create Audit Log
      const changes: AuditLog['changes'] = [];
      const fieldsToTrack = ['patientName', 'bed', 'sector', 'diagnosis', 'allergies', 'complexity', 'mobility', 'fallRisk', 'isRestrained'];
      
      fieldsToTrack.forEach(field => {
        const oldVal = (editingShift as any)[field];
        const newVal = (shift as any)[field];
        if (oldVal !== newVal) {
          changes.push({ field, oldValue: oldVal, newValue: newVal });
        }
      });

      if (changes.length > 0) {
        const newLog: AuditLog = {
          id: now.toString(),
          userName: session?.name || 'Sistema',
          userRegistration: session?.registration || '000000',
          timestamp: now,
          changes
        };
        updatedShift.auditLogs = [...(shift.auditLogs || []), newLog];
      }

      setShifts(shifts.map(s => s.id === shift.id ? updatedShift : s));
    } else {
      // Initial Audit Log
      const initialLog: AuditLog = {
        id: now.toString(),
        userName: session?.name || 'Sistema',
        userRegistration: session?.registration || '000000',
        timestamp: now,
        changes: [{ field: 'Criação', oldValue: null, newValue: 'Paciente Admitido' }]
      };
      updatedShift.auditLogs = [initialLog];
      setShifts([updatedShift, ...shifts]);
    }
    setIsFormOpen(false);
    setEditingShift(undefined);
  };

  const handleEdit = (shift: ShiftHandover) => {
    if (!canEdit) return;
    setEditingShift(shift);
    setIsFormOpen(true);
  };

  const handlePrintSingle = (shift: ShiftHandover) => {
    setShiftsToPrint([shift]);
    setIsPrintViewOpen(true);
  };

  const handlePrintAll = () => {
    // Importante: Filtra apenas pacientes ATIVOS (não arquivados) do setor selecionado
    const activeSectorShifts = shifts.filter(s => s.sector === selectedSector && !s.isArchived);
    setShiftsToPrint(activeSectorShifts);
    setIsPrintViewOpen(true);
  };

  const handleTransfer = (shift: ShiftHandover) => {
    if (!canEdit) return;
    setTransferringShift(shift);
  };

  const handleHomeDischarge = (shift: ShiftHandover) => {
    if (!canEdit) return;
    setDischargingShift(shift);
  };

  const handleTransferConfirm = (shift: ShiftHandover, destinationSector: string, destinationBed: string) => {
    const isExternal = destinationSector === 'Alta Hospitalar' || destinationSector === 'Transferência Externa';
    const now = Date.now();
    
    // Calculate stay in current sector if it was active
    let updatedHistory = [...(shift.sectorHistory || [])];
    if (!shift.isArchived) {
      const entryDate = shift.admissionDate ? new Date(shift.admissionDate).getTime() : shift.updatedAt;
      const diff = now - entryDate;
      const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      
      const newStay = {
        sector: shift.sector,
        entryDate: entryDate,
        exitDate: now,
        durationDays: days
      };
      updatedHistory.push(newStay);
    }
    
    const updatedShift: ShiftHandover = {
      ...shift,
      sector: isExternal ? shift.sector : destinationSector,
      bed: isExternal ? shift.bed : destinationBed,
      isArchived: isExternal,
      admissionDate: isExternal ? shift.admissionDate : format(now, 'yyyy-MM-dd'),
      sectorHistory: updatedHistory,
      dischargeInfo: isExternal ? {
        type: 'discharge',
        destination: `${destinationSector}: ${destinationBed || 'N/A'}`,
        date: now
      } : undefined,
      updatedAt: now,
      auditLogs: [...(shift.auditLogs || []), {
        id: now.toString(),
        userName: session?.name || 'Sistema',
        userRegistration: session?.registration || '000000',
        timestamp: now,
        changes: [{ 
          field: isExternal ? 'Alta' : 'Transferência', 
          oldValue: `${shift.sector} - ${shift.bed}`, 
          newValue: `${destinationSector} - ${destinationBed || 'N/A'}` 
        }]
      }]
    };

    setShifts(shifts.map(s => s.id === shift.id ? updatedShift : s));
    setTransferringShift(undefined);
  };

  const handleDeath = (shift: ShiftHandover) => {
    if (!canEdit) return;
    setDyingShift(shift);
  };

  const handleDeathConfirm = (shift: ShiftHandover) => {
    const now = Date.now();
    
    // Calculate stay in current sector
    const entryDate = shift.admissionDate ? new Date(shift.admissionDate).getTime() : shift.updatedAt;
    const diff = now - entryDate;
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    
    const newStay = {
      sector: shift.sector,
      entryDate: entryDate,
      exitDate: now,
      durationDays: days
    };

    const updatedHistory = [...(shift.sectorHistory || []), newStay];

    const updatedShift: ShiftHandover = {
      ...shift,
      isArchived: true,
      sectorHistory: updatedHistory,
      dischargeInfo: {
        type: 'death',
        date: now
      },
      updatedAt: now,
      auditLogs: [...(shift.auditLogs || []), {
        id: now.toString(),
        userName: session?.name || 'Sistema',
        userRegistration: session?.registration || '000000',
        timestamp: now,
        changes: [{ field: 'Óbito', oldValue: null, newValue: 'Registro de Óbito' }]
      }]
    };
    setShifts(shifts.map(s => s.id === shift.id ? updatedShift : s));
    setDyingShift(undefined);
  };

  const handleAddAccessCode = (codeData: Omit<AccessCode, 'id' | 'createdAt'>) => {
    const newCode: AccessCode = {
      ...codeData,
      id: Date.now().toString(),
      createdAt: Date.now()
    };
    setAccessCodes([...accessCodes, newCode]);
  };

  const handleAddSector = (e: React.FormEvent | string) => {
    let name = '';
    if (typeof e === 'string') {
      name = e;
    } else {
      e.preventDefault();
      name = newSectorName;
    }

    if (!name || sectors.includes(name)) return;
    setSectors([...sectors, name]);
    setNewSectorName('');
  };

  const handleDeleteSector = (name: string) => {
    setSectors(sectors.filter(s => s !== name));
  };

  const handleDeleteAccessCode = (id: string) => {
    setAccessCodes(accessCodes.filter(c => c.id !== id));
  };

  const handleAddAdmin = (newAdmin: Admin) => {
    setAdmins([...admins, newAdmin]);
  };

  const handleDeleteAdmin = (registration: string) => {
    setAdmins(admins.filter(a => a.registration !== registration));
  };

  const handleLogout = () => {
    setSession(null);
    setSelectedSector(null);
    setIsAdminDashboardOpen(false);
  };

  const filteredShifts = shifts.filter(s => {
    const matchesSector = s.sector === selectedSector && !s.isArchived;
    const matchesSearch = s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.bed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || s.complexity === filterStatus;
    return matchesSector && matchesSearch && matchesFilter;
  });

  const historyShifts = shifts.filter(s => s.sector === selectedSector && s.isArchived);

  const handleUpdateAdmin = (updatedAdmin: Admin) => {
    setAdmins(prev => prev.map(a => a.registration === updatedAdmin.registration ? updatedAdmin : a));
    // Update session if it's the same admin
    if (session && session.type === 'admin' && session.registration === updatedAdmin.registration) {
      setSession({
        ...session,
        name: updatedAdmin.name
      });
    }
  };

  // Auth Guard
  if (!session) {
    return <LoginPortal onLogin={setSession} admins={admins} accessCodes={accessCodes} />;
  }

  const canEdit = true; // Todos os profissionais podem editar, dar alta, etc.

  // Sector Selection Screen
  if (!selectedSector) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="bg-medical-blue w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-medical-blue/20">
              <Activity className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">EnfShift</h1>
            <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Selecione o seu setor para iniciar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectors.map((sector) => {
              const count = shifts.filter(s => s.sector === sector).length;
              const pendingCount = shifts.filter(s => s.sector === sector && s.pending).length;
              const isLocked = session.type === 'guest' && 
                !(session.sectors || []).includes('all') && 
                !(session.sectors || []).includes(sector);
              
              return (
                <button
                  key={sector}
                  disabled={isLocked}
                  onClick={() => setSelectedSector(sector)}
                  className={`bg-white p-6 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                    isLocked 
                      ? 'opacity-50 grayscale cursor-not-allowed border-slate-100' 
                      : 'border-slate-200 hover:border-medical-blue hover:shadow-xl'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    {isLocked ? <Lock size={48} /> : <MapPin size={48} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-medical-blue transition-colors">{sector}</h3>
                    {isLocked && <Lock size={16} className="text-slate-400" />}
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {count} Pacientes
                    </div>
                    {pendingCount > 0 && (
                      <div className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {pendingCount} Pendentes
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            
            {/* Add Sector Card - Admin Only */}
            {session.type === 'admin' && (
              <div className="bg-slate-100 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col justify-center">
                <form onSubmit={handleAddSector} className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Adicionar Novo Setor</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newSectorName}
                      onChange={(e) => setNewSectorName(e.target.value)}
                      placeholder="Nome do setor..."
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-medical-blue"
                    />
                    <button 
                      type="submit"
                      className="bg-medical-blue text-white p-2 rounded-lg hover:bg-medical-blue/90 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Admin Dashboard Trigger */}
          {session.type === 'admin' && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="flex items-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-slate-800/20 hover:bg-slate-900 transition-all"
              >
                <Shield size={20} />
                Painel do Administrador
              </button>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <LogOut size={18} />
              Sair do Sistema
            </button>
          </div>
        </motion.div>

        {/* Admin Dashboard in Sector Selection */}
        <AnimatePresence>
          {isAdminDashboardOpen && (
            <AdminDashboard
              accessCodes={accessCodes}
              sectors={sectors}
              shifts={shifts}
              admin={admins.find(a => a.registration === session?.registration) || admins[0]}
              admins={admins}
              onAddCode={handleAddAccessCode}
              onDeleteCode={handleDeleteAccessCode}
              onAddSector={handleAddSector}
              onDeleteSector={handleDeleteSector}
              onUpdateAdmin={handleUpdateAdmin}
              onAddAdmin={handleAddAdmin}
              onDeleteAdmin={handleDeleteAdmin}
              onClose={() => setIsAdminDashboardOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedSector(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="bg-medical-blue p-2 rounded-lg">
                  <Activity className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 leading-tight">{selectedSector}</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
                      {session.type === 'admin' ? <Shield size={8} className="text-slate-600" /> : <User size={8} className="text-slate-600" />}
                      <span className="text-[8px] font-bold text-slate-600 uppercase">{session.name}</span>
                      <span className="text-slate-300 text-[8px]">|</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">{session.category}</span>
                      <span className="text-slate-300 text-[8px]">|</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase">Reg: {session.registration}</span>
                    </div>
                    <span className="text-slate-200 text-[8px]">•</span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Senso de Enfermagem</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {session.type === 'admin' && (
                <button 
                  onClick={() => setIsAdminDashboardOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all shadow-md shadow-slate-800/20"
                  title="Painel Admin"
                >
                  <Shield size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Painel Admin</span>
                </button>
              )}
              <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
                  isHistoryOpen ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <History size={18} />
                Histórico
              </button>
              <button 
                onClick={handlePrintAll}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-100 rounded-lg transition-all"
              >
                <Printer size={18} />
                Imprimir Senso
              </button>
              <div className="h-6 w-px bg-slate-200"></div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header / Actions */}
      <header className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Senso: {selectedSector}</h2>
                {!canEdit && (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-200">
                    Somente Leitura
                  </span>
                )}
              </div>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <ClipboardList size={18} />
                {filteredShifts.length} pacientes • Clique para ver detalhes
              </p>
            </div>
            
            {canEdit && (
              <button 
                onClick={() => {
                  setEditingShift(undefined);
                  setIsFormOpen(true);
                }}
                className="bg-medical-blue text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-medical-blue/90 shadow-xl shadow-medical-blue/20 transition-all hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Novo Paciente
              </button>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por paciente ou leito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-medical-blue focus:border-transparent rounded-xl outline-none transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={18} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-100 border-transparent rounded-xl px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-medical-blue transition-all"
              >
                <option value="all">Todas Complexidades</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isHistoryOpen ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <History size={24} className="text-slate-400" />
                Histórico de Altas e Óbitos
              </h3>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="text-sm font-bold text-medical-blue uppercase tracking-widest"
              >
                Voltar para Ativos
              </button>
            </div>
            
            {historyShifts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {historyShifts.sort((a, b) => (b.dischargeInfo?.date || 0) - (a.dischargeInfo?.date || 0)).map((shift) => (
                  <div key={shift.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between opacity-75 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center text-white",
                        shift.dischargeInfo?.type === 'death' ? "bg-slate-800" : "bg-blue-500"
                      )}>
                        {shift.dischargeInfo?.type === 'death' ? <Skull size={24} /> : <LogOut size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 uppercase">{shift.patientName}</h4>
                        <p className="text-xs text-slate-500">
                          {translateDischargeType(shift.dischargeInfo?.type || '')}
                          {shift.dischargeInfo?.type === 'discharge' && ` para: ${shift.dischargeInfo?.destination}`}
                          {' • '}
                          {shift.dischargeInfo?.date ? format(shift.dischargeInfo.date, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setTransferringShift(shift);
                      }}
                      className="text-[10px] font-bold text-medical-blue uppercase tracking-widest hover:underline"
                    >
                      Reativar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <p>Nenhum registro no histórico deste setor.</p>
              </div>
            )}
          </div>
        ) : filteredShifts.length > 0 ? (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredShifts.sort((a, b) => a.bed.localeCompare(b.bed)).map((shift) => (
                <motion.div
                  key={shift.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShiftCard 
                    shift={shift} 
                    onEdit={handleEdit} 
                    onTransfer={handleTransfer}
                    onHomeDischarge={handleHomeDischarge}
                    onDeath={handleDeath}
                    canEdit={canEdit}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <ClipboardList size={48} />
            </div>
            <h3 className="text-lg font-bold">Nenhum registro encontrado</h3>
            <p className="text-sm">Tente ajustar sua busca ou adicione um novo paciente.</p>
          </div>
        )}
      </main>

      {/* Tips Section */}
      <footer className="bg-slate-50 border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex items-center gap-2 text-medical-blue">
              <Info size={20} />
              <span className="font-bold uppercase tracking-widest text-xs">Dicas de Eficiência</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] text-slate-500 font-medium">
              <p>
                <strong className="text-slate-700 uppercase">SBAR:</strong> Se a situação for crítica, tente usar a técnica SBAR (Situação, Breve histórico, Avaliação e Recomendação).
              </p>
              <p>
                <strong className="text-slate-700 uppercase">Exames:</strong> Sempre mencione se o resultado do exame realizado já saiu ou se o médico já o avaliou.
              </p>
              <p>
                <strong className="text-slate-700 uppercase">Dispositivos:</strong> Não esqueça de anotar a data de inserção de acessos venosos, sondas e drenos.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ShiftForm 
            shift={editingShift}
            sectors={sectors}
            defaultSector={selectedSector}
            onSave={handleSave}
            onClose={() => {
              setIsFormOpen(false);
              setEditingShift(undefined);
            }}
          />
        )}
      </AnimatePresence>

      {/* Print View Modal */}
      <AnimatePresence>
        {isPrintViewOpen && (
          <PrintView 
            shifts={shiftsToPrint}
            userName={session.name}
            userCategory={session.type === 'admin' ? 'Administrador' : (session.category || 'Profissional')}
            onClose={() => {
              setIsPrintViewOpen(false);
              setShiftsToPrint([]);
            }}
          />
        )}
      </AnimatePresence>

      {/* Discharge Modal */}
      <AnimatePresence>
        {dischargingShift && (
          <DischargeModal 
            shift={dischargingShift}
            onConfirm={(shift) => {
              handleTransferConfirm(shift, 'Alta Hospitalar', '');
              setDischargingShift(undefined);
            }}
            onClose={() => setDischargingShift(undefined)}
          />
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {transferringShift && (
          <TransferModal 
            shift={transferringShift}
            sectors={sectors}
            shifts={shifts}
            onTransfer={handleTransferConfirm}
            onClose={() => setTransferringShift(undefined)}
          />
        )}
      </AnimatePresence>

      {/* Death Modal */}
      <AnimatePresence>
        {dyingShift && (
          <DeathModal 
            shift={dyingShift}
            onConfirm={handleDeathConfirm}
            onClose={() => setDyingShift(undefined)}
          />
        )}
      </AnimatePresence>

      {/* Admin Dashboard */}
      <AnimatePresence>
        {isAdminDashboardOpen && (
          <AdminDashboard
            accessCodes={accessCodes}
            sectors={sectors}
            shifts={shifts}
            admin={admins.find(a => a.registration === session?.registration) || admins[0]}
            admins={admins}
            onAddCode={handleAddAccessCode}
            onDeleteCode={handleDeleteAccessCode}
            onAddSector={handleAddSector}
            onDeleteSector={handleDeleteSector}
            onUpdateAdmin={handleUpdateAdmin}
            onAddAdmin={handleAddAdmin}
            onDeleteAdmin={handleDeleteAdmin}
            onClose={() => setIsAdminDashboardOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}



