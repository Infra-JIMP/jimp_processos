export const STAGES = [
  { id: 'PAT', label: 'PAT.' },
  { id: 'LONA', label: 'LONA' },
  { id: 'MONT_TETO', label: 'MONT.TETO' },
  { id: 'MONT_BASE', label: 'MONT.BASE' },
  { id: 'MONT_ASOALHO', label: 'MONT.ASOALHO' },
  { id: 'MONT_ESTRUTURA', label: 'MONT. ESTRUTURA' },
  { id: 'PINTURA', label: 'PINTURA' },
  { id: 'REBIT', label: 'REBIT' },
  { id: 'PROD_PORTAS', label: 'PROD. PORTAS' },
  { id: 'OFICINA', label: 'OFICINA' },
  { id: 'INST_PORTAS', label: 'INST. PORTAS' },
  { id: 'CARPINTARIA', label: 'CARPINTARIA' },
  { id: 'ELETRICA', label: 'ELÉTRICA' },
  { id: 'INSTALACAO', label: 'INSTALAÇÃO' },
  { id: 'REVISAO_FINAL', label: 'REVISÃO FINAL' },
  { id: 'ENTREGA_FABRICA', label: 'ENTREGA FÁBRICA' },
  { id: 'ENTREGA_FINAL', label: 'ENTREGA FINAL' },
] as const;

export type StageId = typeof STAGES[number]['id'];
