import { useState, useMemo } from 'react';
import { STAGES } from '../utils/stages';
import type { StageId } from '../utils/stages';
import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, ChevronDown, X, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { StatsCards } from '../components/dashboard/StatsCards';
import { TableView } from '../components/dashboard/TableView';
import { DashboardFilters } from '../components/dashboard/DashboardFilters';
import type { ContentFilter } from '../components/dashboard/DashboardFilters';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';

export function DashboardPage() {
  const navigate = useNavigate();
  const records = useAppStore((s) => s.records);
  const clearAllRecords = useAppStore((s) => s.clearAllRecords);
  const conferences = useAppStore((s) => s.conferences);
  const activeConferenceId = useAppStore((s) => s.activeConferenceId);
  const setActiveConference = useAppStore((s) => s.setActiveConference);
  const deleteConferenceWithRecords = useAppStore((s) => s.deleteConferenceWithRecords);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [confDropdown, setConfDropdown] = useState(false);
  const [visibleStages, setVisibleStages] = useState<Set<StageId>>(() => new Set(STAGES.map(s => s.id)));
  const [contentFilters, setContentFilters] = useState<Set<ContentFilter>>(new Set());
  const [sortCol, setSortCol] = useState<StageId | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDeleteConf, setConfirmDeleteConf] = useState<string | null>(null);

  const hasActiveFilters = search !== '' || contentFilters.size > 0 || visibleStages.size < STAGES.length || sortCol !== null;

  const clearAllFilters = () => {
    setSearch('');
    setContentFilters(new Set());
    setVisibleStages(new Set(STAGES.map(s => s.id)));
    setSortCol(null);
    setSortDir('asc');
  };

  const handleClearAll = async () => {
    await clearAllRecords();
    setConfirmClear(false);
    showToast('Todos os registros foram removidos.', 'success');
  };

  const handleDeleteConference = async () => {
    if (!confirmDeleteConf) return;
    const conf = conferences.find(c => c.id === confirmDeleteConf);
    const count = records.filter(r => r.conferenceId === confirmDeleteConf).length;
    await deleteConferenceWithRecords(confirmDeleteConf);
    setConfirmDeleteConf(null);
    showToast(`Conferência "${conf?.name}" e ${count} NS removidos.`, 'success');
  };

  const conferenceRecords = useMemo(() => {
    if (!activeConferenceId) return records;
    return records.filter(r => r.conferenceId === activeConferenceId);
  }, [records, activeConferenceId]);

  const filtered = useMemo(() => {
    let result = conferenceRecords;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.ns.toLowerCase().includes(q) || r.clientName.toLowerCase().includes(q));
    }
    if (contentFilters.size > 0) {
      result = result.filter(r =>
        r.stages.some(s => {
          if (contentFilters.has('photo') && ((s.locationPhotos?.length ?? 0) + (s.notesPhotos?.length ?? 0)) > 0) return true;
          if (contentFilters.has('obs') && s.notes && s.notes.trim() !== '') return true;
          if (contentFilters.has('loc') && s.location && s.location.trim() !== '') return true;
          return false;
        })
      );
    }
    return result;
  }, [conferenceRecords, search, contentFilters]);

  const activeConf = conferences.find(c => c.id === activeConferenceId);

  if (records.length === 0) {
    return (
      <EmptyState
        title="NENHUM NS CADASTRADO"
        description="Importe uma planilha Excel com os dados dos clientes para começar a gerenciar os processos de produção."
        action={
          <Button variant="accent" onClick={() => navigate('/importar')}>
            <Upload size={14} />
            Importar Planilha
          </Button>
        }
      />
    );
  }

  return (
    <div className="animate-fade-in">

      {/* Conference selector */}
      {conferences.length > 0 && (
        <div style={{ marginBottom: '16px', position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <button
            onClick={() => setConfDropdown(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 13px', borderRadius: '9px',
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              cursor: 'pointer',
              background: confDropdown ? '#eef2ff' : '#ffffff',
              border: `1px solid ${confDropdown ? '#c7d2fe' : '#e2e5eb'}`,
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={12} color={confDropdown ? '#4c6ef5' : '#9ca3af'} />
            <span style={{
              fontSize: '13px', fontWeight: 500,
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              color: confDropdown ? '#3730a3' : '#374151',
              letterSpacing: '-0.01em',
            }}>
              {activeConf ? activeConf.name : 'Todas as conferências'}
            </span>
            <ChevronDown size={11} color="rgba(140,175,205,0.4)" style={{ transform: confDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s ease' }} />
          </button>

          {confDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
              minWidth: '220px',
              background: '#ffffff',
              border: '1px solid #e2e5eb',
              borderRadius: '12px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s cubic-bezier(0.16,1,0.3,1) both',
            }}>
              <button
                onClick={() => { setActiveConference(null); setConfDropdown(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', background: !activeConferenceId ? '#eef2ff' : 'transparent', border: 'none', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (activeConferenceId) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={e => { if (activeConferenceId) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '12.5px', color: !activeConferenceId ? '#4c6ef5' : '#6b7280', fontWeight: !activeConferenceId ? 600 : 400 }}>Todas as conferências</span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', fontFamily: "'Geist Mono', monospace", color: '#d1d5db' }}>{records.length}</span>
              </button>
              {conferences.map(conf => {
                const count = records.filter(r => r.conferenceId === conf.id).length;
                const isActive = activeConferenceId === conf.id;
                return (
                  <div key={conf.id} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                    onMouseEnter={e => { const row = e.currentTarget.querySelector('.conf-delete-btn') as HTMLElement; if (row) row.style.opacity = '1'; }}
                    onMouseLeave={e => { const row = e.currentTarget.querySelector('.conf-delete-btn') as HTMLElement; if (row) row.style.opacity = '0'; }}
                  >
                    <button onClick={() => { setActiveConference(conf.id); setConfDropdown(false); }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', background: isActive ? '#eef2ff' : 'transparent', border: 'none', transition: 'background 0.1s', paddingRight: '36px' }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Calendar size={12} color={isActive ? '#4c6ef5' : '#d1d5db'} />
                      <span style={{ fontSize: '12.5px', color: isActive ? '#3730a3' : '#374151', fontWeight: isActive ? 500 : 400, flex: 1, textAlign: 'left', letterSpacing: '-0.01em' }}>{conf.name}</span>
                      <span style={{ fontSize: '10px', fontFamily: "'Geist Mono', monospace", color: '#d1d5db' }}>{count}</span>
                    </button>
                    <button
                      className="conf-delete-btn"
                      onClick={e => { e.stopPropagation(); setConfirmDeleteConf(conf.id); setConfDropdown(false); }}
                      title="Excluir conferência"
                      style={{ position: 'absolute', right: '8px', opacity: 0, transition: 'opacity 0.15s', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: 'rgba(239,68,68,0.6)', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; e.currentTarget.style.background = 'none'; }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {confDropdown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setConfDropdown(false)} />
      )}

      <StatsCards records={conferenceRecords} />

      <DashboardFilters
        search={search}
        onSearchChange={setSearch}
        visibleStages={visibleStages}
        onVisibleStagesChange={setVisibleStages}
        contentFilters={contentFilters}
        onContentFiltersChange={setContentFilters}
      />

      {/* Active filters bar */}
      {hasActiveFilters && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '10px', flexWrap: 'wrap',
        }}>
          {/* Active filter pills */}
          {[
            search ? `Busca: "${search}"` : null,
            contentFilters.size > 0 ? `${contentFilters.size} filtro${contentFilters.size > 1 ? 's' : ''}` : null,
            visibleStages.size < STAGES.length ? `${visibleStages.size}/${STAGES.length} etapas` : null,
            sortCol ? `${STAGES.find(s => s.id === sortCol)?.label} ${sortDir === 'asc' ? '↑' : '↓'}` : null,
          ].filter(Boolean).map((label, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 9px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 500,
              fontFamily: "'DM Sans','Geist',sans-serif",
              background: 'rgba(78,205,196,0.08)',
              border: '1px solid rgba(78,205,196,0.18)',
              color: 'rgba(78,205,196,0.7)',
              letterSpacing: '-0.01em',
            }}>
              {label}
            </span>
          ))}

          <div style={{ flex: 1 }} />

          {/* Clear filters */}
          <button onClick={clearAllFilters} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', fontSize: '11px', fontWeight: 500, fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', borderRadius: '8px', background: '#f3f4f6', border: '1px solid #e2e5eb', color: '#6b7280', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <X size={11} /> Limpar filtros
          </button>

          {/* Clear all records */}
          <button onClick={() => setConfirmClear(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', fontSize: '11px', fontWeight: 500, fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', borderRadius: '8px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ffe4e6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff1f2'; }}
          >
            <Trash2 size={11} /> Limpar tudo
          </button>
        </div>
      )}

      {/* Limpar tudo always visible when no other filters */}
      {!hasActiveFilters && records.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button
            onClick={() => setConfirmClear(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 11px', fontSize: '11px', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', borderRadius: '8px',
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
              color: 'rgba(239,68,68,0.6)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; }}
          >
            <Trash2 size={11} />
            Limpar tudo
          </button>
        </div>
      )}

      <TableView
        records={filtered}
        visibleStages={visibleStages}
        sortCol={sortCol}
        sortDir={sortDir}
        onSortChange={(col, dir) => { setSortCol(col); setSortDir(dir); }}
      />

      {/* Confirm delete conference modal */}
      {confirmDeleteConf && (() => {
        const conf = conferences.find(c => c.id === confirmDeleteConf);
        const count = records.filter(r => r.conferenceId === confirmDeleteConf).length;
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(7,11,20,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease both' }}
            onClick={e => { if (e.target === e.currentTarget) setConfirmDeleteConf(null); }}
          >
            <div style={{ background: 'linear-gradient(145deg, #004555 0%, #003540 100%)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '28px', maxWidth: '360px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.55)', animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Trash2 size={18} color="#f87171" />
              </div>
              <h3 className="font-display" style={{ fontSize: '19px', color: '#dde6f0', letterSpacing: '0.06em', marginBottom: '10px' }}>EXCLUIR CONFERÊNCIA</h3>
              <p style={{ fontSize: '13px', fontFamily: "'DM Sans','Geist',sans-serif", color: 'rgba(140,170,195,0.6)', lineHeight: 1.65, marginBottom: '6px' }}>
                A conferência <strong style={{ color: '#c8dae8', fontWeight: 500 }}>"{conf?.name}"</strong> e todos os seus registros serão removidos permanentemente.
              </p>
              <p style={{ fontSize: '12px', fontFamily: "'DM Sans','Geist',sans-serif", color: 'rgba(248,113,113,0.6)', lineHeight: 1.65, marginBottom: '24px' }}>
                <strong style={{ fontFamily: "'Geist Mono', monospace", color: '#f87171' }}>{count}</strong> NS serão excluídos.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setConfirmDeleteConf(null)} style={{ flex: 1, padding: '9px', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(160,190,215,0.6)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#c8dae8'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(160,190,215,0.6)'; }}>
                  Cancelar
                </button>
                <button onClick={handleDeleteConference} style={{ flex: 1, padding: '9px', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', borderRadius: '9px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}>
                  Excluir
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Confirm clear modal */}
      {confirmClear && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(7,11,20,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.15s ease both' }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmClear(false); }}
        >
          <div style={{ background: 'linear-gradient(145deg, #004555 0%, #003540 100%)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '28px', maxWidth: '360px', width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.55)', animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Trash2 size={18} color="#f87171" />
            </div>
            <h3 className="font-display" style={{ fontSize: '19px', color: '#dde6f0', letterSpacing: '0.06em', marginBottom: '10px' }}>LIMPAR TUDO</h3>
            <p style={{ fontSize: '13px', fontFamily: "'DM Sans','Geist',sans-serif", color: 'rgba(140,170,195,0.6)', lineHeight: 1.65, marginBottom: '24px' }}>
              Todos os <strong style={{ fontFamily: "'Geist Mono', monospace", color: '#f87171' }}>{records.length}</strong> registros serão removidos permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirmClear(false)} style={{ flex: 1, padding: '9px', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(160,190,215,0.6)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#c8dae8'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(160,190,215,0.6)'; }}>
                Cancelar
              </button>
              <button onClick={handleClearAll} style={{ flex: 1, padding: '9px', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans','Geist',sans-serif", cursor: 'pointer', borderRadius: '9px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
