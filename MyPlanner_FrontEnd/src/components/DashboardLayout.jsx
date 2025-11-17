import React, { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Layout condiviso per le pagine della dashboard (home e impostazioni).
 *
 * Gestisce sidebar, header e struttura principale.
 */
const DashboardLayout = ({
  activeNav = 'dashboard',
  onNavigate,
  title,
  subtitle,
  headerActions = null,
  children,
  floatingAction = null,
}) => {
  const { user, logout } = useAuth();
  const { accentColor, accentForeground } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Calendario' },
    { id: 'team', label: 'Team', disabled: true },
    { id: 'settings', label: 'Impostazioni' },
  ];

  const handleNavClick = (item) => {
    if (item.disabled) {
      return;
    }
    onNavigate?.(item.id);
    setSidebarOpen(false);
  };

  const renderNavButton = (item) => {
    const isActive = activeNav === item.id;
    const baseClasses =
      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors';
    const activeClasses = 'bg-dash-bg text-dash-primary font-medium';
    const inactiveClasses =
      'text-dash-muted hover:bg-dash-bg hover:text-dash-primary';

    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        disabled={item.disabled}
      >
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-dash-bg flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-72 bg-dash-card shadow-dash border-r border-dash-border
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col p-6 gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full bg-dash-bg flex items-center justify-center text-2xl font-semibold border-2"
                style={{ borderColor: accentColor, color: accentForeground }}
              >
                {user?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm text-dash-muted">Benvenuto</p>
                <p className="text-lg font-semibold">{user}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-dash-muted hover:text-dash-primary"
            >
              <Menu size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-3">
            {navItems.map(renderNavButton)}
          </nav>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 px-4 py-3 text-dash-muted border border-dash-border rounded-xl hover:text-red-500 hover:border-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-72">
        <header
          className="shadow-dash border-b border-dash-border px-6 py-5 flex items-center justify-between gap-4"
          style={{ backgroundColor: accentColor, color: accentForeground }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-full border"
              style={{
                borderColor: accentForeground === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : accentColor,
                color: accentForeground,
              }}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p
                className="text-sm"
                style={{
                  color:
                    accentForeground === '#FFFFFF'
                      ? 'rgba(255,255,255,0.8)'
                      : 'rgba(30,30,47,0.7)',
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>

          {headerActions}
        </header>

        <main className="flex-1 overflow-hidden px-4 sm:px-6 pb-10">
          {children}
        </main>
      </div>

      {floatingAction}
    </div>
  );
};

export default DashboardLayout;

