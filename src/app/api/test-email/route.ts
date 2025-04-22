import { NextResponse } from 'next/server';
import { sendEmail } from '../../../server/email';
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

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const message = `This is a test email from the reminder system.\n\n` +
                   `If you're receiving this, it means the email system is working correctly.\n\n` +
                   `Best regards,\n` +
                   `Your Reminder System`;

    await sendEmail({
      to: email,
      subject: 'Test Email from Reminder System',
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 