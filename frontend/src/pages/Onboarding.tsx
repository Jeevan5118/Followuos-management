import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Plus, X, Check, ArrowRight, Globe, Sparkles } from 'lucide-react';
import api from '@/lib/api';

const DEFAULT_CITIES = [
    { name: 'Chennai', emoji: '🏙️' },
    { name: 'Hyderabad', emoji: '🌆' },
    { name: 'Kochi', emoji: '⛵' },
    { name: 'Bangalore', emoji: '🌿' },
];

export default function Onboarding() {
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [customCity, setCustomCity] = useState('');
    const [extraCities, setExtraCities] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleCity = (city: string) => {
        setSelectedCities(prev =>
            prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
        );
    };

    const addCustomCity = () => {
        const trimmed = customCity.trim();
        if (!trimmed) return;
        const already = DEFAULT_CITIES.some(c => c.name.toLowerCase() === trimmed.toLowerCase())
            || extraCities.some(c => c.toLowerCase() === trimmed.toLowerCase());
        if (already) {
            setError('City already added.');
            return;
        }
        setExtraCities(prev => [...prev, trimmed]);
        setSelectedCities(prev => [...prev, trimmed]);
        setCustomCity('');
        setError('');
    };

    const removeExtra = (city: string) => {
        setExtraCities(prev => prev.filter(c => c !== city));
        setSelectedCities(prev => prev.filter(c => c !== city));
    };

    const handleComplete = async () => {
        if (selectedCities.length === 0) {
            setError('Please select at least one city to continue.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/complete-onboarding', { cities: selectedCities });
            const stored = localStorage.getItem('user');
            if (stored) {
                const user = JSON.parse(stored);
                user.hasCompletedOnboarding = true;
                localStorage.setItem('user', JSON.stringify(user));
            }
            window.location.href = '/';
        } catch {
            setError('Setup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 md:p-8">
            {/* Background accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-200/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.25 }}
                className="relative z-10 w-full max-w-2xl"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center h-20 w-20 rounded-[2rem] bg-blue-600 text-white shadow-2xl shadow-blue-500/30 mb-6"
                    >
                        <Building2 className="h-10 w-10" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="h-3 w-3" />
                            Welcome to FollowTracker CRM
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">
                            Set Up Your Workspace
                        </h1>
                        <p className="text-slate-500 text-base font-medium max-w-md mx-auto">
                            Select the cities you operate in. Each city gets its own isolated data workspace — fully separated.
                        </p>
                    </motion.div>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* Section label */}
                        <div className="flex items-center gap-2 mb-5">
                            <Globe className="h-5 w-5 text-blue-600" />
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Choose Cities</h2>
                        </div>

                        {/* Default city cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {DEFAULT_CITIES.map((city, i) => {
                                const isSelected = selectedCities.includes(city.name);
                                return (
                                    <motion.button
                                        key={city.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.07 }}
                                        onClick={() => toggleCity(city.name)}
                                        className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 font-semibold text-sm cursor-pointer select-none ${
                                            isSelected
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-2 right-2 h-5 w-5 bg-white/20 rounded-full flex items-center justify-center"
                                            >
                                                <Check className="h-3 w-3 text-white" />
                                            </motion.div>
                                        )}
                                        <span className="text-2xl mb-2">{city.emoji}</span>
                                        <span className="text-center leading-tight">{city.name}</span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Extra cities */}
                        <AnimatePresence>
                            {extraCities.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex flex-wrap gap-2 mb-5"
                                >
                                    {extraCities.map(city => (
                                        <motion.div
                                            key={city}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-semibold"
                                        >
                                            <MapPin className="h-3.5 w-3.5" />
                                            {city}
                                            <button
                                                onClick={() => removeExtra(city)}
                                                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add custom city */}
                        <div className="flex gap-2 mb-6">
                            <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Add another city..."
                                    value={customCity}
                                    onChange={e => { setCustomCity(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && addCustomCity()}
                                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                                />
                            </div>
                            <button
                                onClick={addCustomCity}
                                disabled={!customCity.trim()}
                                className="h-11 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </button>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-red-500 text-sm font-semibold mb-4"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        {/* Selection summary */}
                        {selectedCities.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100"
                            >
                                <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <p className="text-sm font-semibold text-blue-700">
                                    {selectedCities.length} {selectedCities.length === 1 ? 'city' : 'cities'} selected: {selectedCities.join(', ')}
                                </p>
                            </motion.div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleComplete}
                            disabled={loading || selectedCities.length === 0}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Setting Up...
                                </span>
                            ) : (
                                <>
                                    Launch Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer note */}
                    <div className="px-8 py-4 bg-slate-50/70 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            You can add more cities anytime from the dashboard settings.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
