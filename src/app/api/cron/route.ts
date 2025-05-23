import { sendAllReminders } from '../../../server/sendAllReminders';
import { NextResponse } from 'next/server';
import { getRemindersDueToday } from '@/app/actions';
import { Reminder } from '@/models/Reminder';

export async function GET() {
  try {
    console.log('Cron job started: Fetching due reminders...');
    const result = await getRemindersDueToday();

    if (result.error) {
      console.error('Cron job: Error fetching reminders:', result.error);
      throw new Error(result.error);
    }

    if (!result.reminders || result.reminders.length === 0) {
      console.log('Cron job: No reminders due today or overdue.');
      return NextResponse.json({ 
        success: true, 
        message: 'No reminders were due to be sent.' 
      });
    }

    const reminderInstances: Reminder[] = result.reminders.map(data => Reminder.fromDB(data));
    
    const plainRemindersData = reminderInstances.map(instance => instance.toJSON());

    console.log(`Cron job: Processing ${plainRemindersData.length} reminders.`);
    const userCount = await sendAllReminders(plainRemindersData);
    
    console.log(`Cron job finished: Reminders sent to ${userCount} user(s).`);
    return NextResponse.json({ 
      success: true, 
      message: `Reminders sent to ${userCount} user(s).` 
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 