import { NextResponse } from 'next/server';
import { sendEmail } from '@/server/sendgridUtils';

export async function POST(request: Request) {
  try {
    const { to, subject, text, html } = await request.json();
    
    await sendEmail({
      to,
      subject,
      text,
      html
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 