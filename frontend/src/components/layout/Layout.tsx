import { ReactNode, useState, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Building2, Globe, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useCity } from '@/contexts/CityContext';
import { cn } from '@/lib/utils';

export function Layout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const { cities, activeCityId, setActiveCityId } = useCity();
    const [showCityMenu, setShowCityMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const activeCity = cities.find(c => c.id === activeCityId);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowCityMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('activeCityId');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Header */}
                <header className="lg:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-50 gap-3">
                    {/* Brand */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-black text-slate-800 tracking-tight">FollowTracker</span>
                    </div>

                    {/* City Switcher */}
                    {cities.length > 0 && (
                        <div className="relative flex-1 max-w-[160px]" ref={menuRef}>
                            <button
                                onClick={() => setShowCityMenu(o => !o)}
                                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700"
                            >
                                <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate flex-1 text-left">{activeCity?.name || 'Select'}</span>
                                <ChevronDown className={cn("h-3 w-3 flex-shrink-0 transition-transform", showCityMenu && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {showCityMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 overflow-hidden min-w-[150px]"
                                    >
                                        {cities.map(city => (
                                            <button
                                                key={city.id}
                                                onClick={() => { setActiveCityId(city.id); setShowCityMenu(false); }}
                                                className={cn(
                                                    "w-full text-left px-3 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors",
                                                    city.id === activeCityId
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "hover:bg-slate-50 text-slate-700"
                                                )}
                                            >
                                                <span className={cn("h-4 w-4 flex-shrink-0", city.id !== activeCityId && "invisible")}>
                                                    <Check className="h-4 w-4 text-blue-600" />
                                                </span>
                                                {city.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-1.5 font-bold h-9 flex-shrink-0"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-[10px] uppercase tracking-tighter hidden sm:block">Logout</span>
                    </Button>
                </header>

                <main className="flex-1 overflow-x-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl pt-4 md:pt-10 pb-36 lg:pb-8"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden">
                <MobileNav />
            </div>
        </div>
    );
}
