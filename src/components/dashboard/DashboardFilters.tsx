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
    if (next.has(id)) { if (next.size === 1) return; next.delete(id); } else { next.add(id); }
    onVisibleStagesChange(next);
  };

  const selectAll = () => onVisibleStagesChange(new Set(STAGES.map(s => s.id)));
  const clearAll  = () => onVisibleStagesChange(new Set([STAGES[0].id]));

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
          color: '#9ca3af', pointerEvents: 'none',
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
            background: '#ffffff',
            border: '1px solid #e2e5eb',
            borderRadius: '9px',
            color: '#374151',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#4c6ef5';
            e.target.style.boxShadow = '0 0 0 3px rgba(76,110,245,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e2e5eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {search && (
          <button onClick={() => onSearchChange('')} style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
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
            padding: '7px 11px', fontSize: '12px', fontWeight: 500,
            fontFamily: "'DM Sans', 'Geist', sans-serif",
            cursor: 'pointer', borderRadius: '9px',
            background: stagesOpen || hiddenCount > 0 ? '#eef2ff' : '#ffffff',
            border: `1px solid ${stagesOpen || hiddenCount > 0 ? '#c7d2fe' : '#e2e5eb'}`,
            color: hiddenCount > 0 ? '#4c6ef5' : '#6b7280',
            transition: 'all 0.15s',
          }}
        >
          <Layers size={12} />
          <span className="sm-show">Etapas</span>
          {hiddenCount > 0 && (
            <span style={{ fontSize: '10px', fontFamily: "'Geist Mono', monospace", background: '#c7d2fe', color: '#4c6ef5', borderRadius: '4px', padding: '0 5px', lineHeight: '16px' }}>
              {visibleStages.size}
            </span>
          )}
        </button>

        {stagesOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
            width: '220px', background: '#ffffff',
            border: '1px solid #e2e5eb', borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            animation: 'scaleIn 0.15s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', fontFamily: "'Geist Mono', monospace", color: '#9ca3af', flex: 1, textTransform: 'uppercase' }}>Etapas</span>
              <button onClick={selectAll} style={{ fontSize: '11px', fontFamily: "'DM Sans','Geist',sans-serif", color: allSelected ? '#c4c9d4' : '#4c6ef5', background: 'none', border: 'none', cursor: allSelected ? 'default' : 'pointer', fontWeight: 500, padding: '1px 4px' }}>Todas</button>
              <span style={{ color: '#e5e7eb', fontSize: '10px' }}>·</span>
              <button onClick={clearAll} style={{ fontSize: '11px', fontFamily: "'DM Sans','Geist',sans-serif", color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: '1px 4px' }}>Limpar</button>
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {STAGES.map(s => {
                const checked = visibleStages.has(s.id);
                return (
                  <button key={s.id} onClick={() => toggleStage(s.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '7px 12px', fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', background: checked ? '#f0f2ff' : 'transparent', border: 'none', transition: 'background 0.1s', textAlign: 'left' }}
                    onMouseEnter={e => { if (!checked) e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={e => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0, border: `1px solid ${checked ? '#4c6ef5' : '#d1d5db'}`, background: checked ? '#4c6ef5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}>
                      {checked && <Check size={9} color="#fff" strokeWidth={2.5} />}
                    </div>
                    <span style={{ fontSize: '12px', fontFamily: "'DM Sans','Geist',sans-serif", color: checked ? '#1a2332' : '#6b7280', fontWeight: checked ? 500 : 400, transition: 'color 0.12s' }}>
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
          { key: 'photo' as ContentFilter, icon: <Camera size={11} />, label: 'Fotos', color: '#059669', activeBg: '#ecfdf5', activeBorder: '#6ee7b7' },
          { key: 'obs'   as ContentFilter, icon: <FileText size={11} />, label: 'Obs',  color: '#4c6ef5', activeBg: '#eef2ff', activeBorder: '#c7d2fe' },
          { key: 'loc'   as ContentFilter, icon: <MapPin size={11} />,   label: 'Loc',  color: '#ea580c', activeBg: '#fff7ed', activeBorder: '#fed7aa' },
        ] as const
      ).map(({ key, icon, label, color, activeBg, activeBorder }) => {
        const active = contentFilters.has(key);
        return (
          <button
            key={key}
            onClick={() => toggleContentFilter(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 10px', fontSize: '12px', fontWeight: 500,
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              cursor: 'pointer', borderRadius: '9px',
              background: active ? activeBg : '#ffffff',
              border: `1px solid ${active ? activeBorder : '#e2e5eb'}`,
              color: active ? color : '#6b7280',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e5eb'; } }}
          >
            {icon}
            <span className="sm-show">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
