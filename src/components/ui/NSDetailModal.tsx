import { createPortal } from 'react-dom';
import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { NSDetailHeader } from '../detail/NSDetailHeader';
import { StageList } from '../detail/StageList';
import { NotesSection } from '../detail/NotesSection';
import { PDFExportButton } from '../export/PDFExportButton';
import { Button } from './Button';
import { Modal } from './Modal';
import { useToast } from './Toast';

interface NSDetailModalProps {
  recordId: string | null;
  onClose: () => void;
}

export function NSDetailModal({ recordId, onClose }: NSDetailModalProps) {
  const record = useAppStore((s) => s.records.find((r) => r.id === recordId));
  const deleteRecord = useAppStore((s) => s.deleteRecord);
  const { showToast } = useToast();
  const [deleteModal, setDeleteModal] = useState(false);

  if (!recordId || !record) return null;

  const handleDelete = () => {
    deleteRecord(record.id);
    showToast('NS removido com sucesso.', 'success');
    setDeleteModal(false);
    onClose();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(7,11,20,0.8)', backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.2s ease both',
        }}
      />

      {/* Drawer / sheet */}
      <div
        className="ns-detail-modal"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
          background: '#006a7a',
          borderLeft: '1px solid rgba(76,110,245,0.18)',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.28s cubic-bezier(0.16,1,0.3,1) both',
          overflowY: 'auto',
        }}
      >
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(76,110,245,0.1)',
          background: '#006a7a',
          position: 'sticky', top: 0, zIndex: 10,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#748ffc', letterSpacing: '0.12em' }}>
              {record.ns}
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(141,160,200,0.4)', marginTop: '1px' }}>
              {record.clientName}
            </p>
          </div>
          <PDFExportButton record={record} />
          <button
            onClick={() => setDeleteModal(true)}
            title="Excluir NS"
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer',
              background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
              color: 'rgba(239,68,68,0.6)', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = 'rgba(239,68,68,0.6)'; }}
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'rgba(76,110,245,0.07)', border: '1px solid rgba(76,110,245,0.15)',
              color: 'rgba(141,160,200,0.5)', cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(76,110,245,0.14)'; e.currentTarget.style.color = '#c5d0e8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(76,110,245,0.07)'; e.currentTarget.style.color = 'rgba(141,160,200,0.5)'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'clamp(12px, 4vw, 20px)', flex: 1 }}>
          <NSDetailHeader record={record} />
          <StageList record={record} />
          <NotesSection record={record} />
        </div>
      </div>

      {/* Delete confirm */}
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirmar Exclusão">
        <p style={{ fontSize: '13px', color: 'rgba(141,160,200,0.6)', lineHeight: 1.6, marginBottom: '20px' }}>
          Tem certeza que deseja excluir o NS{' '}
          <strong style={{ color: '#e8edf7', fontFamily: "'Geist Mono', monospace" }}>{record.ns}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Excluir</Button>
        </div>
      </Modal>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>,
    document.body
  );
}
