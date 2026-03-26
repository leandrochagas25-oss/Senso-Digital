import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { ShiftHandover } from '../types';

interface TransferModalProps {
  shift: ShiftHandover;
  sectors: string[];
  shifts: ShiftHandover[];
  onTransfer: (shift: ShiftHandover, destinationSector: string, destinationBed: string) => void;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ shift, sectors, shifts, onTransfer, onClose }) => {
  const [destinationSector, setDestinationSector] = useState('');
  const [destinationBed, setDestinationBed] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!destinationSector) {
      setError('Selecione o setor de destino.');
      return;
    }

    if (!destinationBed.trim()) {
      setError('Informe o leito de destino.');
      return;
    }

    // Check if bed is occupied in the destination sector
    const isOccupied = shifts.some(s => 
      !s.isArchived && 
      s.sector === destinationSector && 
      s.bed.toLowerCase() === destinationBed.trim().toLowerCase()
    );

    if (isOccupied) {
      setError(`O leito ${destinationBed} já está ocupado no setor ${destinationSector}.`);
      return;
    }

    onTransfer(shift, destinationSector, destinationBed.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Transferência / Alta</h2>
            <p className="text-sm text-slate-500">Defina o destino do paciente {shift.patientName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Setor de Destino</label>
              <select
                required
                value={destinationSector}
                onChange={(e) => setDestinationSector(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
              >
                <option value="">Selecione o Setor</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Alta Hospitalar">Alta Hospitalar</option>
                <option value="Transferência Externa">Transferência Externa</option>
              </select>
            </div>

            {(destinationSector !== 'Alta Hospitalar' && destinationSector !== 'Transferência Externa') && (
              <div className="space-y-1">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Leito (Nº)</label>
                    <input
                      required
                      placeholder="Ex: 201"
                      value={destinationBed.split('-')[0] || ''}
                      onChange={(e) => {
                        const currentLetter = destinationBed.split('-')[1] || '';
                        const newNum = e.target.value;
                        setDestinationBed(currentLetter ? `${newNum}-${currentLetter}` : newNum);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Letra/Box</label>
                    <input
                      placeholder="Ex: B"
                      value={destinationBed.split('-')[1] || ''}
                      onChange={(e) => {
                        const currentNum = destinationBed.split('-')[0] || '';
                        const newLetter = e.target.value.toUpperCase();
                        setDestinationBed(newLetter ? `${currentNum}-${newLetter}` : currentNum);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {(destinationSector === 'Alta Hospitalar' || destinationSector === 'Transferência Externa') && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Observação do Destino</label>
                <input
                  value={destinationBed}
                  onChange={(e) => setDestinationBed(e.target.value)}
                  placeholder="Ex: Domicílio, Hospital X..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-blue focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-medical-blue text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-medical-blue/90 shadow-lg shadow-medical-blue/20 flex items-center gap-2 transition-all"
            >
              <Send size={18} />
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
