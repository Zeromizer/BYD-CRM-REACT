import { Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import './Layout.css';

export function Layout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Outlet />;
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <span className="logo-main">BYD</span>
            <span className="logo-divider">|</span>
            <span className="logo-subtitle">MOTOR-EAST</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-connected">
            Connected
          </button>
          <button className="btn-menu">⋮</button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
