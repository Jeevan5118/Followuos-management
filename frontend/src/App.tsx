import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddCollege from './pages/AddCollege';
import AddPerson from './pages/AddPerson';
import FollowUps from './pages/FollowUps';
import Reminders from './pages/Reminders';
import CollegeDrive from './pages/CollegeDrive';
import Analytics from './pages/Analytics';
import { ColdStartIndicator } from './components/ui/ColdStartIndicator';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <ColdStartIndicator />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/add-college" element={isAuthenticated ? <AddCollege /> : <Navigate to="/login" />} />
        <Route path="/add-person" element={isAuthenticated ? <AddPerson /> : <Navigate to="/login" />} />
        <Route path="/follow-ups" element={isAuthenticated ? <FollowUps /> : <Navigate to="/login" />} />
        <Route path="/reminders" element={isAuthenticated ? <Reminders /> : <Navigate to="/login" />} />
        <Route path="/college-drive" element={isAuthenticated ? <CollegeDrive /> : <Navigate to="/login" />} />
        <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;
