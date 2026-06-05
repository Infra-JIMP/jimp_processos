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
            padding: '9px 10px', borderRadius: '10px',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            transition: 'background 0.15s ease',
            background: isActive
              ? 'linear-gradient(135deg, rgba(255,107,53,0.14) 0%, rgba(255,107,53,0.05) 100%)'
              : 'transparent',
            border: isActive
              ? '1px solid rgba(255,107,53,0.2)'
              : '1px solid transparent',
            marginBottom: isBottom ? '0' : '2px',
          }}
          onMouseEnter={e => {
            if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(76,110,245,0.07)';
          }}
          onMouseLeave={e => {
            if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
          }}
        >
          {/* Active bar */}
          {isActive && (
            <div style={{
              position: 'absolute', left: 0, top: '25%', bottom: '25%', width: '2.5px',
              borderRadius: '0 2px 2px 0',
              background: 'linear-gradient(180deg, #ff6b35, #ffa552)',
            }} />
          )}

          {/* Icon */}
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isActive ? 'rgba(255,107,53,0.15)' : 'rgba(76,110,245,0.07)',
            border: `1px solid ${isActive ? 'rgba(255,107,53,0.2)' : 'rgba(76,110,245,0.1)'}`,
            transition: 'all 0.15s ease',
          }}>
            <Icon size={14} color={isActive ? '#ff8c42' : '#748ffc'} />
          </div>

          {/* Text */}
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontSize: '13px', fontWeight: 600,
              color: isActive ? '#ffa552' : 'rgba(255,255,255,0.85)',
              lineHeight: 1.2, letterSpacing: '0.01em',
            }}>
              {label}
            </p>
            <p style={{
              fontSize: '10px', color: 'rgba(141,160,200,0.4)',
              marginTop: '1px', letterSpacing: '0.02em',
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
          style={{ background: 'rgba(10,25,45,0.85)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col lg:static lg:z-auto lg:translate-x-0 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: '220px', flexShrink: 0,
          background: '#0f2d4a',
          borderRight: '1px solid rgba(76,110,245,0.1)',
        }}
      >
        {/* Logo */}
        <div style={{
          padding: '18px 16px 16px',
          borderBottom: '1px solid rgba(76,110,245,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: 'rgba(255,107,53,0.12)',
              border: '1px solid rgba(255,107,53,0.2)',
              boxShadow: '0 0 20px rgba(255,107,53,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, padding: '3px',
            }}>
              <Logo size={26} />
            </div>
            <div>
              <p className="font-display" style={{ fontSize: '18px', color: '#f0f4ff', lineHeight: 1, letterSpacing: '0.06em' }}>
                GERENCIAL
              </p>
              <p style={{ fontSize: '9px', color: '#4c6ef5', letterSpacing: '0.18em', marginTop: '2px', fontWeight: 600 }}>
                IMPLEMENTOS
              </p>
            </div>
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '16px 16px 6px' }}>
          <span style={{
            fontSize: '9px', letterSpacing: '0.22em',
            color: 'rgba(116,143,252,0.35)', fontWeight: 700,
          }}>
            NAVEGAÇÃO
          </span>
        </div>

        {/* Main nav */}
        <nav style={{ flex: 1, padding: '0 8px' }}>
          {navItems.map(item => (
            <SidebarNavItem key={item.to} {...item} onClose={onClose} />
          ))}
        </nav>

        {/* Bottom nav */}
        <div style={{
          padding: '8px 8px 8px',
          borderTop: '1px solid rgba(76,110,245,0.08)',
        }}>
          {bottomItems.map(item => (
            <SidebarNavItem key={item.to} {...item} onClose={onClose} isBottom />
          ))}
        </div>

      </aside>
    </>
  );
}
