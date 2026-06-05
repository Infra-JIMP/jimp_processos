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

  // Build breadcrumb
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
  }

  return (
    <header
      className="flex items-center gap-3 sticky top-0 z-10"
      style={{
        height: '52px',
        padding: '0 clamp(12px, 3vw, 20px)',
        background: '#0f2d4a',
        borderBottom: '1px solid rgba(76,110,245,0.1)',
        minWidth: 0,
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center"
        style={{
          width: '30px', height: '30px', borderRadius: '7px',
          border: '1px solid rgba(76,110,245,0.18)',
          color: '#748ffc',
          background: 'rgba(76,110,245,0.06)',
          flexShrink: 0, cursor: 'pointer',
        }}
      >
        <Menu size={15} />
      </button>

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }}>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRight size={11} color="rgba(141,160,200,0.25)" style={{ flexShrink: 0 }} />
            )}
            {crumb.to ? (
              <Link
                to={crumb.to}
                style={{
                  fontSize: i === 0 ? '12px' : '13px',
                  fontWeight: i === 0 ? 400 : 600,
                  color: 'rgba(141,160,200,0.45)',
                  textDecoration: 'none',
                  letterSpacing: i === crumbs.length - 1 ? '0.06em' : '0',
                  fontFamily: i === crumbs.length - 1 ? "'Bebas Neue', sans-serif" : 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(141,160,200,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(141,160,200,0.45)')}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={i === crumbs.length - 1 ? 'font-display' : ''}
                style={{
                  fontSize: i === crumbs.length - 1 ? '16px' : '12px',
                  fontWeight: i === crumbs.length - 1 ? 700 : 400,
                  color: i === crumbs.length - 1 ? '#f0f4ff' : 'rgba(141,160,200,0.45)',
                  letterSpacing: i === crumbs.length - 1 ? '0.08em' : '0',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <SyncIndicator />

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
