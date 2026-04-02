import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Plus, X, GraduationCap, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

export default function AddCollege() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Workshop');
    const [coordinators, setCoordinators] = useState([{ name: '', phoneNumber: '' }]);

    const handleAddCoordinator = () => {
        setCoordinators([...coordinators, { name: '', phoneNumber: '' }]);
    };

    const handleRemoveCoordinator = (index: number) => {
        setCoordinators(coordinators.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/colleges', {
                name,
                category,
                coordinators: coordinators.filter(c => c.name && c.phoneNumber),
            });
            navigate('/follow-ups');
        } catch (error) {
            console.error(error);
            alert('Failed to add college');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto pb-20">
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
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 p-6 md:p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" /> Core Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
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
                                    <select
                                        className="w-full h-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Workshop">Workshop</option>
                                        <option value="HR Bootcamp">HR Bootcamp</option>
                                        <option value="Drive">Drive</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 p-6 md:p-8">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" /> Outreach Leads
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
            </div>
        </Layout>
    );
}

function Users(props: any) {
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
