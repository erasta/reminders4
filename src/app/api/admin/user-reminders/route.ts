import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/auth';
import { isAdmin } from '@/server/adminUsers';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch reminders for the user
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
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
    `;

    const reminders = result.rows.map(row => ({
      id: row.id,
      userId: row.userId,
      companyId: row.companyId,
      companyName: row.companyName,
      companyUserId: row.companyUserId,
      daysBetweenReminders: row.daysBetweenReminders,
      lastReminderDate: row.lastReminderDate,
      createdAt: row.createdAt
    }));
    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching user reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
} 