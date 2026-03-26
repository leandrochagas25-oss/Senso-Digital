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
  const [isPreparing, setIsPreparing] = React.useState(true);
  const isSinglePatient = shifts.length === 1;

  React.useEffect(() => {
    const handleAfterPrint = () => {
      onClose();
    };
    window.addEventListener('afterprint', handleAfterPrint);

    // Small delay to ensure the content is fully rendered before printing
    const timer = setTimeout(() => {
      setIsPreparing(false);
      window.print();
    }, 500); // Reduced delay for faster response

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-white z-[100] overflow-auto p-8 print:p-0">
      {/* Preparing Overlay (Hidden on Print) */}
      {isPreparing && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[110] flex flex-col items-center justify-center print:hidden">
          <div className="w-12 h-12 border-4 border-medical-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-medical-blue font-bold uppercase tracking-widest animate-pulse">
            {isSinglePatient ? 'Preparando ficha do paciente...' : 'Preparando senso do setor...'}
          </p>
        </div>
      )}

      {/* Print Controls (Hidden on Print) */}
      <div className="mb-8 flex justify-between items-center print:hidden bg-slate-100 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isSinglePatient ? `Ficha de Impressão: ${shifts[0]?.patientName}` : 'Visualização de Impressão (Senso do Setor)'}
          </h2>
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
            {isSinglePatient ? 'Imprimir Paciente' : 'Imprimir Senso'}
          </button>
        </div>
      </div>

      {/* Spreadsheet View */}
      <div className="w-full">
        <div className="mb-4 text-center border-b-2 border-slate-800 pb-2">
          <h1 className="text-xl font-black uppercase tracking-tighter">
            {isSinglePatient ? 'Ficha Individual de Paciente' : `Senso de Enfermagem - ${shifts[0]?.sector || 'Geral'}`}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Data: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })} • Unidade: SensoEnf
          </p>
        </div>

        <table className="w-full border-collapse border border-slate-950 text-[7px] leading-[1.1]">
          <thead>
            <tr className="bg-slate-100 uppercase font-black text-[6px]">
              <th className="border border-slate-950 p-0.5 w-[3%]">LT</th>
              <th className="border border-slate-950 p-0.5 text-left w-[18%]">Paciente / Identificação</th>
              <th className="border border-slate-950 p-0.5 text-left w-[18%]">Clínica / Diagnóstico</th>
              <th className="border border-slate-950 p-0.5 text-left w-[15%]">Riscos / Alertas / Dieta</th>
              <th className="border border-slate-950 p-0.5 text-left w-[18%]">Suporte / Dispositivos</th>
              <th className="border border-slate-950 p-0.5 text-left w-[14%]">Meds / Balanço</th>
              <th className="border border-slate-950 p-0.5 text-left w-[14%]">Exames / Pendências / Obs</th>
            </tr>
          </thead>
          <tbody>
            {shifts.sort((a, b) => a.bed.localeCompare(b.bed)).map((shift) => (
              <tr key={shift.id} className={`${shift.pending ? "bg-red-50/50" : ""} break-inside-avoid border-b border-slate-950`}>
                {/* 1. LEITO */}
                <td className="border border-slate-950 p-0.5 text-center font-black bg-slate-50 align-top">
                  <div className="text-[10px] leading-none">{shift.bed.split('-')[0]}</div>
                  {shift.bed.includes('-') && (
                    <div className="bg-slate-900 text-white text-[7px] px-0.5 rounded-sm mt-0.5">
                      {shift.bed.split('-')[1]}
                    </div>
                  )}
                </td>

                {/* 2. PACIENTE / IDENTIFICAÇÃO */}
                <td className="border border-slate-950 p-1 align-top">
                  <div className="font-black uppercase text-[8px] mb-0.5">{shift.patientName}</div>
                  <div className="grid grid-cols-2 gap-x-2 text-[6px] text-slate-600">
                    <div><span className="font-bold">Mãe:</span> {shift.motherName}</div>
                    <div><span className="font-bold">Nasc:</span> {shift.birthDate ? format(parseISO(shift.birthDate), 'dd/MM/yy') : '-'} ({shift.birthDate ? differenceInYears(new Date(), parseISO(shift.birthDate)) : '-'}a)</div>
                    <div><span className="font-bold">Adm:</span> {shift.admissionDate ? format(parseISO(shift.admissionDate), 'dd/MM/yy') : '-'} ({shift.admissionDate ? differenceInDays(new Date(), parseISO(shift.admissionDate)) : '-'}d)</div>
                    <div><span className="font-bold">Atend:</span> {shift.serviceNumber}</div>
                  </div>
                </td>

                {/* 3. CLÍNICA / DIAGNÓSTICO */}
                <td className="border border-slate-950 p-1 align-top">
                  <div className="font-bold text-medical-blue uppercase mb-0.5">{shift.specialty}</div>
                  <div className="text-[7px] font-medium mb-1">{shift.diagnosis}</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="bg-slate-100 px-1 rounded-sm font-black">C: {translateComplexity(shift.complexity || 'medium').charAt(0)}</span>
                    <span className="bg-slate-100 px-1 rounded-sm font-bold">{translateMobility(shift.mobility || 'bedridden').toUpperCase()}</span>
                    {shift.isolationType && shift.isolationType !== 'Nenhum' && (
                      <span className="bg-orange-600 text-white px-1 rounded-sm font-black">{shift.isolationType}</span>
                    )}
                    <span className="text-slate-500 font-bold">{shift.insuranceType || 'PART.'}</span>
                  </div>
                </td>

                {/* 4. RISCOS / ALERTAS / DIETA */}
                <td className="border border-slate-950 p-1 align-top">
                  {shift.allergies && (
                    <div className="text-red-700 font-black border-b border-red-100 mb-1 pb-0.5">ALERGIA: {shift.allergies}</div>
                  )}
                  <div className="grid grid-cols-2 gap-1 mb-1">
                    {shift.fallRisk && <div className="text-rose-700 font-bold">⚠️ RISCO QUEDA</div>}
                    {shift.isRestrained && <div className="text-amber-700 font-bold">🔒 CONTIDO</div>}
                  </div>
                  <div className="bg-slate-50 p-0.5 rounded border border-slate-100">
                    <div className="font-bold">{shift.dietType || 'N/D'}</div>
                    <div className="text-[6px] italic">{shift.dietRoute || 'N/D'}</div>
                  </div>
                </td>

                {/* 5. SUPORTE / DISPOSITIVOS */}
                <td className="border border-slate-950 p-1 align-top">
                  <div className="space-y-0.5">
                    {shift.procedures && <div><span className="font-bold">PROC:</span> {shift.procedures}</div>}
                    {shift.devices && <div><span className="font-bold">DISP:</span> {shift.devices}</div>}
                    {shift.ventilatorSettings && <div className="text-blue-700 font-bold">VENT: {shift.ventilatorSettings}</div>}
                    {shift.drains && shift.drains.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="font-bold">DRENOS:</span>
                        {shift.drains.map((d, i) => <span key={i} className="bg-slate-100 px-0.5">{d.type}({d.volume})</span>)}
                      </div>
                    )}
                  </div>
                </td>

                {/* 6. MEDS / BALANÇO */}
                <td className="border border-slate-950 p-1 align-top">
                  <div className="space-y-1">
                    {shift.antibiotics && shift.antibiotics.length > 0 && (
                      <div className="border-b border-slate-100 pb-0.5">
                        <div className="font-black text-[6px] text-slate-400">ATB:</div>
                        {shift.antibiotics.map((atb, i) => (
                          <div key={i} className="flex justify-between leading-none">
                            <span>{atb.name}</span>
                            <span className="font-bold">{differenceInDays(new Date(), parseISO(atb.startDate))}d</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {shift.vasoactiveDrugsList && shift.vasoactiveDrugsList.length > 0 && (
                      <div className="border-b border-slate-100 pb-0.5">
                        <div className="font-black text-[6px] text-red-400">DROGAS:</div>
                        {shift.vasoactiveDrugsList.map((drug, i) => (
                          <div key={i} className="text-red-700 font-bold leading-none">{drug.name}: {drug.dose}ml/h</div>
                        ))}
                      </div>
                    )}
                    {shift.waterBalance && (
                      <div className="flex justify-between font-bold text-[6px]">
                        <span className="text-emerald-600">G:{shift.waterBalance.gain}</span>
                        <span className="text-rose-600">P:{shift.waterBalance.loss}</span>
                        <span className="text-medical-blue">B:{shift.waterBalance.total}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* 7. EXAMES / PENDÊNCIAS / OBS */}
                <td className="border border-slate-950 p-1 align-top">
                  <div className="space-y-1">
                    {shift.pendingExams && shift.pendingExams.length > 0 && (
                      <div className="text-amber-600 font-bold">
                        <div className="text-[6px] uppercase font-black">Pendentes:</div>
                        {shift.pendingExams.map((e, i) => <div key={i}>• {e}</div>)}
                      </div>
                    )}
                    {shift.completedExams && shift.completedExams.length > 0 && (
                      <div className="text-green-700">
                        <div className="text-[6px] uppercase font-black">Realizados:</div>
                        {shift.completedExams.map((e, i) => <div key={i}>• {e.name} ({format(new Date(e.completedAt), 'HH:mm')})</div>)}
                      </div>
                    )}
                    {shift.observations && (
                      <div className="text-slate-500 italic border-t border-slate-100 pt-0.5">
                        {shift.observations}
                      </div>
                    )}
                  </div>
                </td>
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
            margin: 0.3cm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }
          th, td {
            border: 0.5pt solid black !important;
            padding: 1px 2px !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}} />
    </div>
  );
};

