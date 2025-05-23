import { NextResponse } from 'next/server';
import { getRemindersDueToday } from '@/app/actions';
import { UserReminders } from '@/models/UserReminders';
import { Reminder } from '@/models/Reminder';

type RemindersResult = {
  reminders?: Reminder[];
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
    }, {} as Record<string, Reminder[]>);

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