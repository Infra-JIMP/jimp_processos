import { useState, useRef, useEffect } from 'react';
import { Search, X, Layers, Check, MapPin, FileText, Camera } from 'lucide-react';
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
  const hiddenCount = STAGES.length - visibleStages.size;

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
      if (next.size === 1) return;
      next.delete(id);
    } else {
      next.add(id);
    }
    onVisibleStagesChange(next);
  };

  const selectAll = () => onVisibleStagesChange(new Set(STAGES.map(s => s.id)));
  const clearAll = () => onVisibleStagesChange(new Set([STAGES[0].id]));

  const toggleContentFilter = (key: ContentFilter) => {
    const next = new Set(contentFilters);
    if (next.has(key)) next.delete(key); else next.add(key);
    onContentFiltersChange(next);
  };

  return (
    <div className="dashboard-filters">

      {/* Search */}
      <div className="dashboard-search" style={{ position: 'relative' }}>
        <Search size={12} style={{
          position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
          color: 'rgba(100,160,200,0.4)', pointerEvents: 'none',
        }} />
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar NS ou cliente..."
          style={{
            width: '100%', paddingLeft: '32px',
            paddingRight: search ? '32px' : '12px',
            paddingTop: '8px', paddingBottom: '8px',
            fontSize: '13px',
            fontFamily: "'DM Sans', 'Geist', sans-serif",
            fontWeight: 400,
            background: 'rgba(0,0,0,0.18)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '9px',
            color: '#c8dae8',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(78,205,196,0.35)';
            e.target.style.boxShadow = '0 0 0 3px rgba(78,205,196,0.07)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.07)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: '2px',
              cursor: 'pointer', color: 'rgba(140,170,195,0.4)',
              display: 'flex', alignItems: 'center',
            }}
          >
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
            padding: '7px 11px',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: "'DM Sans', 'Geist', sans-serif",
            cursor: 'pointer', borderRadius: '9px',
            background: stagesOpen || hiddenCount > 0 ? 'rgba(78,205,196,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${stagesOpen || hiddenCount > 0 ? 'rgba(78,205,196,0.25)' : 'rgba(255,255,255,0.07)'}`,
            color: hiddenCount > 0 ? '#4ecdc4' : 'rgba(160,190,210,0.6)',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={12} />
          <span className="sm-show">Etapas</span>
          {hiddenCount > 0 && (
            <span style={{
              fontSize: '10px',
              fontFamily: "'Geist Mono', monospace",
              background: 'rgba(78,205,196,0.2)',
              color: '#4ecdc4',
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
            background: 'linear-gradient(145deg, #005060 0%, #003f4a 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            animation: 'scaleIn 0.15s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            {/* Header */}
            <div style={{
              padding: '10px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em',
                fontFamily: "'Geist Mono', monospace",
                color: 'rgba(140,170,195,0.4)', flex: 1,
                textTransform: 'uppercase',
              }}>
                Etapas
              </span>
              <button onClick={selectAll} style={{
                fontSize: '11px',
                fontFamily: "'DM Sans', 'Geist', sans-serif",
                color: allSelected ? 'rgba(78,205,196,0.25)' : '#4ecdc4',
                background: 'none', border: 'none',
                cursor: allSelected ? 'default' : 'pointer',
                fontWeight: 500, padding: '1px 4px',
              }}>
                Todas
              </button>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '10px' }}>·</span>
              <button onClick={clearAll} style={{
                fontSize: '11px',
                fontFamily: "'DM Sans', 'Geist', sans-serif",
                color: noneSelected ? 'rgba(160,190,210,0.2)' : 'rgba(160,190,210,0.5)',
                background: 'none', border: 'none',
                cursor: 'pointer',
                fontWeight: 500, padding: '1px 4px',
              }}>
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
                      padding: '7px 12px',
                      fontFamily: "'DM Sans', 'Geist', sans-serif",
                      cursor: 'pointer',
                      background: checked ? 'rgba(78,205,196,0.06)' : 'transparent',
                      border: 'none', transition: 'background 0.1s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Custom checkbox */}
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0,
                      border: `1px solid ${checked ? 'rgba(78,205,196,0.5)' : 'rgba(255,255,255,0.12)'}`,
                      background: checked ? 'rgba(78,205,196,0.15)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.12s',
                    }}>
                      {checked && <Check size={9} color="#4ecdc4" strokeWidth={2.5} />}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontFamily: "'DM Sans', 'Geist', sans-serif",
                      color: checked ? '#c8dae8' : 'rgba(140,170,195,0.45)',
                      fontWeight: checked ? 500 : 400,
                      transition: 'color 0.12s',
                    }}>
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
          { key: 'obs'   as ContentFilter, icon: <FileText size={11} />, label: 'Obs',  color: '#74b0fc', bg: 'rgba(116,176,252,' },
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
              padding: '7px 10px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              cursor: 'pointer', borderRadius: '9px',
              background: active ? `${bg}0.12)` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? `${bg}0.35)` : 'rgba(255,255,255,0.07)'}`,
              color: active ? color : 'rgba(160,190,210,0.5)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = `${bg}0.08)`;
                e.currentTarget.style.borderColor = `${bg}0.25)`;
                e.currentTarget.style.color = color;
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.color = 'rgba(160,190,210,0.5)';
              }
            }}
          >
            {icon}
            <span className="sm-show">{label}</span>
          </button>
        );
      })}

    </div>
  );
}
