'use server';

import { UserReminders } from '../models/UserReminders';
import { User } from '../models/User';
import { Reminder } from '../models/Reminder';

// Group reminders by user ID
function groupRemindersByUserId(reminders: Reminder[]): Record<string, Reminder[]> {
  return reminders.reduce((acc, reminder) => {
    const userId = reminder.userId;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);
}

// Modified to accept a list of Reminder objects
export async function sendAllReminders(remindersToProcess: Reminder[]): Promise<number> {
  if (!remindersToProcess || remindersToProcess.length === 0) {
    return 0;
  }

  const remindersByUserId = groupRemindersByUserId(remindersToProcess);
  const usersEmailed: Set<string> = new Set();

  for (const [userId, userSpecificReminders] of Object.entries(remindersByUserId)) {
    if (userSpecificReminders.length === 0) {
      continue;
    }

    const userRemindersObj = new UserReminders(userId, userSpecificReminders, new Date());

    if (userRemindersObj.hasDueReminders) {
      try {
        await userRemindersObj.sendEmail();
        usersEmailed.add(userId);
      } catch (error) {
        console.error(`Failed to send reminders to user ${userId}:`, error);
      }
    }
  }
  
  return usersEmailed.size;
} 