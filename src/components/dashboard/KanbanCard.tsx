import { useState } from 'react';
import type { NSRecord } from '../../store/types';
import { STAGES } from '../../utils/stages';
import { NSDetailModal } from '../ui/NSDetailModal';

interface KanbanCardProps {
  record: NSRecord;
  stageIndex: number;
}

export function KanbanCard({ record }: KanbanCardProps) {
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const done = record.stages.filter((s) => s.status === 'done').length;
  const progress = Math.round((done / STAGES.length) * 100);

  const hasAnyInProgress = record.stages.some((s) => s.status === 'in_progress');
  const isComplete = done === STAGES.length;

  const accent = isComplete ? '#10b981' : hasAnyInProgress ? '#ff6b35' : '#4c6ef5';
  const accentAlpha = isComplete ? 'rgba(16,185,129,0.2)' : hasAnyInProgress ? 'rgba(255,107,53,0.2)' : 'rgba(76,110,245,0.15)';

  return (
    <>
      <NSDetailModal recordId={modalOpen ? record.id : null} onClose={() => setModalOpen(false)} />

      <div
        onClick={() => setModalOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? 'linear-gradient(135deg, #1e2a46 0%, #1a4a7a 100%)'
            : 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
          border: `1px solid ${hovered ? accent + '55' : 'rgba(76,110,245,0.14)'}`,
          borderLeft: `3px solid ${accent}`,
          borderRadius: '10px',
          padding: '10px 11px',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          boxShadow: hovered ? `0 4px 20px rgba(0,0,0,0.4), 0 0 12px ${accentAlpha}` : '0 2px 8px rgba(0,0,0,0.25)',
          transform: hovered ? 'translateY(-1px)' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '10px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)',
            pointerEvents: 'none',
          }} />
        )}

        <p style={{ fontSize: '12px', fontWeight: 700, color: '#e8edf7', lineHeight: 1.2, fontFamily: "'Geist Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {record.ns}
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(141,160,200,0.6)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {record.clientName}
        </p>

        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '9px', color: 'rgba(141,160,200,0.4)', letterSpacing: '0.05em' }}>
              {done}/{STAGES.length} etapas
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: accent, fontFamily: "'Geist Mono', monospace" }}>
              {progress}%
            </span>
          </div>
          <div style={{ height: '3px', background: 'rgba(76,110,245,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${progress}%`,
              background: isComplete
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : hasAnyInProgress
                ? 'linear-gradient(90deg, #ff6b35, #ffa552)'
                : 'linear-gradient(90deg, #304280, #4c6ef5)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>
    </>
  );
}
