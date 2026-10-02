import { Link, Outlet } from 'react-router-dom';
import { TopBar } from './Header';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#2A3555]">
      <TopBar />
      <Outlet />
      <footer className="border-t border-[#E3E7EF] mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap gap-4 text-xs text-[#3A4566]">
          <span>CBPRO · Circuito Brasileiro Profissional</span>
          <Link to="/regulamentos" className="hover:text-[#0A2560]">Regulamentos</Link>
          <Link to="/privacy" className="hover:text-[#0A2560]">Privacidade</Link>
          <Link to="/friendlies" className="hover:text-[#0A2560]">Amistosos</Link>
          <Link to="/orgs" className="hover:text-[#0A2560]">Federações</Link>
          <Link to="/recruitment" className="hover:text-[#0A2560]">Recrutamento</Link>
        </div>
      </footer>
    </div>
  );
};