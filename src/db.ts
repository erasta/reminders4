import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';
import { Reminder } from './models/Reminder';

export type Text = {
  id: number;
  userId: string;
  content: string;
  createdAt: Date;
};

export type AddReminderParams = {
  userEmail: string;
  companyId: string;
  companyName: string;
  companyUserId?: string;
  daysBetweenReminders: number;
  lastReminderDate?: string;
};

export type UpdateReminderParams = {
  reminderId: string;
  companyUserId: string;
  daysBetweenReminders: number;
  lastReminderDate?: string;
};

export async function getTexts(userEmail: string) {
  noStore();
  try {
    const result = await sql<Text>`
      SELECT t.*
      FROM texts t
      JOIN users u ON t.user_id = u.id
      WHERE u.email = ${userEmail}
      ORDER BY t.created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch texts.');
  }
}

export async function addText(userEmail: string, content: string) {
  try {
    const result = await sql<Text>`
      WITH user_id AS (
        SELECT id FROM users WHERE email = ${userEmail}
      )
      INSERT INTO texts (user_id, content)
      SELECT id, ${content}
      FROM user_id
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add text.');
  }
}

export async function getReminders(userEmail: string) {
  noStore();
  try {
    const result = await sql`
      SELECT 
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
      WHERE u.email = ${userEmail}
      ORDER BY r.created_at DESC
    `;
    return result.rows.map(row => Reminder.fromDB(row));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch reminders.');
  }
}

// Function to ensure user exists in the database
export async function ensureUserExists(userEmail: string): Promise<string> {
  try {
    // Check if user exists
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${userEmail}
    `;
    
    if (userResult.rows.length > 0) {
      return userResult.rows[0].id;
    }
    
    // Create user if they don't exist
    const newUserResult = await sql`
      INSERT INTO users (email)
      VALUES (${userEmail})
      RETURNING id
    `;
    
    return newUserResult.rows[0].id;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to ensure user exists');
  }
}

export async function addReminder({ userEmail, companyId, companyName, companyUserId, daysBetweenReminders, lastReminderDate }: AddReminderParams) {
  try {
    console.log('Adding reminder to database:', { userEmail, companyId, companyName, companyUserId, daysBetweenReminders, lastReminderDate });
    
    // Ensure user exists and get their ID
    const userId = await ensureUserExists(userEmail);
    
    let query;
    if (lastReminderDate) {
      query = sql`
        INSERT INTO reminders (user_id, company_id, company_name, company_user_id, days_between_reminders, last_reminder_date)
        VALUES (${userId}, ${companyId}, ${companyName}, ${companyUserId}, ${daysBetweenReminders}, ${lastReminderDate})
        RETURNING 
          id,
          user_id as "userId",
          company_id as "companyId",
          company_name as "companyName",
          company_user_id as "companyUserId",
          days_between_reminders as "daysBetweenReminders",
          last_reminder_date as "lastReminderDate",
          created_at as "createdAt"
      `;
    } else {
      query = sql`
        INSERT INTO reminders (user_id, company_id, company_name, company_user_id, days_between_reminders, last_reminder_date)
        VALUES (${userId}, ${companyId}, ${companyName}, ${companyUserId}, ${daysBetweenReminders}, CURRENT_TIMESTAMP)
        RETURNING 
          id,
          user_id as "userId",
          company_id as "companyId",
          company_name as "companyName",
          company_user_id as "companyUserId",
          days_between_reminders as "daysBetweenReminders",
          last_reminder_date as "lastReminderDate",
          created_at as "createdAt"
      `;
    }
    
    const result = await query;
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create reminder');
    }
    
    return Reminder.fromDB(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    throw error instanceof Error ? error : new Error('Failed to add reminder');
  }
}

export async function updateLastReminderDate(reminderId: string) {
  try {
    const result = await sql`
      UPDATE reminders
      SET last_reminder_date = CURRENT_TIMESTAMP
      WHERE id = ${reminderId}
      RETURNING 
        id,
        user_id as "userId",
        company_id as "companyId",
        company_name as "companyName",
        company_user_id as "companyUserId",
        days_between_reminders as "daysBetweenReminders",
        last_reminder_date as "lastReminderDate",
        created_at as "createdAt"
    `;
    return Reminder.fromDB(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update reminder.');
  }
}

export async function deleteReminder(reminderId: string): Promise<void> {
  try {
    await sql`DELETE FROM reminders WHERE id = ${reminderId}`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete reminder.');
  }
}

export async function updateReminder({ reminderId, companyUserId, daysBetweenReminders, lastReminderDate }: UpdateReminderParams) {
  try {
    let query;
    if (lastReminderDate) {
      query = sql`
        UPDATE reminders 
        SET company_user_id = ${companyUserId},
            days_between_reminders = ${daysBetweenReminders},
            last_reminder_date = ${lastReminderDate}
        WHERE id = ${reminderId}
        RETURNING 
          id,
          user_id as "userId",
          company_id as "companyId",
          company_name as "companyName",
          company_user_id as "companyUserId",
          days_between_reminders as "daysBetweenReminders",
          last_reminder_date as "lastReminderDate",
          created_at as "createdAt"
      `;
    } else {
      query = sql`
        UPDATE reminders 
        SET company_user_id = ${companyUserId},
            days_between_reminders = ${daysBetweenReminders}
        WHERE id = ${reminderId}
        RETURNING 
          id,
          user_id as "userId",
          company_id as "companyId",
          company_name as "companyName",
          company_user_id as "companyUserId",
          days_between_reminders as "daysBetweenReminders",
          last_reminder_date as "lastReminderDate",
          created_at as "createdAt"
      `;
    }
    
    const result = await query;
    return Reminder.fromDB(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update reminder.');
  }
} 