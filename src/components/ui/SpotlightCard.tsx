import { useEffect, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  accentHue?: number;
  style?: CSSProperties;
}

export function SpotlightCard({ children, className = '', accentHue = 220, style }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    let rafId: number;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glow.style.transform = `translate(${x - 150}px, ${y - 150}px)`;
      });
    };

    const onEnter = () => { glow.style.opacity = '1'; };
    const onLeave = () => { glow.style.opacity = '0'; };

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {/* Spotlight glow — GPU composited, no repaint */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: 300, height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, hsl(${accentHue} 80% 65% / 0.13) 0%, transparent 70%)`,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          willChange: 'transform',
          zIndex: 0,
        }}
      />
      {/* Border highlight layer */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 'inherit',
          border: '1px solid transparent',
          background: `linear-gradient(135deg, hsl(${accentHue} 70% 60% / 0.18), transparent 60%) border-box`,
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
