'use server';

import { UserReminders } from '../models/UserReminders';
// import { User } from '../models/User'; // User model might not be needed if we fetch email directly
import { Reminder } from '../models/Reminder';
import { sql } from '@vercel/postgres'; // Import sql

// Interface for the objects produced by Reminder.toJSON()
interface PlainReminderJSON {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyUserId: string | null;
  daysBetweenReminders: number;
  lastReminderDate: string | null;
  nextDueDate: string | null;
  createdAt: string;
  isDue: boolean;
  daysUntilDue: number | null;
}

// Group reminders by user ID (expects Reminder instances)
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

// Modified to accept an array of plain reminder data objects and return user IDs emailed
export async function sendAllReminders(plainRemindersData: PlainReminderJSON[]): Promise<string[]> {
  if (!plainRemindersData || plainRemindersData.length === 0) {
    return [];
  }

  const remindersToProcess: Reminder[] = plainRemindersData.map(data => {
    // Explicitly create an object matching the structure Reminder.fromDB expects
    // (which is ReminderDataFromDB as defined in Reminder.ts)
    const dataForFromDB = {
      id: data.id,
      userId: data.userId,
      companyId: data.companyId,
      companyName: data.companyName,
      companyUserId: data.companyUserId,
      daysBetweenReminders: data.daysBetweenReminders,
      lastReminderDate: data.lastReminderDate, // This is string | null from PlainReminderJSON
      createdAt: data.createdAt,             // This is string from PlainReminderJSON
    };
    return Reminder.fromDB(dataForFromDB);
  });

  const remindersByUserId = groupRemindersByUserId(remindersToProcess);
  const usersEmailedSuccessfully: Set<string> = new Set();

  for (const [userId, userSpecificReminders] of Object.entries(remindersByUserId)) {
    if (userSpecificReminders.length === 0) {
      continue;
    }

    try {
      const userResult = await sql`SELECT email FROM users WHERE id = ${userId};`;
      if (userResult.rows.length === 0) {
        console.error(`sendAllReminders: Failed to find email for user ${userId}. Skipping.`);
        continue;
      }
      const recipientEmail = userResult.rows[0].email;
      if (!recipientEmail) {
        console.error(`sendAllReminders: Email is null or undefined for user ${userId}. Skipping.`);
        continue;
      }

      const userRemindersObj = new UserReminders(userId, userSpecificReminders, new Date());

      if (userRemindersObj.hasDueReminders) {
        await userRemindersObj.sendEmail(recipientEmail);
        usersEmailedSuccessfully.add(userId);
      }
    } catch (error) {
      console.error(`sendAllReminders: Failed to process or send reminders for user ${userId}:`, error);
    }
  }
  
  return Array.from(usersEmailedSuccessfully);
} 