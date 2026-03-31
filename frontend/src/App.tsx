import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { FeedPage } from './pages/FeedPage';
import { TweetPage } from './pages/TweetPage';
import { LoginPage, RegisterPage } from './pages/AuthPage';
import { useAuth } from './context/AuthContext';

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-x-gray-50">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="sticky top-0 z-20 bg-x-black/80 backdrop-blur-md border-b border-x-border">
      <div className="flex items-center justify-between px-4 h-[53px]">
        <Link to="/">
          <XLogo />
        </Link>
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${user?.username}`}
                alt={user?.username}
                className="w-8 h-8 rounded-full bg-x-gray-500"
              />
              <span className="text-[15px] text-x-gray-300">@{user?.username}</span>
            </div>
            <button onClick={logout} className="text-[15px] text-x-gray-300 hover:text-x-gray-50 transition-colors">
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-[15px] text-x-gray-50 hover:text-x-gray-100 transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="bg-x-gray-50 text-x-black font-bold text-[15px] rounded-full px-4 py-1.5 hover:bg-x-gray-100 transition-colors">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto border-x border-x-border min-h-screen">
      <Header />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/:username/status/:id" element={<TweetPage />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
