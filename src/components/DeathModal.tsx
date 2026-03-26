import React from 'react';
import { X, Skull, AlertTriangle, Trash2 } from 'lucide-react';
import { ShiftHandover } from '../types';

interface DeathModalProps {
  shift: ShiftHandover;
  onConfirm: (shift: ShiftHandover) => void;
  onClose: () => void;
}

export const DeathModal: React.FC<DeathModalProps> = ({ shift, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-lg text-white">
              <Skull size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Confirmar Óbito</h2>
              <p className="text-sm text-slate-500">Paciente: {shift.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
            <AlertTriangle className="shrink-0" size={24} />
            <div className="text-sm font-medium">
              <p className="font-bold mb-1 uppercase tracking-tight">Atenção!</p>
              <p>Ao confirmar o óbito, este paciente será <strong>removido da passagem de plantão ativa</strong> e movido para o histórico de registros arquivados.</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            Esta ação encerrará o acompanhamento ativo do paciente no setor <strong>{shift.sector}</strong>. Você poderá consultar os dados ou reativar o registro através do Histórico posteriormente.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(shift)}
              className="px-6 py-2 bg-slate-800 text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-slate-900 shadow-lg shadow-slate-200 flex items-center gap-2 transition-all"
            >
              <Trash2 size={18} />
              Confirmar Óbito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
