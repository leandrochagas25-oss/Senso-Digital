import React from 'react';
import { differenceInYears, parseISO, format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Hash, Calendar, Activity, ChevronRight, LogOut, Skull, Pill, Droplet, UserMinus, Scale, Ruler, ShieldAlert, Lock, Info, Footprints, Accessibility } from 'lucide-react';
import { ShiftHandover } from '../types';
import { cn } from '../lib/utils';
import { translateComplexity, translateMobility } from '../lib/translations';

interface ShiftCardProps {
  shift: ShiftHandover;
  onEdit: (shift: ShiftHandover) => void;
  onDischarge: (shift: ShiftHandover) => void;
  onDeath: (shift: ShiftHandover) => void;
  canEdit?: boolean;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onEdit, onDischarge, onDeath, canEdit = true }) => {
  const age = shift.birthDate ? differenceInYears(new Date(), parseISO(shift.birthDate)) : 'N/I';
  const hasPending = shift.pending && shift.pending.trim().length > 0;
  
  const admissionDate = shift.admissionDate ? parseISO(shift.admissionDate) : null;
  const daysHospitalized = admissionDate ? differenceInDays(new Date(), admissionDate) : 0;

  const getMobilityIcon = (mobility: string) => {
    switch (mobility) {
      case 'bedridden': return <UserMinus size={14} className="text-slate-400" title="Acamado" />;
      case 'walks': return <Footprints size={14} className="text-emerald-500" title="Deambula" />;
      case 'assistance': return <Accessibility size={14} className="text-amber-500" title="Auxílio" />;
      default: return null;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      className={cn(
        "group relative flex items-center gap-4 p-4 bg-white border rounded-xl transition-all cursor-pointer hover:shadow-md",
        hasPending 
          ? "border-red-500 bg-red-50/50 hover:bg-red-100/60 ring-1 ring-red-200 shadow-lg shadow-red-100/50" 
          : "border-slate-200 hover:border-medical-blue",
        !canEdit && "cursor-default hover:border-slate-200 hover:shadow-none"
      )}
      onClick={() => canEdit && onEdit(shift)}
    >
      {/* Pending Indicator Bar */}
      {hasPending && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 rounded-l-xl" />
      )}
      {/* Bed Badge */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Leito</span>
        <div className={cn(
          "h-12 flex items-center rounded-2xl border-2 transition-all shadow-sm overflow-hidden",
          hasPending 
            ? "bg-red-50 border-red-200" 
            : "bg-slate-50 border-slate-200"
        )}>
          <div className="px-4 flex items-center justify-center h-full">
            <span className={cn(
              "text-2xl font-black leading-none",
              hasPending ? "text-red-700" : "text-slate-800"
            )}>
              {shift.bed.split('-')[0]}
            </span>
          </div>
          {shift.bed.includes('-') && (
            <div className={cn(
              "h-full px-4 flex items-center justify-center font-black text-2xl min-w-[3rem]",
              hasPending 
                ? "bg-red-600 text-white" 
                : "bg-medical-blue text-white"
            )}>
              {shift.bed.split('-')[1]}
            </div>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-bold text-sm uppercase truncate",
              hasPending ? "text-red-800" : "text-slate-800"
            )}>
              {shift.patientName}
            </h3>
            {getMobilityIcon(shift.mobility || 'bedridden')}
            <span className={cn(
              "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border leading-none",
              getComplexityColor(shift.complexity || 'medium')
            )}>
              {translateComplexity(shift.complexity || 'medium')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
            <Calendar size={12} />
            {shift.birthDate ? format(parseISO(shift.birthDate), 'dd/MM/yyyy', { locale: ptBR }) : 'N/I'} ({age}a)
          </div>
          <div className="text-[9px] text-medical-blue font-bold mt-0.5">
            Internado há {daysHospitalized} {daysHospitalized === 1 ? 'dia' : 'dias'}
          </div>
        </div>

        <div className="hidden md:block">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Atendimento</span>
          <div className="flex items-center gap-1 text-xs font-mono text-slate-600">
            <Hash size={12} className="opacity-50" />
            {shift.serviceNumber}
          </div>
          {(shift.weight || shift.height) && (
            <div className="flex items-center gap-2 mt-1">
              {shift.weight && (
                <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                  <Scale size={10} /> {shift.weight}kg
                </div>
              )}
              {shift.height && (
                <div className="flex items-center gap-0.5 text-[9px] text-slate-500">
                  <Ruler size={10} /> {shift.height}cm
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">HD (Diagnóstico)</span>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-600 truncate font-medium flex-1">
              {shift.diagnosis || 'Não informado'}
            </p>
            <div className="flex gap-1">
              {shift.fallRisk && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[8px] font-bold uppercase" title={`Última queda: ${shift.lastFallDate || 'N/I'}`}>
                  <ShieldAlert size={10} /> Queda
                </div>
              )}
              {shift.isRestrained && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[8px] font-bold uppercase" title={`Contenção: ${shift.restraintDate || 'N/I'}`}>
                  <Lock size={10} /> Contido
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Fields Summary */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-2 mt-1 pt-2 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase">Dieta / Via</span>
            <span className="text-[10px] text-slate-600 font-medium truncate">
              {shift.dietType || 'N/I'} / {shift.dietRoute || 'N/I'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase">Drenos</span>
            <span className="text-[10px] text-slate-600 font-medium truncate flex items-center gap-1">
              <Droplet size={10} className="text-blue-400" />
              {shift.drains && shift.drains.length > 0 
                ? `${shift.drains.length} dreno(s)` 
                : 'Nenhum'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase">Balanço</span>
            <span className={cn(
              "text-[10px] font-bold flex items-center gap-1",
              (shift.waterBalance?.total || 0) > 0 ? "text-emerald-600" : (shift.waterBalance?.total || 0) < 0 ? "text-rose-600" : "text-slate-600"
            )}>
              {shift.waterBalance?.total || 0} ml
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase">Antibióticos</span>
            <span className="text-[10px] text-slate-600 font-medium truncate flex items-center gap-1">
              <Pill size={10} className="text-orange-400" />
              {shift.antibiotics && shift.antibiotics.length > 0 
                ? `${shift.antibiotics.length} em uso` 
                : 'Nenhum'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-400 uppercase">Dispositivos</span>
            <span className="text-[10px] text-slate-600 font-medium truncate">
              {shift.devices || 'Nenhum'}
            </span>
          </div>
          {shift.customField && (
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase">Campo Livre</span>
              <span className="text-[10px] text-medical-blue font-medium truncate flex items-center gap-1">
                <Info size={10} /> {shift.customField}
              </span>
            </div>
          )}
          {shift.vasoactiveDrugs && (
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase">Drogas Vasoativas</span>
              <span className="text-[10px] text-medical-red font-bold truncate">
                {shift.vasoactiveDrugs}
              </span>
            </div>
          )}
          {shift.ventilatorSettings && (
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase">Ventilação</span>
              <span className="text-[10px] text-medical-blue font-bold truncate">
                {shift.ventilatorSettings}
              </span>
            </div>
          )}
          {shift.observations && (
            <div className="md:col-span-2 flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase">Observações</span>
              <span className="text-[10px] text-slate-500 italic truncate">
                {shift.observations}
              </span>
            </div>
          )}
          
          {(shift.sectorHistory && shift.sectorHistory.length > 0) && (
            <div className="md:col-span-2 flex flex-col mt-1 pt-1 border-t border-slate-100">
              <span className="text-[8px] font-bold text-slate-400 uppercase">Permanência Anterior</span>
              <div className="flex flex-wrap gap-2 mt-0.5">
                {shift.sectorHistory.map((stay, idx) => (
                  <span key={idx} className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {stay.durationDays}d {stay.sector}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Indicator */}
      {hasPending && (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-[9px] font-bold uppercase animate-pulse">
          <AlertCircle size={10} />
          Pendente
        </div>
      )}

      {/* Actions */}
      {canEdit && (
        <div className="flex flex-col gap-2 ml-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDischarge(shift);
            }}
            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-200 active:scale-95"
          >
            ALTA
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeath(shift);
            }}
            className="px-4 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-900 transition-all shadow-md shadow-slate-200 active:scale-95"
          >
            ÓBITO
          </button>
        </div>
      )}

      {canEdit && (
        <div className="flex-shrink-0 text-slate-300 group-hover:text-medical-blue transition-colors">
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
};

