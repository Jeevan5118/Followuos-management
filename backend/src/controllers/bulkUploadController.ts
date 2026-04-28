import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const bulkUpload = async (req: Request, res: Response) => {
    try {
        const { cityId, persons, colleges, followups } = req.body;
        if (!cityId) return res.status(400).json({ message: 'cityId is required' });

        const results = {
            persons: { created: 0, skipped: 0 },
            colleges: { created: 0, skipped: 0 },
            followups: { created: 0, skipped: 0 },
        };

        // 1. Upsert persons
        const personNameToId: Record<string, string> = {};

        if (Array.isArray(persons)) {
            for (const p of persons) {
                const name = (p.name || '').trim();
                if (!name) continue;

                let member = await prisma.member.findFirst({ where: { name, cityId } });
                if (!member) {
                    member = await prisma.member.create({ data: { name, cityId } });
                    results.persons.created++;
                } else {
                    results.persons.skipped++;
                }
                personNameToId[name.toLowerCase()] = member.id;
            }
        }

        // 2. Create colleges (skip duplicates)
        const collegeNameToId: Record<string, string> = {};

        // Pre-load existing colleges for this city
        const existingColleges = await prisma.college.findMany({ where: { cityId } });
        for (const ec of existingColleges) {
            collegeNameToId[ec.name.toLowerCase()] = ec.id;
        }

        if (Array.isArray(colleges)) {
            for (const c of colleges) {
                const name = (c.name || '').trim();
                if (!name) continue;

                if (collegeNameToId[name.toLowerCase()]) {
                    results.colleges.skipped++;
                    continue;
                }

                const category = (c.category || 'Workshop').trim();
                const coordName = (c.coordinatorName || '').trim();
                const coordPhone = (c.coordinatorPhone || '').trim();
                const personsVisited: string[] = (c.personsVisited || '')
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean);

                const college = await prisma.college.create({
                    data: {
                        name,
                        category,
                        cityId,
                        coordinators: coordName && coordPhone
                            ? { create: [{ name: coordName, phoneNumber: coordPhone, cityId }] }
                            : undefined,
                    },
                });

                collegeNameToId[name.toLowerCase()] = college.id;

                // Link persons visited
                for (const pName of personsVisited) {
                    const memberId = personNameToId[pName.toLowerCase()];
                    if (memberId) {
                        await prisma.collegeMember.create({
                            data: { collegeId: college.id, memberId },
                        }).catch(() => {}); // ignore duplicate
                    }
                }

                results.colleges.created++;
            }
        }

        // 3. Create follow-ups
        let user = (req as any).user;
        if (!user) user = await prisma.user.findFirst();

        if (Array.isArray(followups) && user) {
            for (const f of followups) {
                const collegeName = (f.collegeName || '').trim();
                const description = (f.description || '').trim();
                if (!collegeName || !description) continue;

                const collegeId = collegeNameToId[collegeName.toLowerCase()];
                if (!collegeId) {
                    results.followups.skipped++;
                    continue;
                }

                await prisma.followUp.create({
                    data: {
                        collegeId,
                        cityId,
                        status: (f.status || 'No Status Change').trim(),
                        description,
                        contactName: (f.contactName || '').trim() || null,
                        createdById: user.id,
                    },
                });
                results.followups.created++;
            }
        }

        res.json({ message: 'Bulk upload complete', results });
    } catch (error: any) {
        console.error('[BULK UPLOAD ERROR]', error);
        res.status(500).json({ message: 'Bulk upload failed', error: error?.message });
    }
};
