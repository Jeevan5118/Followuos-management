import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute';
import collegeRoutes from './routes/collegeRoute';
import followUpRoutes from './routes/followupRoute';
import memberRoutes from './routes/memberRoute';
import reminderRoutes from './routes/reminderRoute';
import driveRoutes from './routes/driveRoute';
import cityRoutes from './routes/cityRoute';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/cities', cityRoutes);

app.use((err: any, req: any, res: any, next: any) => {
    console.error('GLOBAL ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
});

console.log('Finalizing server setup...');
const PORT = process.env.PORT || 5000;

// Export app for Vercel
export default app;

console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Keep process alive for dev environments where app.listen doesn't block properly
if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {}, 1000 * 60 * 60);
}
