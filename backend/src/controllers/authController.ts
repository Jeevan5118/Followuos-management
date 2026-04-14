import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';

export const login = async (req: Request, res: Response) => {
    try {
        let { email, password } = req.body;

        if (email) email = email.trim().toLowerCase();

        // Let's implement a hardcoded seeder/admin if not exists for quick testing
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user && email === 'admin@crm.com' && password === 'password') {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: 'Admin User',
                    role: 'ADMIN'
                }
            });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        let { email, newPassword } = req.body;

        if (email) email = email.trim().toLowerCase();

        console.log(`Password reset attempt for: ${email}`);

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        if (newPassword.length < 4) {
            return res.status(400).json({ message: 'Password must be at least 4 characters' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        console.log(`Password successfully updated for: ${email}`);
        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
