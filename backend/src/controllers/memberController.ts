import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getMembers = async (req: Request, res: Response) => {
    try {
        const members = await prisma.member.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createMember = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const member = await prisma.member.create({
            data: { name }
        });

        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
