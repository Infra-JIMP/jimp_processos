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

const cardBase: React.CSSProperties = {
  borderRadius: '14px',
  padding: '22px 20px 18px',
  overflow: 'hidden',
  cursor: 'default',
  background: 'linear-gradient(145deg, #005f70 0%, #004555 100%)',
  border: '1px solid rgba(255,255,255,0.07)',
  boxShadow: '0 2px 20px rgba(0,0,0,0.2)',
};

function CardTotal({ value }: { value: number }) {
  const count = useCountUp(value, 700);
  return (
    <SpotlightCard accentHue={220} className="animate-slide-up" style={cardBase}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
          fontFamily: "'Geist Mono', monospace",
          color: 'rgba(100,180,220,0.5)',
          textTransform: 'uppercase',
        }}>
          Total NS
        </span>
        <span className="font-display tabular" style={{
          fontSize: 'clamp(46px, 5.5vw, 60px)', lineHeight: 0.9,
          color: '#e8f4ff', letterSpacing: '0.02em',
        }}>
          {count}
        </span>
        <span style={{
          fontSize: '11px', fontWeight: 400,
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          color: 'rgba(140,175,205,0.45)',
          marginTop: '2px',
        }}>
          registros
        </span>
      </div>
    </SpotlightCard>
  );
}

function CardProducao({ value }: { value: number }) {
  const count = useCountUp(value, 750);
  return (
    <SpotlightCard accentHue={20} className="animate-slide-up" style={{ ...cardBase, animationDelay: '60ms', border: '1px solid rgba(255,107,53,0.12)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
            fontFamily: "'Geist Mono', monospace",
            color: 'rgba(255,130,60,0.6)',
            textTransform: 'uppercase',
          }}>
            Em Produção
          </span>
          {value > 0 && (
            <div style={{ position: 'relative', width: '6px', height: '6px', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: '-3px', borderRadius: '50%',
                background: 'rgba(255,107,53,0.2)',
                animation: 'pulseDot 1.8s ease-in-out infinite',
              }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ff6b35' }} />
            </div>
          )}
        </div>
        <span className="font-display tabular" style={{
          fontSize: 'clamp(46px, 5.5vw, 60px)', lineHeight: 0.9,
          color: '#ffe0cc', letterSpacing: '0.02em',
        }}>
          {count}
        </span>
        <span style={{
          fontSize: '11px', fontWeight: 400,
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          color: 'rgba(255,130,60,0.35)',
          marginTop: '2px',
        }}>
          em andamento
        </span>
      </div>
    </SpotlightCard>
  );
}

function CardConcluidos({ value }: { value: number }) {
  const count = useCountUp(value, 800);
  return (
    <SpotlightCard accentHue={155} className="animate-slide-up" style={{ ...cardBase, animationDelay: '120ms', border: '1px solid rgba(16,185,129,0.1)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
          fontFamily: "'Geist Mono', monospace",
          color: 'rgba(16,185,129,0.55)',
          textTransform: 'uppercase',
        }}>
          Concluídos
        </span>
        <span className="font-display tabular" style={{
          fontSize: 'clamp(46px, 5.5vw, 60px)', lineHeight: 0.9,
          color: value > 0 ? '#a7f3d0' : 'rgba(230,240,250,0.25)',
          letterSpacing: '0.02em',
          transition: 'color 0.4s',
        }}>
          {count}
        </span>
        <span style={{
          fontSize: '11px', fontWeight: 400,
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          color: 'rgba(16,185,129,0.3)',
          marginTop: '2px',
        }}>
          finalizados
        </span>
      </div>
    </SpotlightCard>
  );
}

function CardAguardando({ value }: { value: number }) {
  const count = useCountUp(value, 850);
  return (
    <SpotlightCard accentHue={230} className="animate-slide-up" style={{ ...cardBase, animationDelay: '180ms' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '4px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
          fontFamily: "'Geist Mono', monospace",
          color: 'rgba(100,150,200,0.45)',
          textTransform: 'uppercase',
        }}>
          Aguardando
        </span>
        <span className="font-display tabular" style={{
          fontSize: 'clamp(46px, 5.5vw, 60px)', lineHeight: 0.9,
          color: value === 0 ? 'rgba(230,240,250,0.2)' : '#c5d8f0',
          letterSpacing: '0.02em',
          transition: 'color 0.3s',
        }}>
          {count}
        </span>
        <span style={{
          fontSize: '11px', fontWeight: 400,
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          color: 'rgba(100,150,200,0.3)',
          marginTop: '2px',
        }}>
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
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
      <div className="stats-grid">
        <CardTotal      value={total} />
        <CardProducao   value={emProducao} />
        <CardConcluidos value={concluidos} />
        <CardAguardando value={aguardando} />
      </div>
    </>
  );
}
