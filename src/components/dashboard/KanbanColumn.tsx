import type { NSRecord } from '../../store/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  stageLabel: string;
  stageIndex: number;
  records: NSRecord[];
}

export function KanbanColumn({ stageLabel, stageIndex, records }: KanbanColumnProps) {
  const hasItems = records.length > 0;

  return (
    <div style={{ flexShrink: 0, width: '200px', display: 'flex', flexDirection: 'column' }}>
      {/* Column header */}
      <div style={{
        marginBottom: '8px',
        padding: '6px 10px',
        borderRadius: '8px',
        background: hasItems ? 'rgba(76,110,245,0.08)' : 'rgba(30,45,82,0.4)',
        border: `1px solid ${hasItems ? 'rgba(76,110,245,0.2)' : 'rgba(76,110,245,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px',
      }}>
        <span style={{
          fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
          color: hasItems ? '#748ffc' : 'rgba(141,160,200,0.35)',
          textTransform: 'uppercase' as const,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
        }}>
          {stageLabel}
        </span>
        {hasItems && (
          <span style={{
            fontSize: '10px', fontWeight: 700,
            background: 'rgba(76,110,245,0.2)',
            border: '1px solid rgba(76,110,245,0.3)',
            color: '#748ffc',
            borderRadius: '20px',
            padding: '1px 7px',
            flexShrink: 0,
            fontFamily: "'Geist Mono', monospace",
          }}>
            {records.length}
          </span>
        )}
      </div>

      {/* Cards container */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '6px',
        minHeight: '80px',
        background: hasItems ? 'rgba(13,21,38,0.5)' : 'rgba(13,21,38,0.2)',
        borderRadius: '10px',
        padding: '8px',
        border: `1px solid ${hasItems ? 'rgba(76,110,245,0.1)' : 'rgba(76,110,245,0.05)'}`,
        flex: 1,
      }}>
        {records.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '60px',
            fontSize: '10px', color: 'rgba(141,160,200,0.2)',
            letterSpacing: '0.08em',
          }}>
            — vazio —
          </div>
        ) : (
          records.map((r) => (
            <KanbanCard key={r.id} record={r} stageIndex={stageIndex} />
          ))
        )}
      </div>
    </div>
  );
}
