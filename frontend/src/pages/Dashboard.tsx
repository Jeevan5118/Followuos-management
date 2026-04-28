import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListChecks, ArrowRight, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
                const [folReq, remReq, drvReq] = await Promise.all([
                    api.get('/followups?limit=5').catch(() => ({ data: [] })),
                    api.get('/reminders?limit=5').catch(() => ({ data: [] })),
                    api.get('/drives?limit=5').catch(() => ({ data: [] }))
                ]);

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
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
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

                {/* Upcoming College Drives - Compact Grid at Top */}
                {upcomingDrives.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                Upcoming College Drives
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs font-bold uppercase tracking-tighter hover:bg-primary/5 text-primary"
                                onClick={() => navigate('/college-drive')}
                            >
                                View Calendar
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingDrives.map((drive) => {
                                const dt = new Date(drive.date);
                                const coordinator = drive.college?.coordinators?.[0];
                                return (
                                    <div
                                        key={drive.id}
                                        onClick={() => navigate('/college-drive')}
                                        className="group cursor-pointer bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 hover:border-primary/50 rounded-2xl p-4 transition-all hover:shadow-xl hover:-translate-y-1 shadow-sm"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary text-lg">
                                                {drive.college?.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-black text-slate-900 dark:text-white truncate pr-2">{drive.college?.name}</p>
                                                    <div className="shrink-0 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-tighter">
                                                        {drive.college?.category}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-primary font-bold mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {dt.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                {coordinator && (
                                                    <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-2 font-bold flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Users className="h-3 w-3 opacity-50 text-primary" />
                                                            <span className="truncate">{coordinator.name.split('(')[0].trim()}</span>
                                                        </div>
                                                        <div className="pl-[18px] opacity-70 font-medium">
                                                            {coordinator.phoneNumber}
                                                        </div>
                                                    </div>
                                                )}
                                                {drive.description && (
                                                    <p className="text-[10px] text-slate-400 mt-2 line-clamp-2 italic leading-relaxed">
                                                        "{drive.description}"
                                                    </p>
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
