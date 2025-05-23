'use server';

import { getServerSession } from 'next-auth/next';
import { isAdmin } from '../server/adminUsers';
import { sql } from '@vercel/postgres';
import { sendTestEmail } from '../server/email';

/**
 * Check if the current user is an admin
 * @returns true if the user is an admin, false otherwise
 */
export async function checkIsAdmin(): Promise<boolean> {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return false;
  }
  
  return isAdmin(session.user.email);
}

export async function getAllUsers() {
  const session = await getServerSession();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return { error: 'Unauthorized' };
  }

  try {
    const result = await sql.query(
      `SELECT id, email, created_at FROM users ORDER BY created_at DESC`
    );
    return { users: result.rows };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: 'Failed to fetch users' };
  }
}

export async function getRemindersDueToday() {
  try {
    // Query to get reminders due today, aliasing to camelCase for Reminder.fromDB
    const result = await sql.query(
      `SELECT 
        r.id, 
        r.user_id as "userId",
        r.company_id as "companyId", 
        r.company_name as "companyName", 
        r.company_user_id as "companyUserId", 
        r.days_between_reminders as "daysBetweenReminders", 
        r.last_reminder_date as "lastReminderDate",
        r.created_at as "createdAt"
       FROM reminders r
       JOIN users u ON r.user_id = u.id
       WHERE r.last_reminder_date IS NOT NULL
         AND DATE(r.last_reminder_date + (r.days_between_reminders || ' days')::interval) <= CURRENT_DATE
       ORDER BY r.company_name`
    );
    
    // Calculate the due date in JavaScript using camelCase properties
    const remindersWithDueDate = result.rows.map(row => {
      const lastReminderDate = new Date(row.lastReminderDate);
      const dueDate = new Date(lastReminderDate);
      dueDate.setDate(dueDate.getDate() + row.daysBetweenReminders);
      
      return {
        ...row, // row now contains camelCase fields from the SQL query
        date_due: dueDate.toISOString() // This extra field is for potential use, not by Reminder.fromDB
      };
    });
    
    return { reminders: remindersWithDueDate };
  } catch (error) {
    console.error('Detailed error fetching reminders due today:', error);
    return { error: 'Failed to fetch reminders due today: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

export { sendTestEmail }; 