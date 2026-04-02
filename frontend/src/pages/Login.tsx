import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, ShieldCheck, Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('admin@crm.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            window.location.href = '/';
        } catch (error) {
            console.error(error);
            alert("Authentication failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-mesh p-4 md:p-6 overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 mb-6 rotate-6 hover:rotate-0 transition-transform duration-500">
                        <Building2 className="h-10 w-10" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">CRM Pro</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">Enterprise Outreach Engine</p>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="space-y-1 text-center pt-10 pb-6 border-b border-slate-100/50 dark:border-slate-800/50 mx-6">
                        <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Secure Access</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">Verify your identity to enter the console</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Operator Identity</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@crm.com"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="h-14 pl-12 bg-slate-50 border-none rounded-2xl dark:bg-slate-800/50 font-bold focus-visible:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Access Token</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="h-14 pl-12 bg-slate-50 border-none rounded-2xl dark:bg-slate-800/50 font-bold focus-visible:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 rounded-2xl shadow-xl shadow-primary/30 text-lg font-black uppercase tracking-widest transition-all active:scale-95 group"
                                disabled={loading}
                            >
                                {loading ? 'Authorizing...' : (
                                    <span className="flex items-center gap-2">
                                        Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center pb-10 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100/50 dark:border-slate-800/50 pt-6">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                            <ShieldCheck className="h-4 w-4" />
                            End-to-End Encrypted Session
                        </div>
                    </CardFooter>
                </Card>

                <div className="text-center mt-8">
                    <p className="text-[11px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">© 2026 OUTREACH CRM • ALL SYSTEMS OPERATIONAL</p>
                </div>
            </motion.div>
        </div>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
