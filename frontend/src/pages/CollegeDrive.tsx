import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Building2, Phone, User, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCity } from '@/contexts/CityContext';

interface Coordinator {
    id: string;
    name: string;
    phoneNumber: string;
}

interface College {
    id: string;
    name: string;
    category: string;
    coordinators: Coordinator[];
}

interface CollegeDrive {
    id: string;
    date: string;
    description?: string;
    createdAt: string;
    college: College;
}

export default function CollegeDrive() {
    const navigate = useNavigate();
    const { activeCityId } = useCity();
    const [colleges, setColleges] = useState<College[]>([]);
    const [drives, setDrives] = useState<CollegeDrive[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [driveDate, setDriveDate] = useState('');
    const [driveTime, setDriveTime] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (activeCityId) fetchData();
    }, [activeCityId]);

    const fetchData = async () => {
        try {
            const [collegesRes, drivesRes] = await Promise.all([
                api.get(`/colleges?cityId=${activeCityId}`),
                api.get(`/drives?cityId=${activeCityId}`),
            ]);
            setColleges(collegesRes.data || []);
            setDrives(drivesRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedCollegeId || !driveDate || !driveTime) return;

        setSubmitting(true);
        try {
            const dateTime = new Date(`${driveDate}T${driveTime}`).toISOString();
            await api.post('/drives', {
                collegeId: selectedCollegeId,
                cityId: activeCityId,
                date: dateTime,
                description,
            });
            setSelectedCollegeId('');
            setDriveDate('');
            setDriveTime('');
            setDescription('');
            fetchData();
        } catch (err) {
            console.error('Error creating drive:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/drives/${id}?cityId=${activeCityId}`);
            setDrives(drives.filter(d => d.id !== id));
        } catch (err) {
            console.error('Error deleting drive:', err);
        }
    };

    const upcomingDrives = drives.filter(d => new Date(d.date) >= new Date());
    const pastDrives = drives.filter(d => new Date(d.date) < new Date());

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                            College Drives
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Schedule and track all upcoming college recruitment drives.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-500">{upcomingDrives.length} upcoming</span>
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Scheduling Form */}
                    <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/30">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold">
                                <Plus className="h-5 w-5 text-primary" />
                                Schedule a Drive
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* College Selector */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Building2 className="h-3 w-3" /> Select College *
                                    </Label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={selectedCollegeId}
                                            onChange={e => {
                                                if (e.target.value === '__ADD_NEW__') {
                                                    navigate('/add-college');
                                                } else {
                                                    setSelectedCollegeId(e.target.value);
                                                }
                                            }}
                                            className="w-full h-12 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-50 dark:bg-slate-800 px-4 pr-10 text-sm font-semibold focus:ring-2 focus:ring-primary/30 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Choose a college...</option>
                                            {colleges.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                            <option value="__ADD_NEW__" className="text-primary font-bold">
                                                + Add New College
                                            </option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        required
                                        value={driveDate}
                                        onChange={e => setDriveDate(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-semibold focus:ring-primary/30"
                                    />
                                </div>

                                {/* Time */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Time *
                                    </Label>
                                    <Input
                                        type="time"
                                        required
                                        value={driveTime}
                                        onChange={e => setDriveTime(e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 font-semibold focus:ring-primary/30"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Description / Notes
                                    </Label>
                                    <Textarea
                                        placeholder="Add any notes about the drive (e.g., venue, requirements, attire)..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows={3}
                                        className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 text-sm resize-none focus:ring-primary/30"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-12 font-bold rounded-xl"
                                >
                                    {submitting ? 'Scheduling...' : 'Schedule Drive'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Drives List */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Upcoming */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                                Upcoming Drives ({upcomingDrives.length})
                            </h3>
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                    ))}
                                </div>
                            ) : upcomingDrives.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    <Calendar className="h-12 w-12 opacity-20 mb-3" />
                                    <p className="font-semibold text-sm">No upcoming drives scheduled</p>
                                    <p className="text-xs mt-1">Use the form to schedule your first drive.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingDrives.map((drive, i) => (
                                        <DriveCard key={drive.id} drive={drive} onDelete={handleDelete} index={i} isUpcoming />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past */}
                        {pastDrives.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                                    Past Drives ({pastDrives.length})
                                </h3>
                                <div className="space-y-4 opacity-60">
                                    {pastDrives.map((drive, i) => (
                                        <DriveCard key={drive.id} drive={drive} onDelete={handleDelete} index={i} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function DriveCard({ drive, onDelete, index, isUpcoming }: {
    drive: CollegeDrive;
    onDelete: (id: string) => void;
    index: number;
    isUpcoming?: boolean;
}) {
    const dt = new Date(drive.date);
    const coordinators = drive.college.coordinators || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
        >
            <Card className={cn(
                "border shadow-sm hover:shadow-md transition-all overflow-hidden bg-white dark:bg-slate-900",
                isUpcoming
                    ? "border-primary/20 hover:border-primary/40"
                    : "border-slate-200 dark:border-slate-800"
            )}>
                <CardContent className="p-5">
                    {/* Top row: College name + Date badge */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg",
                                isUpcoming ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            )}>
                                {drive.college.name[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-base text-slate-900 dark:text-white truncate">{drive.college.name}</p>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{drive.college.category}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-black",
                                isUpcoming ? "bg-primary/10 text-primary" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                            )}>
                                {dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Coordinators */}
                    {coordinators.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {coordinators.map(coord => (
                                <div key={coord.id} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-700">
                                    <User className="h-3 w-3 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{coord.name.split('(')[0].trim()}</span>
                                    {coord.phoneNumber && (
                                        <>
                                            <span className="text-slate-300 dark:text-slate-600">·</span>
                                            <Phone className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs font-semibold text-slate-500">{coord.phoneNumber}</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {drive.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700/50 mb-3">
                            {drive.description}
                        </p>
                    )}

                    {/* Footer – Delete */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => onDelete(drive.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
