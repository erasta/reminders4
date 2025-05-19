'use server';

import { getRemindersDueToday } from '../app/actions';
import { UserReminders } from '../models/UserReminders';

// Group reminders by user email
function groupRemindersByUser(reminders: any[]): Record<string, any[]> {
  return reminders.reduce((acc, reminder) => {
    const userEmail = reminder.userId;
    if (!acc[userEmail]) {
      acc[userEmail] = [];
    }
    acc[userEmail].push(reminder);
    return acc;
  }, {} as Record<string, any[]>);
}

export async function sendAllReminders(): Promise<number> {
  const result = await getRemindersDueToday();
  
  if (result.error) {
    throw new Error(`Error fetching reminders: ${result.error}`);
  }

  if (!result.reminders) {
    return 0;
  }

  const remindersByUser = groupRemindersByUser(result.reminders);
  const userRemindersList: UserReminders[] = [];

  // Create UserReminders objects and send emails
  for (const [userId, userReminders] of Object.entries(remindersByUser)) {
    const userRemindersObj = UserReminders.fromDB({
      userId,
      reminders: userReminders
    });
    
    if (userRemindersObj.hasDueReminders) {
      await userRemindersObj.sendEmail();
      userRemindersList.push(userRemindersObj);
    }
  }
  
  return userRemindersList.length;
} 