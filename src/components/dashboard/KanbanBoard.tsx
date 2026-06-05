import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MessageSquare, X, ExternalLink, Camera, Image, ChevronRight } from 'lucide-react';
import { STAGES } from '../../utils/stages';
import { useAppStore } from '../../store/useAppStore';
import type { NSRecord } from '../../store/types';
import type { StageId } from '../../utils/stages';
import { useIsMobile } from '../../hooks/useIsMobile';
import { RecordPreview, useRecordPreview } from '../ui/RecordPreview';

const STAGES_WITH_LOCATION = new Set<StageId>([
  'PAT', 'MONT_ASOALHO', 'PINTURA', 'REBIT',
  'PROD_PORTAS', 'CARPINTARIA', 'ELETRICA', 'REVISAO_FINAL',
]);

function getActiveLocObs(record: NSRecord) {
  const currentStageIdx = record.stages.findIndex(s => s.status !== 'done');
  const currentStage = currentStageIdx >= 0 ? record.stages[currentStageIdx] : null;

  if (currentStage && STAGES_WITH_LOCATION.has(currentStage.stageId as StageId)) {
    if (currentStage.location || currentStage.notes) return currentStage;
  }

  const withData = record.stages.filter(
    s => STAGES_WITH_LOCATION.has(s.stageId as StageId) && (s.location || s.notes)
  );
  return withData.length > 0 ? withData[withData.length - 1] : null;
}

function getActiveStage(record: NSRecord) {
  const idx = record.stages.findIndex(s => s.status !== 'done');
  return idx >= 0 ? record.stages[idx] : null;
}

// Converte File para base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface PhotoGridProps {
  photos: string[];
  onAdd: (dataUrl: string) => void;
  onRemove: (index: number) => void;
  accentColor: string;
  accentBg: string;
}

