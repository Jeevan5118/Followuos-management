const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const c = await prisma.college.findFirst();
        if (!c) { console.log("No colleges found"); return; }
        const u = await prisma.user.findFirst();

        console.log("---- Testing Reminder Creation ----");
        const r = await prisma.reminder.create({
            data: { collegeId: c.id, title: "Test Reminder", dueDate: new Date() }
        });
        console.log("SUCCESS:", r);

        console.log("---- Testing Followup Creation ----");
        const f = await prisma.followUp.create({
            data: { collegeId: c.id, description: "Test Followup", contactName: "Test Name", createdById: u.id }
        });
        console.log("SUCCESS:", f);

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    }
}
main().then(() => process.exit(0));
