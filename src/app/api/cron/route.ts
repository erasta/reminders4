import { sendAllReminders } from '../../../server/sendAllReminders';
import { NextResponse } from 'next/server';
import { getRemindersDueToday } from '@/app/actions';
import { Reminder } from '@/models/Reminder';

export async function GET() {
  try {
    console.log('Cron job started: Fetching all due reminders...');
    const result = await getRemindersDueToday();

    if (result.error) {
      console.error('Cron job: Error fetching reminders:', result.error);
      throw new Error(result.error);
    }

    if (!result.reminders || result.reminders.length === 0) {
      console.log('Cron job: No reminders due today or overdue were found.');
      return NextResponse.json({ 
        success: true, 
        message: 'No reminders were due to be sent.' 
      });
    }

    const allDueReminderInstances: Reminder[] = result.reminders.map(data => Reminder.fromDB(data));
    
    const dueTodayInstances = allDueReminderInstances.filter(
      instance => instance.getDaysUntilDue() === 0
    );

    if (dueTodayInstances.length === 0) {
      console.log('Cron job: No reminders are due exactly today.');
      return NextResponse.json({ 
        success: true, 
        message: 'No reminders were due exactly today.' 
      });
    }
    
    const plainDueTodayData = dueTodayInstances.map(instance => instance.toJSON());

    console.log(`Cron job: Processing ${plainDueTodayData.length} reminders due exactly today.`);
    const emailedUserIds = await sendAllReminders(plainDueTodayData);
    
    if (emailedUserIds.length > 0) {
      console.log(`Cron job finished: Successfully sent 'due today' reminders to ${emailedUserIds.length} user(s). User IDs: ${emailedUserIds.join(', ')}`);
    } else {
      console.log('Cron job finished: No \'due today\' reminders were sent (either none processed or all failed).');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `'Due today' reminder processing complete. Emails sent to ${emailedUserIds.length} user(s).`,
      emailedUserIds: emailedUserIds
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 