import { NextResponse } from 'next/server';
import { sendSingleReminder } from '../../../server/sendAllReminders';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';
import { isAdmin } from '../../../server/adminUsers';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reminderId } = await request.json();
    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID is required' }, { status: 400 });
    }

    const result = await sendSingleReminder(reminderId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending single reminder:', error);
    return NextResponse.json({ 
      error: 'Failed to send reminder',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 