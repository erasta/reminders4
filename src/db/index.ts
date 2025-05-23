import { sql } from '@vercel/postgres';
import { Reminder, ReminderDataFromDB } from '../models/Reminder';

export async function getTexts(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM texts 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching texts:', error);
    throw error;
  }
}

export async function addText(userId: string, content: string) {
  try {
    const result = await sql`
      INSERT INTO texts (user_id, content)
      VALUES (${userId}, ${content})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error adding text:', error);
    throw error;
  }
}

// Company functions
export async function getCompanies() {
  try {
    const result = await sql`
      SELECT * FROM companies 
      ORDER BY name ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

export async function addCompany(name: string) {
  try {
    const result = await sql`
      INSERT INTO companies (name)
      VALUES (${name})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error adding company:', error);
    throw error;
  }
}

// Reminder functions
export async function getReminders(userId: string) {
  try {
    const result = await sql`
      SELECT r.*, c.name as company_name
      FROM reminders r
      JOIN companies c ON r.company_id = c.id
      WHERE r.user_id = ${userId} 
      ORDER BY r.created_at DESC
    `;
    return result.rows.map(row => Reminder.fromDB(row as ReminderDataFromDB));
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
}

export async function addReminder(
  userId: string, 
  companyId: number, 
  daysBetweenReminders: number
) {
  try {
    const result = await sql`
      INSERT INTO reminders (user_id, company_id, days_between_reminders)
      VALUES (${userId}, ${companyId}, ${daysBetweenReminders})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }
}

export async function updateLastReminderDate(reminderId: number) {
  try {
    const result = await sql`
      UPDATE reminders 
      SET last_reminder_date = CURRENT_TIMESTAMP
      WHERE id = ${reminderId}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating reminder date:', error);
    throw error;
  }
} 