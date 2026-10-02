import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const links = [
  { label: 'Campeonatos', href: '/tournaments-public' },
  { label: 'Times', href: '/teams-public' },
  { label: 'Jogadores', href: '/players-public' },
  { label: 'Mercado', href: '/transfers' },
];

export function TopBar({ onMenu }: { onMenu?: () => void }) {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="cb-bar sticky top-0 z-50 bg-[#0A2560] text-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        {onMenu && (
          <button type="button" onClick={onMenu} className="cb-on-ink lg:hidden" aria-label="Abrir menu">
            <Menu size={22} />
          </button>
        )}
        <Link to="/" className="shrink-0 flex items-center py-2 pr-2" aria-label="CBPRO">
          <img src="/brand/logo-lockup-white.png" alt="CBPRO" style={{ height: 40, width: 'auto' }} />
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-[13px] font-semibold">
          {links.map((item) => (
            <Link key={item.href} to={item.href} className="cb-on-ink hover:underline underline-offset-4">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden md:flex items-center gap-4 text-[13px] font-semibold">
          {user ? (
            <>
              <Link to="/dashboard" className="cb-on-ink">Painel</Link>
              {isAdmin && <Link to="/admin" className="cb-on-ink">Admin</Link>}
              <button type="button" onClick={signOut} className="cb-on-ink">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="cb-on-ink">Entrar</Link>
              <Link to="/signup" className="cb-signup px-3 py-1.5 rounded-sm" style={{ background: "#FFFFFF", color: "#0A2560" }}>Criar conta</Link>
            </>
          )}
        </div>
        <button type="button" className="cb-on-ink md:hidden ml-auto" onClick={() => setOpen((v) => !v)} aria-label="Links">
          <Menu size={22} />
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/15 px-4 py-3 flex flex-col gap-3 text-sm font-semibold">
          {links.map((item) => (
            <Link key={item.href} to={item.href} className="cb-on-ink" onClick={() => setOpen(false)}>{item.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="cb-on-ink" onClick={() => setOpen(false)}>Painel</Link>
              {isAdmin && <Link to="/admin" className="cb-on-ink" onClick={() => setOpen(false)}>Admin</Link>}
              <button type="button" onClick={signOut} className="cb-on-ink text-left">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="cb-on-ink" onClick={() => setOpen(false)}>Entrar</Link>
              <Link to="/signup" className="cb-signup px-3 py-1.5 rounded-sm self-start" style={{ background: "#FFFFFF", color: "#0A2560" }} onClick={() => setOpen(false)}>Criar conta</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ setSidebarOpen }: HeaderProps) => {
  return <TopBar onMenu={() => setSidebarOpen(true)} />;
};