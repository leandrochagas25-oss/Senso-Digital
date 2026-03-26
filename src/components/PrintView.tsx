import React from 'react';
import { ShiftHandover } from '../types';
import { format, parseISO, differenceInYears, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { translateComplexity, translateMobility } from '../lib/translations';

interface PrintViewProps {
  shifts: ShiftHandover[];
  userName: string;
  userCategory: string;
  onClose: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ shifts, userName, userCategory, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-[100] overflow-auto p-8 print:p-0">
      {/* Print Controls (Hidden on Print) */}
      <div className="mb-8 flex justify-between items-center print:hidden bg-slate-100 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Visualização de Impressão (Senso Completo)</h2>
          <p className="text-sm text-slate-500">Configurado para Folha A4 - Modo Paisagem</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold text-sm uppercase tracking-widest"
          >
            Fechar
          </button>
          <button 
            onClick={() => window.print()}
            className="px-6 py-2 bg-medical-blue text-white rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg shadow-medical-blue/20"
          >
            Imprimir Senso
          </button>
        </div>
      </div>

      {/* Spreadsheet View */}
      <div className="w-full">
        <div className="mb-4 text-center border-b-2 border-slate-800 pb-2">
          <h1 className="text-xl font-black uppercase tracking-tighter">Senso de Enfermagem - {shifts[0]?.sector || 'Geral'}</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Data: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })} • Unidade: SensoEnf
          </p>
        </div>

        <table className="w-full border-collapse border border-slate-800 text-[9px] leading-tight">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-800 p-1 w-10">LEITO</th>
              <th className="border border-slate-800 p-1 text-left w-32">PACIENTE / MÃE</th>
              <th className="border border-slate-800 p-1 w-12">NASC. (ID)</th>
              <th className="border border-slate-800 p-1 w-12">INTERN.</th>
              <th className="border border-slate-800 p-1 w-14">ATEND.</th>
              <th className="border border-slate-800 p-1 text-left w-20">ESP. / STATUS</th>
              <th className="border border-slate-800 p-1 text-left">HD / DIAGNÓSTICO</th>
              <th className="border border-slate-800 p-1 text-left w-20">ALERGIAS</th>
              <th className="border border-slate-800 p-1 text-left w-20">DIETA / VIA</th>
              <th className="border border-slate-800 p-1 text-left w-20">ACESSO / PROC. / DRENO</th>
              <th className="border border-slate-800 p-1 text-left w-20">SUPORTE UTI / ATB</th>
              <th className="border border-slate-800 p-1 text-left w-20">DISPOSITIVOS / OBS</th>
              <th className="border border-slate-800 p-1 text-left w-24">EXAMES REALIZADOS</th>
              <th className="border border-slate-800 p-1 text-left">PENDÊNCIAS (🚩)</th>
            </tr>
          </thead>
          <tbody>
            {shifts.sort((a, b) => a.bed.localeCompare(b.bed)).map((shift) => (
              <tr key={shift.id} className={shift.pending ? "bg-red-50" : ""}>
                <td className="border border-slate-800 p-1 text-center font-bold bg-slate-50">
                  <div className="text-[8px] uppercase opacity-50">Leito</div>
                  <div className="flex items-center justify-center border border-slate-300 rounded overflow-hidden">
                    <div className="px-1.5 py-0.5 text-sm">{shift.bed.split('-')[0]}</div>
                    {shift.bed.includes('-') && (
                      <div className="bg-slate-800 text-white text-[11px] px-1.5 py-0.5 min-w-[1.2rem]">
                        {shift.bed.split('-')[1]}
                      </div>
                    )}
                  </div>
                </td>
                <td className="border border-slate-800 p-1">
                  <div className="font-bold uppercase">{shift.patientName}</div>
                  <div className="text-[8px] text-slate-500 italic">Mãe: {shift.motherName}</div>
                  {(shift.weight || shift.height) && (
                    <div className="text-[7px] text-slate-400 mt-0.5">
                      {shift.weight ? `P: ${shift.weight}kg ` : ''}
                      {shift.height ? `A: ${shift.height}cm` : ''}
                    </div>
                  )}
                </td>
                <td className="border border-slate-800 p-1 text-center">
                  {shift.birthDate ? format(parseISO(shift.birthDate), 'dd/MM/yy') : '-'}
                  <div className="font-bold">({shift.birthDate ? differenceInYears(new Date(), parseISO(shift.birthDate)) : '-'}a)</div>
                </td>
                <td className="border border-slate-800 p-1 text-center">
                  {shift.admissionDate ? format(parseISO(shift.admissionDate), 'dd/MM/yy') : '-'}
                  <div className="font-bold">
                    ({shift.admissionDate ? differenceInDays(new Date(), parseISO(shift.admissionDate)) : '-'}d)
                  </div>
                </td>
                <td className="border border-slate-800 p-1 text-center font-mono">{shift.serviceNumber}</td>
                <td className="border border-slate-800 p-1">
                  <div className="font-bold">{shift.specialty}</div>
                  <div className="uppercase text-[8px] font-bold">C: {translateComplexity(shift.complexity || 'medium')}</div>
                  <div className="uppercase text-[8px]">{translateMobility(shift.mobility || 'bedridden')}</div>
                </td>
                <td className="border border-slate-800 p-1">
                  <div className="font-bold">{shift.diagnosis}</div>
                  {(shift.fallRisk || shift.isRestrained) && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {shift.fallRisk && (
                        <span className="bg-rose-50 text-rose-700 px-1 rounded-[2px] text-[7px] border border-rose-100 uppercase font-bold">
                          Risco Queda {shift.lastFallDate && `(${format(parseISO(shift.lastFallDate), 'dd/MM')})`}
                        </span>
                      )}
                      {shift.isRestrained && (
                        <span className="bg-amber-50 text-amber-700 px-1 rounded-[2px] text-[7px] border border-amber-100 uppercase font-bold">
                          Contido {shift.restraintDate && `(${format(parseISO(shift.restraintDate), 'dd/MM')})`}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="border border-slate-800 p-1 font-bold text-red-700">{shift.allergies}</td>
                <td className="border border-slate-800 p-1">
                  <div className="font-bold">{shift.dietType || '-'}</div>
                  <div className="text-[8px]">{shift.dietRoute || '-'}</div>
                </td>
                <td className="border border-slate-800 p-1">
                  <div className="font-bold">{shift.access || '-'}</div>
                  <div className="text-[8px]">{shift.procedures || '-'}</div>
                  <div className="mt-1 space-y-0.5">
                    {shift.drains && shift.drains.length > 0 ? (
                      shift.drains.map((drain, idx) => (
                        <div key={idx} className="text-[7px] text-blue-600 font-bold border-b border-blue-50 last:border-0">
                          Dreno: {drain.type} - {drain.volume}
                        </div>
                      ))
                    ) : (
                      <div className="text-[8px] text-slate-400">Sem dreno</div>
                    )}
                  </div>
                  {shift.waterBalance && (
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      <div className="text-[6px] font-bold text-slate-400 uppercase">Balanço Hídrico:</div>
                      <div className="flex justify-between text-[7px]">
                        <span>G: {shift.waterBalance.gain}ml</span>
                        <span>P: {shift.waterBalance.loss}ml</span>
                        <span className="font-bold">Total: {shift.waterBalance.total}ml</span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="border border-slate-800 p-1">
                  <div className="font-bold">{shift.vasoactiveDrugs || '-'}</div>
                  <div className="text-[8px]">{shift.ventilatorSettings || '-'}</div>
                  <div className="mt-1">
                    {shift.antibiotics?.map((atb, i) => (
                      <div key={i} className="text-[7px] leading-none border-b border-slate-100 last:border-0 py-0.5">
                        <span className="font-bold text-orange-700">{atb.name}</span>
                        <span className="text-slate-400 ml-1">({differenceInDays(new Date(), parseISO(atb.startDate))}d)</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="border border-slate-800 p-1">
                  <div className="text-[8px]">{shift.devices}</div>
                  {shift.observations && (
                    <div className="mt-1 p-1 bg-slate-50 border-t border-slate-100 text-[7px] italic text-slate-500">
                      Obs: {shift.observations}
                    </div>
                  )}
                  {shift.customField && (
                    <div className="mt-1 p-1 bg-blue-50 border-t border-blue-100 text-[7px] text-blue-700">
                      Livre: {shift.customField}
                    </div>
                  )}
                  {shift.sectorHistory && shift.sectorHistory.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      <div className="text-[6px] font-bold text-slate-400 uppercase">Permanência:</div>
                      {shift.sectorHistory.map((stay, i) => (
                        <div key={i} className="text-[7px] font-bold text-slate-600">
                          {stay.durationDays}d {stay.sector}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="border border-slate-800 p-1">
                  <div className="space-y-0.5">
                    {shift.completedExams?.map((exam, i) => (
                      <div key={i} className="flex justify-between border-b border-slate-200 last:border-0">
                        <span>{exam.name}</span>
                        <span className="font-mono text-[7px]">{format(new Date(exam.completedAt), 'dd/MM', { locale: ptBR })}</span>
                      </div>
                    ))}
                    {shift.exams && <div className="italic text-slate-400">Pendente: {shift.exams}</div>}
                  </div>
                </td>
                <td className="border border-slate-800 p-1 font-bold text-red-600">{shift.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer for notes */}
        <div className="mt-8 grid grid-cols-3 gap-6 text-[9px]">
          <div className="border border-slate-300 p-3 rounded-lg">
            <div className="font-bold uppercase text-slate-400 mb-6">Responsável (Saída)</div>
            <div className="border-b border-slate-400 w-full mb-1"></div>
            <div className="text-[7px] text-center text-slate-400 italic">Assinatura e Carimbo</div>
          </div>
          
          <div className="border border-slate-300 p-3 rounded-lg">
            <div className="font-bold uppercase text-slate-400 mb-6">Responsável (Entrada)</div>
            <div className="border-b border-slate-400 w-full mb-1"></div>
            <div className="text-[7px] text-center text-slate-400 italic">Assinatura e Carimbo</div>
          </div>

          <div className="border border-slate-800 p-3 rounded-lg bg-slate-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-black uppercase text-[8px] tracking-widest text-slate-900">Impresso por:</div>
                <div className="font-bold text-slate-800 text-[10px]">{userName}</div>
                <div className="text-slate-500 italic text-[8px]">{userCategory}</div>
              </div>
              <div className="text-right">
                <div className="font-black uppercase text-[8px] tracking-widest text-slate-400">Data/Hora</div>
                <div className="font-mono text-[8px]">{format(new Date(), 'dd/MM/yy HH:mm')}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-2 border-t border-slate-200">
              <div className="font-black uppercase text-[7px] tracking-tighter text-slate-400 mb-4">Espaço para Carimbo / Conferência:</div>
              <div className="h-10 border-2 border-dashed border-slate-200 rounded-md flex items-center justify-center">
                <span className="text-[6px] text-slate-300 uppercase font-bold tracking-widest">Carimbo Aqui</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid black !important;
            padding: 2px 4px !important;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
};

