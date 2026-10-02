import { NavLink } from 'react-router-dom';
import { X, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Painel', path: '/dashboard' },
  { name: 'Ranking', path: '/ranked' },
  { name: 'Amistosos', path: '/friendlies' },
  { name: 'Federações', path: '/orgs' },
  { name: 'Recrutamento', path: '/recruitment' },
  { name: 'Fantasy', path: '/fantasy' },
  { name: 'Regulamentos', path: '/regulamentos' },
];

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const { profile, signOut, isAdmin, isSuperAdmin } = useAuth();
  const accountName = profile?.display_name || profile?.gamertag || 'Conta';
  const accountCargo = profile?.cargo || (isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : '');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[#0B1430]/40 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-screen w-60 bg-white border-r border-[#E3E7EF] flex flex-col transition-transform duration-200',
        !isOpen && '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#E3E7EF]">
          <img src="/brand/logo-symbol.png" alt="" style={{ height: 36, width: 'auto' }} />
          <button className="lg:hidden text-[#3A4566]" onClick={() => setIsOpen(false)} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                'block px-3 py-2 rounded-sm text-sm font-semibold',
                isActive ? 'bg-[#F4F6FA] text-[#0A2560]' : 'text-[#3A4566] hover:bg-[#F4F6FA]'
              )}
            >
              {item.name}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => cn(
                'block px-3 py-2 mt-4 rounded-sm text-sm font-semibold',
                isActive ? 'bg-[#F4F6FA] text-[#0A2560]' : 'text-[#3A4566] hover:bg-[#F4F6FA]'
              )}
            >
              Admin
            </NavLink>
          )}
        </nav>
        <div className="p-4 border-t border-[#E3E7EF]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#F4F6FA] border border-[#E3E7EF] overflow-hidden flex items-center justify-center">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-[#3A4566]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#2A3555] truncate">{accountName}</p>
              {accountCargo ? <p className="text-[11px] text-[#0B4DA2] truncate">{accountCargo}</p> : null}
              <button onClick={signOut} className="text-xs text-[#3A4566] hover:text-[#0A2560] flex items-center mt-1">
                <LogOut className="h-3 w-3 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};