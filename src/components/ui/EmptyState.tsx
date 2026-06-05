import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
    }} className="animate-fade-in">

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div style={{
          position: 'absolute', inset: '-14px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,110,245,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: '68px', height: '68px', borderRadius: '18px',
          background: 'linear-gradient(145deg, rgba(76,110,245,0.1) 0%, rgba(76,110,245,0.04) 100%)',
          border: '1px solid rgba(76,110,245,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'rgba(76,110,245,0.55)' }}>
            {icon ?? <FileQuestion size={26} />}
          </span>
        </div>
      </div>

      <h3 className="font-display" style={{
        fontSize: '20px', color: '#c5d0e8',
        marginBottom: '10px', letterSpacing: '0.08em', lineHeight: 1.2,
      }}>
        {title}
      </h3>

      {description && (
        <p style={{
          fontSize: '13px', color: 'rgba(141,160,200,0.5)',
          maxWidth: '320px', lineHeight: 1.65, marginBottom: '28px',
        }}>
          {description}
        </p>
      )}

      {action}
    </div>
  );
}
