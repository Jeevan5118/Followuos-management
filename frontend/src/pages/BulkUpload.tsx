import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCity } from '@/contexts/CityContext';

const VALID_STATUSES = ['No Status Change', 'Pending', 'Contacted', 'In Progress', 'Interested', 'Closed', 'Not Interested'];
const VALID_CATEGORIES = ['Workshop', 'HR Bootcamp', 'Drive'];

interface ParsedData {
    persons: { name: string }[];
    colleges: { name: string; category: string; coordinatorName: string; coordinatorPhone: string; personsVisited: string }[];
    followups: { collegeName: string; status: string; description: string; contactName: string }[];
}

interface ValidationError {
    sheet: string;
    row: number;
    message: string;
}

export default function BulkUpload() {
    const { activeCityId } = useCity();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [fileName, setFileName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [expandedSheet, setExpandedSheet] = useState<string | null>('colleges');

    const downloadTemplate = () => {
        const wb = XLSX.utils.book_new();

        // Persons sheet
        const personsData = [
            ['Name'],
            ['John Doe'],
            ['Jane Smith'],
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(personsData), 'Persons');

        // Colleges sheet
        const collegesData = [
            ['College Name', 'Category', 'Coordinator Name', 'Coordinator Phone', 'Persons Visited (comma separated)'],
            ['Stanford University', 'Workshop', 'Dr. James Wilson', '+91 98765 43210', 'John Doe, Jane Smith'],
            ['MIT', 'HR Bootcamp', 'Prof. Sarah Lee', '+91 91234 56789', 'John Doe'],
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(collegesData), 'Colleges');

        // Followups sheet
        const followupsData = [
            ['College Name', 'Status', 'Description', 'Contact Name'],
            ['Stanford University', 'Interested', 'Had a great meeting with the placement cell.', 'John Doe'],
            ['MIT', 'Pending', 'Waiting for confirmation from coordinator.', 'Jane Smith'],
        ];
        const followupsSheet = XLSX.utils.aoa_to_sheet(followupsData);

        // Add a note about valid statuses
        followupsSheet['!notes'] = {};
        XLSX.utils.book_append_sheet(wb, followupsSheet, 'Followups');

        // Info sheet
        const infoData = [
            ['INSTRUCTIONS'],
            [''],
            ['Sheet: Persons'],
            ['  - Name: Full name of the team member'],
            [''],
            ['Sheet: Colleges'],
            ['  - College Name: Name of the institution (required)'],
            ['  - Category: Must be one of — Workshop, HR Bootcamp, Drive'],
            ['  - Coordinator Name: College-side contact person'],
            ['  - Coordinator Phone: Contact number'],
            ['  - Persons Visited: Comma-separated names (must match names in Persons sheet)'],
            [''],
            ['Sheet: Followups'],
            ['  - College Name: Must match a college name (from Colleges sheet or already in system)'],
            ['  - Status: Must be one of — No Status Change, Pending, Contacted, In Progress, Interested, Closed, Not Interested'],
            ['  - Description: Interaction notes (required)'],
            ['  - Contact Name: Person who made the contact'],
            [''],
            ['NOTES'],
            ['  - Duplicate college names in the same city will be skipped'],
            ['  - Persons with the same name already in the system will be skipped'],
            ['  - All sheets are optional — fill only what you need'],
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(infoData), 'Instructions');

        XLSX.writeFile(wb, 'FollowTracker_BulkUpload_Template.xlsx');
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: 'array' });

                const persons: ParsedData['persons'] = [];
                const colleges: ParsedData['colleges'] = [];
                const followups: ParsedData['followups'] = [];
                const validationErrors: ValidationError[] = [];

                // Parse Persons
                if (wb.SheetNames.includes('Persons')) {
                    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Persons'], { defval: '' });
                    rows.forEach((row, i) => {
                        const name = (row['Name'] || '').toString().trim();
                        if (!name) {
                            validationErrors.push({ sheet: 'Persons', row: i + 2, message: 'Name is required' });
                            return;
                        }
                        persons.push({ name });
                    });
                }

                // Parse Colleges
                if (wb.SheetNames.includes('Colleges')) {
                    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Colleges'], { defval: '' });
                    rows.forEach((row, i) => {
                        const name = (row['College Name'] || '').toString().trim();
                        const category = (row['Category'] || 'Workshop').toString().trim();

                        if (!name) {
                            validationErrors.push({ sheet: 'Colleges', row: i + 2, message: 'College Name is required' });
                            return;
                        }
                        if (!VALID_CATEGORIES.includes(category)) {
                            validationErrors.push({ sheet: 'Colleges', row: i + 2, message: `Invalid category "${category}". Must be: ${VALID_CATEGORIES.join(', ')}` });
                            return;
                        }
                        colleges.push({
                            name,
                            category,
                            coordinatorName: (row['Coordinator Name'] || '').toString().trim(),
                            coordinatorPhone: (row['Coordinator Phone'] || '').toString().trim(),
                            personsVisited: (row['Persons Visited (comma separated)'] || '').toString().trim(),
                        });
                    });
                }

                // Parse Followups
                if (wb.SheetNames.includes('Followups')) {
                    const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Followups'], { defval: '' });
                    rows.forEach((row, i) => {
                        const collegeName = (row['College Name'] || '').toString().trim();
                        const description = (row['Description'] || '').toString().trim();
                        const status = (row['Status'] || 'No Status Change').toString().trim();

                        if (!collegeName) {
                            validationErrors.push({ sheet: 'Followups', row: i + 2, message: 'College Name is required' });
                            return;
                        }
                        if (!description) {
                            validationErrors.push({ sheet: 'Followups', row: i + 2, message: 'Description is required' });
                            return;
                        }
                        if (!VALID_STATUSES.includes(status)) {
                            validationErrors.push({ sheet: 'Followups', row: i + 2, message: `Invalid status "${status}"` });
                            return;
                        }
                        followups.push({
                            collegeName,
                            status,
                            description,
                            contactName: (row['Contact Name'] || '').toString().trim(),
                        });
                    });
                }

                setErrors(validationErrors);
                setParsedData({ persons, colleges, followups });
                setResult(null);
            } catch (err) {
                console.error(err);
                alert('Failed to parse file. Make sure it is a valid .xlsx file.');
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        parseFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        setFileName(file.name);
        parseFile(file);
    };

    const handleSubmit = async () => {
        if (!parsedData || !activeCityId) return;
        if (errors.length > 0) {
            alert('Please fix validation errors before uploading.');
            return;
        }

        setUploading(true);
        try {
            const res = await api.post('/bulk-upload', {
                cityId: activeCityId,
                persons: parsedData.persons,
                colleges: parsedData.colleges,
                followups: parsedData.followups,
            });
            setResult((res.data as any).results);
            setParsedData(null);
            setFileName('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            alert('Upload failed: ' + (err?.response?.data?.message || err?.message));
        } finally {
            setUploading(false);
        }
    };

    const totalRows = parsedData
        ? parsedData.persons.length + parsedData.colleges.length + parsedData.followups.length
        : 0;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                            Bulk Upload
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            Upload colleges, persons, and follow-ups at once using an Excel file.
                        </p>
                    </div>
                    <Button
                        onClick={downloadTemplate}
                        variant="outline"
                        className="flex items-center gap-2 h-12 px-6 rounded-2xl border-2 font-black uppercase tracking-widest text-xs border-primary/30 text-primary hover:bg-primary/5"
                    >
                        <Download className="h-4 w-4" />
                        Download Template
                    </Button>
                </div>

                {/* Upload Zone */}
                {!parsedData && !result && (
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            <div
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-4 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/40 hover:bg-primary/2 transition-all group"
                            >
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">
                                        Drop your Excel file here
                                    </p>
                                    <p className="text-slate-400 text-sm font-medium mt-1">
                                        or click to browse — .xlsx files only
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 mt-2">
                                    {['Persons', 'Colleges', 'Followups'].map(sheet => (
                                        <div key={sheet} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="h-2 w-2 rounded-full bg-primary/40" />
                                            {sheet}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Validation Errors */}
                {errors.length > 0 && (
                    <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-3xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2 text-base font-black uppercase tracking-widest">
                                <AlertCircle className="h-5 w-5" />
                                {errors.length} Validation Error{errors.length > 1 ? 's' : ''} Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {errors.map((err, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full shrink-0 mt-0.5">
                                        {err.sheet} · Row {err.row}
                                    </span>
                                    <span className="text-red-700 dark:text-red-300 font-medium">{err.message}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Preview */}
                {parsedData && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">File Parsed</p>
                                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{fileName}</p>
                            </div>
                            <button
                                onClick={() => { setParsedData(null); setFileName(''); setErrors([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="text-slate-400 hover:text-destructive transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Summary badges */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Persons', count: parsedData.persons.length, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                                { label: 'Colleges', count: parsedData.colleges.length, color: 'bg-green-50 text-green-700 border-green-100' },
                                { label: 'Follow-ups', count: parsedData.followups.length, color: 'bg-purple-50 text-purple-700 border-purple-100' },
                            ].map(s => (
                                <div key={s.label} className={cn('rounded-2xl border p-4 text-center', s.color)}>
                                    <p className="text-3xl font-black">{s.count}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Expandable previews */}
                        {[
                            { key: 'persons', label: 'Persons', data: parsedData.persons, cols: ['name'] },
                            { key: 'colleges', label: 'Colleges', data: parsedData.colleges, cols: ['name', 'category', 'coordinatorName', 'coordinatorPhone', 'personsVisited'] },
                            { key: 'followups', label: 'Follow-ups', data: parsedData.followups, cols: ['collegeName', 'status', 'description', 'contactName'] },
                        ].map(sheet => sheet.data.length > 0 && (
                            <Card key={sheet.key} className="border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    onClick={() => setExpandedSheet(expandedSheet === sheet.key ? null : sheet.key)}
                                >
                                    <span className="font-black uppercase tracking-widest text-xs text-slate-600 dark:text-slate-300">
                                        {sheet.label} — {sheet.data.length} rows
                                    </span>
                                    {expandedSheet === sheet.key
                                        ? <ChevronUp className="h-4 w-4 text-slate-400" />
                                        : <ChevronDown className="h-4 w-4 text-slate-400" />
                                    }
                                </button>
                                {expandedSheet === sheet.key && (
                                    <div className="overflow-x-auto max-h-64 custom-scrollbar border-t border-slate-100 dark:border-slate-800">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                                                <tr>
                                                    {sheet.cols.map(col => (
                                                        <th key={col} className="text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                                                            {col.replace(/([A-Z])/g, ' $1').trim()}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sheet.data.map((row: any, i) => (
                                                    <tr key={i} className="border-t border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                                        {sheet.cols.map(col => (
                                                            <td key={col} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium max-w-[200px] truncate">
                                                                {row[col] || <span className="text-slate-300 italic">—</span>}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        ))}

                        {/* Submit */}
                        <Button
                            onClick={handleSubmit}
                            disabled={uploading || totalRows === 0 || errors.length > 0}
                            className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-base transition-transform active:scale-[0.98]"
                        >
                            {uploading ? 'Uploading...' : `Upload ${totalRows} Records`}
                        </Button>
                    </div>
                )}

                {/* Success Result */}
                {result && (
                    <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10 rounded-3xl shadow-sm">
                        <CardContent className="p-8 flex flex-col items-center gap-6 text-center">
                            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-green-700 dark:text-green-400 uppercase tracking-tight">Upload Complete!</h3>
                                <p className="text-slate-500 mt-1 font-medium">Here's a summary of what was processed:</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 w-full">
                                {Object.entries(result).map(([key, val]: any) => (
                                    <div key={key} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{key}</p>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-green-600 font-bold">Created</span>
                                                <span className="font-black text-green-600">{val.created}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400 font-bold">Skipped</span>
                                                <span className="font-black text-slate-400">{val.skipped}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => setResult(null)}
                                variant="outline"
                                className="rounded-2xl px-8 font-black uppercase tracking-widest text-xs"
                            >
                                Upload Another File
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </Layout>
    );
}
