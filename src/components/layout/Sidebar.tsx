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
            transition: 'background 0.12s ease',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            marginBottom: isBottom ? '0' : '1px',
          }}
          onMouseEnter={e => {
            if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={e => {
            if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          {/* Active bar */}
          {isActive && (
            <div style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '2.5px',
              borderRadius: '0 2px 2px 0',
              background: '#ff6b35',
            }} />
          )}

          {/* Icon */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'rgba(255,107,53,0.18)' : 'rgba(255,255,255,0.07)',
            transition: 'all 0.12s ease',
          }}>
            <Icon size={13} color={isActive ? '#ff8c42' : 'rgba(255,255,255,0.45)'} />
          </div>

          {/* Text */}
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
              lineHeight: 1.25,
            }}>
              {label}
            </p>
            <p style={{
              fontSize: '10.5px',
              fontFamily: "'DM Sans', 'Geist', sans-serif",
              color: isActive ? 'rgba(255,200,170,0.45)' : 'rgba(255,255,255,0.25)',
              marginTop: '1px', fontWeight: 400,
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
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col lg:static lg:z-auto lg:translate-x-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '210px', flexShrink: 0,
          background: '#1a2540',
          borderRight: '1px solid rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '16px 14px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(255,107,53,0.12)',
            border: '1px solid rgba(255,107,53,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Logo size={22} />
          </div>
          <div>
            <p className="font-display" style={{
              fontSize: '17px', color: '#ffffff',
              lineHeight: 1, letterSpacing: '0.05em',
            }}>
              GERENCIAL
            </p>
            <p style={{
              fontSize: '9px',
              fontFamily: "'Geist Mono', monospace",
              color: 'rgba(100,180,255,0.5)',
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
            color: 'rgba(255,255,255,0.2)', fontWeight: 600,
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
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {bottomItems.map(item => (
            <SidebarNavItem key={item.to} {...item} onClose={onClose} isBottom />
          ))}
        </div>
      </aside>
    </>
  );
}
