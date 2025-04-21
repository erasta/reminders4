import { Resend } from 'resend';

export async function sendTestEmail(userEmail: string): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables');
    return { success: false, error: 'RESEND_API_KEY is not set' };
  }
  
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Reminders App <reminders@yourdomain.com>',
      to: userEmail,
      subject: 'Test Email from Reminder App',
      text: 'This is a test email from the Reminder App admin panel.',
      html: '<p>This is a test email from the Reminder App admin panel.</p>'
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return { success: false, error: 'Failed to send email' };
  }
} 