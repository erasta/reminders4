'use server';

import { sendEmail } from './sendgridUtils';
import { getServerSession } from 'next-auth/next';
import { isAdmin } from './adminUsers';

export async function sendTestEmail(userEmail: string): Promise<{ success: boolean; error?: string }> {
  console.log('=== Starting sendTestEmail ===');
  console.log('User email to send to:', userEmail);
  
  try {
    console.log('Getting server session...');
    const session = await getServerSession();
    console.log('Session found:', !!session);
    console.log('Session user email:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('No user email in session - unauthorized');
      return { success: false, error: 'Not authenticated' };
    }

    console.log('Checking admin status...');
    const adminStatus = await isAdmin(session.user.email);
    console.log('Admin status:', adminStatus);
    
    if (!adminStatus) {
      console.log('User is not an admin - forbidden');
      return { success: false, error: 'Not authorized' };
    }

    console.log('User is authenticated and authorized, preparing to send email...');
    
    await sendEmail({
      to: userEmail,
      subject: 'Test Email from Reminder App',
      text: 'This is a test email from the Reminder App admin panel.',
      html: '<p>This is a test email from the Reminder App admin panel.</p>'
    });

    console.log('Test email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('=== Error in sendTestEmail ===');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return { success: false, error: 'Failed to send email' };
  }
}
