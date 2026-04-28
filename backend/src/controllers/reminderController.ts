import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getReminders = async (req: Request, res: Response) => {
    try {
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

        const reminders = await prisma.reminder.findMany({
            where: { cityId },
            include: { college: true },
            orderBy: { dueDate: 'asc' },
            take: limit
        });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createReminder = async (req: Request, res: Response) => {
    try {
        console.log("DEBUG: createReminder Body:", JSON.stringify(req.body, null, 2));
        const { collegeId, title, description, dueDate, cityId } = req.body;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const reminder = await prisma.reminder.create({
            data: {
                collegeId,
                cityId,
                title,
                description,
                dueDate: new Date(dueDate)
            },
            include: { college: true }
        });
        res.status(201).json(reminder);
    } catch (error: any) {
        console.error("Reminder Create Error CRITICAL:", error);
        res.status(500).json({
            message: 'Server error during reminder creation',
            error: error?.message || "Unknown error"
        });
    }
};

export const deleteReminder = async (req: Request, res: Response) => {
    try {
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        await prisma.reminder.deleteMany({ where: { id: String(req.params.id), cityId } });
        res.status(200).json({ message: 'Deleted' });
    } catch (error: any) {
        console.error("Reminder Delete Error:", error);
        res.status(500).json({ message: 'Server error', error: error?.message || error });
    }
};
