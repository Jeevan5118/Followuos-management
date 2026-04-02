import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getColleges = async (req: Request, res: Response) => {
    try {
        const colleges = await prisma.college.findMany({
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
        const college = await prisma.college.findUnique({
            where: { id },
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
        const { name, category, memberIds, coordinators } = req.body;

        const college = await prisma.college.create({
            data: {
                name,
                category,
                coordinators: {
                    create: coordinators.map((c: any) => ({
                        name: c.name,
                        phoneNumber: c.phoneNumber
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
        await prisma.college.delete({
            where: { id }
        });
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
