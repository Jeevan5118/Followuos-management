import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/analytics', label: 'Stats', icon: TrendingUp },
    { href: '/follow-ups', label: 'Outreach', icon: ListChecks },
    { href: '/college-drive', label: 'Drives', icon: Calendar },
];

export function MobileNav() {
    const location = useLocation();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t px-2 pb-safe">
            <nav className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 py-1 transition-colors relative",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute -top-1 w-8 h-1 bg-primary rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={cn("h-5 w-5 mb-1", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-medium tracking-tight uppercase">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
