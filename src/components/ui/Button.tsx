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
    border: '1px solid rgba(116,143,252,0.25)',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(76,110,245,0.25)',
  },
  accent: {
    background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
    border: '1px solid rgba(255,140,66,0.25)',
    color: '#fff',
    boxShadow: '0 2px 12px rgba(255,107,53,0.3)',
  },
  ghost: {
    background: '#f3f4f6',
    border: '1px solid #e2e5eb',
    color: '#374151',
  },
  danger: {
    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '5px 12px', fontSize: '12px' },
  md: { padding: '8px 16px', fontSize: '13px' },
  lg: { padding: '11px 24px', fontSize: '14px' },
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
        gap: '7px',
        fontWeight: 500,
        fontFamily: "'DM Sans', 'Geist', sans-serif",
        borderRadius: '9px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.45 : 1,
        transition: 'all 0.15s ease',
        letterSpacing: '-0.01em',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      className={className}
      onMouseEnter={e => {
        if (disabled || loading) return;
        (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)';
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.filter = '';
        (e.currentTarget as HTMLButtonElement).style.transform = '';
      }}
    >
      {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
      {children}
    </button>
  );
}
