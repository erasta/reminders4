import { NextResponse } from 'next/server';
import { sendEmail } from '@/server/sendgridUtils';
import { getServerSession } from 'next-auth/next';
import { isAdmin } from '@/server/adminUsers';

export async function POST(request: Request) {
  try {
    console.log('Received test email request');
    const { userId, email } = await request.json();
    console.log('Test email request data:', { userId, email });

    if (!userId || !email) {
      console.error('Missing required fields:', { userId, email });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is authenticated and admin
    const session = await getServerSession();
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    await sendEmail({
      to: email,
      subject: `Test Email to ${email}`,
      text: `This is a test email sent at ${timestamp}`,
      html: `<p>This is a test email sent at ${timestamp}</p>`
    });

    return NextResponse.json({ 
      success: true,
      message: `Test email sent to ${email} at ${timestamp}`
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
} 