import sgMail from '@sendgrid/mail';

console.log('Initializing SendGrid...');
if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is not set in environment variables');
  throw new Error('SENDGRID_API_KEY is not set');
}

console.log('Setting SendGrid API key...');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface SendGridError extends Error {
  response?: {
    body: any;
    headers: any;
  };
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  console.log('Preparing to send email with SendGrid...');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('From email:', process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com');
  
  try {
    console.log('Sending email through SendGrid...');
    const response = await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      subject,
      text,
      html,
    });
    console.log('SendGrid response:', response);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('SendGrid error details:', error);
    const sendGridError = error as SendGridError;
    if (sendGridError.response) {
      console.error('SendGrid response body:', sendGridError.response.body);
      console.error('SendGrid response headers:', sendGridError.response.headers);
    }
    throw error;
  }
} 