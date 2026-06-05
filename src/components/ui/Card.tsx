interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        border: '1px solid rgba(76,110,245,0.14)',
        borderRadius: '14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={onClick ? e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(76,110,245,0.28)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(76,110,245,0.1)';
      } : undefined}
      onMouseLeave={onClick ? e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(76,110,245,0.14)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)';
      } : undefined}
    >
      {children}
    </div>
  );
}
