import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus, User, Search, Users, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { useCity } from '@/contexts/CityContext';

export default function AddPerson() {
    const { activeCityId } = useCity();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [persons, setPersons] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (activeCityId) fetchPersons();
    }, [activeCityId]);

    const fetchPersons = async () => {
        setFetching(true);
        try {
            const data = res.data as any[];
            setPersons(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/members', { name, cityId: activeCityId });
            setPersons([res.data, ...persons]);
            setName('');
        } catch (error) {
            console.error(error);
            alert('Failed to add person');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this contact?')) return;
        try {
            await api.delete(`/members/${id}`);
            setPersons(persons.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to delete contact');
        }
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Global Roster</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage cross-institutional contacts and decision makers.</p>
                    </div>
                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-primary/5 self-start md:self-center">
                        <Users className="h-8 w-8" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add Form */}
                    <Card className="lg:col-span-5 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden h-fit sticky top-8 rounded-3xl">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 p-6">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-primary" /> New Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <User className="h-3 w-3" /> Full Identity *
                                    </Label>
                                    <Input
                                        required
                                        placeholder="Ex. Samantha Rogers"
                                        className="h-14 rounded-2xl bg-slate-50/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-800 font-bold"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest transition-transform active:scale-95"
                                    disabled={loading || !name}
                                >
                                    {loading ? 'Processing...' : 'Register Contact'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* All Persons List */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Database Directory</h3>
                            <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{persons.length} Indexed</span>
                        </div>

                        {fetching && (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
                            </div>
                        )}

                        {!fetching && persons.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/30 dark:bg-slate-900/10">
                                <Search className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-6 stroke-[1px]" />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No records found</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!fetching && persons.map((person) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={person.id}
                                >
                                    <Card className="group relative border-slate-100 dark:border-slate-800 hover:border-primary/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl md:rounded-3xl p-5 bg-white dark:bg-slate-900 overflow-hidden">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-primary group-hover:text-white transition-colors capitalize">
                                                {person.name?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-8">
                                                <h4 className="font-bold text-slate-900 dark:text-white truncate text-base">{person.name}</h4>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(person.id)}
                                                className="absolute top-2 right-2 h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-full md:opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
