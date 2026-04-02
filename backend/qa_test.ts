import * as dotenv from 'dotenv';
dotenv.config();
import { prisma } from './src/prismaClient';
import axios from 'axios';

const BASE = 'http://localhost:5000/api';

async function run() {
    // 1. Login
    console.log('\n=== 1. LOGIN ===');
    let token = '';
    try {
        const res = await axios.post(`${BASE}/auth/login`, { email: 'admin@crm.com', password: 'password' });
        token = res.data.token;
        console.log('Login OK. Token:', token.substring(0, 30) + '...');
    } catch (e: any) {
        console.error('Login FAILED:', e.response?.data || e.message);
        return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Colleges
    console.log('\n=== 2. COLLEGES ===');
    try {
        const res = await axios.get(`${BASE}/colleges`, { headers });
        console.log(`Found ${res.data.length} college(s).`);
        if (res.data[0]) console.log('First college:', JSON.stringify(res.data[0], null, 2));
    } catch (e: any) {
        console.error('Colleges FAILED:', e.response?.data || e.message);
    }

    // 3. Members
    console.log('\n=== 3. MEMBERS (Persons) ===');
    try {
        const res = await axios.get(`${BASE}/members`, { headers });
        console.log(`Found ${res.data.length} member(s).`);
        if (res.data[0]) console.log('First member:', JSON.stringify(res.data[0]));
    } catch (e: any) {
        console.error('Members FAILED:', e.response?.data || e.message);
    }

    // 4. Follow-ups
    console.log('\n=== 4. FOLLOW-UPS ===');
    try {
        const res = await axios.get(`${BASE}/followups`, { headers });
        console.log(`Found ${res.data.length} followup(s).`);
        if (res.data[0]) console.log('First followup:', JSON.stringify(res.data[0], null, 2));
    } catch (e: any) {
        console.error('Followups FAILED:', e.response?.data || e.message);
    }

    // 5. College-specific follow-ups
    const college = await prisma.college.findFirst();
    if (college) {
        console.log(`\n=== 5. FOLLOWUPS FOR COLLEGE "${college.name}" ===`);
        try {
            const res = await axios.get(`${BASE}/followups/college/${college.id}`, { headers });
            console.log(`Found ${res.data.length} followup(s) for this college.`);
            res.data.forEach((f: any, i: number) => {
                console.log(`  [${i + 1}] contactName="${f.contactName}" | description="${f.description}"`);
            });
        } catch (e: any) {
            console.error('College Followups FAILED:', e.response?.data || e.message);
        }

        // 6. Create a test followup
        console.log('\n=== 6. CREATE FOLLOWUP ===');
        try {
            const res = await axios.post(`${BASE}/followups`, {
                collegeId: college.id,
                description: 'QA Test Note - ' + new Date().toISOString(),
                contactName: 'QA Tester',
                status: 'In Progress',
            }, { headers });
            console.log('Create Followup OK:', JSON.stringify(res.data, null, 2));
        } catch (e: any) {
            console.error('Create Followup FAILED:', e.response?.data || e.message);
        }

        // 7. Create a test reminder
        console.log('\n=== 7. CREATE REMINDER ===');
        try {
            const res = await axios.post(`${BASE}/reminders`, {
                collegeId: college.id,
                title: 'QA Test Reminder',
                dueDate: new Date(Date.now() + 86400000).toISOString(),
            }, { headers });
            console.log('Create Reminder OK:', JSON.stringify(res.data, null, 2));
        } catch (e: any) {
            console.error('Create Reminder FAILED:', e.response?.data || e.message);
        }
    }

    // 8. Reminders
    console.log('\n=== 8. ALL REMINDERS ===');
    try {
        const res = await axios.get(`${BASE}/reminders`, { headers });
        console.log(`Found ${res.data.length} reminder(s).`);
    } catch (e: any) {
        console.error('Reminders FAILED:', e.response?.data || e.message);
    }

    console.log('\n=== ALL TESTS COMPLETE ===');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
