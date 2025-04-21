'use server';

import { Resend } from 'resend';
import { getServerSession } from 'next-auth/next';
import { isAdmin } from './adminUsers';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
  console.log('Attempting to send email to:', to);
  console.log('Subject:', subject);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set in environment variables');
    throw new Error('RESEND_API_KEY is not set');
  }
  
  console.log('RESEND_API_KEY is set, proceeding with email send');
  
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: 'Reminders App <onboarding@resend.dev>',
      to,
      subject,
      text,
      html,
    });
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendTestEmail(userEmail: string): Promise<{ success: boolean; error?: string }> {
  console.log('sendTestEmail called with:', userEmail);
  
  try {
    const session = await getServerSession();
    console.log('Session:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.email) {
      console.log('No user email in session');
      return { success: false, error: 'Not authenticated' };
    }

    const adminStatus = await isAdmin(session.user.email);
    console.log('Admin status for', session.user.email, ':', adminStatus);
    
    if (!adminStatus) {
      console.log('User is not an admin');
      return { success: false, error: 'Not authorized' };
    }

    console.log('User is authenticated and authorized, sending email');
    
    await sendEmail({
      to: userEmail,
      subject: 'Test Email from Reminder App',
      text: 'This is a test email from the Reminder App admin panel.',
      html: '<p>This is a test email from the Reminder App admin panel.</p>'
    });

    console.log('Test email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return { success: false, error: 'Failed to send email' };
  }
} 