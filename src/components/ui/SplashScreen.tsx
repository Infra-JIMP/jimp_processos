import { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'intro' | 'text' | 'bar' | 'exit'>('intro');
  const [typedGerencial, setTypedGerencial] = useState('');
  const [typedSub, setTypedSub] = useState('');
  const [barWidth, setBarWidth] = useState(0);
  const [barDone, setBarDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 400);
    const t2 = setTimeout(() => setPhase('bar'), 2000);
    const t3 = setTimeout(() => {
      setBarDone(true);
      setPhase('exit');
      setTimeout(onComplete, 700);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Typewriter — GERENCIAL
  useEffect(() => {
    if (phase !== 'text') return;
    const word = 'GERENCIAL';
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedGerencial(word.slice(0, i));
      if (i >= word.length) clearInterval(iv);
    }, 60);
    return () => clearInterval(iv);
  }, [phase]);

  // Typewriter — subtítulo
  useEffect(() => {
    if (typedGerencial !== 'GERENCIAL') return;
    const sub = 'JOINVILLE IMPLEMENTOS';
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedSub(sub.slice(0, i));
      if (i >= sub.length) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [typedGerencial]);

  // Progress bar
  useEffect(() => {
    if (phase !== 'bar') return;
    const duration = 1300;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setBarWidth(eased * 100);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [phase]);

  const exiting = phase === 'exit';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0f2d4a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px',
      opacity: exiting ? 0 : 1,
      transform: exiting ? 'scale(1.05)' : 'scale(1)',
      transition: exiting ? 'opacity 0.6s cubic-bezier(0.4,0,1,1), transform 0.6s cubic-bezier(0.4,0,1,1)' : 'none',
      overflow: 'hidden',
    }}>

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(76,110,245,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Center glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(76,110,245,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom orange breath */}
      <div style={{
        position: 'absolute', bottom: '-60px', left: '50%',
        transform: 'translateX(-50%)',
        width: '320px', height: '180px',
        background: 'radial-gradient(ellipse, rgba(255,107,53,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'breathe 3s ease-in-out infinite',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>

        {/* Icon */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginBottom: '36px',
          opacity: phase === 'intro' ? 0 : 1,
          transform: phase === 'intro' ? 'scale(0.6) translateY(10px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(255,107,53,0.12)',
            boxShadow: '0 0 48px rgba(255,107,53,0.35), 0 0 100px rgba(255,107,53,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '10px',
          }}>
            <Logo size={52} />
          </div>
        </div>

        {/* GERENCIAL typewriter */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(56px, 12vw, 100px)',
          letterSpacing: '0.06em',
          color: '#f0f4ff',
          lineHeight: 1,
          textAlign: 'center',
          minHeight: 'clamp(56px, 12vw, 100px)',
          textShadow: '0 0 80px rgba(76,110,245,0.25)',
          userSelect: 'none',
        }}>
          {typedGerencial}
          {phase === 'text' && typedGerencial.length < 9 && (
            <span style={{
              display: 'inline-block',
              width: '0.06em', height: '0.75em',
              background: '#ff6b35',
              verticalAlign: 'baseline',
              marginLeft: '3px',
              boxShadow: '0 0 10px #ff6b35',
              animation: 'blink 0.75s step-end infinite',
            }} />
          )}
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 'clamp(9px, 1.8vw, 12px)',
          letterSpacing: '0.26em',
          color: '#4c6ef5',
          fontWeight: 600,
          textAlign: 'center',
          marginTop: '8px',
          minHeight: '18px',
          opacity: typedSub.length > 0 ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}>
          {typedSub}
          {typedSub.length > 0 && typedSub.length < 21 && (
            <span style={{ animation: 'blink 0.6s step-end infinite', color: '#748ffc' }}>_</span>
          )}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: '52px',
          opacity: phase === 'bar' || phase === 'exit' ? 1 : 0,
          transform: phase === 'bar' || phase === 'exit' ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}>
          {/* Track */}
          <div style={{
            height: '2px', borderRadius: '2px',
            background: 'rgba(76,110,245,0.12)',
            position: 'relative', overflow: 'visible',
          }}>
            {/* Fill */}
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${barWidth}%`,
              background: barDone
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #4c6ef5, #ff6b35)',
              borderRadius: '2px',
              transition: 'background 0.5s ease',
            }} />

            {/* Glow tip */}
            {!barDone && barWidth > 1 && (
              <div style={{
                position: 'absolute',
                top: '50%', left: `${barWidth}%`,
                transform: 'translate(-50%, -50%)',
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#ff6b35',
                boxShadow: '0 0 10px 3px rgba(255,107,53,0.7)',
                animation: 'tipPulse 0.12s ease infinite alternate',
              }} />
            )}
          </div>

          {/* Labels */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: '10px',
          }}>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '9px', letterSpacing: '0.14em',
              color: barDone ? '#10b981' : 'rgba(141,160,200,0.3)',
              transition: 'color 0.4s ease',
            }}>
              {barDone ? 'SISTEMA PRONTO' : 'INICIALIZANDO'}
            </span>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '18px', letterSpacing: '0.04em', lineHeight: 1,
              color: barDone ? '#10b981' : '#748ffc',
              transition: 'color 0.4s ease',
            }}>
              {Math.round(barWidth)}%
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes tipPulse {
          from { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
          to   { transform: translate(-50%,-50%) scale(1.5); opacity: 0.6; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
          50%       { opacity: 1;   transform: translateX(-50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
