import React from 'react';
import { X, Home, AlertTriangle, ChevronRight } from 'lucide-react';
import { ShiftHandover } from '../types';

interface DischargeModalProps {
  shift: ShiftHandover;
  onConfirm: (shift: ShiftHandover) => void;
  onClose: () => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({ 
  shift, 
  onConfirm, 
  onClose 
}) => {
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(shift);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Home size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-900">Confirmar Alta</h2>
              <p className="text-sm text-emerald-700/70">Paciente: {shift.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-full transition-colors">
            <X size={24} className="text-emerald-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800">
            <AlertTriangle className="shrink-0" size={24} />
            <div className="text-sm font-medium">
              <p className="font-bold mb-1 uppercase tracking-tight">Atenção!</p>
              <p>Ao confirmar a alta hospitalar, este paciente será movido para o <strong>histórico de registros arquivados</strong>.</p>
            </div>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all active:scale-95"
              >
                Confirmar Alta
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
