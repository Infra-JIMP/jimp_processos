import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCheck, Clock, PlayCircle, MapPin, History } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useAppStore } from '../../store/useAppStore';
import type { StageEntry } from '../../store/types';
import { STAGES } from '../../utils/stages';
import type { StageId } from '../../utils/stages';

interface StageItemProps {
  entry: StageEntry;
  recordId: string;
  index: number;
}

// Etapas que possuem campo de localização + observação
const STAGES_WITH_LOCATION = new Set<StageId>([
  'PAT', 'MONT_ASOALHO', 'PINTURA', 'REBIT',
  'PROD_PORTAS', 'CARPINTARIA', 'ELETRICA', 'REVISAO_FINAL',
]);

const statusCycleMap = { pending: 'in_progress', in_progress: 'done', done: 'pending', n_a: 'n_a' } as const;
const statusLabel = {
  pending: 'Iniciar etapa',
  in_progress: 'Marcar como concluído',
  done: 'Resetar para aguardando',
  n_a: 'Não aplica',
};

const statusDisplayLabel: Record<string, string> = {
  pending: 'Aguardando',
  in_progress: 'Em produção',
  done: 'Concluído',
  n_a: 'Não aplica',
};

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const accentByStatus = {
  pending:     { color: '#304280', border: 'rgba(76,110,245,0.15)',  bg: 'rgba(76,110,245,0.04)' },
  in_progress: { color: '#ff6b35', border: 'rgba(255,107,53,0.25)', bg: 'rgba(255,107,53,0.05)' },
  done:        { color: '#10b981', border: 'rgba(16,185,129,0.22)', bg: 'rgba(16,185,129,0.04)' },
  n_a:         { color: '#4da6cc', border: 'rgba(77,166,204,0.2)',  bg: 'rgba(77,166,204,0.04)' },
};

const StatusIcon = ({ status }: { status: StageEntry['status'] }) => {
  if (status === 'done') return <CheckCheck size={14} color="#10b981" />;
  if (status === 'in_progress') return <PlayCircle size={14} color="#ff6b35" />;
  if (status === 'n_a') return <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(77,166,204,0.6)', fontFamily: "'Geist Mono', monospace" }}>N/A</span>;
  return <Clock size={14} color="#304280" />;
};

