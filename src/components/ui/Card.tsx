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
        background: '#ffffff',
        border: '1px solid #e8eaef',
        borderRadius: '12px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : undefined,
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={onClick ? e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#c7d2fe';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(76,110,245,0.1)';
      } : undefined}
      onMouseLeave={onClick ? e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e8eaef';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 8px rgba(0,0,0,0.05)';
      } : undefined}
    >
      {children}
    </div>
  );
}
