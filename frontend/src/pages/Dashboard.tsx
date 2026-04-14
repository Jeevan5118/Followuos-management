import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, CheckCircle2, TrendingUp, Plus, ListChecks, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState<any[]>([]);
    const [followups, setFollowups] = useState<any[]>([]);
    const [reminders, setReminders] = useState<any[]>([]);
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const colReq = await api.get('/colleges').catch(() => ({ data: [] }));
                const folReq = await api.get('/followups').catch(() => ({ data: [] }));
                const remReq = await api.get('/reminders').catch(() => ({ data: [] }));
                const drvReq = await api.get('/drives').catch(() => ({ data: [] }));

                setColleges(colReq.data || []);
                setFollowups(folReq.data || []);
                setReminders(remReq.data || []);
                setDrives(drvReq.data || []);
            } catch (error) {
                console.error("Dashboard Fetch Error Detailed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const pending = followups.filter(f => f.status === 'Pending' || f.status === 'In Progress').length;
    const interested = followups.filter(f => f.status === 'Interested').length;

    let convRate = 0;
    if (colleges.length > 0) {
        convRate = Math.round((interested / colleges.length) * 100);
    }

    const stats = [
        { title: 'Total Colleges', value: loading ? '-' : colleges.length.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', path: '/follow-ups' },
        { title: 'Pending Follow-ups', value: loading ? '-' : pending.toLocaleString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', path: '/follow-ups' },
        { title: 'Interested', value: loading ? '-' : interested.toLocaleString(), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', path: '/follow-ups' },
        { title: 'Conversion Rate', value: loading ? '-' : `${convRate}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50', path: '/' },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const } }
    };

    const recentFollowUps = followups.slice(0, 4);
    const activeReminders = reminders
        .filter(r => r.dueDate && new Date(r.dueDate).getTime() > new Date().getTime())
        .slice(0, 4);
    const upcomingDrives = drives
        .filter(d => new Date(d.date).getTime() > new Date().getTime())
        .slice(0, 3);

    return (
        <Layout>
            <div className="space-y-6 md:space-y-10">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            CRM Overview
                        </h2>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
                            Welcome back! Monitor your outreach performance and upcoming tasks.
                        </p>
                    </div>
                </div>

                {/* Quick Actions - Primary Focus for Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/add-college')}
                        className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white">New College</p>
                                <p className="text-xs text-slate-500">Log a visit or outreach</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                    </button>

                    <button
                        onClick={() => navigate('/follow-ups')}
                        className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                <ListChecks className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white">Update Status</p>
                                <p className="text-xs text-slate-500">Review log & activities</p>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </button>
                </div>

                {/* Stats Grid */}
                <motion.div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {stats.map((stat, i) => (
                        <motion.div key={i} variants={item}>
                            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 hover:shadow-md transition-all h-full">
                                <CardContent className="p-3 md:p-5 flex flex-col items-start gap-2 md:gap-3">
                                    <div className={cn("p-1.5 md:p-2 rounded-lg", stat.bg)}>
                                        <stat.icon className={cn("h-4 w-4 md:h-5 md:w-5", stat.color)} />
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <p className="text-[9px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{stat.title}</p>
                                        <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 md:mt-1 uppercase truncate">{stat.value}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Upcoming College Drives */}
                {upcomingDrives.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                Upcoming College Drives
                            </h3>
                            <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-tighter" onClick={() => navigate('/college-drive')}>View All</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingDrives.map((drive) => {
                                const dt = new Date(drive.date);
                                const coordinator = drive.college?.coordinators?.[0];
                                return (
                                    <div
                                        key={drive.id}
                                        onClick={() => navigate('/college-drive')}
                                        className="group cursor-pointer bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/20 hover:border-primary/50 rounded-2xl p-4 transition-all hover:shadow-md"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary text-lg">
                                                {drive.college?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-slate-900 dark:text-white truncate">{drive.college?.name}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-primary font-bold mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                {coordinator && (
                                                    <p className="text-[10px] text-slate-500 mt-1 truncate">📞 {coordinator.name} · {coordinator.phoneNumber}</p>
                                                )}
                                                {drive.description && (
                                                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-snug">{drive.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
                    {/* Recent Activities */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden flex flex-col bg-white dark:bg-slate-900">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    Recent Interactions
                                    <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-tighter" onClick={() => navigate('/follow-ups')}>View All</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                            {recentFollowUps.length > 0 ? (
                                <div className="space-y-3">
                                    {recentFollowUps.map((u) => (
                                        <div
                                            key={u.id}
                                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                                            onClick={() => navigate('/follow-ups', { state: { collegeId: u.collegeId } })}
                                        >
                                            <div className="h-10 w-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400 capitalize">
                                                {u.college?.name?.[0] || 'C'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-bold text-slate-900 dark:text-white truncate">{u.college?.name || 'A College'}</p>
                                                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-snug">{u.description}</p>
                                                {u.status !== 'No Status Change' && (
                                                    <div className="mt-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            {u.status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-12 text-center">
                                    <ListChecks className="h-12 w-12 opacity-10 mb-4" />
                                    <p className="font-medium">No interactions recorded yet.</p>
                                    <Button variant="link" className="text-primary mt-2" onClick={() => navigate('/follow-ups')}>Start Logging</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Reminders */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden flex flex-col bg-white dark:bg-slate-900">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    Next Tasks
                                    <span className="flex h-2 w-2 rounded-full bg-primary/80 animate-pulse"></span>
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-tighter" onClick={() => navigate('/reminders')}>Full Calendar</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                            {activeReminders.length > 0 ? (
                                <div className="space-y-3">
                                    {activeReminders.map((r) => {
                                        const dt = new Date(r.dueDate);
                                        const isDueSoon = dt.getTime() - new Date().getTime() < 86400000;
                                        return (
                                            <div
                                                key={r.id}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                                                    isDueSoon
                                                        ? "bg-amber-50/50 border-amber-100 hover:border-amber-300 dark:bg-amber-500/5 dark:border-amber-500/20"
                                                        : "bg-slate-50/30 border-slate-100 hover:border-slate-200 dark:bg-slate-800/20 dark:border-slate-800 hover:bg-slate-50"
                                                )}
                                                onClick={() => navigate('/reminders')}
                                            >
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className={cn(
                                                        "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center",
                                                        isDueSoon ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                    )}>
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 dark:text-white truncate pr-2">{r.title}</p>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs font-bold uppercase tracking-tight text-slate-400">
                                                            <span className={cn(isDueSoon && "text-amber-600 dark:text-amber-400")}>
                                                                {dt.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="opacity-50">•</span>
                                                            <span className="truncate">{r.college?.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-12 text-center">
                                    <Calendar className="h-12 w-12 opacity-10 mb-4" />
                                    <p className="font-medium">No pending tasks.</p>
                                    <Button variant="link" className="text-primary mt-2" onClick={() => navigate('/reminders')}>Schedule Alert</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
