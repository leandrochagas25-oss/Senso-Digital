export const translateComplexity = (complexity: string): string => {
  const translations: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
  };
  return translations[complexity] || complexity;
};

export const translateMobility = (mobility: string): string => {
  const translations: Record<string, string> = {
    bedridden: 'Acamado',
    walks: 'Deambula',
    assistance: 'Auxílio',
  };
  return translations[mobility] || mobility;
};

export const translateStatus = (status: string): string => {
  const translations: Record<string, string> = {
    stable: 'Estável',
    observation: 'Observação',
    critical: 'Crítico',
  };
  return translations[status] || status;
};

export const translateDischargeType = (type: string): string => {
  const translations: Record<string, string> = {
    discharge: 'Alta',
    death: 'Óbito',
  };
  return translations[type] || type;
};
