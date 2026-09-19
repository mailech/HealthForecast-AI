import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiSun, FiMoon, FiUser, FiSettings, FiLogOut,
  FiMenu, FiSearch, FiX, FiAlertCircle, FiInfo, FiCheckCircle,
  FiChevronDown, FiCalendar, FiClock, FiActivity, FiArrowRight, FiFileText,
  FiLoader, FiLayers
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import api from '../../services/api';

const ROLE_COLORS = {
  doctor:         'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900',
  hospital_admin: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900',
  researcher:     'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900',
  system_admin:   'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
};

const ROLE_LABELS = {
  doctor:         'Doctor',
  hospital_admin: 'Hospital Administrator',
  researcher:     'Researcher',
  system_admin:   'System Administrator',
  admin:          'Hospital Administrator',
  sysadmin:       'System Administrator',
};

const NOTIF_ICONS = {
  high_risk:   <FiAlertCircle className="text-rose-600 dark:text-rose-400 flex-shrink-0" size={15} />,
  critical:    <FiAlertCircle className="text-rose-600 dark:text-rose-400 flex-shrink-0" size={15} />,
  appointment: <FiCalendar className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={15} />,
  reminder:    <FiClock className="text-teal-600 dark:text-teal-400 flex-shrink-0" size={15} />,
  report:      <FiFileText className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={15} />,
  success:     <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={15} />,
  info:        <FiInfo className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={15} />,
};

const SEARCH_CATEGORY_ICONS = {
  patient:     <FiUser className="text-blue-600 dark:text-blue-400" size={14} />,
  appointment: <FiCalendar className="text-teal-600 dark:text-teal-400" size={14} />,
  prediction:  <FiActivity className="text-purple-600 dark:text-purple-400" size={14} />,
  report:      <FiFileText className="text-emerald-600 dark:text-emerald-400" size={14} />,
  treatment:   <FiLayers className="text-indigo-600 dark:text-indigo-400" size={14} />,
};

