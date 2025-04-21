'use server';

import { getServerSession } from 'next-auth';
import { isAdmin } from '../server/adminUsers';
import { sql } from '@vercel/postgres';

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
  const session = await getServerSession();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return { error: 'Unauthorized' };
  }

  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Query to get reminders due today - using a simpler approach
    const result = await sql.query(
      `SELECT 
        r.id, 
        r.company_id, 
        r.company_name, 
        r.company_user_id, 
        r.days_between_reminders, 
        r.last_reminder_date,
        CURRENT_DATE as today_date,
        u.email as user_email
       FROM reminders r
       JOIN users u ON r.user_id = u.id
       WHERE r.last_reminder_date IS NOT NULL
         AND DATE(r.last_reminder_date + (r.days_between_reminders || ' days')::interval) = CURRENT_DATE
       ORDER BY r.company_name`
    );
    
    // Calculate the due date in JavaScript for more control
    const remindersWithDueDate = result.rows.map(reminder => {
      const lastReminderDate = new Date(reminder.last_reminder_date);
      const dueDate = new Date(lastReminderDate);
      dueDate.setDate(dueDate.getDate() + reminder.days_between_reminders);
      
      return {
        ...reminder,
        date_due: dueDate.toISOString()
      };
    });
    
    return { reminders: remindersWithDueDate };
  } catch (error) {
    console.error('Detailed error fetching reminders due today:', error);
    return { error: 'Failed to fetch reminders due today: ' + (error instanceof Error ? error.message : String(error)) };
  }
} 