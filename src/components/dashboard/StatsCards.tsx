import { useEffect, useRef, useState } from 'react';
import { SpotlightCard } from '../ui/SpotlightCard';
import type { NSRecord } from '../../store/types';

interface StatsCardsProps {
  records: NSRecord[];
}

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(start + diff * eased));
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

function CardTotal({ value }: { value: number }) {
  const count = useCountUp(value, 700);

  return (
    <SpotlightCard
      accentHue={220}
            className="animate-slide-up"
      style={{
        borderRadius: '16px',
        padding: '20px 22px',
        overflow: 'hidden',
        cursor: 'default',
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        border: '1px solid rgba(76,110,245,0.22)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(76,110,245,0.08)',
      }}
    >

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(116,143,252,0.6)' }}>
          TOTAL NS
        </span>
        <span className="font-display" style={{
          fontSize: 'clamp(42px, 5vw, 56px)', lineHeight: 0.85,
          color: '#f0f4ff', letterSpacing: '-0.01em',
        }}>
          {count}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(116,143,252,0.45)', fontWeight: 500 }}>
          registros
        </span>
      </div>

    </SpotlightCard>
  );
}

function CardProducao({ value, total }: { value: number; total: number }) {
  const count = useCountUp(value, 750);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <SpotlightCard
      accentHue={20}
            className="animate-slide-up"
      style={{
        animationDelay: '60ms',
        borderRadius: '16px',
        padding: '20px 22px',
        overflow: 'hidden',
        cursor: 'default',
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        border: '1px solid rgba(255,107,53,0.22)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,107,53,0.06)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(255,107,53,0.7)' }}>
            EM PRODUÇÃO
          </span>
          <div style={{ position: 'relative', width: '6px', height: '6px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ff6b35', animation: value > 0 ? 'pulseDot 1.8s ease-in-out infinite' : 'none' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ff6b35' }} />
          </div>
        </div>
        <span className="font-display" style={{
          fontSize: 'clamp(42px, 5vw, 56px)', lineHeight: 0.85,
          color: '#f0f4ff', letterSpacing: '-0.01em',
        }}>
          {count}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(255,107,53,0.45)', fontWeight: 500 }}>
          em andamento
        </span>
      </div>
    </SpotlightCard>
  );
}

function CardConcluidos({ value, total }: { value: number; total: number }) {
  const count = useCountUp(value, 800);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <SpotlightCard
      accentHue={155}
            className="animate-slide-up"
      style={{
        animationDelay: '120ms',
        borderRadius: '16px',
        padding: '20px 22px',
        overflow: 'hidden',
        cursor: 'default',
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(16,185,129,0.06)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(16,185,129,0.6)' }}>
          CONCLUÍDOS
        </span>
        <span className="font-display" style={{
          fontSize: 'clamp(42px, 5vw, 56px)', lineHeight: 0.85,
          color: '#f0f4ff', letterSpacing: '-0.01em',
        }}>
          {count}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(16,185,129,0.45)', fontWeight: 500 }}>
          finalizados
        </span>
      </div>
    </SpotlightCard>
  );
}

function CardAguardando({ value, total }: { value: number; total: number }) {
  const count = useCountUp(value, 850);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <SpotlightCard
      accentHue={230}
            className="animate-slide-up"
      style={{
        animationDelay: '180ms',
        borderRadius: '16px',
        padding: '20px 22px',
        overflow: 'hidden',
        cursor: 'default',
        background: 'linear-gradient(135deg, #1a4a7a 0%, #133a5e 100%)',
        border: '1px solid rgba(116,143,252,0.18)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(116,143,252,0.06)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '6px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(116,143,252,0.5)' }}>
          AGUARDANDO
        </span>
        <span className="font-display" style={{
          fontSize: 'clamp(42px, 5vw, 56px)', lineHeight: 0.85,
          color: '#f0f4ff', letterSpacing: '-0.01em',
          opacity: value === 0 ? 0.4 : 1,
          transition: 'opacity 0.3s',
        }}>
          {count}
        </span>
        <span style={{ fontSize: '11px', color: 'rgba(116,143,252,0.35)', fontWeight: 500 }}>
          na fila
        </span>
      </div>
    </SpotlightCard>
  );
}

export function StatsCards({ records }: StatsCardsProps) {
  const total      = records.length;
  const concluidos = records.filter(r => r.stages.every(s => s.status === 'done' || s.status === 'n_a')).length;
  const emProducao = records.filter(r =>
    r.stages.some(s => s.status === 'in_progress') && !r.stages.every(s => s.status === 'done' || s.status === 'n_a')
  ).length;
  const aguardando = records.filter(r => r.stages.every(s => s.status === 'pending')).length;

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255,107,53,0.4); }
          50%       { transform: scale(1.2); opacity: 0.85; box-shadow: 0 0 0 6px rgba(255,107,53,0); }
        }
      `}</style>
      <div className="stats-grid">
        <CardTotal      value={total} />
        <CardProducao   value={emProducao} total={total} />
        <CardConcluidos value={concluidos} total={total} />
        <CardAguardando value={aguardando} total={total} />
      </div>
    </>
  );
}
