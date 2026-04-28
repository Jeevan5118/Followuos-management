import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getColleges = async (req: Request, res: Response) => {
    try {
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });
        
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        
        const colleges = await prisma.college.findMany({
            where: { cityId },
            take: limit,
            include: {
                coordinators: true,
                members: {
                    include: { member: true }
                },
                followUps: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(colleges);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCollegeById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const college = await prisma.college.findFirst({
            where: { id, cityId },
            include: {
                coordinators: true,
                members: {
                    include: { member: true }
                },
                followUps: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!college) return res.status(404).json({ message: 'Not found' });
        res.json(college);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCollege = async (req: Request, res: Response) => {
    try {
        const { name, category, memberIds, coordinators, cityId } = req.body;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const college = await prisma.college.create({
            data: {
                name,
                category,
                cityId,
                coordinators: {
                    create: coordinators.map((c: any) => ({
                        name: c.name,
                        phoneNumber: c.phoneNumber,
                        cityId
                    }))
                }
            }
        });

        if (memberIds && Array.isArray(memberIds)) {
            for (const memberId of memberIds) {
                await prisma.collegeMember.create({
                    data: {
                        collegeId: college.id,
                        memberId: memberId,
                    }
                });
            }
        }

        res.status(201).json(college);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCollege = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        await prisma.college.deleteMany({
            where: { id, cityId }
        });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
