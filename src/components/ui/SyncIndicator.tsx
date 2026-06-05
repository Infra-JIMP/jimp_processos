import { useEffect, useState } from 'react';
import { onSyncStatus, type SyncStatus } from '../../lib/sync';

const CONFIG: Record<SyncStatus, { label: string; color: string; pulse: boolean }> = {
  idle:    { label: 'Ao vivo',       color: '#4ecdc4', pulse: true  },
  syncing: { label: 'Sincronizando', color: '#74b0fc', pulse: true  },
  synced:  { label: 'Ao vivo',       color: '#4ecdc4', pulse: true  },
  error:   { label: 'Erro DB',       color: '#f87171', pulse: false },
  offline: { label: 'Offline',       color: '#f59e0b', pulse: false },
};

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const unsub = onSyncStatus((s, err) => { setStatus(s); setError(err); });
    return () => { unsub(); };
  }, []);

  const cfg = CONFIG[status];

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => status === 'error' && setShowError(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
          cursor: status === 'error' ? 'pointer' : 'default',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: cfg.color,
          boxShadow: `0 0 6px ${cfg.color}`,
          animation: cfg.pulse ? 'syncPulse 2.5s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          color: cfg.color,
          opacity: 0.8,
          letterSpacing: '0.03em',
        }}>
          {status === 'syncing' ? 'Sincronizando…' : cfg.label}
        </span>
      </button>

      {showError && error && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '6px',
          background: '#003540', border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: '8px', padding: '8px 12px', minWidth: '200px',
          fontSize: '12px',
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          color: '#f87171', zIndex: 50,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes syncPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
