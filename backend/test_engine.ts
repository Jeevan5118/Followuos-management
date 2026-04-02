import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/prismaClient';

async function main() {
    try {
        console.log("---- Testing Connection ----");
        const c = await prisma.college.findFirst();
        if (!c) { console.log("No colleges found!"); return; }
        const u = await prisma.user.findFirst();

        console.log("Found College:", c.id);

        console.log("---- Testing Followup Injection ----");
        const f = await prisma.followUp.create({
            data: {
                collegeId: c.id,
                description: "Direct Injection Test",
                contactName: "Chaitanya Debug",
                createdById: u!.id
            }
        });
        console.log("Followup Save State:", f);

        console.log("---- Testing Reminder Injection ----");
        const r = await prisma.reminder.create({
            data: {
                collegeId: c.id,
                title: "Injection Reminder",
                dueDate: new Date(Date.now() + 86400000)
            }
        });
        console.log("Reminder Save State:", r);

    } catch (e) {
        console.error("DIAGNOSTIC CRASH:", e);
    }
}

main().then(() => process.exit(0));
