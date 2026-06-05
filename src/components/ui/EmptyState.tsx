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

      <div style={{ position: 'relative', marginBottom: '28px' }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute', inset: '-20px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,205,196,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: '72px', height: '72px', borderRadius: '18px',
          background: 'linear-gradient(145deg, rgba(78,205,196,0.08) 0%, rgba(78,205,196,0.03) 100%)',
          border: '1px solid rgba(78,205,196,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'rgba(78,205,196,0.45)' }}>
            {icon ?? <PackageOpen size={26} />}
          </span>
        </div>
      </div>

      <h3 className="font-display" style={{
        fontSize: '22px', color: '#c8dae8',
        marginBottom: '10px', letterSpacing: '0.1em', lineHeight: 1.15,
      }}>
        {title}
      </h3>

      {description && (
        <p style={{
          fontSize: '13px',
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          fontWeight: 400,
          color: 'rgba(140,170,195,0.45)',
          maxWidth: '300px', lineHeight: 1.7, marginBottom: '28px',
        }}>
          {description}
        </p>
      )}

      {action}
    </div>
  );
}
