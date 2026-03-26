export interface CompletedExam {
  name: string;
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

export interface AccessCode {
  id: string;
  code: string;
  collaboratorName: string;
  sector: string | 'all';
  createdAt: number;
}

export interface Admin {
  name: string;
  registration: string;
  type: 'COREN' | 'CRM' | 'Administrativo';
  password: string;
}

export interface AuthSession {
  type: 'admin' | 'guest';
  name: string;
  category?: string;
  registration?: string;
  sector?: string | 'all';
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
  allergies: string;
  exams: string;
  completedExams: CompletedExam[];
  pending: string;
  devices: string;
  dietType: string;
  dietRoute: string;
  access: string;
  procedures: string;
  vasoactiveDrugs?: string;
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
