import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Building2, Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 text-center border border-slate-100 dark:border-slate-800"
            >
                <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">404</h1>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Page Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    The requested console path does not exist or has been moved to a different sector.
                </p>
                <div className="flex flex-col gap-3">
                    <Button 
                        onClick={() => navigate('/')}
                        className="h-12 rounded-xl font-bold flex items-center gap-2"
                    >
                        <Home className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <Building2 className="h-3 w-3" />
                        FollowTracker CRM
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
