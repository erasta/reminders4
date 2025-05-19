import { NextResponse } from 'next/server';
import { getRemindersDueToday } from '@/app/actions';
import { UserReminders } from '@/models/UserReminders';

type ReminderData = {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyUserId: string | null;
  daysBetweenReminders: number;
  lastReminderDate: string | null;
  createdAt: string;
};

type RemindersResult = {
  reminders?: ReminderData[];
  error?: string;
};

export async function GET() {
  try {
    const result = await getRemindersDueToday() as RemindersResult;
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    if (!result.reminders) {
      return NextResponse.json({ userReminders: [] });
    }

    // Group reminders by user
    const remindersByUser = result.reminders.reduce((acc, reminder) => {
      const userId = reminder.userId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(reminder);
      return acc;
    }, {} as Record<string, ReminderData[]>);

    // Create UserReminders objects
    const userReminders = Object.entries(remindersByUser).map(([userId, reminders]) => 
      UserReminders.fromDB({ userId, reminders })
    );

    return NextResponse.json({ userReminders });
  } catch (error) {
    console.error('Error fetching due reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due reminders' },
      { status: 500 }
    );
  }
} 