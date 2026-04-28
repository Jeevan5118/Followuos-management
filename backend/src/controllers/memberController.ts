import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getMembers = async (req: Request, res: Response) => {
    try {
        const cityId = req.query.cityId as string;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const members = await prisma.member.findMany({
            where: { cityId },
            orderBy: { name: 'asc' }
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createMember = async (req: Request, res: Response) => {
    try {
        const { name, cityId } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const member = await prisma.member.create({
            data: { name, cityId }
        });

        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteMember = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.member.delete({ where: { id } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
