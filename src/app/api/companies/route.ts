import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read and parse the CSV file
    const csvFilePath = path.join(process.cwd(), 'companies.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Transform the data to match our expected format
    const companies = records.map((record: any) => ({
      id: record.company_id,
      name: record.company_name,
      days_before_deactivation: parseInt(record.days_before_deactivation) || 0,
      link_to_policy: record.link_to_policy || '',
      activities_to_avoid_deactivation: record.activities_to_avoid_deactivation || ''
    }));

    return NextResponse.json(companies);
  } catch (err) {
    console.error('Error fetching companies:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// We don't need POST anymore since companies come from CSV
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 