import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, Warehouse } from 'lucide-react';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemDef {
  to: string;
  icon: React.ElementType;
  label: string;
  desc: string;
}

const navItems: NavItemDef[] = [
  { to: '/', icon: LayoutDashboard, label: 'Processos', desc: 'Visão geral' },
  { to: '/pat-ofic', icon: Warehouse, label: 'PAT / OFIC', desc: 'Pátio e Oficina' },
  { to: '/relatorios', icon: FileText, label: 'Relatórios', desc: 'Exportar PDF' },
];

const bottomItems: NavItemDef[] = [
  { to: '/importar', icon: Upload, label: 'Importar', desc: 'Planilha Excel' },
];

function SidebarNavItem({ to, icon: Icon, label, desc, onClose, isBottom = false }: NavItemDef & { onClose: () => void; isBottom?: boolean }) {
  return (
    <NavLink to={to} end={to === '/'} onClick={onClose} style={{ textDecoration: 'none', display: 'block' }}>
      {({ isActive }) => (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '9px',
            cursor: 'pointer', position: 'relative',
            transition: 'background 0.12s ease, border-color 0.12s ease',
            background: isActive ? 'rgba(255,107,53,0.1)' : 'transparent',
            border: isActive ? '1px solid rgba(255,107,53,0.18)' : '1px solid transparent',
            marginBottom: isBottom ? '0' : '1px',
          }}
          onMouseEnter={e => {
            if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
          }}
          onMouseLeave={e => {
            if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          {/* Active bar */}
          {isActive && (
            <div style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '2px',
              borderRadius: '0 2px 2px 0',
              background: 'linear-gradient(180deg, #ff6b35, #ffa552)',
            }} />
          )}

          {/* Icon */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isActive ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.06)'}`,
            transition: 'all 0.12s ease',
          }}>
            <Icon size={13} color={isActive ? '#ff8c42' : 'rgba(180,210,230,0.55)'} />
          </div>

          {/* Text */}
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              color: isActive ? '#ffc4a0' : 'rgba(220,235,245,0.8)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}>
              {label}
            </p>
            <p style={{
              fontSize: '10.5px',
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              color: isActive ? 'rgba(255,160,100,0.5)' : 'rgba(140,170,195,0.35)',
              marginTop: '1px',
              letterSpacing: '0',
              fontWeight: 400,
            }}>
              {desc}
            </p>
          </div>
        </div>
      )}
    </NavLink>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,20,30,0.75)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col lg:static lg:z-auto lg:translate-x-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '212px', flexShrink: 0,
          background: '#005060',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '16px 14px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,107,53,0.1)',
            border: '1px solid rgba(255,107,53,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Logo size={22} />
          </div>
          <div>
            <p className="font-display" style={{
              fontSize: '17px', color: '#e8f4ff',
              lineHeight: 1, letterSpacing: '0.05em',
            }}>
              GERENCIAL
            </p>
            <p style={{
              fontSize: '9px',
              fontFamily: "'Geist Mono', monospace",
              color: 'rgba(78,205,196,0.6)',
              letterSpacing: '0.2em', marginTop: '2px', fontWeight: 600,
            }}>
              IMPLEMENTOS
            </p>
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '14px 14px 5px' }}>
          <span style={{
            fontSize: '9px', letterSpacing: '0.2em',
            fontFamily: "'Geist Mono', monospace",
            color: 'rgba(140,170,195,0.3)', fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            MENU
          </span>
        </div>

        {/* Main nav */}
        <nav style={{ flex: 1, padding: '0 7px' }}>
          {navItems.map(item => (
            <SidebarNavItem key={item.to} {...item} onClose={onClose} />
          ))}
        </nav>

        {/* Bottom nav */}
        <div style={{
          padding: '8px 7px 10px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {bottomItems.map(item => (
            <SidebarNavItem key={item.to} {...item} onClose={onClose} isBottom />
          ))}
        </div>

      </aside>
    </>
  );
}