export function StageItem({ entry, recordId, index }: StageItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const updateStageStatus   = useAppStore((s) => s.updateStageStatus);
  const updateStageNotes    = useAppStore((s) => s.updateStageNotes);
  const updateStageLocation = useAppStore((s) => s.updateStageLocation);

  const stageInfo    = STAGES.find((s) => s.id === entry.stageId);
  const hasLocField  = STAGES_WITH_LOCATION.has(entry.stageId as StageId);
  const { color, border, bg } = accentByStatus[entry.status];

  const isNA = entry.status === 'n_a';

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isNA) return;
    updateStageStatus(recordId, entry.stageId, statusCycleMap[entry.status]);
  };

  return (
    <div
      style={{
        background: hovered ? 'rgba(17,29,53,0.9)' : 'linear-gradient(135deg, #005f70 0%, #004a58 100%)',
        border: `1px solid ${hovered ? border : 'rgba(76,110,245,0.12)'}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? `0 4px 20px rgba(0,0,0,0.3), 0 0 12px ${bg}` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Row ── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div style={{
          width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: entry.status === 'done' ? 'rgba(16,185,129,0.15)' : 'rgba(76,110,245,0.08)',
          border: `1px solid ${border}`,
        }}>
          <StatusIcon status={entry.status} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 700, fontSize: '13px', color: '#e8edf7', lineHeight: 1.3 }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', color: 'rgba(141,160,200,0.4)', marginRight: '6px' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              {stageInfo?.label ?? entry.stageId}
            </p>
            {/* Localização inline badge */}
            {hasLocField && entry.location && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                fontSize: '10px', fontFamily: "'Geist Mono', monospace",
                color: '#ff8c42', background: 'rgba(255,107,53,0.1)',
                border: '1px solid rgba(255,107,53,0.25)',
                borderRadius: '6px', padding: '1px 7px',
              }}>
                <MapPin size={9} />
                {entry.location}
              </span>
            )}
          </div>
          {entry.status !== 'pending' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '3px' }}>
              {entry.startedAt && (
                <span style={{ fontSize: '10px', color: 'rgba(141,160,200,0.45)', fontFamily: "'Geist Mono', monospace" }}>
                  ▶ {formatDate(entry.startedAt)}
                </span>
              )}
              {entry.completedAt && (
                <span style={{ fontSize: '10px', color: 'rgba(52,211,153,0.6)', fontFamily: "'Geist Mono', monospace" }}>
                  ✓ {formatDate(entry.completedAt)}
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button onClick={handleStatusClick} title={statusLabel[entry.status]}
            style={{ background: 'none', border: 'none', padding: 0, cursor: isNA ? 'default' : 'pointer' }}>
            <Badge status={entry.status} />
          </button>
          <div style={{ color: 'rgba(141,160,200,0.3)' }}>
            {expanded
              ? <ChevronUp size={14} color="rgba(116,143,252,0.5)" />
              : <ChevronDown size={14} color="rgba(141,160,200,0.3)" />
            }
          </div>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div style={{
          borderTop: `1px solid ${bg}`,
          background: 'rgba(5,9,18,0.5)',
        }}>
          {/* Panel header strip */}
          <div style={{
            padding: '8px 14px',
            background: `linear-gradient(90deg, ${bg} 0%, transparent 100%)`,
            borderBottom: '1px solid rgba(76,110,245,0.06)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: color, opacity: 0.7 }} />
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color: 'rgba(141,160,200,0.35)' }}>
              DETALHES DA ETAPA
            </span>
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Localização — só nas 8 etapas */}
            {hasLocField && (
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                  color: 'rgba(255,140,66,0.8)', marginBottom: '7px',
                }}>
                  <MapPin size={9} color="#ff8c42" />
                  LOCALIZAÇÃO
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={12} style={{
                    position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(255,107,53,0.4)', pointerEvents: 'none',
                  }} />
                  <input
                    type="text"
                    value={entry.location ?? ''}
                    onChange={e => updateStageLocation(recordId, entry.stageId, e.target.value)}
                    placeholder="Ex: Galpão A - Vaga 03"
                    style={{
                      width: '100%', fontSize: '12px', fontWeight: 500,
                      background: 'rgba(255,107,53,0.04)',
                      border: '1px solid rgba(255,107,53,0.18)',
                      borderRadius: '9px', padding: '9px 12px 9px 32px',
                      color: '#f0f4ff', fontFamily: 'inherit',
                      outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(255,107,53,0.45)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.08)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,107,53,0.18)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Observações */}
            <div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                color: 'rgba(116,143,252,0.6)', marginBottom: '7px',
              }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'rgba(76,110,245,0.4)', display: 'inline-block', flexShrink: 0 }} />
                OBSERVAÇÕES
              </label>
              <textarea
                value={entry.notes ?? ''}
                onChange={e => updateStageNotes(recordId, entry.stageId, e.target.value)}
                placeholder="Adicionar observações para esta etapa..."
                rows={3}
                style={{
                  width: '100%', fontSize: '12px',
                  background: 'rgba(76,110,245,0.03)',
                  border: '1px solid rgba(76,110,245,0.15)',
                  borderRadius: '9px', padding: '9px 12px',
                  color: '#c5d0e8', fontFamily: 'inherit',
                  resize: 'none', outline: 'none', lineHeight: 1.65,
                  boxSizing: 'border-box', display: 'block',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(76,110,245,0.4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(76,110,245,0.07)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(76,110,245,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Histórico de alterações */}
            {entry.history && entry.history.length > 0 && (
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                  color: 'rgba(141,160,200,0.4)', marginBottom: '8px',
                }}>
                  <History size={9} color="rgba(141,160,200,0.4)" />
                  HISTÓRICO DE ALTERAÇÕES
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[...entry.history].reverse().map((h, i) => {
                    const dotColor = h.status === 'done' ? '#10b981' : h.status === 'in_progress' ? '#ff6b35' : '#304280';
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '6px 10px', borderRadius: '7px',
                        background: 'rgba(76,110,245,0.03)',
                        border: '1px solid rgba(76,110,245,0.08)',
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: dotColor }} />
                        <span style={{ fontSize: '11px', color: 'rgba(197,208,232,0.6)', flex: 1 }}>
                          {statusDisplayLabel[h.status] ?? h.status}
                        </span>
                        <span style={{ fontSize: '10px', color: 'rgba(141,160,200,0.35)', fontFamily: "'Geist Mono', monospace", whiteSpace: 'nowrap' }}>
                          {formatDate(h.changedAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
