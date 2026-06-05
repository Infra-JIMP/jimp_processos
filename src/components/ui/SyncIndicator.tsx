import { useEffect, useState } from 'react';
import { onSyncStatus, type SyncStatus } from '../../lib/sync';

const CONFIG: Record<SyncStatus, { label: string; color: string; pulse: boolean; glow: string }> = {
  idle:    { label: 'Conectado',    color: '#10b981', pulse: true,  glow: 'rgba(16,185,129,0.7)' },
  syncing: { label: 'Sincronizando', color: '#748ffc', pulse: true,  glow: 'rgba(116,143,252,0.7)' },
  synced:  { label: 'Ao vivo',      color: '#10b981', pulse: true,  glow: 'rgba(16,185,129,0.7)' },
  error:   { label: 'Erro DB',      color: '#f87171', pulse: false, glow: 'rgba(248,113,113,0.5)' },
  offline: { label: 'Offline',      color: '#f59e0b', pulse: false, glow: 'rgba(245,158,11,0.5)' },
};

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const unsub = onSyncStatus((s, err) => {
      setStatus(s);
      setError(err);
    });
    return () => { unsub(); };
  }, []);

  const cfg = CONFIG[status];
  const bgColor = status === 'error' ? 'rgba(248,113,113,0.08)' :
                  status === 'offline' ? 'rgba(245,158,11,0.08)' :
                  status === 'syncing' ? 'rgba(116,143,252,0.08)' :
                  'rgba(16,185,129,0.08)';
  const borderColor = status === 'error' ? 'rgba(248,113,113,0.2)' :
                      status === 'offline' ? 'rgba(245,158,11,0.2)' :
                      status === 'syncing' ? 'rgba(116,143,252,0.2)' :
                      'rgba(16,185,129,0.18)';

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => status === 'error' && setShowError(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '3px 10px', borderRadius: '20px',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          flexShrink: 0,
          cursor: status === 'error' ? 'pointer' : 'default',
        }}
      >
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: cfg.color,
          boxShadow: `0 0 5px ${cfg.glow}`,
          animation: cfg.pulse ? 'syncPulse 2.5s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: '9px', fontWeight: 700,
          color: cfg.color.replace(')', ',0.7)').replace('rgb', 'rgba'),
          letterSpacing: '0.1em',
          opacity: 0.85,
        }}>
          {status === 'syncing' ? (
            <span style={{ animation: 'syncDots 1.2s steps(3,end) infinite' }}>
              {cfg.label}
            </span>
          ) : cfg.label.toUpperCase()}
        </span>
      </button>

      {showError && error && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '6px',
          background: '#133a5e', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '8px', padding: '8px 12px', minWidth: '200px',
          fontSize: '11px', color: '#f87171', zIndex: 50,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes syncPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes syncDots {
          0% { content: ''; }
          33% { content: '.'; }
          66% { content: '..'; }
          100% { content: '...'; }
        }
      `}</style>
    </div>
  );
}
