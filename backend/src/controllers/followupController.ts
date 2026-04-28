import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getFollowups = async (req: Request, res: Response) => {
    try {
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

        const followups = await prisma.followUp.findMany({
            where: { cityId },
            include: { college: true },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
        res.json(followups);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFollowupsByCollegeId = async (req: Request, res: Response) => {
    try {
        const collegeId = req.params.collegeId as string;
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const followups = await prisma.followUp.findMany({
            where: { collegeId: String(collegeId), cityId },
            orderBy: { createdAt: 'asc' },
            include: { createdBy: { select: { name: true } } }
        });
        res.json(followups);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createFollowup = async (req: Request, res: Response) => {
    try {
        console.log("DEBUG: createFollowup Body:", JSON.stringify(req.body, null, 2));
        const { collegeId, status, description, contactName, nextFollowupDate, cityId } = req.body;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        // The user ID should come from auth middleware but we'll mock it for now
        // if user is not attached, fetch first user
        let user = (req as any).user;
        if (!user) {
            user = await prisma.user.findFirst();
        }

        const followup = await prisma.followUp.create({
            data: {
                collegeId,
                cityId,
                status: status || 'No Status Change',
                description,
                contactName,
                nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
                createdById: user.id
            },
            include: {
                createdBy: { select: { name: true } }
            }
        });

        res.status(201).json(followup);
    } catch (error: any) {
        console.error("Followup Create Error CRITICAL:", error);
        res.status(500).json({
            message: 'Server error during followup creation',
            error: error?.message || "Unknown error",
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        });
    }
};