export default function Navbar({ onMenuClick }) {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchVal,   setSearchVal]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);
  const searchTimeoutRef = useRef(null);

  const userRoleKey = user?.role?.toString().toLowerCase().replace(/\s+/g, '_') || '';
  const formattedRole = ROLE_LABELS[userRoleKey] || user?.role || 'Healthcare Professional';
  const userName = user?.full_name || user?.name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  /* Fetch real notifications from backend */
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const items = await notificationService.getAll();
      setNotifications(items);
      const count = items.filter(n => !n.is_read).length;
      setUnread(count);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  /* Global Search Execution */
  useEffect(() => {
    const query = searchVal.trim();
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchDropdownOpen(false);
      return;
    }

    setSearchDropdownOpen(true);
    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.get(`/search/?q=${encodeURIComponent(query)}`);
        setSearchResults(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.warn('Search query error:', err?.message || err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchVal]);

  /* Close menus on outside click */
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  /* Mark single notification as read & view detail */
  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
      await notificationService.markAsRead(notif.id);
    }
    setNotifOpen(false);
    setSelectedNotif(notif);
  };

  /* Mark all as read */
  const handleMarkAllRead = async () => {
    if (unread === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnread(0);
    await notificationService.markAllAsRead();
  };

  /* Navigate from detail modal */
  const handleDetailAction = (route) => {
    setSelectedNotif(null);
    if (route) navigate(route);
  };

  /* Navigate from search result */
  const handleSearchResultClick = (item) => {
    setSearchDropdownOpen(false);
    setSearchVal('');
    setSearchOpen(false);
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 w-full flex items-center justify-between px-4 sm:px-6
        bg-white/95 dark:bg-slate-900/95 backdrop-blur-md
        border-b border-slate-200/90 dark:border-slate-800
        shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-colors">

        {/* ── LEFT SIDE: Mobile Toggle & Global Search Bar ── */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile menu toggle */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors flex-shrink-0"
            aria-label="Open Sidebar Menu"
          >
            <FiMenu size={20} />
          </motion.button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center w-full relative" ref={searchRef}>
            <div className="relative w-full">
              <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search patients, appointments, predictions, reports..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onFocus={() => { if (searchVal.trim()) setSearchDropdownOpen(true); }}
                className="w-full h-9 pl-9 pr-8 text-xs bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-blue-400 dark:focus:border-blue-600 rounded-xl
                  text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all shadow-xs"
              />
              {searchVal && (
                <button
                  onClick={() => { setSearchVal(''); setSearchResults([]); setSearchDropdownOpen(false); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  aria-label="Clear Search"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown (Desktop) */}
            <AnimatePresence>
              {searchDropdownOpen && searchVal.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-11 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden max-h-[75vh]"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-400 tracking-wider">
                    <span>SEARCH RESULTS</span>
                    {isSearching && <FiLoader className="animate-spin text-blue-600 dark:text-blue-400" size={12} />}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {isSearching && searchResults.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <FiLoader className="animate-spin text-blue-600 dark:text-blue-400" size={14} />
                        <span>Searching database…</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No results found for &ldquo;{searchVal}&rdquo;
                      </div>
                    ) : (
                      searchResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSearchResultClick(item)}
                          className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 mt-0.5 flex-shrink-0">
                            {SEARCH_CATEGORY_ICONS[item.category] || <FiActivity className="text-blue-600 dark:text-blue-400" size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT SIDE ACTIONS (Far Right Aligned) ── */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">

          {/* Search Toggle (mobile) */}
          <button
            onClick={() => setSearchOpen(o => !o)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            aria-label="Toggle search"
          >
            <FiSearch size={18} />
          </button>

          {/* 1. Theme Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            <AnimatePresence mode="wait">
              {darkMode
                ? <motion.span key="sun"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} className="block"><FiSun size={18} className="text-amber-400" /></motion.span>
                : <motion.span key="moon" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }} className="block"><FiMoon size={18} /></motion.span>
              }
            </AnimatePresence>
          </motion.button>

          {/* 2. Notification Bell */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
              className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              aria-label="View Notifications"
            >
              <FiBell size={18} />
              {unread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[9px] rounded-full flex items-center justify-center font-extrabold leading-none border-2 border-white dark:border-slate-900 shadow-xs"
                >
                  {unread}
                </motion.span>
              )}
            </motion.button>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden max-h-[80vh]"
                >
                  
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
                    <div className="flex items-center gap-2">
                      <FiBell size={14} className="text-slate-900 dark:text-slate-100" />
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                      {unread > 0 && (
                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none">
                          {unread}
                        </span>
                      )}
                    </div>
                    <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                      <FiX size={14} />
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <FiCheckCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={24} />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No new notifications</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">You're all caught up.</p>
                      </div>
                    ) : (
                      notifications.map((n, i) => {
                        const isUnread = !n.is_read;
                        return (
                          <div
                            key={n.id || i}
                            onClick={() => handleNotificationClick(n)}
                            className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left
                              ${isUnread ? 'bg-slate-100/60 dark:bg-slate-800/40' : 'bg-white dark:bg-slate-900'}`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5">{NOTIF_ICONS[n.type] || NOTIF_ICONS.info}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate">
                                    {n.title}
                                  </p>
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 font-medium">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
                    <button
                      onClick={handleMarkAllRead}
                      disabled={unread === 0}
                      className={`text-xs font-semibold w-full text-center transition-colors ${
                        unread === 0
                          ? 'text-slate-400 dark:text-slate-500 cursor-default'
                          : 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                      }`}
                    >
                      {unread === 0 ? 'All notifications read' : 'Mark all as read'}
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Vertical Divider Line */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* 4. User Profile & Rightmost Dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
              className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm shadow-blue-500/20 flex-shrink-0 border border-white/20">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight whitespace-nowrap">
                  {userName.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {formattedRole}
                </p>
              </div>
              <FiChevronDown size={14} className={`text-slate-400 transition-transform duration-200 hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            {/* Right-Aligned Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-extrabold shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900 mt-1">
                          {formattedRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                        <FiUser size={14} />
                      </div>
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                        <FiSettings size={14} />
                      </div>
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 py-1.5 bg-slate-50/30 dark:bg-slate-900">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <FiLogOut size={14} />
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* ── Mobile Search Bar (Expands Below Header) ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 right-0 px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 md:hidden z-50"
            >
              <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                <FiSearch size={14} className="text-slate-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search patients, appointments, predictions, reports..."
                  className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none"
                />
                {searchVal && (
                  <button onClick={() => setSearchVal('')} className="text-slate-400 hover:text-slate-600">
                    <FiX size={13} />
                  </button>
                )}
              </div>

              {/* Mobile Search Results */}
              {searchVal.trim() && (
                <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {isSearching && searchResults.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">Searching…</div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">No results found</div>
                  ) : (
                    searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSearchResultClick(item)}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center gap-2.5"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                          {SEARCH_CATEGORY_ICONS[item.category] || <FiActivity className="text-blue-600 dark:text-blue-400" size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.subtitle}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Real Notification Detail Modal ── */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
            >
              <button
                onClick={() => setSelectedNotif(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiX size={18} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  {NOTIF_ICONS[selectedNotif.type] || <FiInfo className="text-blue-600" size={20} />}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{selectedNotif.title}</h4>
                  <p className="text-xs text-slate-400">{selectedNotif.time}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-5 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedNotif.message}</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Close
                </button>
                {selectedNotif.route && (
                  <button
                    onClick={() => handleDetailAction(selectedNotif.route)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <span>View Details</span>
                    <FiArrowRight size={13} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
