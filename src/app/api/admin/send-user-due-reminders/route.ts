import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { isAdmin } from '@/server/adminUsers';
import { sql } from '@vercel/postgres';
import { Reminder } from '@/models/Reminder';
import { sendEmail } from '@/server/sendgridUtils';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch the user's email and due reminders
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
      WHERE r.user_id = ${userId}
      AND (
        r.last_reminder_date IS NULL 
        OR r.last_reminder_date + (r.days_between_reminders || ' days')::interval <= CURRENT_TIMESTAMP
      )
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No due reminders found' }, { status: 404 });
    }

    const reminders = result.rows.map(row => Reminder.fromDB(row));
    const userEmail = result.rows[0].userEmail;

    // Create the email message
    const reminderList = reminders
      .map(reminder => `- ${reminder.companyName} (Due: ${reminder.getNextDueDate()?.toLocaleDateString() || 'Not set'})`)
      .join('\n');

    const message = `Hello,\n\nYou have the following reminders due:\n\n${reminderList}\n\nPlease take action on these reminders.\n\nBest regards,\nYour Reminder System`;

    // Send the email
    await sendEmail({
      to: userEmail,
      subject: 'Reminder: Companies Due Today',
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    // Update the last reminder date for all sent reminders
    for (const reminder of reminders) {
      await sql`
        UPDATE reminders
        SET last_reminder_date = CURRENT_TIMESTAMP
        WHERE id = ${reminder.id}
      `;
    }

    return NextResponse.json({ success: true, count: reminders.length });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
} 