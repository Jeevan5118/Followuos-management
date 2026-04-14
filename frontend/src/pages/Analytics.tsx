import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Analytics() {
    const [colleges, setColleges] = useState<any[]>([]);
    const [followups, setFollowups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const colReq = await api.get('/colleges').catch(() => ({ data: [] }));
                const folReq = await api.get('/followups').catch(() => ({ data: [] }));

                setColleges(colReq.data || []);
                setFollowups(folReq.data || []);
            } catch (error) {
                console.error("Analytics Fetch Error:", error);
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
        { title: 'Total Colleges', value: loading ? '-' : colleges.length.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Pending Follow-ups', value: loading ? '-' : pending.toLocaleString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
        { title: 'Interested', value: loading ? '-' : interested.toLocaleString(), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        { title: 'Conversion Rate', value: loading ? '-' : `${convRate}%`, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const } }
    };

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase italic">
                        Performance Analytics
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Detailed breakdown of outreach metrics and conversion data.
                    </p>
                </div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {stats.map((stat, i) => (
                        <motion.div key={i} variants={item}>
                            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                                <CardContent className="p-8 flex flex-col items-start gap-4">
                                    <div className={cn("p-4 rounded-2xl shadow-sm", stat.bg)}>
                                        <stat.icon className={cn("h-8 w-8", stat.color)} />
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.title}</p>
                                        <div className="text-4xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tighter truncate">
                                            {stat.value}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Additional Insight Placeholders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-slate-200 dark:border-slate-800 p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                        <h4 className="font-black uppercase tracking-widest text-slate-400 text-sm mb-6 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            Growth Trends
                        </h4>
                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            Chart Visualizations loading...
                        </div>
                    </Card>
                    <Card className="border-slate-200 dark:border-slate-800 p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                        <h4 className="font-black uppercase tracking-widest text-slate-400 text-sm mb-6 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Category Performance
                        </h4>
                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                            Category distribution loading...
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
