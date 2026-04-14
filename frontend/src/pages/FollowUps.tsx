import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Clock, CheckCircle2, Phone, XCircle, Inbox, Trash2, ArrowLeft, MessageSquarePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Interested': return 'text-green-500 bg-green-500/10 border-green-500/20';
        case 'Pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        case 'In Progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        case 'Closed': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
        case 'Not Interested': return 'text-destructive bg-destructive/10 border-destructive/20';
        default: return 'text-muted-foreground bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Interested': return <CheckCircle2 className="h-4 w-4" />;
        case 'Pending': return <Clock className="h-4 w-4" />;
        case 'Contacted': return <Phone className="h-4 w-4" />;
        case 'Not Interested': return <XCircle className="h-4 w-4" />;
        default: return <span className="h-2 w-2 rounded-full bg-current" />;
    }
}

export default function FollowUps() {
    const location = useLocation();
    const [colleges, setColleges] = useState<any[]>([]);
    const [activeCollege, setActiveCollege] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [globalPersons, setGlobalPersons] = useState<any[]>([]);

    const [followupDesc, setFollowupDesc] = useState('');
    const [followupStatus, setFollowupStatus] = useState('');
    const [contactName, setContactName] = useState('');
    const [timeline, setTimeline] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [showContactList, setShowContactList] = useState(true); // For mobile view toggle
    const chatBottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const colRes = await api.get('/colleges').catch(() => ({ data: [] }));
                const memRes = await api.get('/members').catch(() => ({ data: [] }));
                const cols: any[] = colRes.data || [];
                const mems: any[] = memRes.data || [];
                setColleges(cols);
                setGlobalPersons(mems);

                const stateCollegeId = location.state?.collegeId;
                const lastId = stateCollegeId || localStorage.getItem('lastViewedCollegeId');
                if (lastId) {
                    const found = cols.find((c: any) => c.id === lastId);
                    if (found) {
                        setActiveCollege(found);
                        setShowContactList(false); // Hide list on mobile if college is pre-selected
                    }
                }
            } catch (error) {
                console.error('Failed to load colleges:', error);
            } finally {
                setPageLoading(false);
            }
        };
        fetchColleges();
    }, []);

    useEffect(() => {
        if (!activeCollege) return;
        setTimeline([]);
        fetchTimeline(activeCollege.id);
        localStorage.setItem('lastViewedCollegeId', activeCollege.id);
    }, [activeCollege?.id]);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [timeline.length]);

    const fetchTimeline = async (id: string) => {
        setTimelineLoading(true);
        try {
            const res = await api.get(`/followups/college/${id}`);
            setTimeline(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
            setTimeline([]);
        } finally {
            setTimelineLoading(false);
        }
    };

    const handleSelectCollege = (c: any) => {
        setActiveCollege(c);
        setShowContactList(false);
        setFollowupDesc('');
        setFollowupStatus('');
        setContactName('');
    };

    const handleAddFollowUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!followupDesc.trim() || !activeCollege || sending) return;

        setSending(true);
        try {
            const res = await api.post('/followups', {
                collegeId: activeCollege.id,
                status: followupStatus || 'No Status Change',
                description: followupDesc.trim(),
                contactName: contactName.trim() || null,
            });
            setTimeline(prev => [...prev, res.data]);
            setFollowupDesc('');
            setFollowupStatus('');
            setContactName('');
        } catch (error) {
            console.error('Failed to log follow-up:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteCollege = async () => {
        if (!activeCollege) return;
        if (!window.confirm(`Delete "${activeCollege.name}" permanently?`)) return;

        try {
            await api.delete(`/colleges/${activeCollege.id}`);
            setColleges(prev => prev.filter(c => c.id !== activeCollege.id));
            setActiveCollege(null);
            setShowContactList(true);
            setTimeline([]);
            localStorage.removeItem('lastViewedCollegeId');
        } catch (error) {
            console.error(error);
            alert('Error deleting college.');
        }
    };

    const filteredColleges = colleges.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row h-full md:h-[calc(100vh-10rem)] shadow-2xl border rounded-2xl md:rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl relative">

                {/* Left Panel - College List */}
                <div className={cn(
                    "w-full md:w-80 lg:w-96 border-r flex flex-col bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300 z-20",
                    !showContactList && "hidden md:flex",
                    showContactList ? "relative h-[60vh] md:h-full" : "h-0 md:h-full"
                )}>
                    <div className="p-4 md:p-6 border-b bg-white/50 dark:bg-slate-900/50">
                        <h2 className="font-black text-xl md:text-2xl tracking-tight mb-4 text-slate-900 dark:text-white uppercase">Outreach Log</h2>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search colleges..."
                                className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary/20"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {pageLoading && <div className="text-center text-sm text-slate-500 p-4 font-bold animate-pulse">Synchronizing...</div>}
                        {!pageLoading && filteredColleges.length === 0 && (
                            <div className="text-center text-sm text-slate-400 p-12 flex flex-col items-center gap-3">
                                <Inbox className="h-10 w-10 opacity-10" />
                                <p className="font-bold uppercase tracking-widest text-[10px]">Registry Empty</p>
                            </div>
                        )}
                        {!pageLoading && filteredColleges.map(c => {
                            const lastStatus = c.followUps?.[0]?.status || 'Pending';
                            const isActive = activeCollege?.id === c.id;

                            return (
                                <button
                                    key={c.id}
                                    onClick={() => handleSelectCollege(c)}
                                    className={cn(
                                        "w-full text-left p-5 rounded-2xl transition-all duration-300 flex justify-between items-center group relative overflow-hidden border",
                                        isActive
                                            ? "bg-white dark:bg-primary/10 border-primary shadow-lg shadow-primary/10 z-10"
                                            : "hover:bg-white dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                                    )}
                                >
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className={cn("font-bold truncate text-[15px]", isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-300')}>
                                            {c.name}
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1.5">
                                            <Building2 className="h-3 w-3" />
                                            {c.category || 'Outreach'}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter shrink-0 border transition-colors",
                                        getStatusColor(lastStatus)
                                    )}>
                                        {lastStatus === 'No Status Change' ? 'Logged' : lastStatus}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel - Chat Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-950/40 relative">
                    {!activeCollege ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <div className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-8 rotate-12">
                                <MessageSquarePlus className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Workspace Ready</h3>
                            <p className="text-sm max-w-xs font-medium text-slate-500 leading-relaxed">Select a college from the directory to start managing interactions and follow-ups.</p>
                            <Button
                                className="mt-8 md:hidden rounded-full px-8 h-12 font-black uppercase tracking-widest"
                                onClick={() => setShowContactList(true)}
                            >
                                Open Directory
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Panel Header */}
                            <div className="p-4 md:p-6 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
                                <div className="flex items-center gap-3 mb-4 md:hidden">
                                    <Button variant="ghost" size="icon" onClick={() => setShowContactList(true)} className="rounded-full">
                                        <ArrowLeft className="h-6 w-6" />
                                    </Button>
                                    <h2 className="text-lg font-bold truncate pr-10">{activeCollege.name}</h2>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="hidden md:block min-w-0">
                                        <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">{activeCollege.name}</h2>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {activeCollege.category && (
                                                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 bg-primary text-primary-foreground rounded-full">
                                                    {activeCollege.category}
                                                </span>
                                            )}
                                            {activeCollege.coordinators?.map((coord: any, i: number) => (
                                                <span key={i} className="text-[10px] font-bold text-slate-500 border rounded-full px-2.5 py-1">
                                                    📞 {coord.name} — {coord.phoneNumber}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Mobile Header Sub-info */}
                                    <div className="md:hidden flex flex-wrap gap-1.5 mt-1">
                                        {activeCollege.category && (
                                            <span className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md">
                                                {activeCollege.category}
                                            </span>
                                        )}
                                        {activeCollege.coordinators?.length > 0 && (
                                            <span className="text-[8px] font-bold text-slate-500 border rounded-md px-1.5 py-0.5 bg-slate-50/50">
                                                {activeCollege.coordinators.length} Lead{activeCollege.coordinators.length > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchTimeline(activeCollege.id)}
                                            className="text-[10px] font-black uppercase tracking-widest h-8 rounded-full border-slate-200"
                                            disabled={timelineLoading}
                                        >
                                            {timelineLoading ? 'Syncing...' : 'Reload'}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleDeleteCollege} className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Timeline */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
                                {timelineLoading && (
                                    <div className="flex flex-col items-center justify-center h-full py-12 md:py-20 animate-pulse">
                                        <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Logs</p>
                                    </div>
                                )}
                                {!timelineLoading && timeline.length === 0 && (
                                    <div className="flex flex-col items-center justify-center text-slate-400 text-[11px] font-bold uppercase tracking-widest py-20 text-center opacity-40">
                                        <CheckCircle2 className="h-16 w-16 mb-6 stroke-[1px]" />
                                        No interactions found
                                    </div>
                                )}
                                <div className="space-y-6">
                                    {timeline.map((item, idx) => {
                                        const dt = new Date(item.createdAt);
                                        const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const dateStr = dt.toLocaleDateString([], { month: 'short', day: 'numeric' });

                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={item.id}
                                                className="flex gap-4 group"
                                            >
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm transition-transform group-hover:scale-110",
                                                        getStatusColor(item.status)
                                                    )}>
                                                        {getStatusIcon(item.status)}
                                                    </div>
                                                    {idx !== timeline.length - 1 && <div className="w-0.5 bg-slate-200 dark:bg-slate-800 flex-1 my-2 rounded-full" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-1.5 flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-[13px] text-slate-900 dark:text-slate-100 uppercase tracking-tighter">
                                                                {item.contactName?.trim() || 'General Connection'}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                                                {dateStr} • {timeStr}
                                                            </span>
                                                        </div>
                                                        {item.status && item.status !== 'No Status Change' && (
                                                            <span className={cn(
                                                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                                                getStatusColor(item.status)
                                                            )}>
                                                                {item.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl shadow-sm group-hover:shadow-md transition-all">
                                                        <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">{item.description}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <div ref={chatBottomRef} />
                            </div>

                            {/* Input Bar */}
                            <div className="p-4 md:p-6 border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                                <form onSubmit={handleAddFollowUp} className="max-w-5xl mx-auto space-y-4">
                                    <div className="grid grid-cols-2 sm:flex gap-2">
                                        <select
                                            className="h-9 md:h-10 px-3 md:px-4 rounded-xl md:rounded-full bg-slate-100 dark:bg-slate-800 border-none outline-none text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 cursor-pointer appearance-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                        >
                                            <option value="">👤 Person</option>
                                            {globalPersons.map((m: any) => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="h-9 md:h-10 px-3 md:px-4 rounded-xl md:rounded-full bg-slate-100 dark:bg-slate-800 border-none outline-none text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 cursor-pointer appearance-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            value={followupStatus}
                                            onChange={(e) => setFollowupStatus(e.target.value)}
                                        >
                                            <option value="">🏷️ Status</option>
                                            <option value="Pending">🕒 Pending</option>
                                            <option value="Contacted">📞 Contacted</option>
                                            <option value="In Progress">🔄 In Progress</option>
                                            <option value="Interested">⭐ Interested</option>
                                            <option value="Closed">🔒 Closed</option>
                                            <option value="Not Interested">❌ Not Interested</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Interaction transcript..."
                                            className="flex-1 h-12 md:h-14 px-4 md:px-6 bg-slate-100 dark:bg-slate-800 border-none rounded-xl md:rounded-3xl focus-visible:ring-primary/20 text-sm md:text-md font-medium"
                                            value={followupDesc}
                                            onChange={(e) => setFollowupDesc(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddFollowUp(e as any);
                                                }
                                            }}
                                        />
                                        <Button
                                            disabled={!followupDesc.trim() || sending}
                                            type="submit"
                                            className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-xl md:rounded-3xl shadow-xl shadow-primary/20 transition-all active:scale-90"
                                        >
                                            <Send className="h-5 w-5 md:h-6 md:w-6 ml-0.5 md:ml-1" />
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function Building2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            <path d="M10 6h4" />
            <path d="M10 10h4" />
            <path d="M10 14h4" />
            <path d="M10 18h4" />
        </svg>
    )
}
