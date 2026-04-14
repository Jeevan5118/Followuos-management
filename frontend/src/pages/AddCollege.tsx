import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Plus, X, GraduationCap, Tag, UserCheck, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AddCollege() {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Workshop');
    const [coordinators, setCoordinators] = useState([{ name: '', phoneNumber: '' }]);
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    // Data lists
    const [persons, setPersons] = useState<any[]>([]);
    const [colleges, setColleges] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const [membersRes, collegesRes] = await Promise.all([
                api.get('/members').catch(() => ({ data: [] })),
                api.get('/colleges').catch(() => ({ data: [] })),
            ]);
            setPersons(Array.isArray(membersRes.data) ? membersRes.data : []);
            setColleges(Array.isArray(collegesRes.data) ? collegesRes.data : []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleAddCoordinator = () => {
        setCoordinators([...coordinators, { name: '', phoneNumber: '' }]);
    };

    const handleRemoveCoordinator = (index: number) => {
        setCoordinators(coordinators.filter((_, i) => i !== index));
    };

    const toggleMember = (id: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/colleges', {
                name,
                category,
                memberIds: selectedMemberIds,
                coordinators: coordinators.filter(c => c.name && c.phoneNumber),
            });
            setName('');
            setCategory('Workshop');
            setCoordinators([{ name: '', phoneNumber: '' }]);
            setSelectedMemberIds([]);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Failed to add college');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCollege = async (id: string) => {
        if (!window.confirm('Delete this college?')) return;
        try {
            await api.delete(`/colleges/${id}`);
            setColleges(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete college');
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Register College</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg">Enter the details of the educational institution to begin the outreach lifecycle.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Core Information */}
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 p-6 md:p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" /> Core Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 md:p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Building2 className="h-3 w-3" /> College Name *
                                    </Label>
                                    <Input
                                        required
                                        placeholder="Ex. Stanford University"
                                        className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 font-bold placeholder:text-slate-300"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Tag className="h-3 w-3" /> Category *
                                    </Label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-14 rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="Workshop">Workshop</option>
                                            <option value="HR Bootcamp">HR Bootcamp</option>
                                            <option value="Drive">Drive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Persons Visited */}
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 p-6 md:p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-primary" /> Persons Visited
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            {persons.length === 0 && !loadingData ? (
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-4">
                                    No persons added yet. Add persons first from the "Add Person" page.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-1.5 md:gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                    {persons.map(person => {
                                        const isSelected = selectedMemberIds.includes(person.id);
                                        return (
                                            <button
                                                key={person.id}
                                                type="button"
                                                onClick={() => toggleMember(person.id)}
                                                className={cn(
                                                    "px-3 py-1.5 md:px-4 md:py-2.5 rounded-full text-[11px] md:text-sm font-bold transition-all border md:border-2",
                                                    isSelected
                                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                                                )}
                                            >
                                                {isSelected && <span className="mr-1">✓</span>}
                                                {person.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {selectedMemberIds.length > 0 && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-4">
                                    {selectedMemberIds.length} person{selectedMemberIds.length > 1 ? 's' : ''} selected
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Outreach Leads (Coordinators) */}
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 p-6 md:p-8">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <UsersIcon className="w-5 h-5 text-primary" /> Outreach Leads
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddCoordinator}
                                    className="h-10 rounded-full px-4 border-slate-200 font-black text-[10px] uppercase tracking-widest"
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Extra
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-6">
                            {coordinators.map((coordinator, index) => (
                                <div key={index} className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Coordinator Name</Label>
                                            <Input
                                                placeholder="Ex. Dr. James Wilson"
                                                className="h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 font-bold"
                                                value={coordinator.name}
                                                onChange={(e) => {
                                                    const newCoordinators = [...coordinators];
                                                    newCoordinators[index].name = e.target.value;
                                                    setCoordinators(newCoordinators);
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Phone Directory</Label>
                                            <Input
                                                placeholder="Ex. +91 98765 43210"
                                                className="h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 font-bold"
                                                value={coordinator.phoneNumber}
                                                onChange={(e) => {
                                                    const newCoordinators = [...coordinators];
                                                    newCoordinators[index].phoneNumber = e.target.value;
                                                    setCoordinators(newCoordinators);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {coordinators.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveCoordinator(index)}
                                            className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white dark:bg-slate-900 border shadow-lg text-destructive hover:bg-destructive hover:text-white transition-all scale-0 group-hover:scale-100"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Button
                        type="submit"
                        className="w-full h-16 rounded-3xl shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-lg transition-transform active:scale-[0.98]"
                        disabled={loading || !name}
                    >
                        {loading ? 'Initializing Record...' : 'Complete Registration'}
                    </Button>
                </form>

                {/* Registered Colleges Table */}
                <div className="mt-16">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Registered Colleges</h3>
                        <span className="text-[10px] font-black px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full uppercase tracking-widest">
                            {colleges.length} Total
                        </span>
                    </div>

                    {loadingData && (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl" />)}
                        </div>
                    )}

                    {!loadingData && colleges.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-16 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/10">
                            <Building2 className="w-14 h-14 text-slate-200 dark:text-slate-700 mb-4 stroke-[1px]" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No colleges registered yet</p>
                        </div>
                    )}

                    {!loadingData && colleges.length > 0 && (
                        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">College Name</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Persons Visited</th>
                                            <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Coordinator</th>
                                            <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {colleges.map((college: any) => (
                                            <tr key={college.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-900 dark:text-white">{college.name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 bg-primary/10 text-primary rounded-full">{college.category || '—'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {college.members?.length > 0 ? college.members.map((cm: any, i: number) => (
                                                            <span key={i} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-0.5">
                                                                {cm.member?.name || 'Unknown'}
                                                            </span>
                                                        )) : <span className="text-[10px] text-slate-300 italic">None</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        {college.coordinators?.length > 0 ? college.coordinators.map((coord: any, i: number) => (
                                                            <span key={i} className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                                {coord.name} <span className="text-slate-400">({coord.phoneNumber})</span>
                                                            </span>
                                                        )) : <span className="text-[10px] text-slate-300 italic">None</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteCollege(college.id)}
                                                        className="text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden p-4 space-y-4">
                                {colleges.map((college: any) => (
                                    <div key={college.id} className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-base">{college.name}</h4>
                                                <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-full mt-1 inline-block">{college.category || '—'}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteCollege(college.id)}
                                                className="text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Persons Visited</p>
                                            <div className="flex flex-wrap gap-1">
                                                {college.members?.length > 0 ? college.members.map((cm: any, i: number) => (
                                                    <span key={i} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-0.5">
                                                        {cm.member?.name || 'Unknown'}
                                                    </span>
                                                )) : <span className="text-[10px] text-slate-300 italic uppercase">None Logged</span>}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Coordinator Contacts</p>
                                            {college.coordinators?.length > 0 ? college.coordinators.map((coord: any, i: number) => (
                                                <p key={i} className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                                    {coord.name} <span className="text-slate-400 font-medium ml-auto">{coord.phoneNumber}</span>
                                                </p>
                                            )) : <span className="text-[10px] text-slate-300 italic uppercase">No Leads found</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function UsersIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
