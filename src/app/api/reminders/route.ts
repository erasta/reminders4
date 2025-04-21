import { NextResponse } from 'next/server';
import { getReminders, addReminder, updateLastReminderDate } from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminders = await getReminders(session.user.email);
    return NextResponse.json(reminders);
  } catch (err) {
    console.error('Error fetching reminders:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, companyName, daysBetweenReminders } = await request.json();
    if (!companyId || !companyName || !daysBetweenReminders) {
      return NextResponse.json({ error: 'Company ID, company name, and days between reminders are required' }, { status: 400 });
    }

    // Ensure companyId is a string
    const companyIdString = String(companyId);
    
    console.log('Adding reminder with companyId:', companyIdString, 'companyName:', companyName, 'daysBetweenReminders:', daysBetweenReminders);
    
    const newReminder = await addReminder({
      userEmail: session.user.email,
      companyId: companyIdString,
      companyName,
      daysBetweenReminders
    });
    return NextResponse.json(newReminder);
  } catch (err) {
    console.error('Error adding reminder:', err);
    return NextResponse.json({ 
      error: 'Failed to add reminder', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reminderId } = await request.json();
    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    const updatedReminder = await updateLastReminderDate(reminderId);
    return NextResponse.json(updatedReminder);
  } catch (err) {
    console.error('Error updating reminder:', err);
    return NextResponse.json({ 
      error: 'Failed to update reminder', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
} 