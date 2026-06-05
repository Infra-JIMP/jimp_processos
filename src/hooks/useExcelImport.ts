import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { STAGES } from '../utils/stages';
import type { StageId } from '../utils/stages';
import type { NSRecord, StageEntry, StageStatus } from '../store/types';

export interface ParseResult {
  sheetNames: string[];
  selectedSheet: string;
  columns: string[];
  rows: Record<string, string>[];
  autoNsCol: string;
  autoClientCol: string;
  stageColMap: Partial<Record<StageId, string>>;
}

const NS_KEYWORDS = ['ns', 'n.s', 'n/s', 'numero de serie', 'número de série', 'serial', 'chassis', 'chassi', 'numero', 'número'];

const CLIENT_KEYWORDS = ['cliente', 'client', 'razao', 'razão', 'empresa', 'comprador', 'nome'];

const STAGE_ALIASES: Record<StageId, string[]> = {
  PAT:            ['pat', 'pat.', 'patio', 'pátio', 'pateo'],
  LONA:           ['lona', 'lonas', 'cobertura'],
  MONT_TETO:      ['mont. teto', 'mont.teto', 'mont teto', 'montagem teto', 'mont. teto.'],
  MONT_BASE:      ['mont. base', 'mont.base', 'mont base', 'montagem base', 'mont. base.'],
  MONT_ASOALHO:   ['mont. assoalho', 'mont. asoalho', 'mont.asoalho', 'mont asoalho', 'assoalho', 'asoalho', 'mont. assoa'],
  MONT_ESTRUTURA: ['mont. estr.', 'mont.estr.', 'mont estr', 'mont. estrutura', 'mont.estrutura', 'mont estrutura', 'estrutura'],
  PINTURA:        ['pint.', 'pintura', 'pint', 'paint'],
  REBIT:          ['rebit.', 'rebit', 'rebite', 'rebitagem'],
  PROD_PORTAS:    ['prod. portas', 'prod.portas', 'prod portas', 'producao portas', 'produção portas'],
  OFICINA:        [],
  INST_PORTAS:    ['inst. portas', 'inst.portas', 'inst portas', 'instalacao portas', 'instalação portas'],
  CARPINTARIA:    ['carpintaria', 'carpin', 'marcenaria'],
  ELETRICA:       ['elétrica', 'eletrica', 'eletr.', 'eletric', 'eletr'],
  INSTALACAO:     ['instalação', 'instalacao', 'instal', 'instalação.'],
  REVISAO_FINAL:  ['revisão final', 'revisao final', 'rev. final', 'rev.final', 'revisão', 'revisao'],
  ENTREGA_FABRICA:['entrega fábrica', 'entrega fabrica', 'ent. fabrica', 'ent.fabrica', 'entrega fab', 'entrega fáb'],
  ENTREGA_FINAL:  ['entrega final', 'ent. final', 'ent.final', 'entrega final.'],
};

const IGNORE_COLS = [
  'tomada forca', 'tomada força', '5th all', '5thall', 'kit usinado', 'trilho',
  'coluna', 'lat.', 'lat', 'lateral', 'plasma', 'dobra cx', 'dobra de porta',
  'dobra cx.', 'op5', 'ops', 'ee', 'bt', 'eletr.', 'patio', 'teto',
  'seq.', 'seq', 'tipo', 'medida', 'portas', 'data inicio', 'data início',
  'acess.', 'cx carga', 'cx. carga', 'projeto', 'kit', 'realizado', 'data',
  'programacao', 'programação', 'caminhao', 'caminhão', 'almo xarifado',
  'almoxarifado', 'basculante', 'acab. cx. carga',
];

/**
 * Remove U+FFFD (replacement character) que o SheetJS insere quando não consegue
 * decodificar um byte. Tenta substituir pelo caractere Latin-1 original usando
 * a posição contextual, ou simplesmente remove se não for possível recuperar.
 * Para mojibake (UTF-8 lido como Latin-1): reverte se todos os chars são ≤ U+00FF.
 */
function fixEncoding(s: string): string {
  if (!s) return s;

  // Caso 1: mojibake — todos os chars são ≤ U+00FF, tenta redecodificar como UTF-8
  let allLatin = true;
  for (let i = 0; i < s.length; i++) {
    if (s.charCodeAt(i) > 0xFF) { allLatin = false; break; }
  }
  if (allLatin) {
    try {
      const bytes = new Uint8Array(s.length);
      for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      // Só aceita se o resultado tiver menos replacement chars que o original
      if (!decoded.includes('�')) return decoded;
    } catch { /* não é UTF-8 válido, continua */ }
  }

  // Caso 2: U+FFFD isolados — remove-os (melhor que mostrar ?)
  return s.replace(/�/g, '');
}

