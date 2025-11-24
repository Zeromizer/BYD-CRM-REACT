import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import './Layout.css';

export function Layout() {
  const { consultant, signOut, isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Outlet />;
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <span className="logo-main">BYD</span>
            <span className="logo-subtitle">MOTOR-EAST</span>
          </div>
          <nav className="header-nav">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Customers
            </NavLink>
            <NavLink
              to="/forms"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Forms
            </NavLink>
            <NavLink
              to="/excel"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              Excel
            </NavLink>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-info">
            {consultant?.picture && (
              <img
                src={consultant.picture}
                alt={consultant.name}
                className="user-avatar"
              />
            )}
            <span className="user-name">{consultant?.name}</span>
          </div>
          <button className="btn-signout" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
