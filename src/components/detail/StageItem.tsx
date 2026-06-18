import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, CheckCheck, Clock, PlayCircle, MapPin, History, Camera, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  pending:     { color: '#4c6ef5', border: '#e0e7ff', bg: '#eef2ff' },
  in_progress: { color: '#ff6b35', border: '#fed7aa', bg: '#fff7ed' },
  done:        { color: '#10b981', border: '#a7f3d0', bg: '#ecfdf5' },
  n_a:         { color: '#4da6cc', border: '#bae6fd', bg: '#f0f9ff' },
};

const StatusIcon = ({ status }: { status: StageEntry['status'] }) => {
  if (status === 'done') return <CheckCheck size={14} color="#10b981" />;
  if (status === 'in_progress') return <PlayCircle size={14} color="#ff6b35" />;
  if (status === 'n_a') return <span style={{ fontSize: '9px', fontWeight: 700, color: '#4da6cc', fontFamily: "'Geist Mono', monospace" }}>N/A</span>;
  return <Clock size={14} color="#4c6ef5" />;
};

export function StageItem({ entry, recordId, index }: StageItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const updateStageStatus   = useAppStore((s) => s.updateStageStatus);
  const updateStageNotes    = useAppStore((s) => s.updateStageNotes);
  const updateStageLocation = useAppStore((s) => s.updateStageLocation);
  const addStagePhoto       = useAppStore((s) => s.addStagePhoto);
  const removeStagePhoto    = useAppStore((s) => s.removeStagePhoto);

  const stageInfo   = STAGES.find((s) => s.id === entry.stageId);
  const hasLocField = STAGES_WITH_LOCATION.has(entry.stageId as StageId);
  const { color, border, bg } = accentByStatus[entry.status];
  const isNA = entry.status === 'n_a';

  const allPhotos = [...(entry.locationPhotos ?? []), ...(entry.notesPhotos ?? [])];
  const photoCount = allPhotos.length;

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isNA) return;
    updateStageStatus(recordId, entry.stageId, statusCycleMap[entry.status]);
  };

  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) addStagePhoto(recordId, entry.stageId, 'notesPhotos', ev.target.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = () => {
    const locCount = (entry.locationPhotos ?? []).length;
    const field = photoIdx < locCount ? 'locationPhotos' : 'notesPhotos';
    const idx = photoIdx < locCount ? photoIdx : photoIdx - locCount;
    removeStagePhoto(recordId, entry.stageId, field, idx);
    setPhotoIdx(p => Math.max(0, p - 1));
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${hovered ? border : '#e8eaef'}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? `0 4px 16px rgba(0,0,0,0.07)` : '0 1px 4px rgba(0,0,0,0.04)',
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
          background: bg, border: `1px solid ${border}`,
        }}>
          <StatusIcon status={entry.status} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <p style={{ fontWeight: 700, fontSize: '13px', color: '#1a2332', lineHeight: 1.3 }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '10px', color: '#d1d5db', marginRight: '6px' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              {stageInfo?.label ?? entry.stageId}
            </p>
            {hasLocField && entry.location && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                fontSize: '10px', fontFamily: "'Geist Mono', monospace",
                color: '#ff6b35', background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '6px', padding: '1px 7px',
              }}>
                <MapPin size={9} />
                {entry.location}
              </span>
            )}
            {hasLocField && photoCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '3px',
                fontSize: '10px', fontFamily: "'Geist Mono', monospace",
                color: '#10b981', background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '6px', padding: '1px 7px',
              }}>
                <Camera size={9} />
                {photoCount}
              </span>
            )}
          </div>
          {entry.status !== 'pending' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '3px' }}>
              {entry.startedAt && (
                <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: "'Geist Mono', monospace" }}>
                  ▶ {formatDate(entry.startedAt)}
                </span>
              )}
              {entry.completedAt && (
                <span style={{ fontSize: '10px', color: '#059669', fontFamily: "'Geist Mono', monospace" }}>
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
          <div style={{ color: '#d1d5db' }}>
            {expanded
              ? <ChevronUp size={14} color="#9ca3af" />
              : <ChevronDown size={14} color="#d1d5db" />
            }
          </div>
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div style={{
          borderTop: `1px solid #f3f4f6`,
          background: '#fafbfc',
        }}>
          {/* Panel header strip */}
          <div style={{
            padding: '8px 14px',
            background: bg,
            borderBottom: `1px solid ${border}`,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.16em', color }}>
              DETALHES DA ETAPA
            </span>
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Localização */}
            {hasLocField && (
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                  color: '#ff6b35', marginBottom: '7px',
                }}>
                  <MapPin size={9} color="#ff6b35" />
                  LOCALIZAÇÃO
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={12} style={{
                    position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
                    color: '#fca27e', pointerEvents: 'none',
                  }} />
                  <input
                    type="text"
                    value={entry.location ?? ''}
                    onChange={e => updateStageLocation(recordId, entry.stageId, e.target.value)}
                    placeholder="Ex: Galpão A - Vaga 03"
                    style={{
                      width: '100%', fontSize: '12px', fontWeight: 500,
                      background: '#fff7f5', border: '1px solid #fecba1',
                      borderRadius: '9px', padding: '9px 12px 9px 32px',
                      color: '#374151', fontFamily: 'inherit',
                      outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#ff6b35';
                      e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.08)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#fecba1';
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
                color: '#4c6ef5', marginBottom: '7px',
              }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#c7d2fe', display: 'inline-block', flexShrink: 0 }} />
                OBSERVAÇÕES
              </label>
              <textarea
                value={entry.notes ?? ''}
                onChange={e => updateStageNotes(recordId, entry.stageId, e.target.value)}
                placeholder="Adicionar observações para esta etapa..."
                rows={3}
                style={{
                  width: '100%', fontSize: '12px',
                  background: '#f5f7ff', border: '1px solid #c7d2fe',
                  borderRadius: '9px', padding: '9px 12px',
                  color: '#374151', fontFamily: 'inherit',
                  resize: 'none', outline: 'none', lineHeight: 1.65,
                  boxSizing: 'border-box', display: 'block',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#4c6ef5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(76,110,245,0.07)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#c7d2fe';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Fotos */}
            {hasLocField && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                    color: '#4c6ef5', flex: 1,
                  }}>
                    <Camera size={9} color="#4c6ef5" />
                    FOTOS {photoCount > 0 && `(${photoCount})`}
                  </label>
                </div>

                {/* Botões câmera + galeria */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: photoCount > 0 ? '10px' : '0' }}>
                  <button
                    onClick={() => cameraRef.current?.click()}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '9px 12px', fontSize: '11px', fontWeight: 600,
                      fontFamily: 'inherit', cursor: 'pointer', borderRadius: '8px',
                      background: '#1a2332', border: '1px solid #2d3748',
                      color: '#ffffff', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#2d3748')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#1a2332')}
                  >
                    <Camera size={12} />
                    Câmera
                  </button>
                  <input
                    ref={cameraRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={e => { handlePhotoFiles(e.target.files); e.target.value = ''; }}
                  />

                  <button
                    onClick={() => galleryRef.current?.click()}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '9px 12px', fontSize: '11px', fontWeight: 600,
                      fontFamily: 'inherit', cursor: 'pointer', borderRadius: '8px',
                      background: '#eef2ff', border: '1px solid #c7d2fe',
                      color: '#4c6ef5', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#e0e7ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#eef2ff')}
                  >
                    <ChevronRight size={12} style={{ transform: 'rotate(-45deg)' }} />
                    Galeria
                  </button>
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => { handlePhotoFiles(e.target.files); e.target.value = ''; }}
                  />
                </div>

                {/* Carousel de fotos */}
                {photoCount > 0 && (
                  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#f3f4f6' }}>
                    <img
                      src={allPhotos[photoIdx]}
                      alt=""
                      style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                    />
                    {photoCount > 1 && (
                      <>
                        <button
                          onClick={() => setPhotoIdx(i => (i - 1 + photoCount) % photoCount)}
                          style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => setPhotoIdx(i => (i + 1) % photoCount)}
                          style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <ChevronRight size={14} />
                        </button>
                        <span style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.5)', borderRadius: '5px', padding: '2px 7px' }}>
                          {photoIdx + 1}/{photoCount}
                        </span>
                      </>
                    )}
                    <button
                      onClick={handleRemovePhoto}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Histórico */}
            {entry.history && entry.history.length > 0 && (
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                  color: '#9ca3af', marginBottom: '8px',
                }}>
                  <History size={9} color="#9ca3af" />
                  HISTÓRICO DE ALTERAÇÕES
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[...entry.history].reverse().map((h, i) => {
                    const dotColor = h.status === 'done' ? '#10b981' : h.status === 'in_progress' ? '#ff6b35' : '#4c6ef5';
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '6px 10px', borderRadius: '7px',
                        background: '#ffffff', border: '1px solid #f3f4f6',
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0, background: dotColor }} />
                        <span style={{ fontSize: '11px', color: '#6b7280', flex: 1 }}>
                          {statusDisplayLabel[h.status] ?? h.status}
                        </span>
                        <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: "'Geist Mono', monospace", whiteSpace: 'nowrap' }}>
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