function normalize(s: string): string {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s.]/g, '')
    .replace(/\s+/g, ' ');
}

function isIgnored(col: string): boolean {
  const n = normalize(col);
  return IGNORE_COLS.some(ig => normalize(ig) === n || n === normalize(ig));
}

function detectNsCol(columns: string[]): string {
  for (const col of columns) {
    const n = normalize(col);
    if (NS_KEYWORDS.some(k => n === normalize(k))) return col;
  }
  for (const col of columns) {
    const n = normalize(col);
    if (NS_KEYWORDS.some(k => n.includes(normalize(k)))) return col;
  }
  return columns[0] ?? '';
}

function detectClientCol(columns: string[]): string {
  for (const col of columns) {
    const n = normalize(col);
    if (CLIENT_KEYWORDS.some(k => n === normalize(k) || n.startsWith(normalize(k)))) return col;
  }
  for (const col of columns) {
    const n = normalize(col);
    if (CLIENT_KEYWORDS.some(k => n.includes(normalize(k)))) return col;
  }
  return columns[1] ?? columns[0] ?? '';
}

function detectStageCols(columns: string[]): Partial<Record<StageId, string>> {
  const result: Partial<Record<StageId, string>> = {};
  for (const [stageId, aliases] of Object.entries(STAGE_ALIASES) as [StageId, string[]][]) {
    for (const col of columns) {
      if (isIgnored(col)) continue;
      const n = normalize(col);
      if (aliases.some(a => n === normalize(a))) {
        result[stageId] = col;
        break;
      }
    }
    if (!result[stageId as StageId]) {
      for (const col of columns) {
        if (isIgnored(col)) continue;
        const n = normalize(col);
        if (aliases.some(a => n.startsWith(normalize(a)))) {
          result[stageId as StageId] = col;
          break;
        }
      }
    }
  }
  return result;
}

function cellToStatus(val: string): StageStatus {
  const v = val?.toString().trim();
  if (!v || v === '' || v === '0') return 'pending';
  const lower = v.toLowerCase().replace(/[\s.]/g, '');
  if (lower === 'na' || lower === 'n/a' || lower === 'nãoaplica' || lower === 'naoplica' || lower === 'naoaplica') return 'n_a';
  return 'done';
}

