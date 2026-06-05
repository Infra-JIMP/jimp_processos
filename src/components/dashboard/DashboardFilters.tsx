import { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, CheckSquare, Square, MapPin, FileText, Camera } from 'lucide-react';
import { STAGES } from '../../utils/stages';
import type { StageId } from '../../utils/stages';

export type ContentFilter = 'photo' | 'obs' | 'loc';

interface DashboardFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  visibleStages: Set<StageId>;
  onVisibleStagesChange: (stages: Set<StageId>) => void;
  contentFilters: Set<ContentFilter>;
  onContentFiltersChange: (filters: Set<ContentFilter>) => void;
}

export function DashboardFilters({ search, onSearchChange, visibleStages, onVisibleStagesChange, contentFilters, onContentFiltersChange }: DashboardFiltersProps) {
  const [stagesOpen, setStagesOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const allSelected = visibleStages.size === STAGES.length;
  const noneSelected = visibleStages.size === 0;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setStagesOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleStage = (id: StageId) => {
    const next = new Set(visibleStages);
    if (next.has(id)) {
      if (next.size === 1) return; // keep at least one
      next.delete(id);
    } else {
      next.add(id);
    }
    onVisibleStagesChange(next);
  };

  const selectAll = () => onVisibleStagesChange(new Set(STAGES.map(s => s.id)));
  const clearAll = () => {
    onVisibleStagesChange(new Set([STAGES[0].id]));
  };

  const toggleContentFilter = (key: ContentFilter) => {
    const next = new Set(contentFilters);
    if (next.has(key)) next.delete(key); else next.add(key);
    onContentFiltersChange(next);
  };

  const hiddenCount = STAGES.length - visibleStages.size;

  return (
    <>
      <div className="dashboard-filters">

        {/* Search */}
        <div className="dashboard-search" style={{ position: 'relative' }}>
          <Search size={12} style={{
            position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
            color: 'rgba(116,143,252,0.5)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar NS ou cliente..."
            style={{
              width: '100%', paddingLeft: '32px',
              paddingRight: search ? '32px' : '12px',
              paddingTop: '8px', paddingBottom: '8px', fontSize: '12px',
              background: 'rgba(8,14,29,0.9)', border: '1px solid rgba(76,110,245,0.15)',
              borderRadius: '10px', color: '#c5d0e8', fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(76,110,245,0.45)'; e.target.style.boxShadow = '0 0 0 3px rgba(76,110,245,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(76,110,245,0.15)'; e.target.style.boxShadow = 'none'; }}
          />
          {search && (
            <button onClick={() => onSearchChange('')} style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: 'rgba(141,160,200,0.4)', display: 'flex', alignItems: 'center' }}>
              <X size={11} />
            </button>
          )}
        </div>

        {/* Stage filter */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setStagesOpen(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 11px', fontSize: '11px', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', borderRadius: '9px',
              background: stagesOpen || hiddenCount > 0 ? 'rgba(76,110,245,0.14)' : 'rgba(76,110,245,0.06)',
              border: `1px solid ${stagesOpen || hiddenCount > 0 ? 'rgba(76,110,245,0.35)' : 'rgba(76,110,245,0.15)'}`,
              color: hiddenCount > 0 ? '#748ffc' : 'rgba(141,160,200,0.5)',
              transition: 'all 0.15s ease',
            }}
          >
            <SlidersHorizontal size={12} />
            <span className="sm-show">Etapas</span>
            {hiddenCount > 0 && (
              <span style={{
                fontSize: '10px', fontFamily: "'Geist Mono', monospace",
                background: '#4c6ef5', color: '#fff',
                borderRadius: '4px', padding: '0 5px', lineHeight: '16px',
              }}>
                {visibleStages.size}
              </span>
            )}
          </button>

          {stagesOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
              width: '220px',
              background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
              border: '1px solid rgba(76,110,245,0.2)',
              borderRadius: '12px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s cubic-bezier(0.16,1,0.3,1) both',
            }}>
              {/* Header */}
              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(76,110,245,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(141,160,200,0.45)', flex: 1 }}>
                  ETAPAS VISÍVEIS
                </span>
                <button onClick={selectAll} style={{ fontSize: '10px', color: allSelected ? 'rgba(116,143,252,0.3)' : '#748ffc', background: 'none', border: 'none', cursor: allSelected ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '1px 4px' }}>
                  Todas
                </button>
                <span style={{ color: 'rgba(76,110,245,0.2)', fontSize: '10px' }}>·</span>
                <button onClick={clearAll} style={{ fontSize: '10px', color: noneSelected ? 'rgba(116,143,252,0.3)' : 'rgba(141,160,200,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, padding: '1px 4px' }}>
                  Limpar
                </button>
              </div>

              {/* Stage list */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {STAGES.map(s => {
                  const checked = visibleStages.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleStage(s.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '9px',
                        padding: '8px 12px', fontFamily: 'inherit', cursor: 'pointer',
                        background: checked ? 'rgba(76,110,245,0.08)' : 'transparent',
                        border: 'none', transition: 'background 0.1s', textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(76,110,245,0.04)'; }}
                      onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {checked
                        ? <CheckSquare size={13} color="#4c6ef5" />
                        : <Square size={13} color="rgba(76,110,245,0.25)" />
                      }
                      <span style={{ fontSize: '11px', color: checked ? '#c5d0e8' : 'rgba(141,160,200,0.4)', fontWeight: checked ? 600 : 400 }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content filters */}
        {(
          [
            { key: 'photo' as ContentFilter, icon: <Camera size={11} />, label: 'Fotos', color: '#10b981', bg: 'rgba(16,185,129,' },
            { key: 'obs'   as ContentFilter, icon: <FileText size={11} />, label: 'Obs',  color: '#748ffc', bg: 'rgba(116,143,252,' },
            { key: 'loc'   as ContentFilter, icon: <MapPin size={11} />,   label: 'Loc',  color: '#ff8c42', bg: 'rgba(255,140,66,' },
          ] as const
        ).map(({ key, icon, label, color, bg }) => {
          const active = contentFilters.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleContentFilter(key)}
              title={`Filtrar por ${label}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 10px', fontSize: '11px', fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', borderRadius: '9px',
                background: active ? `${bg}0.14)` : `${bg}0.05)`,
                border: `1px solid ${active ? `${bg}0.4)` : `${bg}0.15)`}`,
                color: active ? color : `${bg}0.4)`,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!active) { e.currentTarget.style.background = `${bg}0.1)`; e.currentTarget.style.borderColor = `${bg}0.3)`; e.currentTarget.style.color = color; }
              }}
              onMouseLeave={e => {
                if (!active) { e.currentTarget.style.background = `${bg}0.05)`; e.currentTarget.style.borderColor = `${bg}0.15)`; e.currentTarget.style.color = `${bg}0.4)`; }
              }}
            >
              {icon}
              <span className="sm-show">{label}</span>
            </button>
          );
        })}

      </div>
    </>
  );
}
