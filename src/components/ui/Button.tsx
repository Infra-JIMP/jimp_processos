import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'accent' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 100%)',
    border: '1px solid rgba(116,143,252,0.3)',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(76,110,245,0.3)',
  },
  accent: {
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
    border: '1px solid rgba(255,165,82,0.3)',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(255,107,53,0.35)',
  },
  ghost: {
    background: 'rgba(76,110,245,0.06)',
    border: '1px solid rgba(76,110,245,0.2)',
    color: '#8da0c8',
  },
  danger: {
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: '12px' },
  md: { padding: '8px 16px', fontSize: '13px' },
  lg: { padding: '12px 24px', fontSize: '14px' },
};

export function Button({
  variant = 'primary',
  loading = false,
  size = 'md',
  children,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: '10px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'all 0.15s ease',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      className={className}
      onMouseEnter={e => {
        if (disabled || loading) return;
        (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.12)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.filter = '';
        (e.currentTarget as HTMLButtonElement).style.transform = '';
      }}
    >
      {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
      {children}
    </button>
  );
}
