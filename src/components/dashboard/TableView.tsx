import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { STAGES } from '../../utils/stages';
import type { NSRecord, StageStatus, StageEntry } from '../../store/types';
import { useAppStore } from '../../store/useAppStore';
import type { StageId } from '../../utils/stages';
import { MapPin, FileText, Camera, X, ChevronLeft, ChevronRight, Trash2, ChevronDown } from 'lucide-react';
import { NSDetailModal } from '../ui/NSDetailModal';

interface TableViewProps {
  records: NSRecord[];
  visibleStages?: Set<StageId>;
  sortCol: StageId | null;
  sortDir: 'asc' | 'desc';
  onSortChange: (col: StageId, dir: 'asc' | 'desc') => void;
}

const statusCycle: Record<StageStatus, StageStatus> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
  n_a: 'n_a',
};

const STAGES_WITH_LOCATION = new Set<StageId>([
  'PAT', 'MONT_ASOALHO', 'PINTURA', 'REBIT',
  'PROD_PORTAS', 'CARPINTARIA', 'ELETRICA', 'REVISAO_FINAL',
]);

const STATUS_LABEL: Record<StageStatus, string> = {
  pending: 'Aguardando',
  in_progress: 'Em produção',
  done: 'Concluído',
  n_a: 'Não aplica',
};

const STATUS_COLOR: Record<StageStatus, string> = {
  pending: '#304280',
  in_progress: '#ff6b35',
  done: '#10b981',
  n_a: '#4da6cc',
};

const STATUS_BG: Record<StageStatus, string> = {
  pending: 'rgba(48,66,128,0.12)',
  in_progress: 'rgba(255,107,53,0.12)',
  done: 'rgba(16,185,129,0.12)',
  n_a: 'rgba(77,166,204,0.08)',
};

// ── Photo Tooltip ─────────────────────────────────────────────────────────────
interface PhotoTooltipProps {
  stage: StageEntry;
  stageLabel: string;
  anchorRect: DOMRect;
}

