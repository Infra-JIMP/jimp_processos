import type { StageStatus } from '../../store/types';

interface BadgeProps {
  status: StageStatus;
  className?: string;
}

const statusConfig: Record<StageStatus, { label: string; style: React.CSSProperties; dot: string }> = {
  pending: {
    label: 'Aguardando',
    style: {
      background: 'rgba(48,66,128,0.4)',
      border: '1px solid rgba(76,110,245,0.2)',
      color: '#748ffc',
    },
    dot: '#304280',
  },
  in_progress: {
    label: 'Em Progresso',
    style: {
      background: 'rgba(255,107,53,0.15)',
      border: '1px solid rgba(255,107,53,0.35)',
      color: '#ffa552',
    },
    dot: '#ff6b35',
  },
  done: {
    label: 'Concluído',
    style: {
      background: 'rgba(16,185,129,0.12)',
      border: '1px solid rgba(16,185,129,0.3)',
      color: '#34d399',
    },
    dot: '#10b981',
  },
  n_a: {
    label: 'Não aplica',
    style: {
      background: 'rgba(77,166,204,0.08)',
      border: '1px solid rgba(77,166,204,0.2)',
      color: 'rgba(77,166,204,0.7)',
    },
    dot: '#4da6cc',
  },
};

export function Badge({ status, className = '' }: BadgeProps) {
  const { label, style, dot } = statusConfig[status];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: dot,
        flexShrink: 0,
        boxShadow: status === 'in_progress' ? `0 0 5px ${dot}` : 'none',
        animation: status === 'in_progress' ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }} />
      {label}
    </span>
  );
}
