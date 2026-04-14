import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';

export function ColdStartIndicator() {
    const [isColdStarting, setIsColdStarting] = useState(false);

    useEffect(() => {
        const handleColdStart = (e: any) => {
            setIsColdStarting(e.detail);
        };

        window.addEventListener('api:cold-start', handleColdStart);
        return () => window.removeEventListener('api:cold-start', handleColdStart);
    }, []);

    return (
        <AnimatePresence>
            {isColdStarting && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md"
                >
                    <div className="bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl p-6 flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-white font-black uppercase tracking-tight text-lg">Waking Up Server...</h3>
                            <p className="text-slate-400 text-xs font-medium px-4">
                                Our secure cloud engine is starting up. This happens once after being idle.
                                <span className="block mt-1 text-primary/80 font-bold uppercase tracking-widest text-[9px]">Hang tight • Ready in seconds</span>
                            </p>
                        </div>
                        <div className="w-full bg-slate-800 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                initial={{ width: "0%" }}
                                animate={{ width: "95%" }}
                                transition={{ duration: 45, ease: "linear" }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
