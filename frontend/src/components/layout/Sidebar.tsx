import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, LogOut, BellRing, UserPlus, Building2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/add-college', label: 'Add College', icon: Building2 },
    { href: '/add-person', label: 'Add Person', icon: UserPlus },
    { href: '/follow-ups', label: 'Follow-ups', icon: ListChecks },
    { href: '/college-drive', label: 'College Drive', icon: Calendar },
    { href: '/reminders', label: 'Reminders', icon: BellRing },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 border-r bg-card/40 backdrop-blur-2xl h-screen sticky top-0 flex flex-col p-4 z-40 bg-white/50 dark:bg-slate-900/50">
            <div className="mb-10 px-4 py-6">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            CRM Pro
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest leading-none mt-1">College Outreach</p>
                    </div>
                </Link>
            </div>

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
                                    ? "text-primary bg-primary/5 shadow-inner"
                                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-foreground"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active-pill"
                                    className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon className={cn("h-5 w-5 relative z-10 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t pt-4">
                <button
                    onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-destructive/20">
                        <LogOut className="h-4 w-4" />
                    </div>
                    Logout
                </button>
            </div>
        </aside>
    );
}
