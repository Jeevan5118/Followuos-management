import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getCities = async (req: Request, res: Response) => {
    try {
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCity = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'City name is required' });
        }

        const city = await prisma.city.create({
            data: { name: name.trim() }
        });
        
        res.status(201).json(city);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'City already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCity = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.city.delete({ where: { id } });
        res.json({ message: 'City deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