function PhotoGrid({ photos, onAdd, onRemove, accentColor, accentBg }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const b64 = await fileToBase64(file);
      onAdd(b64);
    }
  };

  return (
    <>
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <img
            src={lightbox}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '10px', objectFit: 'contain' }}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        {photos.map((src, i) => (
          <div
            key={i}
            style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}
          >
            <img
              src={src}
              onClick={() => setLightbox(src)}
              style={{
                width: '72px', height: '72px', objectFit: 'cover',
                borderRadius: '8px', cursor: 'zoom-in',
                border: '1px solid rgba(76,110,245,0.2)',
              }}
            />
            <button
              onClick={() => onRemove(i)}
              style={{
                position: 'absolute', top: '-5px', right: '-5px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#ef4444', border: '2px solid #006a7a',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={9} />
            </button>
          </div>
        ))}

        {/* Botão adicionar foto */}
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            width: '72px', height: '72px', borderRadius: '8px', cursor: 'pointer',
            background: accentBg,
            border: `1.5px dashed ${accentColor}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '4px', color: accentColor, transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Camera size={16} />
          <span style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.05em' }}>FOTO</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
    </>
  );
}

interface LocObsModalProps {
  record: NSRecord;
  onClose: () => void;
}

function LocObsModal({ record, onClose }: LocObsModalProps) {
  const updateStageLocation = useAppStore(s => s.updateStageLocation);
  const updateStageNotes = useAppStore(s => s.updateStageNotes);
  const addStagePhoto = useAppStore(s => s.addStagePhoto);
  const removeStagePhoto = useAppStore(s => s.removeStagePhoto);
  const navigate = useNavigate();

  const activeStage = getActiveStage(record);
  const hasLocField = activeStage && STAGES_WITH_LOCATION.has(activeStage.stageId as StageId);

  const relevantStages = record.stages.filter(
    s => STAGES_WITH_LOCATION.has(s.stageId as StageId)
  );

  const [selectedStageId, setSelectedStageId] = useState<StageId>(
    hasLocField ? activeStage.stageId as StageId : (relevantStages[0]?.stageId as StageId)
  );

  const selectedEntry = record.stages.find(s => s.stageId === selectedStageId);

  const [location, setLocation] = useState(selectedEntry?.location ?? '');
  const [notes, setNotes] = useState(selectedEntry?.notes ?? '');

  const handleStageChange = (stageId: StageId) => {
    // Salva estado atual antes de trocar
    updateStageLocation(record.id, selectedStageId, location);
    updateStageNotes(record.id, selectedStageId, notes);

    setSelectedStageId(stageId);
    const entry = record.stages.find(s => s.stageId === stageId);
    setLocation(entry?.location ?? '');
    setNotes(entry?.notes ?? '');
  };

  const handleSave = () => {
    updateStageLocation(record.id, selectedStageId, location);
    updateStageNotes(record.id, selectedStageId, notes);
    onClose();
  };

  // Fotos ao vivo do store (atualizadas imediatamente após addStagePhoto)
  const liveEntry = useAppStore(s =>
    s.records.find(r => r.id === record.id)?.stages.find(s => s.stageId === selectedStageId)
  );
  const locationPhotos = liveEntry?.locationPhotos ?? [];
  const notesPhotos = liveEntry?.notesPhotos ?? [];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={onClose}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(7,11,20,0.88)',
        backdropFilter: 'blur(10px)',
      }} />

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '480px',
          maxHeight: '90vh',
          background: 'linear-gradient(160deg, #005f70 0%, #004a58 100%)',
          border: '1px solid rgba(76,110,245,0.22)',
          borderRadius: '16px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(76,110,245,0.08)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(76,110,245,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: '#e8edf7' }}>
                {record.ns}
              </span>
              <span style={{ fontSize: '11px', color: 'rgba(141,160,200,0.5)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {record.clientName}
              </span>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(141,160,200,0.4)', marginTop: '2px', letterSpacing: '0.06em' }}>
              LOCALIZAÇÃO & OBSERVAÇÃO
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => { onClose(); navigate(`/ns/${record.id}`); }}
              title="Abrir detalhe completo"
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(76,110,245,0.08)', border: '1px solid rgba(76,110,245,0.15)',
                color: '#8da0c8', cursor: 'pointer',
              }}
            >
              <ExternalLink size={13} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(76,110,245,0.08)', border: '1px solid rgba(76,110,245,0.15)',
                color: '#8da0c8', cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Stage selector */}
        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(141,160,200,0.4)', marginBottom: '8px' }}>
            ETAPA
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {relevantStages.map(s => {
              const info = STAGES.find(st => st.id === s.stageId);
              const isActive = s.stageId === selectedStageId;
              const hasData = s.location || s.notes || (s.locationPhotos?.length ?? 0) > 0 || (s.notesPhotos?.length ?? 0) > 0;
              return (
                <button
                  key={s.stageId}
                  onClick={() => handleStageChange(s.stageId as StageId)}
                  style={{
                    fontSize: '10px', fontWeight: 600,
                    padding: '4px 10px', borderRadius: '20px', cursor: 'pointer',
                    background: isActive ? 'rgba(76,110,245,0.2)' : 'rgba(76,110,245,0.05)',
                    border: `1px solid ${isActive ? 'rgba(76,110,245,0.5)' : 'rgba(76,110,245,0.12)'}`,
                    color: isActive ? '#748ffc' : hasData ? '#c5d0e8' : 'rgba(141,160,200,0.4)',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  {info?.label ?? s.stageId}
                  {hasData && (
                    <span style={{
                      position: 'absolute', top: '-3px', right: '-3px',
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#ff6b35', border: '1px solid #006a7a',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* LOCALIZAÇÃO */}
          <div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
              color: '#ff8c42', marginBottom: '7px',
            }}>
              <MapPin size={9} />
              LOCALIZAÇÃO
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ex: Galpão A - Vaga 03"
              autoFocus
              style={{
                width: '100%', fontSize: '13px', fontWeight: 500,
                background: 'rgba(255,107,53,0.05)',
                border: '1px solid rgba(255,107,53,0.2)',
                borderRadius: '10px', padding: '10px 13px',
                color: '#f0f4ff', fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(255,107,53,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,107,53,0.2)')}
            />

            {/* Fotos de localização */}
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,140,66,0.5)', marginBottom: '0' }}>
                FOTOS DA LOCALIZAÇÃO <span style={{ opacity: 0.5 }}>— opcional</span>
              </p>
              <PhotoGrid
                photos={locationPhotos}
                onAdd={b64 => addStagePhoto(record.id, selectedStageId, 'locationPhotos', b64)}
                onRemove={i => removeStagePhoto(record.id, selectedStageId, 'locationPhotos', i)}
                accentColor="rgba(255,140,66,0.6)"
                accentBg="rgba(255,107,53,0.06)"
              />
            </div>
          </div>

          {/* OBSERVAÇÃO */}
          <div>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
              color: 'rgba(141,160,200,0.6)', marginBottom: '7px',
            }}>
              <MessageSquare size={9} />
              OBSERVAÇÃO
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anotações sobre esta etapa..."
              rows={3}
              style={{
                width: '100%', fontSize: '12px',
                background: 'rgba(13,21,38,0.8)',
                border: '1px solid rgba(76,110,245,0.18)',
                borderRadius: '10px', padding: '10px 13px',
                color: '#c5d0e8', fontFamily: 'inherit',
                resize: 'none', outline: 'none', lineHeight: 1.6,
                boxSizing: 'border-box', transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(76,110,245,0.45)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(76,110,245,0.18)')}
            />

            {/* Fotos de observação */}
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(141,160,200,0.4)', marginBottom: '0' }}>
                FOTOS DA OBSERVAÇÃO <span style={{ opacity: 0.5 }}>— opcional</span>
              </p>
              <PhotoGrid
                photos={notesPhotos}
                onAdd={b64 => addStagePhoto(record.id, selectedStageId, 'notesPhotos', b64)}
                onRemove={i => removeStagePhoto(record.id, selectedStageId, 'notesPhotos', i)}
                accentColor="rgba(116,143,252,0.6)"
                accentBg="rgba(76,110,245,0.06)"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(76,110,245,0.08)',
          display: 'flex', justifyContent: 'flex-end', gap: '8px',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              fontSize: '12px', fontWeight: 600, padding: '8px 16px',
              borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(76,110,245,0.06)',
              border: '1px solid rgba(76,110,245,0.15)',
              color: 'rgba(141,160,200,0.7)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              fontSize: '12px', fontWeight: 700, padding: '8px 20px',
              borderRadius: '8px', cursor: 'pointer',
              background: 'linear-gradient(135deg, #4c6ef5, #3b5bdb)',
              border: '1px solid rgba(76,110,245,0.4)',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(76,110,245,0.3)',
            }}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(record: NSRecord): string {
  if (record.stages.every(s => s.status === 'done')) return '#10b981';
  if (record.stages.some(s => s.status === 'in_progress')) return '#ff6b35';
  return '#748ffc';
}

interface MobileListViewProps {
  records: NSRecord[];
  onLocObsClick: (record: NSRecord) => void;
}

function MobileListView({ records, onLocObsClick }: MobileListViewProps) {
  const navigate = useNavigate();

  if (records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(141,160,200,0.3)', fontSize: '13px' }}>
        Nenhum NS encontrado.
      </div>
    );
  }

  // Agrupa por etapa seguindo a ordem de STAGES
  const byStageId = new Map<string, NSRecord[]>();
  STAGES.forEach(s => byStageId.set(s.id, []));
  records.forEach(r => {
    const idx = r.stages.findIndex(s => s.status !== 'done');
    const stageId = idx >= 0 ? r.stages[idx].stageId : r.stages[r.stages.length - 1]?.stageId;
    if (stageId && byStageId.has(stageId)) byStageId.get(stageId)!.push(r);
  });

  // Filtra etapas sem registros
  const orderedGroups = STAGES
    .map(s => ({ stage: s, records: byStageId.get(s.id) ?? [] }))
    .filter(g => g.records.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {orderedGroups.map(({ stage, records: stageRecords }) => {
        const stageLabel = stage.label;
        return (
        <div key={stageLabel} style={{
          background: 'linear-gradient(180deg, #005060 0%, #003f4a 100%)',
          border: '1px solid rgba(76,110,245,0.18)',
          borderRadius: '14px',
          overflow: 'hidden',
        }}>
          {/* Stage header */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid rgba(76,110,245,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(76,110,245,0.04)',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#748ffc' }}>
              {stageLabel}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700, fontFamily: "'Geist Mono', monospace",
              color: '#ff6b35', background: 'rgba(255,107,53,0.12)',
              border: '1px solid rgba(255,107,53,0.25)',
              borderRadius: '20px', padding: '1px 8px',
            }}>
              {stageRecords.length}
            </span>
          </div>

          {/* Records */}
          {stageRecords.map((record, idx) => {
            const locObs = getActiveLocObs(record);
            const activeStage = getActiveStage(record);
            const isLocStage = activeStage && STAGES_WITH_LOCATION.has(activeStage.stageId as StageId);
            const statusColor = getStatusColor(record);
            const done = record.stages.filter(s => s.status === 'done').length;
            const progress = Math.round((done / STAGES.length) * 100);

            return (
              <div
                key={record.id}
                onClick={() => isLocStage ? onLocObsClick(record) : navigate(`/ns/${record.id}`)}
                style={{
                  padding: '12px 14px',
                  borderBottom: idx < stageRecords.length - 1 ? '1px solid rgba(76,110,245,0.06)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer', transition: 'background 0.15s',
                  position: 'relative',
                }}
                onTouchStart={e => (e.currentTarget.style.background = 'rgba(76,110,245,0.08)')}
                onTouchEnd={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Status dot */}
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: statusColor, flexShrink: 0,
                  boxShadow: `0 0 6px ${statusColor}88`,
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: 700, color: '#e8edf7',
                      fontFamily: "'Geist Mono', monospace",
                    }}>
                      {record.ns}
                    </span>
                    {isLocStage && (
                      <MapPin size={10} color="rgba(255,140,66,0.6)" />
                    )}
                  </div>
                  <p style={{
                    fontSize: '11px', color: 'rgba(141,160,200,0.6)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    marginBottom: '6px',
                  }}>
                    {record.clientName}
                  </p>

                  {/* Progress bar */}
                  <div style={{ height: '2px', background: 'rgba(76,110,245,0.12)', borderRadius: '2px' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px', width: `${progress}%`,
                      background: progress === 100 ? '#10b981' : `linear-gradient(90deg, ${statusColor}, ${statusColor}aa)`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  {/* Loc/obs preview */}
                  {locObs?.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px' }}>
                      <MapPin size={9} color="#ff8c42" />
                      <span style={{ fontSize: '10px', color: '#ff8c42', fontWeight: 600 }}>
                        {locObs.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight size={14} color="rgba(141,160,200,0.25)" style={{ flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
        );
      })}
    </div>
  );
}

interface KanbanBoardProps {
  records: NSRecord[];
}

function getRecordsForStage(records: NSRecord[], stageIndex: number): NSRecord[] {
  return records.filter((r) => {
    const stage = r.stages[stageIndex];
    if (!stage) return false;
    if (stage.status === 'in_progress') return true;
    if (stage.status !== 'pending') return false;
    const firstPendingIndex = r.stages.findIndex((s) => s.status !== 'done');
    return firstPendingIndex === stageIndex;
  });
}

export function KanbanBoard({ records }: KanbanBoardProps) {
  const navigate = useNavigate();
  const moveRecordToStage = useAppStore((s) => s.moveRecordToStage);
  const [dragOverStage, setDragOverStage] = useState<number | null>(null);
  const dragRecordId = useRef<string | null>(null);
  const [modalRecord, setModalRecord] = useState<NSRecord | null>(null);
  const isMobile = useIsMobile(768);
  const { previewRecord, showPreview, hidePreview } = useRecordPreview();

  const handleCardClick = (record: NSRecord, stageIndex: number) => {
    const stage = record.stages[stageIndex];
    const isLocStage = stage && STAGES_WITH_LOCATION.has(stage.stageId as StageId);
    if (isLocStage) {
      setModalRecord(record);
    } else {
      navigate(`/ns/${record.id}`);
    }
  };

  const handleDragStart = (e: React.DragEvent, recordId: string) => {
    dragRecordId.current = recordId;
    e.dataTransfer.effectAllowed = 'move';
    hidePreview();
    setTimeout(() => { (e.target as HTMLElement).style.opacity = '0.4'; }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    dragRecordId.current = null;
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageIndex);
  };

  const handleDragLeave = () => { setDragOverStage(null); };

  const handleDrop = (e: React.DragEvent, stageIndex: number) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!dragRecordId.current) return;
    moveRecordToStage(dragRecordId.current, stageIndex);
    dragRecordId.current = null;
  };

  return (
    <>
      {modalRecord && (
        <LocObsModal record={modalRecord} onClose={() => setModalRecord(null)} />
      )}

      <RecordPreview record={previewRecord} visible={!!previewRecord} />

      {isMobile ? (
        <MobileListView records={records} onLocObsClick={setModalRecord} />
      ) : (
      <div className="kanban-wrapper">
      <div className="kanban-grid">
        {STAGES.map((stage, i) => {
          const stageRecords = getRecordsForStage(records, i);
          const hasRecords = stageRecords.length > 0;
          const isDragOver = dragOverStage === i;
          const isLocStage = STAGES_WITH_LOCATION.has(stage.id as StageId);

          return (
            <div
              key={stage.id}
              className="kanban-col"
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
              style={{
                background: isDragOver
                  ? 'linear-gradient(180deg, #162040 0%, #005060 100%)'
                  : 'linear-gradient(180deg, #005060 0%, #003f4a 100%)',
                border: `1px solid ${isDragOver ? 'rgba(76,110,245,0.6)' : hasRecords ? 'rgba(76,110,245,0.22)' : 'rgba(76,110,245,0.08)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                minHeight: '120px',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                boxShadow: isDragOver ? '0 0 0 2px rgba(76,110,245,0.2)' : 'none',
              }}
            >
              {/* Stage header */}
              <div style={{
                padding: '10px 12px 8px',
                borderBottom: `1px solid ${hasRecords ? 'rgba(76,110,245,0.15)' : 'rgba(76,110,245,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                  {isLocStage && (
                    <MapPin size={8} color="rgba(255,140,66,0.5)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                    color: hasRecords ? '#c5d0e8' : 'rgba(141,160,200,0.3)',
                    lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {stage.label}
                  </span>
                </div>
                {hasRecords && (
                  <span style={{
                    fontSize: '11px', fontWeight: 700, fontFamily: "'Geist Mono', monospace",
                    color: '#ff6b35', background: 'rgba(255,107,53,0.12)',
                    border: '1px solid rgba(255,107,53,0.25)',
                    borderRadius: '20px', padding: '1px 7px', flexShrink: 0,
                  }}>
                    {stageRecords.length}
                  </span>
                )}
              </div>

              {/* Records list */}
              <div style={{
                padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px',
                minHeight: isDragOver ? '60px' : undefined,
              }}>
                {stageRecords.length === 0 ? (
                  <div style={{
                    padding: '16px 0', textAlign: 'center', fontSize: '10px',
                    color: isDragOver ? 'rgba(76,110,245,0.5)' : 'rgba(141,160,200,0.2)',
                    letterSpacing: '0.05em', transition: 'color 0.15s ease',
                  }}>
                    {isDragOver ? 'soltar aqui' : 'vazio'}
                  </div>
                ) : (
                  stageRecords.map((record) => {
                    const locObs = getActiveLocObs(record);
                    const currentStage = record.stages[i];
                    const cardIsLocStage = currentStage && STAGES_WITH_LOCATION.has(currentStage.stageId as StageId);
                    const totalPhotos = (locObs?.locationPhotos?.length ?? 0) + (locObs?.notesPhotos?.length ?? 0);

                    return (
                      <div
                        key={record.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, record.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleCardClick(record, i)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '8px 10px',
                          borderRadius: '8px', background: 'rgba(76,110,245,0.06)',
                          border: '1px solid rgba(76,110,245,0.1)',
                          cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'all 0.15s ease', position: 'relative',
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = 'rgba(76,110,245,0.12)';
                          el.style.borderColor = 'rgba(76,110,245,0.25)';
                          if (!dragRecordId.current) showPreview(record);
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = 'rgba(76,110,245,0.06)';
                          el.style.borderColor = 'rgba(76,110,245,0.1)';
                          hidePreview();
                        }}
                      >
                        {cardIsLocStage && (
                          <div style={{
                            position: 'absolute', top: '6px', right: '7px',
                            display: 'flex', alignItems: 'center', gap: '2px',
                          }}>
                            <MapPin size={8} color="rgba(255,140,66,0.4)" />
                          </div>
                        )}

                        <p style={{
                          fontSize: '11px', fontWeight: 700, color: '#e8edf7',
                          fontFamily: "'Geist Mono', monospace",
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          pointerEvents: 'none',
                          paddingRight: cardIsLocStage ? '14px' : '0',
                        }}>
                          {record.ns}
                        </p>

                        <p style={{
                          fontSize: '10px', color: 'rgba(141,160,200,0.55)', marginTop: '2px',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          pointerEvents: 'none',
                        }}>
                          {record.clientName}
                        </p>

                        {locObs && (locObs.location || locObs.notes) && (
                          <div style={{
                            marginTop: '6px', paddingTop: '6px',
                            borderTop: '1px solid rgba(76,110,245,0.1)',
                            display: 'flex', flexDirection: 'column', gap: '3px',
                            pointerEvents: 'none',
                          }}>
                            {locObs.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={9} color="#ff8c42" style={{ flexShrink: 0 }} />
                                <span style={{
                                  fontSize: '10px', color: '#ff8c42', fontWeight: 600,
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                  {locObs.location}
                                </span>
                              </div>
                            )}
                            {locObs.notes && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                <MessageSquare size={9} color="rgba(141,160,200,0.45)" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <span style={{
                                  fontSize: '10px', color: 'rgba(141,160,200,0.55)',
                                  overflow: 'hidden', display: '-webkit-box',
                                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                }}>
                                  {locObs.notes}
                                </span>
                              </div>
                            )}
                            {totalPhotos > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                <Image size={9} color="rgba(116,143,252,0.5)" style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: '9px', color: 'rgba(116,143,252,0.5)' }}>
                                  {totalPhotos} foto{totalPhotos > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {cardIsLocStage && !locObs?.location && !locObs?.notes && (
                          <div style={{
                            marginTop: '5px', fontSize: '9px',
                            color: 'rgba(255,140,66,0.35)',
                            display: 'flex', alignItems: 'center', gap: '3px',
                            pointerEvents: 'none',
                          }}>
                            <MapPin size={8} />
                            clique para adicionar local
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
      )}
    </>
  );
}
