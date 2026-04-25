import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, LogOut, BellRing, UserPlus, Building2, Calendar, TrendingUp, Globe, ChevronDown, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCity } from '@/contexts/CityContext';
import api from '@/lib/api';

const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/add-college', label: 'Add College', icon: Building2 },
    { href: '/add-person', label: 'Add Person', icon: UserPlus },
    { href: '/follow-ups', label: 'Follow-ups', icon: ListChecks },
    { href: '/college-drive', label: 'College Drive', icon: Calendar },
    { href: '/reminders', label: 'Reminders', icon: BellRing },
];

export function Sidebar() {
    const location = useLocation();
    const { cities, activeCityId, setActiveCityId, fetchCities } = useCity();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [addingCity, setAddingCity] = useState(false);
    const [newCityName, setNewCityName] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const activeCity = cities.find(c => c.id === activeCityId);

    const handleAddCity = async () => {
        const name = newCityName.trim();
        if (!name) return;
        try {
            await api.post('/cities', { name });
            await fetchCities();
            setNewCityName('');
            setAddingCity(false);
        } catch {
            alert('City already exists or failed to add.');
        }
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <aside className="w-64 border-r bg-card/40 backdrop-blur-2xl h-screen sticky top-0 flex flex-col p-4 z-40 bg-white/50 dark:bg-slate-900/50">
            {/* Logo */}
            <div className="mb-4 px-4 py-5">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight text-foreground">
                            FollowTracker
                        </h1>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-0.5">CRM Platform</p>
                    </div>
                </Link>
            </div>

            {/* City Switcher */}
            {cities.length > 0 && (
                <div className="px-2 mb-5" ref={dropdownRef}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 px-2">Active City</p>
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(o => !o)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-sm font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                            <Globe className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">{activeCity?.name || 'Select City'}</span>
                            <ChevronDown className={cn("h-4 w-4 flex-shrink-0 transition-transform", dropdownOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                                >
                                    {cities.map(city => (
                                        <button
                                            key={city.id}
                                            onClick={() => { setActiveCityId(city.id); setDropdownOpen(false); setAddingCity(false); }}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2",
                                                city.id === activeCityId
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                            )}
                                        >
                                            <span className={cn("h-4 w-4 flex-shrink-0", city.id !== activeCityId && "invisible")}>
                                                <Check className="h-4 w-4 text-blue-600" />
                                            </span>
                                            {city.name}
                                        </button>
                                    ))}
                                    <div className="border-t border-slate-100 dark:border-slate-800">
                                        {addingCity ? (
                                            <div className="p-2 flex gap-1">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="City name..."
                                                    value={newCityName}
                                                    onChange={e => setNewCityName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddCity()}
                                                    className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                                <button onClick={handleAddCity} className="px-2 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-bold">Add</button>
                                                <button onClick={() => setAddingCity(false)} className="px-2 py-1.5 text-slate-500 text-xs rounded-lg">✕</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setAddingCity(true)}
                                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Add New City
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300",
                                isActive
                                    ? "text-blue-700 bg-blue-50"
                                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active-pill"
                                    className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon className={cn("h-5 w-5 relative z-10 transition-transform group-hover:scale-110", isActive && "text-blue-600")} />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="mt-auto border-t pt-4">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        localStorage.removeItem('activeCityId');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                >
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <LogOut className="h-4 w-4" />
                    </div>
                    Logout
                </button>
            </div>
        </aside>
    );
}
