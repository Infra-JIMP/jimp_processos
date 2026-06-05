import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { RecordPreview, useRecordPreview } from '../components/ui/RecordPreview';
import { NSDetailModal } from '../components/ui/NSDetailModal';
import { STAGES } from '../utils/stages';
import type { NSRecord } from '../store/types';

function getStageStatus(record: NSRecord, stageId: string) {
  return record.stages.find(s => s.stageId === stageId)?.status ?? 'pending';
}

function getProgress(record: NSRecord) {
  const done = record.stages.filter(s => s.status === 'done').length;
  return Math.round((done / STAGES.length) * 100);
}

function RecordRow({
  record,
  accent,
  accentRgb,
  onMouseEnter,
  onMouseLeave,
}: {
  record: NSRecord;
  accent: string;
  accentRgb: string;
  onMouseEnter: (r: NSRecord) => void;
  onMouseLeave: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const progress = getProgress(record);

  return (
    <>
    <NSDetailModal recordId={modalOpen ? record.id : null} onClose={() => setModalOpen(false)} />
    <div
      onClick={() => setModalOpen(true)}
      onMouseEnter={() => { setHovered(true); onMouseEnter(record); }}
      onMouseLeave={() => { setHovered(false); onMouseLeave(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '12px 16px',
        borderRadius: '11px',
        background: hovered ? `rgba(${accentRgb},0.09)` : `rgba(${accentRgb},0.04)`,
        border: `1px solid rgba(${accentRgb},${hovered ? '0.3' : '0.14'})`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered ? `0 6px 20px rgba(${accentRgb},0.12)` : 'none',
      }}
    >
      {/* Pulse dot */}
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
        background: accent,
        boxShadow: `0 0 8px ${accent}`,
        animation: 'dotPulse 1.5s ease-in-out infinite',
      }} />

      {/* NS + Client */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <span style={{
            fontSize: '13px', fontWeight: 700, color: '#e8edf7',
            fontFamily: "'Geist Mono', monospace",
            whiteSpace: 'nowrap',
          }}>
            {record.ns}
          </span>
          <span style={{ fontSize: '10px', color: 'rgba(141,160,200,0.25)' }}>·</span>
          <span style={{
            fontSize: '12px', color: 'rgba(141,160,200,0.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {record.clientName}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            flex: 1, maxWidth: '200px', height: '3px',
            background: `rgba(${accentRgb},0.12)`, borderRadius: '3px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${accent}, rgba(${accentRgb},0.5))`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{
            fontSize: '10px', color: `rgba(${accentRgb},0.5)`,
            fontFamily: "'Geist Mono', monospace", whiteSpace: 'nowrap',
          }}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
    </>
  );
}

function Section({
  title,
  subtitle,
  accent,
  accentRgb,
  records,
  onMouseEnter,
  onMouseLeave,
}: {
  title: string;
  subtitle: string;
  accent: string;
  accentRgb: string;
  records: NSRecord[];
  onMouseEnter: (r: NSRecord) => void;
  onMouseLeave: () => void;
}) {
  return (
    <div style={{
      minWidth: 0,
      background: 'linear-gradient(135deg, #005f70 0%, #004a58 100%)',
      border: `1px solid rgba(${accentRgb},0.18)`,
      borderRadius: '14px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: `1px solid rgba(${accentRgb},0.12)`,
        background: `rgba(${accentRgb},0.04)`,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
          background: accent, boxShadow: `0 0 10px ${accent}`,
          animation: 'dotPulse 1.5s ease-in-out infinite',
        }} />
        <div>
          <h2 className="font-display" style={{
            fontSize: '16px', letterSpacing: '0.1em', color: accent, lineHeight: 1,
          }}>
            {title}
          </h2>
          <p style={{ fontSize: '10px', color: 'rgba(141,160,200,0.35)', marginTop: '2px', letterSpacing: '0.04em' }}>
            {subtitle}
          </p>
        </div>
        <div style={{
          marginLeft: 'auto',
          fontSize: '12px', fontFamily: "'Geist Mono', monospace", fontWeight: 700,
          color: accent,
          background: `rgba(${accentRgb},0.1)`,
          border: `1px solid rgba(${accentRgb},0.2)`,
          borderRadius: '6px', padding: '2px 8px',
        }}>
          {records.length}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {records.length === 0 ? (
          <div style={{
            padding: '32px 0', textAlign: 'center',
            color: 'rgba(141,160,200,0.25)', fontSize: '12px', fontStyle: 'italic',
          }}>
            Nenhum NS em andamento
          </div>
        ) : (
          records.map(r => (
            <RecordRow
              key={r.id}
              record={r}
              accent={accent}
              accentRgb={accentRgb}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function PatOficinaPage() {
  const records = useAppStore(s => s.records);
  const { previewRecord, showPreview, hidePreview } = useRecordPreview();

  const patRecords = records.filter(r => getStageStatus(r, 'PAT') === 'in_progress');
  const oficinaRecords = records.filter(r => getStageStatus(r, 'OFICINA') === 'in_progress');

  return (
    <div className="animate-fade-in">
      <RecordPreview record={previewRecord} visible={!!previewRecord} />

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#4c6ef5', boxShadow: '0 0 8px #4c6ef5',
            animation: 'dotPulse 1.5s ease-in-out infinite',
          }} />
          <h1 className="font-display" style={{
            fontSize: '22px', letterSpacing: '0.08em', color: '#f0f4ff',
          }}>
            PAT / OFIC
          </h1>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(141,160,200,0.4)', marginLeft: '18px' }}>
          {patRecords.length + oficinaRecords.length} NS em andamento nessas etapas
        </p>
      </div>

      {/* Two columns */}
      <div className="pat-ofic-grid">
        <Section
          title="PAT."
          subtitle="Pátio — em andamento"
          accent="#4c6ef5"
          accentRgb="76,110,245"
          records={patRecords}
          onMouseEnter={showPreview}
          onMouseLeave={hidePreview}
        />
        <Section
          title="OFICINA"
          subtitle="Oficina — em andamento"
          accent="#ff6b35"
          accentRgb="255,107,53"
          records={oficinaRecords}
          onMouseEnter={showPreview}
          onMouseLeave={hidePreview}
        />
      </div>
    </div>
  );
}
