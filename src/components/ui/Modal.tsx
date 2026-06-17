import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidths = { sm: '380px', md: '460px', lg: '540px', xl: '680px' };

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0',
    }}
    className="modal-wrapper"
    >
      <style>{`
        @media (min-width: 640px) {
          .modal-wrapper { align-items: center !important; padding: 16px !important; }
          .modal-inner { border-radius: 16px !important; max-height: 90vh !important; }
        }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        className="animate-scale-in modal-inner"
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: maxWidths[size],
          maxHeight: '95vh', overflowY: 'auto',
          background: '#ffffff',
          border: '1px solid #e2e5eb',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#1a2332', letterSpacing: '-0.01em', fontFamily: "'DM Sans','Geist',sans-serif" }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                color: '#6b7280', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e5e7eb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}
