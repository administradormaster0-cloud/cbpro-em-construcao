import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Signup = () => {
  const [gamertag, setGamertag] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!terms) {
      setError('Você precisa aceitar os termos de uso.');
      return;
    }

    const { error: signUpError } = await signUp(email, password, gamertag);
    if (signUpError) {
      setError(signUpError.message);
    } else {
      navigate('/login?registered=true');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E3E7EF] rounded-md p-8">
        <img src="/brand/logo-symbol.png" alt="" style={{ height: 40, width: 'auto' }} />
        <h1 className="text-3xl text-[#0A2560] mt-4">Criar conta</h1>
        <p className="text-sm text-[#3A4566] mt-1">Entre para o Circuito Brasileiro Profissional.</p>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm p-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-semibold text-[#2A3555] mb-1.5">Gamertag</label>
            <input
              type="text"
              required
              value={gamertag}
              onChange={(e) => setGamertag(e.target.value)}
              className="w-full bg-white border border-[#DCE2EC] rounded-sm px-3 py-2.5 text-[#2A3555] focus:outline-none focus:border-[#0B4DA2]"
              placeholder="Sua PSN ID / Xbox Live / Origin"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2A3555] mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#DCE2EC] rounded-sm px-3 py-2.5 text-[#2A3555] focus:outline-none focus:border-[#0B4DA2]"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2A3555] mb-1.5">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#DCE2EC] rounded-sm px-3 py-2.5 text-[#2A3555] focus:outline-none focus:border-[#0B4DA2]"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 w-4 h-4"
            />
            <label htmlFor="terms" className="ml-3 text-sm text-[#3A4566]">
              Eu aceito os <a href="#" className="text-[#0A2560] font-semibold">Termos de Uso</a> e a <a href="#" className="text-[#0A2560] font-semibold">Política de Privacidade</a>
            </label>
          </div>
          <button type="submit" disabled={loading} className="cb-btn w-full">
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#3A4566]">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-semibold text-[#0A2560]">Faça login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;