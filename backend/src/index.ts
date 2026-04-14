import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute';
import collegeRoutes from './routes/collegeRoute';
import followUpRoutes from './routes/followupRoute';
import memberRoutes from './routes/memberRoute';
import reminderRoutes from './routes/reminderRoute';

dotenv.config();

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

const PORT = process.env.PORT || 5000;

// Export app for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
