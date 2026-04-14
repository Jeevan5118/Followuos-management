import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { motion } from 'framer-motion';

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 pb-24 lg:pb-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="container mx-auto p-3 md:p-6 lg:p-8 max-w-7xl"
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
