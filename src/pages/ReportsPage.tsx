import { useState } from 'react';
import { FileDown, FileText, Search, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { usePDFExport } from '../hooks/usePDFExport';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { STAGES } from '../utils/stages';
import type { NSRecord } from '../store/types';
import { useToast } from '../components/ui/Toast';
import { RecordPreview, useRecordPreview } from '../components/ui/RecordPreview';
import { NSDetailModal } from '../components/ui/NSDetailModal';

export function ReportsPage() {
  const records = useAppStore(s => s.records);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [modalRecordId, setModalRecordId] = useState<string | null>(null);
  const { isExporting, exportSingleDirect, exportMultiple } = usePDFExport();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exportingId, setExportingId] = useState<string | null>(null);
  const { previewRecord, showPreview, hidePreview } = useRecordPreview();

  const filtered = records.filter(r =>
    !search ||
    r.ns.toLowerCase().includes(search.toLowerCase()) ||
    r.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRecord = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };

  const handleSingleExport = async (record: NSRecord) => {
    setExportingId(record.id);
    await exportSingleDirect(record);
    setExportingId(null);
  };

  const handleBulkExport = async () => {
    const toExport = records.filter(r => selected.has(r.id));
    if (toExport.length === 0) { showToast('Selecione pelo menos um NS.', 'error'); return; }
    await exportMultiple(toExport);
    showToast(`${toExport.length} NS exportados em PDF.`, 'success');
  };

  const getOverallStatus = (record: NSRecord) => {
    if (record.stages.every(s => s.status === 'done')) return 'done';
    if (record.stages.some(s => s.status === 'in_progress')) return 'in_progress';
    return 'pending';
  };

  if (records.length === 0) {
    return (
      <EmptyState
        title="NENHUM NS CADASTRADO"
        description="Importe uma planilha para ver os relatórios."
        action={<Button variant="accent" onClick={() => navigate('/importar')}>Importar</Button>}
      />
    );
  }

  const allSelected = selected.size === filtered.length && filtered.length > 0;
  const stats = [
    { label: 'Total', value: records.length, color: '#748ffc', rgb: '116,143,252' },
    { label: 'Concluídos', value: records.filter(r => r.stages.every(s => s.status === 'done')).length, color: '#10b981', rgb: '16,185,129' },
    { label: 'Em andamento', value: records.filter(r => r.stages.some(s => s.status === 'in_progress')).length, color: '#ff6b35', rgb: '255,107,53' },
    { label: 'Aguardando', value: records.filter(r => r.stages.every(s => s.status === 'pending')).length, color: '#8da0c8', rgb: '141,160,200' },
  ];

  return (
    <div className="animate-fade-in">
      <NSDetailModal recordId={modalRecordId} onClose={() => setModalRecordId(null)} />
      <RecordPreview record={previewRecord} visible={!!previewRecord} />

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '180px', maxWidth: '300px' }}>
          <Search size={12} style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            color: '#9ca3af', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar NS ou cliente..."
            style={{
              width: '100%', paddingLeft: '30px', paddingRight: search ? '30px' : '12px',
              paddingTop: '8px', paddingBottom: '8px', fontSize: '12px',
              background: '#ffffff', border: '1px solid #e2e5eb',
              borderRadius: '10px', color: '#1a2332', fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = '#4c6ef5')}
            onBlur={e => (e.target.style.borderColor = '#e2e5eb')}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: '2px', cursor: 'pointer',
              color: '#9ca3af',
            }}>
              <X size={11} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={toggleAll}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px', fontSize: '11px', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
              background: allSelected ? '#eef2ff' : '#f3f4f6',
              border: `1px solid ${allSelected ? '#c7d2fe' : '#e2e5eb'}`,
              borderRadius: '8px', color: allSelected ? '#4c6ef5' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: '13px', height: '13px', borderRadius: '3px',
              border: `2px solid ${allSelected ? '#4c6ef5' : 'rgba(76,110,245,0.35)'}`,
              background: allSelected ? '#4c6ef5' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {allSelected && <div style={{ width: '5px', height: '5px', borderRadius: '1px', background: '#fff' }} />}
            </div>
            {allSelected ? 'Desmarcar' : 'Selecionar todos'}
          </button>

          <Button
            variant="accent"
            loading={isExporting && !exportingId}
            onClick={handleBulkExport}
            disabled={selected.size === 0 || !!isExporting}
          >
            <FileDown size={13} />
            {selected.size > 0 ? `Exportar (${selected.size})` : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {stats.map(({ label, value, color, rgb }) => (
          <div key={label} style={{
            padding: '7px 14px', borderRadius: '8px', flex: '1 1 auto',
            background: `rgba(${rgb},0.06)`,
            border: `1px solid rgba(${rgb},0.15)`,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{
              fontSize: '15px', fontWeight: 700, color,
              fontFamily: "'Geist Mono', monospace", lineHeight: 1,
            }}>
              {value}
            </span>
            <span style={{ fontSize: '10px', color: '#9ca3af', letterSpacing: '0.04em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '13px' }}>
          Nenhum resultado encontrado.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {filtered.map(record => {
            const done = record.stages.filter(s => s.status === 'done').length;
            const progress = Math.round((done / STAGES.length) * 100);
            const status = getOverallStatus(record);
            const isSelected = selected.has(record.id);
            const statusColor = status === 'done' ? '#10b981' : status === 'in_progress' ? '#ff6b35' : '#748ffc';

            return (
              <div
                key={record.id}
                style={{
                  background: isSelected ? '#eef2ff' : '#ffffff',
                  border: `1px solid ${isSelected ? '#c7d2fe' : '#e8eaef'}`,
                  borderRadius: '11px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px',
                  transition: 'all 0.15s ease',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#c7d2fe';
                    (e.currentTarget as HTMLDivElement).style.background = '#f8f9fb';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#e8eaef';
                    (e.currentTarget as HTMLDivElement).style.background = '#ffffff';
                  }
                }}
              >
                {/* Left status bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0, width: '2.5px',
                  background: statusColor, opacity: 0.5,
                }} />

                {/* Checkbox */}
                <div
                  onClick={() => toggleRecord(record.id)}
                  style={{
                    width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                    border: `1.5px solid ${isSelected ? '#4c6ef5' : 'rgba(76,110,245,0.25)'}`,
                    background: isSelected ? 'rgba(76,110,245,0.25)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {isSelected && <div style={{ width: '7px', height: '7px', borderRadius: '1.5px', background: '#748ffc' }} />}
                </div>

                {/* Info */}
                <div
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                  onClick={() => setModalRecordId(record.id)}
                  onMouseEnter={() => showPreview(record)}
                  onMouseLeave={hidePreview}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    <p style={{
                      fontWeight: 700, fontSize: '13px', color: '#1a2332',
                      fontFamily: "'Geist Mono', monospace",
                    }}>
                      {record.ns}
                    </p>
                    <span style={{ color: '#d1d5db', fontSize: '10px' }}>·</span>
                    <p style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.clientName}
                    </p>
                    <Badge status={status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, maxWidth: '200px', height: '2px', background: 'rgba(76,110,245,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px', width: `${progress}%`,
                        background: status === 'done'
                          ? 'linear-gradient(90deg,#10b981,#34d399)'
                          : status === 'in_progress'
                          ? 'linear-gradient(90deg,#ff6b35,#ffa552)'
                          : 'rgba(116,143,252,0.4)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: "'Geist Mono', monospace", whiteSpace: 'nowrap' }}>
                      {done}/{STAGES.length} · {progress}%
                    </span>
                  </div>
                </div>

                {/* PDF button */}
                <div className="record-item-pdf-btn">
                  <button
                    onClick={() => handleSingleExport(record)}
                    disabled={!!isExporting}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '5px 10px', fontSize: '11px', fontWeight: 600,
                      fontFamily: 'inherit', cursor: isExporting ? 'not-allowed' : 'pointer',
                      background: '#eef2ff',
                      border: '1px solid #c7d2fe',
                      borderRadius: '7px', color: '#4c6ef5',
                      transition: 'all 0.15s', opacity: isExporting ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { if (!isExporting) (e.currentTarget.style.background = '#e0e7ff'); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = '#eef2ff'); }}
                  >
                    <FileText size={11} />
                    PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
