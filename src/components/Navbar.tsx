import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SystemNotification } from '../types';
import {
  Bell,
  GitBranch,
  LogOut,
  ShieldCheck,
  Building,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenFlowchart: () => void;
  onOpenLoginModal: (mode?: 'signin' | 'admin' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenFlowchart,
  onOpenLoginModal,
}) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchNotifs = async () => {
    try {
      if (user) {
        const list = await api.getNotifications();
        setNotifications(list);
      }
    } catch (err) {
      // Quiet ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      // Quiet
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: College & Platform Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('events')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="w-10 h-11 flex items-center justify-center p-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs group-hover:border-blue-400 transition-colors shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/ap1_3c1c1923.jpg"
                alt="APCOER Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                CampusConnect
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  APCOER
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                Anantrao Pawar College of Engineering & Research
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold">
          <button
            onClick={() => onSelectTab('events')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              currentTab === 'events'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Events
          </button>

          {user && user.role === 'student' && (
            <button
              onClick={() => onSelectTab('tickets')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
                currentTab === 'tickets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              My Passes
            </button>
          )}

          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <button
              onClick={() => onSelectTab('organizer')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
                currentTab === 'organizer'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Organizer Desk
            </button>
          )}

          <button
            onClick={() => onSelectTab('reports')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              currentTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Institutional Reports
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              currentTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>

          {/* Admin Panel Tab */}
          {user && user.role === 'admin' ? (
            <button
              onClick={() => onSelectTab('admin')}
              className={`whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-indigo-600 hover:text-indigo-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (user?.role === 'admin') {
                  onSelectTab('admin');
                } else {
                  onOpenLoginModal('admin');
                }
              }}
              className="text-slate-500 hover:text-indigo-700 transition-colors flex items-center gap-1"
              title="APCOER Administrator Access"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
              <span>Admin Portal</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 14-Step Flowchart Guide Button */}
          <button
            onClick={onOpenFlowchart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="View 14-Step System Architecture Diagram"
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden lg:inline">Flowchart Map</span>
          </button>

          {/* Notifications Bell (for logged in users) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Notifications</span>
                    <span className="text-[10px] text-slate-500">{notifications.length} total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkAsRead(n._id)}
                          className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="font-semibold text-slate-900 text-xs">{n.title}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile or Sign-In buttons */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium flex items-center justify-end gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                    user.role === 'admin' ? 'bg-indigo-600' : user.role === 'organizer' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`} />
                  {user.role === 'admin'
                    ? 'Administrator'
                    : user.role === 'organizer'
                    ? 'Organizer'
                    : 'Student'}
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Sign off from website"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Sign Off</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLoginModal('signin')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenLoginModal('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 text-xs font-medium">
          <div className="flex items-center gap-2.5 pb-2 mb-1 border-b border-slate-100">
            <img
              src="/assets/aistudio/ap1_3c1c1923.jpg"
              alt="APCOER Logo"
              className="w-8 h-9 object-contain rounded border border-slate-200 p-0.5"
            />
            <div>
              <div className="font-bold text-slate-900 text-xs">CampusConnect APCOER</div>
              <div className="text-[10px] text-slate-500">Anantrao Pawar College of Engg & Research</div>
            </div>
          </div>
          <button
            onClick={() => {
              onSelectTab('events');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              currentTab === 'events' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Events
          </button>

          {user && user.role === 'student' && (
            <button
              onClick={() => {
                onSelectTab('tickets');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                currentTab === 'tickets' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
              }`}
            >
              My Passes
            </button>
          )}

          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <button
              onClick={() => {
                onSelectTab('organizer');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                currentTab === 'organizer' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
              }`}
            >
              Organizer Desk
            </button>
          )}

          <button
            onClick={() => {
              onSelectTab('reports');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              currentTab === 'reports' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Institutional Reports
          </button>

          <button
            onClick={() => {
              onSelectTab('analytics');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg ${
              currentTab === 'analytics' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Analytics
          </button>

          <button
            onClick={() => {
              if (user?.role === 'admin') {
                onSelectTab('admin');
              } else {
                onOpenLoginModal('admin');
              }
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-1.5 ${
              currentTab === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-indigo-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Admin Panel
          </button>

          {/* User Sign Off & Mobile Auth Actions */}
          {user ? (
            <div className="pt-3 mt-2 border-t border-slate-200 space-y-2">
              <div className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-xs text-slate-900">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  {user.role === 'admin'
                    ? 'Principal / Chief Administrator'
                    : user.role === 'organizer'
                    ? `Organizer (${user.organizerType || 'Faculty'})`
                    : `Student (${user.prn || 'Registered'})`}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{user.email}</div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Off from Website</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 mt-2 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => {
                  onOpenLoginModal('signin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenLoginModal('register');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 text-center text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
