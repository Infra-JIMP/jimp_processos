import React from 'react';
import { Menu, ChevronRight } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { SyncIndicator } from '../ui/SyncIndicator';

interface TopbarProps {
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export function Topbar({ onMenuClick, actions }: TopbarProps) {
  const location = useLocation();
  const records = useAppStore(s => s.records);

  const crumbs: { label: string; to?: string }[] = [];
  if (location.pathname === '/') {
    crumbs.push({ label: 'Dashboard' });
  } else if (location.pathname === '/importar') {
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: 'Importar' });
  } else if (location.pathname === '/relatorios') {
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: 'Relatórios' });
  } else if (location.pathname.startsWith('/ns/')) {
    const id = location.pathname.replace('/ns/', '');
    const record = records.find(r => r.id === id);
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: record ? `NS ${record.ns}` : 'Detalhe NS' });
  } else if (location.pathname === '/pat-ofic') {
    crumbs.push({ label: 'Dashboard', to: '/' });
    crumbs.push({ label: 'PAT / OFIC' });
  }

  return (
    <header
      className="flex items-center gap-3 sticky top-0 z-10"
      style={{
        height: '50px',
        padding: '0 clamp(12px, 3vw, 20px)',
        background: '#ffffff',
        borderBottom: '1px solid #e8eaef',
        boxShadow: '0 1px 0 #e8eaef',
        minWidth: 0,
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="lg:hidden flex items-center justify-center"
        style={{
          width: '28px', height: '28px', borderRadius: '7px',
          border: '1px solid #e2e5eb',
          color: '#6b7280',
          background: '#f5f6f8',
          flexShrink: 0, cursor: 'pointer',
        }}
      >
        <Menu size={14} />
      </button>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, minWidth: 0 }}>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <ChevronRight size={10} color="#d1d5db" style={{ flexShrink: 0 }} />
              )}
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  style={{
                    fontSize: '12px', fontWeight: 400,
                    fontFamily: "'DM Sans', 'Geist', sans-serif",
                    color: '#9ca3af',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#4b5563')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-display' : ''}
                  style={{
                    fontSize: isLast ? '18px' : '12px',
                    fontWeight: isLast ? 700 : 400,
                    fontFamily: isLast ? "'Bebas Neue', sans-serif" : "'DM Sans', 'Geist', sans-serif",
                    color: isLast ? '#1a2332' : '#9ca3af',
                    letterSpacing: isLast ? '0.08em' : '0',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    lineHeight: 1,
                  }}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <SyncIndicator />

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
