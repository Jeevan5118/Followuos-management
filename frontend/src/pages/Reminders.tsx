import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Trash2, BellRing, Clock, AlertCircle, CalendarDays } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCity } from '@/contexts/CityContext';

export default function Reminders() {
    const { activeCityId } = useCity();
    const [colleges, setColleges] = useState<any[]>([]);
    const [reminders, setReminders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [collegeId, setCollegeId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (activeCityId) fetchData();
    }, [activeCityId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const colRes = await api.get(`/colleges?cityId=${activeCityId}`).catch(() => ({ data: [] }));
            const remRes = await api.get(`/reminders?cityId=${activeCityId}`).catch(() => ({ data: [] }));
            setColleges(Array.isArray(colRes.data) ? colRes.data : []);
            setReminders(Array.isArray(remRes.data) ? remRes.data : []);
        } catch (error) {
            console.error('Reminders data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateReminder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!collegeId || !title.trim() || !dueDate) return;

        setSaving(true);
        try {
            const res = await api.post('/reminders', {
                collegeId,
                cityId: activeCityId,
                title: title.trim(),
                description: description.trim() || null,
                dueDate,
            });
            setReminders(prev => [...prev, res.data]);
            setCollegeId('');
            setTitle('');
            setDescription('');
            setDueDate('');
        } catch (error: any) {
            const msg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Unknown error';
            alert('Failed to save reminder: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this reminder?')) return;
        try {
            await api.delete(`/reminders/${id}?cityId=${activeCityId}`);
            setReminders(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete reminder.');
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Calendar Alerts</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Schedule standalone notifications for your outreach campaigns.</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary self-start md:self-center">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form Section */}
                    <Card className="lg:col-span-5 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden h-fit sticky top-8">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <BellRing className="w-5 h-5 text-primary" /> Create Task
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleCreateReminder} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select College</Label>
                                    {colleges.length === 0 && !loading ? (
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            Registry empty. Add a college first.
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full h-14 rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/40 outline-none appearance-none cursor-pointer transition-all pr-12"
                                                value={collegeId}
                                                onChange={e => setCollegeId(e.target.value)}
                                            >
                                                <option value="">-- {loading ? 'Loading...' : 'CHOOSE TARGET'} --</option>
                                                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Title</Label>
                                    <Input
                                        required
                                        placeholder="Ex. Finalize MOU Approval"
                                        className="h-12 rounded-xl bg-slate-50/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 font-medium"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline</Label>
                                    <Input
                                        required
                                        type="datetime-local"
                                        className="h-12 rounded-xl bg-slate-50/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 font-bold"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes (Optional)</Label>
                                    <textarea
                                        placeholder="Internal memo..."
                                        className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50/50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest transition-transform active:scale-95"
                                    disabled={saving || !collegeId || !title.trim() || !dueDate}
                                >
                                    {saving ? 'Synchronizing...' : 'Schedule Task'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* List Section */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Pipeline</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{reminders.length} Tasks</span>
                        </div>

                        {loading && <div className="animate-pulse flex flex-col gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
                        </div>}

                        {!loading && reminders.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/10">
                                <Calendar className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-6 stroke-[1px]" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No Pending Alerts</p>
                            </div>
                        )}

                        {!loading && reminders.map(r => {
                            const date = new Date(r.dueDate);
                            const isPast = date.getTime() < new Date().getTime();
                            const isSoon = date.getTime() - new Date().getTime() < 86400000 && !isPast;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={r.id}
                                >
                                    <Card className={cn(
                                        "group border shadow-sm transition-all hover:shadow-md rounded-2xl md:rounded-3xl p-5 bg-white dark:bg-slate-900",
                                        isSoon ? "border-amber-200 bg-amber-50/20 dark:border-amber-500/30" : "border-slate-100 dark:border-slate-800"
                                    )}>
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                                    <h4 className={cn(
                                                        "text-lg font-black tracking-tight",
                                                        isSoon ? "text-amber-600 dark:text-amber-400" : isPast ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                                                    )}>{r.title}</h4>
                                                    {r.college?.name && (
                                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{r.college.name}</span>
                                                    )}
                                                </div>
                                                {r.description && <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 pr-4 font-medium italic">{r.description}</p>}

                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        isPast ? "bg-red-50 text-red-500 dark:bg-red-500/10" : isSoon ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20" : "bg-blue-50 text-blue-600 dark:bg-blue-500/10"
                                                    )}>
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    {isPast && <span className="text-[9px] text-red-600 font-black uppercase tracking-widest px-2 py-0.5 bg-red-50 rounded-full">Exceeded</span>}
                                                    {isSoon && <span className="text-[9px] text-amber-600 font-black uppercase tracking-widest px-2 py-0.5 bg-amber-100 rounded-full">Soon</span>}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(r.id)}
                                                className="text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-full h-10 w-10 shrink-0 self-end sm:self-start opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

