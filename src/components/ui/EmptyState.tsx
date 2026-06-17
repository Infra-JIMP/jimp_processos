import { PackageOpen } from 'lucide-react';

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
          width: '68px', height: '68px', borderRadius: '16px',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#9ca3af' }}>
            {icon ?? <PackageOpen size={26} />}
          </span>
        </div>
      </div>

      <h3 className="font-display" style={{
        fontSize: '22px', color: '#1a2332',
        marginBottom: '8px', letterSpacing: '0.08em', lineHeight: 1.15,
      }}>
        {title}
      </h3>

      {description && (
        <p style={{
          fontSize: '13px',
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          fontWeight: 400,
          color: '#9ca3af',
          maxWidth: '300px', lineHeight: 1.7, marginBottom: '28px',
        }}>
          {description}
        </p>
      )}

      {action}
    </div>
  );
}
