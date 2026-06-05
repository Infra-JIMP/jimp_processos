import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { NSDetailHeader } from '../components/detail/NSDetailHeader';
import { StageList } from '../components/detail/StageList';
import { NotesSection } from '../components/detail/NotesSection';
import { PDFExportButton } from '../components/export/PDFExportButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useState } from 'react';

export function NSDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const record = useAppStore((s) => s.records.find((r) => r.id === id));
  const deleteRecord = useAppStore((s) => s.deleteRecord);
  const [deleteModal, setDeleteModal] = useState(false);

  if (!record) {
    return (
      <EmptyState
        title="NS não encontrado"
        description="O registro solicitado não existe ou foi removido."
        action={
          <Button variant="ghost" onClick={() => navigate('/')}>
            Voltar ao Dashboard
          </Button>
        }
      />
    );
  }

  const handleDelete = () => {
    deleteRecord(record.id);
    showToast('NS removido com sucesso.', 'success');
    navigate('/');
  };

  return (
    <div className="detail-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '14px' }}>
        <PDFExportButton record={record} />
        <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
          <Trash2 size={13} />
          Excluir
        </Button>
      </div>

      <NSDetailHeader record={record} />
      <StageList record={record} />
      <NotesSection record={record} />

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
    </div>
  );
}
