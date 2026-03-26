export interface CompletedExam {
  id: string;
  name: string;
  date: string;
  completedAt: number;
}

export interface SectorStay {
  sector: string;
  entryDate: number;
  exitDate: number;
  durationDays: number;
}

export interface Drain {
  type: string;
  volume: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRegistration: string;
  timestamp: number;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface AccessCode {
  id: string;
  code: string;
  collaboratorName: string;
  category: string;
  registration: string;
  sectors: string[]; // Changed from sector: string | 'all'
  createdAt: number;
}

export interface Admin {
  name: string;
  registration: string;
  type: 'COREN' | 'CRM' | 'Administrativo' | 'Gerente' | 'Coordenador' | 'Diretor';
  password: string;
}

export interface AuthSession {
  type: 'admin' | 'guest';
  name: string;
  category: string;
  registration: string;
  sectors?: string[]; // Changed from sector?: string | 'all'
}

export interface VasoactiveDrug {
  name: string;
  dose: string;
}

export interface ShiftHandover {
  id: string;
  bed: string;
  sector: string;
  patientName: string;
  birthDate: string;
  motherName: string;
  serviceNumber: string;
  specialty: string;
  diagnosis: string;
  isolationType?: string;
  insuranceType?: string;
  allergies: string;
  pendingExams: string[];
  completedExams: CompletedExam[];
  pending: string;
  devices: string;
  dietType: string;
  dietRoute: string;
  access: string;
  procedures: string;
  vasoactiveDrugs?: string;
  vasoactiveDrugsList?: VasoactiveDrug[];
  ventilatorSettings?: string;
  complexity: 'high' | 'medium' | 'low';
  mobility: 'bedridden' | 'walks' | 'assistance';
  fallRisk: boolean;
  lastFallDate?: string;
  isRestrained: boolean;
  restraintDate?: string;
  weight?: string;
  height?: string;
  customField?: string;
  admissionDate?: string;
  sectorHistory?: SectorStay[];
  auditLogs?: AuditLog[]; // Added audit logs
  antibiotics?: {
    name: string;
    startDate: string;
  }[];
  drains?: Drain[];
  waterBalance?: {
    gain: number;
    loss: number;
    total: number;
  };
  observations?: string;
  sbar?: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  updatedAt: number;
  isArchived?: boolean;
  dischargeInfo?: {
    type: 'discharge' | 'death';
    destination?: string;
    date: number;
  };
}
