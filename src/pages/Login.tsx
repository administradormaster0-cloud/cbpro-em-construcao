import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E3E7EF] rounded-md p-8">
        <img src="/brand/logo-symbol.png" alt="" style={{ height: 40, width: 'auto' }} />
        <h1 className="text-3xl text-[#0A2560] mt-4">Entrar</h1>
        <p className="text-sm text-[#3A4566] mt-1">Bem-vindo de volta ao circuito.</p>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm p-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold text-[#2A3555]">Senha</label>
              <Link to="/reset-password" className="text-xs font-semibold text-[#0B4DA2]">Esqueceu a senha?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#DCE2EC] rounded-sm px-3 py-2.5 text-[#2A3555] focus:outline-none focus:border-[#0B4DA2]"
            />
          </div>
          <button type="submit" disabled={loading} className="cb-btn w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#3A4566]">
          Não tem uma conta?{' '}
          <Link to="/signup" className="font-semibold text-[#0A2560]">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;