import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Reminder, ReminderDataFromDB } from '@/models/Reminder';
import { User } from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { isAdmin } from '@/server/adminUsers';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and admin
    const session = await getServerSession();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reminderId } = await request.json();
    
    if (!reminderId) {
      return NextResponse.json(
        { error: 'Missing reminder ID' },
        { status: 400 }
      );
    }

    // Get reminder and user details
    const result = await sql`
      SELECT 
        r.id,
        r.user_id as "userId",
        r.company_id as "companyId",
        r.company_name as "companyName",
        r.company_user_id as "companyUserId",
        r.days_between_reminders as "daysBetweenReminders",
        r.last_reminder_date as "lastReminderDate",
        r.created_at as "createdAt",
        u.email as "userEmail"
      FROM reminders r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${reminderId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    const reminderData = result.rows[0];
    const reminder = Reminder.fromDB(reminderData as ReminderDataFromDB);
    const user = new User(reminderData.userId, reminderData.userEmail);

    await user.sendReminderEmail();

    return NextResponse.json({
      success: true,
      email: reminderData.userEmail,
      subject: `Reminder: ${reminder.companyName}`,
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
} 