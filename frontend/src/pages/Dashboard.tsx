import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, ArrowRight, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const [followups, setFollowups] = useState<any[]>([]);
    const [reminders, setReminders] = useState<any[]>([]);
    const [drives, setDrives] = useState<any[]>([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const folReq = await api.get('/followups').catch(() => ({ data: [] }));
                const remReq = await api.get('/reminders').catch(() => ({ data: [] }));
                const drvReq = await api.get('/drives').catch(() => ({ data: [] }));

                setFollowups(folReq.data || []);
                setReminders(remReq.data || []);
                setDrives(drvReq.data || []);
            } catch (error) {
                console.error("Dashboard Fetch Error Detailed:", error);
            }
        };
        fetchData();
    }, []);

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

                {/* Upcoming College Drives Highlight Section - NOW AT TOP */}
                {upcomingDrives.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
                                Drive Calendar Highlights
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] h-7 px-3 font-black uppercase tracking-tighter border-primary/20 hover:bg-primary/5 text-primary"
                                onClick={() => navigate('/college-drive')}
                            >
                                Manage Schedule
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* Main Highlight (The Very Next Drive) */}
                            <div className="xl:col-span-12">
                                <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white dark:from-slate-900 dark:to-black">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Left side: College Initial/Logo */}
                                            <div className="md:w-1/4 bg-primary flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
                                                <div className="text-7xl font-black opacity-20 absolute -bottom-4 -right-4">{upcomingDrives[0].college?.name?.[0]}</div>
                                                <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-4xl mb-4 relative z-10 shadow-2xl">
                                                    {upcomingDrives[0].college?.name?.[0]}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10 opacity-80">Next Session</span>
                                            </div>

                                            {/* Right side: Details */}
                                            <div className="flex-1 p-6 md:p-10 relative">
                                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                                    <div>
                                                        <h4 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-2">
                                                            {upcomingDrives[0].college?.name}
                                                        </h4>
                                                        <span className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-black uppercase tracking-widest text-primary-foreground border border-white/10">
                                                            {upcomingDrives[0].college?.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="text-sm font-black flex items-center gap-2 text-primary-foreground/80 mb-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(upcomingDrives[0].date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-4xl font-black tracking-tighter">
                                                            {new Date(upcomingDrives[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                                    <div className="space-y-4">
                                                        {upcomingDrives[0].description && (
                                                            <p className="text-lg text-slate-300 leading-relaxed font-medium line-clamp-2 italic">
                                                                "{upcomingDrives[0].description}"
                                                            </p>
                                                        )}
                                                        {upcomingDrives[0].college?.coordinators?.[0] && (
                                                            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                                                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground">
                                                                    <Users className="h-5 w-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-black uppercase tracking-widest text-slate-400">Coordinator</div>
                                                                    <div className="font-bold flex items-center gap-2">
                                                                        {upcomingDrives[0].college.coordinators[0].name}
                                                                        <span className="text-primary font-black ml-2">{upcomingDrives[0].college.coordinators[0].phoneNumber}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-end pt-4 md:pt-0">
                                                        <Button
                                                            onClick={() => navigate('/college-drive')}
                                                            className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/20 group"
                                                        >
                                                            Full Details
                                                            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Secondary Items (If more than 1) */}
                            {upcomingDrives.length > 1 && (
                                <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {upcomingDrives.slice(1, 4).map((drive) => (
                                        <div
                                            key={drive.id}
                                            onClick={() => navigate('/college-drive')}
                                            className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 transition-all hover:shadow-md hover:border-primary/30"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 text-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    {drive.college?.name?.[0]}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 dark:text-white truncate">{drive.college?.name}</p>
                                                    <p className="text-xs font-bold text-primary mt-0.5">
                                                        {new Date(drive.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(drive.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
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
