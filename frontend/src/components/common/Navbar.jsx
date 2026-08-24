import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiSun, FiMoon, FiUser, FiSettings, FiLogOut,
  FiMenu, FiSearch, FiX, FiAlertCircle, FiInfo, FiCheckCircle,
  FiChevronDown, FiGlobe,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { NOTIFICATIONS } from '../../data/dummyData';

const ROLE_COLORS = {
  doctor:        'bg-blue-100 text-blue-700 border-blue-200',
  hospital_admin:'bg-violet-100 text-violet-700 border-violet-200',
  researcher:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  system_admin:  'bg-orange-100 text-orange-700 border-orange-200',
};

const ROLE_LABELS = {
  doctor:        'Doctor',
  hospital_admin:'Hospital Admin',
  researcher:    'Researcher',
  system_admin:  'System Admin',
};

const NOTIF_ICONS = {
  critical: <FiAlertCircle className="text-red-500 flex-shrink-0" size={14} />,
  info:     <FiInfo className="text-blue-500 flex-shrink-0" size={14} />,
  success:  <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={14} />,
};

const LANGS = ['EN', 'FR', 'ES', 'DE'];

export default function Navbar({ onMenuClick }) {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [langOpen,    setLangOpen]    = useState(false);
  const [lang,        setLang]        = useState('EN');
  const [searchVal,   setSearchVal]   = useState('');

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const langRef    = useRef(null);
  const searchRef  = useRef(null);

  const unread = NOTIFICATIONS.filter(n => !n.read).length;
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  /* close on outside click */
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (langRef.current    && !langRef.current.contains(e.target))    setLangOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  { setSearchOpen(false); setSearchVal(''); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const closeAll = () => { setNotifOpen(false); setProfileOpen(false); setLangOpen(false); };

  const handleLogout = () => { logout(); navigate('/login'); };

  /* gradient per role */
  const avatarGrad = {
    doctor:        'from-blue-500 to-blue-700',
    hospital_admin:'from-violet-500 to-violet-700',
    researcher:    'from-emerald-500 to-emerald-700',
    system_admin:  'from-orange-400 to-orange-600',
  }[user?.role] || 'from-blue-500 to-blue-700';

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center px-4 gap-3
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      border-b border-slate-200/70 dark:border-slate-700/60
      shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">

      {/* ── Mobile menu ── */}
      <motion.button whileTap={{ scale: 0.92 }} onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0">
        <FiMenu size={20} />
      </motion.button>

      {/* ── Logo (desktop hidden — sidebar has it) ── */}
      <Link to="/" className="hidden lg:flex items-center gap-2.5 mr-2 flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
          <span className="text-white text-xs font-extrabold tracking-tight">HF</span>
        </div>
        <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base tracking-tight">
          HealthForecast <span className="text-blue-600">AI</span>
        </span>
      </Link>

      {/* ── Search bar (desktop) ── */}
      <div className="hidden md:flex flex-1 max-w-xs relative" ref={searchRef}>
        <div className={`flex items-center gap-2 w-full h-9 px-3 rounded-xl border transition-all duration-200
          ${searchOpen
            ? 'bg-white dark:bg-slate-800 border-blue-400 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]'
            : 'bg-slate-100 dark:bg-slate-800/60 border-transparent hover:border-slate-200 dark:hover:border-slate-600'
          }`}>
          <FiSearch size={14} className="text-slate-400 flex-shrink-0" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search patients, reports…"
            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none min-w-0"
          />
          {searchVal && (
            <button onClick={() => setSearchVal('')} className="text-slate-400 hover:text-slate-600 transition-colors">
              <FiX size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1">

        {/* Mobile search */}
        <motion.button whileTap={{ scale: 0.92 }}
          onClick={() => setSearchOpen(s => !s)}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
          <FiSearch size={18} />
        </motion.button>

        {/* Language */}
        <div className="relative hidden sm:block" ref={langRef}>
          <motion.button whileTap={{ scale: 0.92 }}
            onClick={() => { setLangOpen(o => !o); closeAll(); setLangOpen(true); }}
            className="flex items-center gap-1 h-9 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors text-xs font-semibold">
            <FiGlobe size={15} />
            <span className="hidden lg:block">{lang}</span>
          </motion.button>
          <AnimatePresence>
            {langOpen && (
              <motion.div initial={{ opacity:0, y:-6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-6, scale:0.97 }} transition={{ duration:0.13 }}
                className="absolute right-0 top-11 w-24 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden py-1">
                {LANGS.map(l => (
                  <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors
                      ${l === lang
                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                    {l}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark mode */}
        <motion.button whileTap={{ scale: 0.88 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title={darkMode ? 'Light mode' : 'Dark mode'}>
          <AnimatePresence mode="wait">
            {darkMode
              ? <motion.span key="sun"  initial={{ rotate:-90, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:90, opacity:0 }} transition={{ duration:0.18 }} className="block"><FiSun  size={18} /></motion.span>
              : <motion.span key="moon" initial={{ rotate:90,  opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-90, opacity:0 }} transition={{ duration:0.18 }} className="block"><FiMoon size={18} /></motion.span>
            }
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <motion.button whileTap={{ scale: 0.92 }}
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); setLangOpen(false); }}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
            <FiBell size={18} />
            {unread > 0 && (
              <motion.span initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:300 }}
                className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-extrabold leading-none border-2 border-white dark:border-slate-900">
                {unread}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
                className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <FiBell size={14} className="text-blue-600" />
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
                    {unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-extrabold rounded-full px-1.5 py-0.5 leading-none">{unread}</span>
                    )}
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                    <FiX size={14} />
                  </button>
                </div>
                {/* Items */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/60">
                  {NOTIFICATIONS.map((n, i) => (
                    <motion.div key={n.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer
                        ${!n.read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}>
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">{NOTIF_ICONS[n.type] || NOTIF_ICONS.info}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold w-full text-center transition-colors">
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setLangOpen(false); }}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-xs font-extrabold shadow-sm flex-shrink-0`}>
              {initials}
            </div>
            {/* Name + role */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight whitespace-nowrap">
                {user?.name?.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight capitalize font-medium">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>
            <FiChevronDown size={13} className={`text-slate-400 transition-transform duration-200 hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
                className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">

                {/* User header */}
                <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-white text-sm font-extrabold shadow-sm`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${ROLE_COLORS[user?.role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {ROLE_LABELS[user?.role] || user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link to="/profile" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <FiUser size={13} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <FiSettings size={13} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full">
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <FiLogOut size={13} className="text-red-500" />
                    </div>
                    <span className="font-semibold">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile search bar (expands below) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }} transition={{ duration:0.2 }}
            className="absolute top-16 left-0 right-0 px-4 py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 md:hidden z-50"
            ref={searchRef}>
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-blue-400 bg-white dark:bg-slate-800 shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
              <FiSearch size={14} className="text-slate-400 flex-shrink-0" />
              <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)}
                placeholder="Search patients, reports…"
                className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none" />
              {searchVal && (
                <button onClick={() => setSearchVal('')} className="text-slate-400 hover:text-slate-600">
                  <FiX size={13} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
