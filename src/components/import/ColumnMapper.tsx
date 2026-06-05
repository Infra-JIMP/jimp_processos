import React from 'react';
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { STAGES } from '../../utils/stages';
import type { StageId } from '../../utils/stages';

interface ColumnMapperProps {
  sheetNames: string[];
  selectedSheet: string;
  onSheetChange: (s: string) => void;
  columns: string[];
  nsColumn: string;
  onNsColumnChange: (c: string) => void;
  clientColumn: string;
  onClientColumnChange: (c: string) => void;
  stageColMap?: Partial<Record<StageId, string>>;
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
  padding: '10px 36px 10px 12px',
  fontSize: '13px',
  background: 'rgba(7,11,20,0.8)',
  border: '1px solid rgba(76,110,245,0.22)',
  borderRadius: '10px',
  color: '#c5d0e8',
  fontFamily: 'inherit',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  autoDetected,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  autoDetected?: boolean;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(141,160,200,0.55)', letterSpacing: '0.04em' }}>
          {label}
        </label>
        {autoDetected && (
          <span style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
            color: '#10b981', background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '4px', padding: '1px 5px',
          }}>
            AUTO
          </span>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={selectStyle}
          onFocus={e => (e.target.style.borderColor = 'rgba(76,110,245,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(76,110,245,0.22)')}
        >
          {placeholder && <option value="" style={{ background: '#003f4a', color: '#8da0c8' }}>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: '#003f4a', color: '#c5d0e8' }}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(116,143,252,0.5)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

export function ColumnMapper({
  sheetNames,
  selectedSheet,
  onSheetChange,
  columns,
  nsColumn,
  onNsColumnChange,
  clientColumn,
  onClientColumnChange,
  stageColMap,
}: ColumnMapperProps) {
  const detectedCount = stageColMap ? Object.keys(stageColMap).length : 0;
  const totalStages = STAGES.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {sheetNames.length > 1 && (
        <SelectField
          label="Planilha"
          value={selectedSheet}
          onChange={onSheetChange}
          options={sheetNames}
        />
      )}
      <SelectField
        label="Coluna do NS (Número de Série)"
        value={nsColumn}
        onChange={onNsColumnChange}
        options={columns}
        placeholder="Selecione a coluna..."
        autoDetected={!!nsColumn}
      />
      <SelectField
        label="Coluna do Cliente"
        value={clientColumn}
        onChange={onClientColumnChange}
        options={columns}
        placeholder="Selecione a coluna..."
        autoDetected={!!clientColumn}
      />

      {/* Stage detection summary */}
      {stageColMap !== undefined && (
        <div style={{
          borderRadius: '10px',
          border: `1px solid ${detectedCount > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,107,53,0.2)'}`,
          background: detectedCount > 0 ? 'rgba(16,185,129,0.06)' : 'rgba(255,107,53,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px',
            borderBottom: detectedCount > 0 ? '1px solid rgba(16,185,129,0.12)' : 'none',
          }}>
            {detectedCount > 0
              ? <CheckCircle2 size={14} color="#10b981" />
              : <AlertCircle size={14} color="#ff6b35" />
            }
            <span style={{ fontSize: '12px', fontWeight: 600, color: detectedCount > 0 ? '#10b981' : '#ff6b35' }}>
              {detectedCount > 0
                ? `${detectedCount} de ${totalStages} etapas detectadas automaticamente`
                : 'Nenhuma etapa detectada — datas serão ignoradas'
              }
            </span>
          </div>

          {detectedCount > 0 && (
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {STAGES.map(s => {
                const col = stageColMap[s.id];
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                      background: col ? '#10b981' : 'rgba(141,160,200,0.2)',
                    }} />
                    <span style={{ fontSize: '11px', color: col ? 'rgba(141,160,200,0.7)' : 'rgba(141,160,200,0.3)', flex: 1 }}>
                      {s.label}
                    </span>
                    {col && (
                      <span style={{
                        fontSize: '10px', fontFamily: "'Geist Mono', monospace",
                        color: '#748ffc', background: 'rgba(76,110,245,0.1)',
                        border: '1px solid rgba(76,110,245,0.2)',
                        borderRadius: '4px', padding: '1px 6px',
                        maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {col}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