function cellToDate(val: string): string | undefined {
  if (!val?.toString().trim() || val === '0') return undefined;
  const num = Number(val);
  if (!isNaN(num) && num > 1000) {
    const date = XLSX.SSF.parse_date_code(num);
    if (date) return new Date(date.y, date.m - 1, date.d).toISOString();
  }
  const match = val.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (match) {
    const [, d2, m, y] = match;
    const fullYear = y.length === 2 ? `20${y}` : y;
    return new Date(Number(fullYear), Number(m) - 1, Number(d2)).toISOString();
  }
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

export function useExcelImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedSheet, setSelectedSheet] = useState('');

  function buildResult(wb: XLSX.WorkBook, sheetName: string): ParseResult {
    const ws = wb.Sheets[sheetName];

    const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '', raw: false }) as string[][];

    console.log('[DEBUG] Primeiras linhas do Excel:');
    raw.slice(0, 6).forEach((row, i) => console.log(`  linha ${i}:`, JSON.stringify(row)));

    let headerRow = 0;
    let bestScore = -1;
    for (let i = 0; i < Math.min(10, raw.length); i++) {
      const row = raw[i] ?? [];
      const filled = row.filter(c => {
        const s = String(c).trim();
        return s && !s.startsWith('__EMPTY') && isNaN(Number(s));
      }).length;
      if (filled > bestScore) {
        bestScore = filled;
        headerRow = i;
      }
    }
    console.log('[DEBUG] headerRow detectado:', headerRow, '| linha:', JSON.stringify(raw[headerRow]));

    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
      defval: '',
      raw: false,
      range: headerRow,
    });

    const allColumns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const columns = allColumns.filter(c => !c.startsWith('__EMPTY') && c.trim());

    const autoNsCol = detectNsCol(columns);
    const autoClientCol = detectClientCol(columns);
    const stageColMap = detectStageCols(columns);

    const seqCol = columns.find(c => normalize(c) === 'seq.' || normalize(c) === 'seq');

    const cleanRows = rows
      .filter(row => {
        const nsVal = row[autoNsCol]?.toString().trim();
        if (!nsVal || nsVal.length === 0) return false;
        if (seqCol) {
          const seqVal = row[seqCol]?.toString().trim();
          if (seqVal && nsVal === seqVal) return false;
        }
        const nsNum = Number(nsVal);
        if (!isNaN(nsNum) && nsNum < 1000) return false;
        return true;
      })
      .map(row => {
        const clean: Record<string, string> = {};
        for (const c of columns) clean[c] = row[c] ?? '';
        return clean;
      });

    const seen = new Set<string>();
    const dedupedRows = cleanRows.filter(row => {
      const ns = row[autoNsCol]?.toString().trim();
      if (!ns || seen.has(ns)) return false;
      seen.add(ns);
      return true;
    });

    return {
      sheetNames: wb.SheetNames,
      selectedSheet: sheetName,
      columns,
      rows: dedupedRows,
      autoNsCol,
      autoClientCol,
      stageColMap,
    };
  }

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      let wb: XLSX.WorkBook;
      if (isCsv) {
        // Tenta UTF-8 primeiro; se tiver replacement chars, relê como Windows-1252
        let text = await file.text();
        if (text.includes('�')) {
          const buf = await file.arrayBuffer();
          text = new TextDecoder('windows-1252').decode(buf);
        }
        wb = XLSX.read(text, { type: 'string' });
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const isXls = file.name.toLowerCase().endsWith('.xls');
        // .xls (BIFF8) usa Windows-1252; .xlsx é sempre UTF-8
        wb = XLSX.read(arrayBuffer, { type: 'array', ...(isXls ? { codepage: 1252 } : {}) });
      }
      setWorkbook(wb);
      const firstSheet = wb.SheetNames[0];
      const result = buildResult(wb, firstSheet);
      setSelectedSheet(firstSheet);
      setParseResult(result);
    } catch (e) {
      setError('Erro ao ler o arquivo. Verifique se é um arquivo Excel ou CSV válido.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectSheet = useCallback((sheetName: string) => {
    if (!workbook) return;
    const result = buildResult(workbook, sheetName);
    setSelectedSheet(sheetName);
    setParseResult(result);
  }, [workbook]);

  const buildRecords = useCallback((
    nsCol: string,
    clientCol: string,
    selectedRows: Record<string, string>[],
    stageColMap: Partial<Record<StageId, string>>,
    conferenceId?: string
  ): NSRecord[] => {
    return selectedRows
      .filter(row => row[nsCol]?.toString().trim())
      .map(row => {
        const ns = fixEncoding(row[nsCol]?.toString().trim() ?? '');
        const clientName = fixEncoding(row[clientCol]?.toString().trim() ?? '');

        // First pass: resolve done/pending from spreadsheet values
        const rawStages = STAGES.map(s => {
          const col = stageColMap[s.id];
          const rawVal = col ? (row[col] ?? '') : '';
          const status = cellToStatus(rawVal);
          const completedAt = status === 'done' ? cellToDate(rawVal) : undefined;
          return { stageId: s.id, status, completedAt, startedAt: completedAt };
        });

        // Second pass: the first pending stage after the last done stage becomes in_progress
        // n_a stages are transparent: skip them when finding the "next pending after last done"
        const lastDoneIndex = rawStages.reduce((acc, s, i) => s.status === 'done' ? i : acc, -1);
        let inProgressAssigned = false;
        const stages: StageEntry[] = rawStages.map((s, i) => {
          if (!inProgressAssigned && i > lastDoneIndex && s.status === 'pending' && lastDoneIndex >= 0) {
            inProgressAssigned = true;
            return { ...s, status: 'in_progress' as const, startedAt: new Date().toISOString() };
          }
          return s;
        });

        return {
          id: uuidv4(),
          ns,
          clientName,
          label: `${ns} - ${clientName}`,
          importedAt: new Date().toISOString(),
          conferenceId: conferenceId || undefined,
          stages,
          generalNotes: '',
        };
      });
  }, []);

  return {
    parseFile,
    parseResult,
    selectedSheet,
    selectSheet,
    isLoading,
    error,
    buildRecords,
  };
}
