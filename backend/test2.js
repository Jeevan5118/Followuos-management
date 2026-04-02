require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    console.log("--- Members ---");
    const mem = await prisma.member.findMany();
    console.log(mem);

    console.log("--- Reminders Setup ---");
    const c = await prisma.college.findFirst();
    if (!c) { console.log("No colleges"); return; }
    try {
        console.log("Trying to create reminder for college:", c.id);
        const rem = await prisma.reminder.create({
            data: { collegeId: c.id, title: "DB Test", dueDate: new Date() }
        });
        console.log("Success! Reminder created:", rem.id);
    } catch (e) {
        console.error("REMINDER ERROR REVEALED:", e);
    }
}
run().then(() => process.exit(0));
