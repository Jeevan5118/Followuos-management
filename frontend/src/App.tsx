import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AddCollege from './pages/AddCollege';
import AddPerson from './pages/AddPerson';
import FollowUps from './pages/FollowUps';
import Reminders from './pages/Reminders';
import CollegeDrive from './pages/CollegeDrive';
import Analytics from './pages/Analytics';
import BulkUpload from './pages/BulkUpload';
import NotFound from './pages/NotFound';
import { ColdStartIndicator } from './components/ui/ColdStartIndicator';
import { CityProvider } from './contexts/CityContext';

function App() {
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    let hasCompletedOnboarding = true;
    try {
        const stored = localStorage.getItem('user');
        if (stored) {
            const user = JSON.parse(stored);
            if (typeof user.hasCompletedOnboarding === 'boolean') {
                hasCompletedOnboarding = user.hasCompletedOnboarding;
            }
        }
    } catch {
        // fallback: treat as onboarded so we don't block existing sessions
    }

    const requireAuth = (element: React.ReactElement) => {
        if (!isAuthenticated) return <Navigate to="/login" replace />;
        if (!hasCompletedOnboarding) return <Navigate to="/onboarding" replace />;
        return element;
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <ColdStartIndicator />
            <CityProvider>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated
                                ? <Navigate to={hasCompletedOnboarding ? '/' : '/onboarding'} replace />
                                : <Login />
                        }
                    />
                    <Route
                        path="/onboarding"
                        element={
                            !isAuthenticated
                                ? <Navigate to="/login" replace />
                                : hasCompletedOnboarding
                                    ? <Navigate to="/" replace />
                                    : <Onboarding />
                        }
                    />

                    <Route path="/" element={requireAuth(<Dashboard />)} />
                    <Route path="/add-college" element={requireAuth(<AddCollege />)} />
                    <Route path="/add-person" element={requireAuth(<AddPerson />)} />
                    <Route path="/follow-ups" element={requireAuth(<FollowUps />)} />
                    <Route path="/reminders" element={requireAuth(<Reminders />)} />
                    <Route path="/college-drive" element={requireAuth(<CollegeDrive />)} />
                    <Route path="/analytics" element={requireAuth(<Analytics />)} />
                    <Route path="/bulk-upload" element={requireAuth(<BulkUpload />)} />

                    {/* Fallbacks */}
                    <Route path="/admin" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CityProvider>
        </div>
    );
}

export default App;
