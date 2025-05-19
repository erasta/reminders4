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

    const { reminderId } = await request.json();
    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    // Fetch the reminder
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
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    const reminder = Reminder.fromDB(result.rows[0]);
    const userEmail = result.rows[0].userEmail;

    // Send the email
    const message = `Hello,\n\nYou have a reminder for ${reminder.companyName}.\n\nPlease take action on this reminder.\n\nBest regards,\nYour Reminder System`;

    await sendEmail({
      to: userEmail,
      subject: `Reminder: ${reminder.companyName}`,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    // Update the last reminder date
    await sql`
      UPDATE reminders
      SET last_reminder_date = CURRENT_TIMESTAMP
      WHERE id = ${reminderId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    );
  }
} 