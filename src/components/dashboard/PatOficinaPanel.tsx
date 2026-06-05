import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { NSRecord } from '../../store/types';
import { RecordPreview, useRecordPreview } from '../ui/RecordPreview';

interface PatOficinaPanelProps {
  records: NSRecord[];
}

function getStageStatus(record: NSRecord, stageId: string) {
  return record.stages.find(s => s.stageId === stageId)?.status ?? 'pending';
}

function isInPat(record: NSRecord) {
  return getStageStatus(record, 'PAT') === 'in_progress';
}

function isInOficina(record: NSRecord) {
  return getStageStatus(record, 'OFICINA') === 'in_progress';
}

function ClientChip({ record, accentRgb, accent }: { record: NSRecord; accentRgb: string; accent: string }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => navigate(`/ns/${record.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '7px 11px',
        borderRadius: '9px',
        background: hovered
          ? `rgba(${accentRgb},0.12)`
          : `rgba(${accentRgb},0.06)`,
        border: `1px solid rgba(${accentRgb},${hovered ? '0.35' : '0.18'})`,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow: hovered ? `0 4px 16px rgba(${accentRgb},0.15)` : 'none',
      }}
    >
      {/* Status dot */}
      <div style={{
        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
        background: accent,
        boxShadow: `0 0 6px ${accent}`,
        animation: 'dotPulse 1.5s ease-in-out infinite',
      }} />
      <div style={{ minWidth: 0 }}>
        <p style={{
          fontSize: '12px', fontWeight: 700, color: '#e8edf7',
          fontFamily: "'Geist Mono', monospace",
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '120px',
        }}>
          {record.ns}
        </p>
        <p style={{
          fontSize: '10px', color: `rgba(${accentRgb},0.65)`,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '120px', marginTop: '1px',
        }}>
          {record.clientName}
        </p>
      </div>
    </div>
  );
}

function SectionColumn({
  title,
  count,
  accent,
  accentRgb,
  records,
  onMouseEnter,
  onMouseLeave,
}: {
  title: string;
  count: number;
  accent: string;
  accentRgb: string;
  records: NSRecord[];
  onMouseEnter: (r: NSRecord) => void;
  onMouseLeave: () => void;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Column header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '10px', paddingBottom: '8px',
        borderBottom: `1px solid rgba(${accentRgb},0.15)`,
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: accent, boxShadow: `0 0 8px ${accent}88`,
        }} />
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em',
          color: accent,
        }}>
          {title}
        </span>
        <span style={{
          fontSize: '10px', fontFamily: "'Geist Mono', monospace",
          color: `rgba(${accentRgb},0.5)`,
          background: `rgba(${accentRgb},0.1)`,
          border: `1px solid rgba(${accentRgb},0.2)`,
          borderRadius: '4px', padding: '0px 5px',
          marginLeft: 'auto',
        }}>
          {count}
        </span>
      </div>

      {/* Cards */}
      {records.length === 0 ? (
        <p style={{ fontSize: '11px', color: 'rgba(141,160,200,0.25)', fontStyle: 'italic', padding: '4px 0' }}>
          Nenhum em andamento
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {records.map(r => (
            <div
              key={r.id}
              onMouseEnter={() => onMouseEnter(r)}
              onMouseLeave={onMouseLeave}
            >
              <ClientChip record={r} accent={accent} accentRgb={accentRgb} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PatOficinaPanel({ records }: PatOficinaPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { previewRecord, showPreview, hidePreview } = useRecordPreview();

  const patRecords = records.filter(isInPat);
  const oficinaRecords = records.filter(isInOficina);
  const total = patRecords.length + oficinaRecords.length;

  if (total === 0) return null;

  return (
    <>
      <RecordPreview record={previewRecord} visible={!!previewRecord} />

      <div style={{
        marginBottom: '20px',
        borderRadius: '14px',
        border: '1px solid rgba(76,110,245,0.16)',
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderBottom: collapsed ? 'none' : '1px solid rgba(76,110,245,0.1)',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(76,110,245,0.04)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          {/* Live dot */}
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
            background: '#4c6ef5', boxShadow: '0 0 8px #4c6ef5',
            animation: 'dotPulse 1.5s ease-in-out infinite',
          }} />

          <span className="font-display" style={{
            fontSize: '13px', letterSpacing: '0.12em', color: '#748ffc',
          }}>
            PAT / OFIC
          </span>

          <span style={{
            fontSize: '10px', fontFamily: "'Geist Mono', monospace",
            color: 'rgba(116,143,252,0.5)',
            background: 'rgba(76,110,245,0.1)',
            border: '1px solid rgba(76,110,245,0.2)',
            borderRadius: '5px', padding: '1px 7px',
          }}>
            {total} em andamento
          </span>

          <div style={{ marginLeft: 'auto', color: 'rgba(116,143,252,0.4)' }}>
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </div>
        </button>

        {/* Body */}
        {!collapsed && (
          <div style={{
            padding: '14px 16px',
            display: 'flex', gap: '20px', flexWrap: 'wrap',
            animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            {/* Divider line between columns */}
            <SectionColumn
              title="PAT."
              count={patRecords.length}
              accent="#4c6ef5"
              accentRgb="76,110,245"
              records={patRecords}
              onMouseEnter={showPreview}
              onMouseLeave={hidePreview}
            />

            <div style={{ width: '1px', background: 'rgba(76,110,245,0.1)', flexShrink: 0, alignSelf: 'stretch' }} />

            <SectionColumn
              title="OFICINA"
              count={oficinaRecords.length}
              accent="#ff6b35"
              accentRgb="255,107,53"
              records={oficinaRecords}
              onMouseEnter={showPreview}
              onMouseLeave={hidePreview}
            />
          </div>
        )}
      </div>
    </>
  );
}
