import { Request, Response } from 'express';
import { prisma } from '../prismaClient';


export const createDrive = async (req: Request, res: Response): Promise<void> => {
    try {
        const { collegeId, date, description } = req.body;

        if (!collegeId || !date) {
            res.status(400).json({ error: 'collegeId and date are required' });
            return;
        }

        const newDrive = await prisma.collegeDrive.create({
            data: {
                collegeId,
                date: new Date(date),
                description,
            },
            include: {
                college: {
                    include: {
                        coordinators: true
                    }
                }
            }
        });

        res.status(201).json(newDrive);
    } catch (error) {
        console.error('Error creating college drive:', error);
        res.status(500).json({ error: 'Internal server error while creating drive' });
    }
};

export const getDrives = async (req: Request, res: Response): Promise<void> => {
    try {
        const drives = await prisma.collegeDrive.findMany({
            include: {
                college: {
                    include: {
                        coordinators: true,
                        members: {
                            include: {
                                member: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        res.status(200).json(drives);
    } catch (error) {
        console.error('Error fetching college drives:', error);
        res.status(500).json({ error: 'Internal server error while fetching drives' });
    }
};

export const deleteDrive = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.collegeDrive.delete({
            where: { id: id as string }
        });

        res.status(200).json({ message: 'Drive deleted successfully' });
    } catch (error) {
        console.error('Error deleting college drive:', error);
        res.status(500).json({ error: 'Internal server error while deleting drive' });
    }
};