function PhotoTooltip({ stage, stageLabel, anchorRect }: PhotoTooltipProps) {
  const allPhotos = [...(stage.locationPhotos ?? []), ...(stage.notesPhotos ?? [])];
  const photoIdx = 0;

  const W = 240;
  const GAP = 10;
  let left = anchorRect.left + anchorRect.width / 2 - W / 2;
  let top = anchorRect.bottom + GAP + window.scrollY;
  if (left + W > window.innerWidth - 12) left = window.innerWidth - W - 12;
  if (left < 8) left = 8;
  const estimatedH = allPhotos.length > 0 ? 280 : 120;
  if (anchorRect.bottom + GAP + estimatedH > window.innerHeight) {
    top = anchorRect.top - GAP - estimatedH + window.scrollY;
    if (top < 8) top = 8;
  }

  const hasLoc = !!stage.location;
  const hasNotes = !!stage.notes?.trim();
  const hasPhotos = allPhotos.length > 0;

  return createPortal(
    <div
      style={{
        position: 'absolute', top, left, width: W, zIndex: 3000,
        background: '#1e293b',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(76,110,245,0.06)',
        overflow: 'hidden',
        animation: 'tooltipIn 0.14s ease both',
        pointerEvents: 'none',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid rgba(76,110,245,0.1)',
        background: 'rgba(76,110,245,0.06)',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLOR[stage.status], boxShadow: `0 0 5px ${STATUS_COLOR[stage.status]}` }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(197,208,232,0.8)' }}>
          {stageLabel}
        </span>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Photo carousel */}
        {hasPhotos && (
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#0a0f1a' }}>
            <img
              src={allPhotos[photoIdx]}
              alt=""
              style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
            />
            {allPhotos.length > 1 && (
              <>
                <div style={{ position: 'absolute', bottom: '6px', right: '6px', fontSize: '9px', color: 'rgba(255,255,255,0.8)', background: 'rgba(0,0,0,0.55)', borderRadius: '4px', padding: '2px 6px', fontFamily: "'Geist Mono', monospace" }}>
                  {photoIdx + 1}/{allPhotos.length}
                </div>
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', display: 'flex', gap: '4px' }}>
                  {allPhotos.map((_, i) => (
                    <div key={i} style={{ width: i === photoIdx ? '14px' : '5px', height: '5px', borderRadius: '3px', background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.35)', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Location */}
        {hasLoc && (
          <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(255,140,66,0.15)', border: '1px solid rgba(255,140,66,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
              <MapPin size={9} color="#ff8c42" />
            </div>
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,140,66,0.6)', letterSpacing: '0.1em', marginBottom: '2px' }}>LOCALIZAÇÃO</p>
              <p style={{ fontSize: '11px', color: '#c5d0e8', lineHeight: 1.4 }}>{stage.location}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {hasNotes && (
          <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(116,143,252,0.15)', border: '1px solid rgba(116,143,252,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
              <FileText size={9} color="#748ffc" />
            </div>
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(116,143,252,0.6)', letterSpacing: '0.1em', marginBottom: '2px' }}>OBSERVAÇÕES</p>
              <p style={{ fontSize: '11px', color: '#c5d0e8', lineHeight: 1.4, maxHeight: '60px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const }}>{stage.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── Cell Popover ──────────────────────────────────────────────────────────────
interface CellPopoverProps {
  record: NSRecord;
  stage: StageEntry;
  stageLabel: string;
  anchorRect: DOMRect;
  onClose: () => void;
}

function CellPopover({ record, stage, stageLabel, anchorRect, onClose }: CellPopoverProps) {
  const updateStageStatus   = useAppStore(s => s.updateStageStatus);
  const updateStageLocation = useAppStore(s => s.updateStageLocation);
  const updateStageNotes    = useAppStore(s => s.updateStageNotes);
  const addStagePhoto       = useAppStore(s => s.addStagePhoto);
  const removeStagePhoto    = useAppStore(s => s.removeStagePhoto);
  const fileRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  const allPhotos = [...(stage.locationPhotos ?? []), ...(stage.notesPhotos ?? [])];

  const W = 300;
  const GAP = 8;
  let left = anchorRect.left + anchorRect.width / 2 - W / 2;
  let top = anchorRect.bottom + GAP + window.scrollY;
  if (left + W > window.innerWidth - 12) left = window.innerWidth - W - 12;
  if (left < 8) left = 8;
  if (anchorRect.bottom + GAP + 400 > window.innerHeight) {
    top = anchorRect.top - GAP - 400 + window.scrollY;
    if (top < 8) top = 8;
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) addStagePhoto(record.id, stage.stageId, 'notesPhotos', ev.target.result as string);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const color = STATUS_COLOR[stage.status];
  const bg = STATUS_BG[stage.status];
  const hasLocField = STAGES_WITH_LOCATION.has(stage.stageId as StageId);

  return createPortal(
    <div
      ref={popRef}
      style={{
        position: 'absolute', top, left, width: W, zIndex: 2000,
        background: 'linear-gradient(135deg, #005f70 0%, #004a58 100%)',
        border: `1px solid ${color}44`,
        borderRadius: '14px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        animation: 'scaleIn 0.15s cubic-bezier(0.16,1,0.3,1) both',
        overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 12px',
        background: bg,
        borderBottom: `1px solid ${color}22`,
      }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color, flex: 1 }}>
          {stageLabel}
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(141,160,200,0.4)', display: 'flex', padding: '2px' }}>
          <X size={12} />
        </button>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={() => updateStageStatus(record.id, stage.stageId, statusCycle[stage.status])}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px',
            background: bg, border: `1px solid ${color}44`,
            cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
            fontSize: '11px', color, letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = `${color}44`)}
        >
          <span>{STATUS_LABEL[stage.status]}</span>
          <span style={{ fontSize: '9px', opacity: 0.6 }}>clique para avançar →</span>
        </button>

        {(stage.startedAt || stage.completedAt) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {stage.startedAt && (
              <span style={{ fontSize: '10px', color: 'rgba(141,160,200,0.4)', fontFamily: "'Geist Mono', monospace" }}>
                ▶ {formatDate(stage.startedAt)}
              </span>
            )}
            {stage.completedAt && (
              <span style={{ fontSize: '10px', color: 'rgba(52,211,153,0.6)', fontFamily: "'Geist Mono', monospace" }}>
                ✓ {formatDate(stage.completedAt)}
              </span>
            )}
          </div>
        )}

        {hasLocField && (
        <div>
          <label style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,140,66,0.7)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
            <MapPin size={9} color="#ff8c42" /> LOCALIZAÇÃO
          </label>
          <input
            type="text"
            value={stage.location ?? ''}
            onChange={e => updateStageLocation(record.id, stage.stageId, e.target.value)}
            placeholder="Ex: Galpão A - Vaga 03"
            style={{
              width: '100%', padding: '7px 10px', fontSize: '12px', boxSizing: 'border-box',
              background: 'rgba(255,107,53,0.04)', border: '1px solid rgba(255,107,53,0.18)',
              borderRadius: '8px', color: '#f0f4ff', fontFamily: 'inherit', outline: 'none',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,107,53,0.45)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,107,53,0.18)')}
          />
        </div>
        )}

        {hasLocField && (
        <div>
          <label style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(116,143,252,0.6)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
            <FileText size={9} color="#748ffc" /> OBSERVAÇÕES
          </label>
          <textarea
            value={stage.notes ?? ''}
            onChange={e => updateStageNotes(record.id, stage.stageId, e.target.value)}
            placeholder="Observações desta etapa..."
            rows={3}
            style={{
              width: '100%', padding: '7px 10px', fontSize: '12px', boxSizing: 'border-box',
              background: 'rgba(76,110,245,0.03)', border: '1px solid rgba(76,110,245,0.15)',
              borderRadius: '8px', color: '#c5d0e8', fontFamily: 'inherit', resize: 'none',
              outline: 'none', lineHeight: 1.6, display: 'block',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(76,110,245,0.4)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(76,110,245,0.15)')}
          />
        </div>
        )}

        {hasLocField && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <label style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(116,143,252,0.6)', display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
              <Camera size={9} color="#748ffc" /> FOTOS {allPhotos.length > 0 && `(${allPhotos.length})`}
            </label>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: '3px 8px', fontSize: '10px', fontWeight: 600, fontFamily: 'inherit',
                borderRadius: '6px', cursor: 'pointer',
                background: 'rgba(76,110,245,0.1)', border: '1px solid rgba(76,110,245,0.25)',
                color: '#748ffc', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(76,110,245,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(76,110,245,0.1)')}
            >
              + Adicionar
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          {allPhotos.length > 0 && (
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#006a7a' }}>
              <img src={allPhotos[photoIdx]} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
              {allPhotos.length > 1 && (
                <>
                  <button onClick={() => setPhotoIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                    style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPhotoIdx(i => (i + 1) % allPhotos.length)}
                    style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={14} />
                  </button>
                  <span style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '1px 6px' }}>
                    {photoIdx + 1}/{allPhotos.length}
                  </span>
                </>
              )}
              <button
                onClick={() => {
                  const locCount = (stage.locationPhotos ?? []).length;
                  const field = photoIdx < locCount ? 'locationPhotos' : 'notesPhotos';
                  const idx = photoIdx < locCount ? photoIdx : photoIdx - locCount;
                  removeStagePhoto(record.id, stage.stageId, field, idx);
                  setPhotoIdx(p => Math.max(0, p - 1));
                }}
                style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={10} />
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── Mobile Card View ──────────────────────────────────────────────────────────
function MobileCardView({ records, stagesToShow }: { records: NSRecord[]; stagesToShow: ReadonlyArray<{ id: StageId; label: string }> }) {
  const updateStageStatus = useAppStore(s => s.updateStageStatus);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);

  const dotColors: Record<StageStatus, React.CSSProperties> = {
    pending:    { background: 'rgba(76,110,245,0.2)', border: '1px solid rgba(76,110,245,0.15)' },
    in_progress:{ background: '#ff6b35', boxShadow: '0 0 6px rgba(255,107,53,0.6)' },
    done:       { background: '#10b981', boxShadow: '0 0 5px rgba(16,185,129,0.5)' },
    n_a:        { background: 'rgba(77,166,204,0.2)', border: '1px solid rgba(77,166,204,0.25)' },
  };

  return (
    <>
      <NSDetailModal recordId={modalId} onClose={() => setModalId(null)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {records.map(record => {
          const applicableStages = record.stages.filter(s => s.status !== 'n_a');
          const done = applicableStages.filter(s => s.status === 'done').length;
          const progress = applicableStages.length > 0 ? Math.round((done / applicableStages.length) * 100) : 0;
          const isExpanded = expandedId === record.id;
          const currentStage = record.stages.find(s => s.status === 'in_progress');
          const currentLabel = currentStage
            ? STAGES.find(s => s.id === currentStage.stageId)?.label ?? ''
            : progress === 100 ? 'Concluído' : 'Aguardando';

          return (
            <div
              key={record.id}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #005060 0%, #003f4a 100%)',
                border: '1px solid rgba(76,110,245,0.12)',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Card header row */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(isExpanded ? null : record.id)}
              >
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#e8edf7', fontFamily: "'Geist Mono', monospace", fontSize: '13px', lineHeight: 1.2 }}>
                    {record.ns}
                  </p>
                  <p style={{ color: 'rgba(141,160,200,0.5)', fontSize: '11px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {record.clientName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                    <div style={{
                      width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                      background: progress === 100 ? '#10b981' : currentStage ? '#ff6b35' : 'rgba(76,110,245,0.4)',
                    }} />
                    <span style={{ fontSize: '10px', color: 'rgba(141,160,200,0.4)', letterSpacing: '0.04em' }}>
                      {currentLabel}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setModalId(record.id); }}
                    style={{
                      padding: '5px 10px', fontSize: '10px', fontWeight: 600,
                      fontFamily: 'inherit', cursor: 'pointer', borderRadius: '7px',
                      background: 'rgba(76,110,245,0.1)', border: '1px solid rgba(76,110,245,0.2)',
                      color: '#748ffc', whiteSpace: 'nowrap',
                    }}
                  >
                    Detalhes
                  </button>
                  <div style={{ color: 'rgba(141,160,200,0.3)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Expandable stage grid */}
              {isExpanded && (
                <div style={{
                  borderTop: '1px solid rgba(76,110,245,0.08)',
                  padding: '10px 14px 12px',
                  background: 'rgba(0,0,0,0.15)',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                    gap: '6px',
                  }}>
                    {stagesToShow.map(stageDef => {
                      const stage = record.stages.find(s => s.stageId === stageDef.id);
                      if (!stage) return null;
                      const isNA = stage.status === 'n_a';
                      const color = STATUS_COLOR[stage.status];
                      const hasExtra = !isNA && !!(stage.location || stage.notes || (stage.locationPhotos?.length ?? 0) > 0 || (stage.notesPhotos?.length ?? 0) > 0);
                      return (
                        <button
                          key={stageDef.id}
                          onClick={isNA ? undefined : () => updateStageStatus(record.id, stage.stageId, statusCycle[stage.status])}
                          title={isNA ? 'Não aplica para este cliente' : undefined}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                            padding: '8px 4px', borderRadius: '8px',
                            cursor: isNA ? 'default' : 'pointer',
                            fontFamily: 'inherit',
                            background: isNA ? 'rgba(77,166,204,0.06)'
                              : stage.status === 'done' ? 'rgba(16,185,129,0.08)'
                              : stage.status === 'in_progress' ? 'rgba(255,107,53,0.08)'
                              : 'rgba(76,110,245,0.04)',
                            border: `1px solid ${isNA ? 'rgba(77,166,204,0.2)'
                              : stage.status === 'done' ? 'rgba(16,185,129,0.2)'
                              : stage.status === 'in_progress' ? 'rgba(255,107,53,0.25)'
                              : 'rgba(76,110,245,0.1)'}`,
                            transition: 'all 0.15s',
                          }}
                        >
                          {isNA ? (
                            <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(77,166,204,0.5)', fontFamily: "'Geist Mono', monospace" }}>N/A</span>
                          ) : (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', ...dotColors[stage.status] }} />
                          )}
                          <span style={{ fontSize: '8px', fontWeight: 600, color: isNA ? 'rgba(77,166,204,0.4)' : stage.status === 'pending' ? 'rgba(141,160,200,0.35)' : color, letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.2 }}>
                            {stageDef.label}
                          </span>
                          {hasExtra && (
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {stage.location && <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ff8c42' }} />}
                              {stage.notes && <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#748ffc' }} />}
                              {((stage.locationPhotos?.length ?? 0) + (stage.notesPhotos?.length ?? 0)) > 0 && (
                                <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#10b981' }} />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── TableView ─────────────────────────────────────────────────────────────────

// Sort priority: in_progress=0 (most urgent) → pending=1 → done=2 → n_a=3
const SORT_PRIORITY: Record<StageStatus, number> = {
  in_progress: 0,
  pending: 1,
  done: 2,
  n_a: 3,
};

export function TableView({ records, visibleStages, sortCol, sortDir, onSortChange }: TableViewProps) {
  const [activeCell, setActiveCell] = useState<{ recordId: string; stageId: StageId; rect: DOMRect } | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [hoverTooltip, setHoverTooltip] = useState<{ recordId: string; stageId: StageId; rect: DOMRect } | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSortClick = (stageId: StageId) => {
    if (sortCol === stageId) {
      onSortChange(stageId, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(stageId, 'asc');
    }
  };

  const handleCellMouseEnter = useCallback((e: React.MouseEvent<HTMLTableCellElement>, recordId: string, stageId: StageId, hasExtra: boolean) => {
    if (!hasExtra) return;
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = setTimeout(() => {
      setHoverTooltip({ recordId, stageId, rect });
    }, 80);
  }, []);

  const handleCellMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoverTooltip(null);
  }, []);

  const stagesToShow = visibleStages ? STAGES.filter(s => visibleStages.has(s.id)) : STAGES;

  const sortedRecords = sortCol
    ? [...records].sort((a, b) => {
        const sa = a.stages.find(s => s.stageId === sortCol)?.status ?? 'pending';
        const sb = b.stages.find(s => s.stageId === sortCol)?.status ?? 'pending';
        const diff = SORT_PRIORITY[sa] - SORT_PRIORITY[sb];
        return sortDir === 'asc' ? diff : -diff;
      })
    : records;

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(141,160,200,0.3)', fontSize: '13px' }}>
        Nenhum NS encontrado.
      </div>
    );
  }

  // ── Mobile card layout ────────────────────────────────────────────────────
  if (isMobile) {
    return <MobileCardView records={records} stagesToShow={stagesToShow} />;
  }

  // ── Desktop table layout ──────────────────────────────────────────────────
  const handleCellClick = (e: React.MouseEvent<HTMLElement>, recordId: string, stageId: StageId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveCell(prev =>
      prev?.recordId === recordId && prev?.stageId === stageId ? null : { recordId, stageId, rect }
    );
  };

  const activeRecord = activeCell ? records.find(r => r.id === activeCell.recordId) : null;
  const activeStage = activeRecord?.stages.find(s => s.stageId === activeCell?.stageId);
  const activeStageLabel = STAGES.find(s => s.id === activeCell?.stageId)?.label ?? '';

  return (
    <>
      {activeCell && activeRecord && activeStage && (
        <CellPopover
          record={activeRecord}
          stage={activeStage}
          stageLabel={activeStageLabel}
          anchorRect={activeCell.rect}
          onClose={() => setActiveCell(null)}
        />
      )}

      {hoverTooltip && !activeCell && (() => {
        const hr = records.find(r => r.id === hoverTooltip.recordId);
        const hs = hr?.stages.find(s => s.stageId === hoverTooltip.stageId);
        const hl = STAGES.find(s => s.id === hoverTooltip.stageId)?.label ?? '';
        return hr && hs ? <PhotoTooltip stage={hs} stageLabel={hl} anchorRect={hoverTooltip.rect} /> : null;
      })()}

      <div className="table-wrapper" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <tr style={{
              borderBottom: '1px solid #e8eaef',
              background: '#f8f9fb',
            }}>
              <th style={{
                textAlign: 'left', padding: '11px 16px',
                fontWeight: 700, fontSize: '10px', letterSpacing: '0.16em',
                fontFamily: "'Geist Mono', monospace",
                color: '#9ca3af',
                textTransform: 'uppercase',
                position: 'sticky', left: 0, zIndex: 30,
                background: '#f8f9fb',
                minWidth: '200px',
                borderRight: '1px solid #e8eaef',
              }}>
                NS / Cliente
              </th>
              {stagesToShow.map((s, i) => {
                const isActive = sortCol === s.id;
                return (
                  <th
                    key={s.id}
                    onClick={() => handleSortClick(s.id)}
                    style={{
                      padding: '10px 6px',
                      fontWeight: 600, fontSize: '10px', letterSpacing: '0.04em',
                      fontFamily: "'DM Sans', 'Geist', sans-serif",
                      color: isActive ? '#4c6ef5' : '#6b7280',
                      textAlign: 'center', minWidth: '76px',
                      whiteSpace: 'nowrap',
                      background: isActive ? '#eef2ff' : '#f8f9fb',
                      borderLeft: i === 0 ? 'none' : '1px solid #f0f1f4',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'color 0.15s, background 0.15s',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span>{s.label}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', opacity: isActive ? 1 : 0.2, transition: 'opacity 0.15s' }}>
                        <svg width="7" height="4" viewBox="0 0 7 4" fill="none">
                          <path d="M3.5 0L7 4H0L3.5 0Z" fill={isActive && sortDir === 'asc' ? '#4c6ef5' : '#d1d5db'} />
                        </svg>
                        <svg width="7" height="4" viewBox="0 0 7 4" fill="none">
                          <path d="M3.5 4L0 0H7L3.5 4Z" fill={isActive && sortDir === 'desc' ? '#4c6ef5' : '#d1d5db'} />
                        </svg>
                      </div>
                    </div>
                    {isActive && (
                      <div style={{
                        position: 'absolute', bottom: 0, left: '15%', right: '15%',
                        height: '2px', borderRadius: '2px 2px 0 0',
                        background: '#4c6ef5',
                      }} />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((record, rowIdx) => {
              const isEven = rowIdx % 2 === 0;

              return (
                <tr
                  key={record.id}
                  className="table-row"
                  style={{
                    borderBottom: '1px solid #f0f1f4',
                    background: isEven ? '#fafbfc' : '#ffffff',
                  }}
                >
                  {/* NS / Cliente sticky column */}
                  <td
                    className="table-ns-cell"
                    style={{
                      padding: '10px 16px',
                      position: 'sticky', left: 0, zIndex: 5,
                      background: isEven ? '#fafbfc' : '#ffffff',
                      borderRight: '1px solid #e8eaef',
                      cursor: 'default',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontWeight: 600, color: '#1a2332',
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: '12.5px', lineHeight: 1.2,
                          letterSpacing: '0.01em',
                        }}>
                          {record.ns}
                        </p>
                        <p style={{
                          color: '#9ca3af',
                          fontFamily: "'DM Sans', 'Geist', sans-serif",
                          fontSize: '11px', fontWeight: 400,
                          marginTop: '2px', whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '148px',
                        }}>
                          {record.clientName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Stage cells */}
                  {record.stages.filter(s => stagesToShow.some(vs => vs.id === s.stageId)).map((stage, si) => {
                    const isNA = stage.status === 'n_a';
                    const isActive = !isNA && activeCell?.recordId === record.id && activeCell?.stageId === stage.stageId;
                    const hasLoc = !isNA && !!stage.location;
                    const hasNotes = !isNA && !!stage.notes && stage.notes.trim() !== '';
                    const photoCount = isNA ? 0 : (stage.locationPhotos?.length ?? 0) + (stage.notesPhotos?.length ?? 0);
                    const hasPhotos = photoCount > 0;
                    const hasExtra = hasLoc || hasNotes || hasPhotos;
                    const color = STATUS_COLOR[stage.status];

                    // Date of last change for this stage
                    const stageDate = stage.completedAt ?? stage.startedAt ?? null;
                    const stageDateStr = stageDate
                      ? new Date(stageDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                      : null;

                    const cellBg = isNA
                      ? 'rgba(77,166,204,0.04)'
                      : isActive
                        ? STATUS_BG[stage.status]
                        : 'transparent';

                    return (
                      <td
                        key={stage.stageId}
                        onMouseEnter={isNA ? undefined : e => handleCellMouseEnter(e, record.id, stage.stageId, hasExtra)}
                        onMouseLeave={isNA ? undefined : handleCellMouseLeave}
                        title={isNA ? 'Não aplica para este cliente' : undefined}
                        className={isNA ? undefined : 'stage-cell'}
                        style={{
                          padding: '6px 4px',
                          textAlign: 'center',
                          cursor: 'default',
                          borderLeft: si === 0 ? 'none' : '1px solid rgba(76,110,245,0.07)',
                          background: cellBg,
                          transition: 'background 0.12s ease',
                          outline: isActive ? `2px solid ${color}66` : 'none',
                          outlineOffset: '-2px',
                          position: 'relative',
                          verticalAlign: 'middle',
                        }}
                      >
                        {isNA ? (
                          /* N/A cell — light blue, read-only */
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3px 0' }}>
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '28px', height: '28px', borderRadius: '7px',
                              background: 'rgba(77,166,204,0.1)',
                              border: '1.5px solid rgba(77,166,204,0.25)',
                            }}>
                              <span style={{
                                fontSize: '8px', fontWeight: 700, letterSpacing: '0.04em',
                                color: 'rgba(77,166,204,0.65)',
                                fontFamily: "'Geist Mono', monospace",
                              }}>N/A</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>

                            {/* Wrap date + icon so hover targets only this element */}
                            <div className="stage-icon-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>

                            {/* Date label — visible on icon hover via CSS */}
                            <span className="cell-date-label" style={{
                              fontSize: '8px',
                              color: stage.status === 'done'
                                ? 'rgba(52,211,153,0.7)'
                                : stage.status === 'in_progress'
                                  ? 'rgba(255,140,66,0.7)'
                                  : 'rgba(116,143,252,0.4)',
                              fontFamily: "'Geist Mono', monospace",
                              letterSpacing: '0.02em',
                              lineHeight: 1,
                              height: '10px',
                              display: 'block',
                            }}>
                              {stageDateStr ?? ''}
                            </span>

                            {/* Status icon box — 28×28 */}
                            <div
                              className={`status-icon-box${stage.status === 'done' ? ' done' : stage.status === 'in_progress' ? ' in-progress' : ''}`}
                              onClick={e => handleCellClick(e, record.id, stage.stageId)}
                              style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '28px', height: '28px', borderRadius: '7px',
                                cursor: 'pointer',
                                background: stage.status === 'done'
                                  ? 'rgba(16,185,129,0.18)'
                                  : stage.status === 'in_progress'
                                    ? 'rgba(255,107,53,0.2)'
                                    : 'rgba(76,110,245,0.07)',
                                border: `1.5px solid ${stage.status === 'done'
                                  ? 'rgba(16,185,129,0.4)'
                                  : stage.status === 'in_progress'
                                    ? 'rgba(255,107,53,0.5)'
                                    : 'rgba(76,110,245,0.14)'}`,
                                boxShadow: stage.status === 'in_progress' ? '0 0 8px rgba(255,107,53,0.25)' : 'none',
                              }}
                            >
                              {stage.status === 'done' && (
                                <svg className="checkbox-check" width="13" height="13" viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6L5 9L10 3" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              {stage.status === 'in_progress' && (
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b35', boxShadow: '0 0 8px rgba(255,107,53,0.9)', animation: 'dotPulse 1.5s ease-in-out infinite' }} />
                              )}
                              {stage.status === 'pending' && (
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(76,110,245,0.3)' }} />
                              )}
                            </div>
                            </div>{/* end stage-icon-wrap */}

                            {/* Content indicator chips */}
                            {hasExtra && (
                              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                {hasLoc && (
                                  <div title="Localização" style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    background: 'rgba(255,140,66,0.2)', border: '1px solid rgba(255,140,66,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <MapPin size={9} color="#ff8c42" />
                                  </div>
                                )}
                                {hasNotes && (
                                  <div title="Observações" style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    background: 'rgba(116,143,252,0.2)', border: '1px solid rgba(116,143,252,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <FileText size={9} color="#748ffc" />
                                  </div>
                                )}
                                {hasPhotos && (
                                  <div title={`${photoCount} foto${photoCount > 1 ? 's' : ''}`} style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <Camera size={9} color="#10b981" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
