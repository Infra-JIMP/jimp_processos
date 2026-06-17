import { useEffect, useState } from 'react';
import { onSyncStatus, type SyncStatus } from '../../lib/sync';

const CONFIG: Record<SyncStatus, { label: string; color: string; bg: string; pulse: boolean }> = {
  idle:    { label: 'Ao vivo',       color: '#059669', bg: 'rgba(5,150,105,0.08)',   pulse: true  },
  syncing: { label: 'Sincronizando', color: '#4c6ef5', bg: 'rgba(76,110,245,0.08)',  pulse: true  },
  synced:  { label: 'Ao vivo',       color: '#059669', bg: 'rgba(5,150,105,0.08)',   pulse: true  },
  error:   { label: 'Erro DB',       color: '#dc2626', bg: 'rgba(220,38,38,0.07)',   pulse: false },
  offline: { label: 'Offline',       color: '#d97706', bg: 'rgba(217,119,6,0.07)',   pulse: false },
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
          background: cfg.bg,
          border: `1px solid ${cfg.color}22`,
          flexShrink: 0,
          cursor: status === 'error' ? 'pointer' : 'default',
        }}
      >
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: cfg.color,
          animation: cfg.pulse ? 'syncPulse 2.5s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: '11px', fontWeight: 500,
          fontFamily: "'DM Sans', 'Geist', sans-serif",
          color: cfg.color,
          letterSpacing: '-0.01em',
        }}>
          {status === 'syncing' ? 'Sincronizando…' : cfg.label}
        </span>
      </button>

      {showError && error && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '6px',
          background: '#fff', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '8px 12px', minWidth: '200px',
          fontSize: '12px', color: '#dc2626', zIndex: 50,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
