import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';
import { LOGIN, REGISTER } from '../graphql/operations';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  return <AuthForm mode="login" />;
}

export function RegisterPage() {
  return <AuthForm mode="register" />;
}

function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER);

  const loading = loginLoading || registerLoading;
  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        const { data } = await registerMutation({
          variables: { input: { username, email, password } },
        });
        setAuth(data.register.accessToken, data.register.user);
      } else {
        const { data } = await loginMutation({
          variables: { input: { email, password } },
        });
        setAuth(data.login.accessToken, data.login.user);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-[364px]">
        {/* X Logo */}
        <div className="flex justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-x-gray-50">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        <h1 className="text-[31px] font-extrabold leading-9 mb-7">
          {isRegister ? 'Create your account' : 'Sign in to X'}
        </h1>

        <div className="space-y-3">
          {isRegister && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              minLength={3}
              className="w-full bg-x-black border border-x-gray-500 rounded text-[17px] px-3 py-4 text-x-gray-50 placeholder:text-x-gray-300 focus:outline-none focus:border-x-blue"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-x-black border border-x-gray-500 rounded text-[17px] px-3 py-4 text-x-gray-50 placeholder:text-x-gray-300 focus:outline-none focus:border-x-blue"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full bg-x-black border border-x-gray-500 rounded text-[17px] px-3 py-4 text-x-gray-50 placeholder:text-x-gray-300 focus:outline-none focus:border-x-blue"
          />
        </div>

        {error && (
          <div className="mt-3 text-[#f4212e] text-[15px]">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-x-gray-50 hover:bg-x-gray-100 disabled:opacity-50 text-x-black font-bold rounded-full py-3 text-[17px] transition-colors"
        >
          {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>

        <p className="mt-10 text-x-gray-300 text-[15px]">
          {isRegister ? (
            <>Have an account already? <Link to="/login" className="text-x-blue hover:underline">Sign in</Link></>
          ) : (
            <>Don't have an account? <Link to="/register" className="text-x-blue hover:underline">Sign up</Link></>
          )}
        </p>

        {/* Demo hint */}
        {!isRegister && (
          <div className="mt-6 border border-x-border rounded-2xl p-4">
            <p className="text-x-gray-300 text-13 mb-1">Demo accounts:</p>
            <p className="text-x-gray-200 text-13 font-mono">alice@example.com / password123</p>
            <p className="text-x-gray-200 text-13 font-mono">bob@example.com / password123</p>
          </div>
        )}
      </div>
    </div>
  );
}
