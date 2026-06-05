interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 7,
  color,
  trackColor = 'rgba(76,110,245,0.12)',
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const ringColor = color ?? (
    percentage === 100 ? '#10b981'
    : percentage > 50 ? '#4c6ef5'
    : percentage > 0 ? '#ff6b35'
    : '#304280'
  );

  const glowColor = percentage === 100
    ? 'rgba(16,185,129,0.4)'
    : percentage > 0
    ? `rgba(76,110,245,0.3)`
    : 'transparent';

  const id = `ring-${Math.round(percentage)}-${size}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ filter: percentage > 0 ? `drop-shadow(0 0 6px ${glowColor})` : 'none' }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ringColor} />
            <stop offset="100%" stopColor={percentage === 100 ? '#34d399' : '#748ffc'} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ fontSize: size * 0.19, fontWeight: 700, color: '#f0f4ff', fontFamily: "'Geist Mono', monospace", lineHeight: 1 }}
      >
        {Math.round(percentage)}%
      </div>
    </div>
  );
}
