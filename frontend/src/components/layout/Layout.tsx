import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

export function Layout({ children }: { children: ReactNode }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Header - Clean Logout only */}
                <header className="lg:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-4 sticky top-0 z-50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 font-bold h-9"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="text-[10px] uppercase tracking-tighter">Logout</span>
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
