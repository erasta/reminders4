import { Reminder } from './Reminder';
import { sql } from '@vercel/postgres';

// Assuming ReminderDataFromDB is defined in Reminder.ts and can be imported or re-defined here
// For simplicity, if Reminder.ts is in the same directory, it might be accessible.
// Or we define a similar interface here if not directly importable.
interface ReminderDataForUserReminders {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyUserId: string | null;
  daysBetweenReminders: number;
  lastReminderDate: string | Date | null;
  createdAt: string | Date;
  // Match this to what Reminder.fromDB expects, which is ReminderDataFromDB
}

export class UserReminders {
  constructor(
    public readonly userId: string,
    public readonly reminders: Reminder[],
    public readonly date: Date = new Date()
  ) {}

  get hasReminders(): boolean {
    return this.reminders.length > 0;
  }

  get dueReminders(): Reminder[] {
    return this.reminders.filter(reminder => reminder.isDue());
  }

  get hasDueReminders(): boolean {
    return this.dueReminders.length > 0;
  }

  async sendEmail(recipientEmail: string): Promise<void> {
    if (!this.hasDueReminders) {
      console.log('No due reminders found, returning early');
      return;
    }

    const dueRemindersToSend = [...this.dueReminders];
    const reminderList = dueRemindersToSend
      .map(reminder => reminder.getEmailMessage())
      .join('\n');
    
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const message = `Hello,\n\nYou have the following reminders due today:\n\n${reminderList}\n\nPlease take action on these reminders.\n\nBest regards,\nYour Reminder System\n\nEmail sent at: ${timestamp}`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/send-reminder-email`;
    console.log('Sending email request to:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: 'Reminder: Companies Due Today',
          text: message,
          html: message.replace(/\n/g, '<br>')
        })
      });

      console.log('Email API response status:', response.status);
      const responseData = await response.json();
      console.log('Email API response data:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to send reminder email. Status: ${response.status}, Response: ${JSON.stringify(responseData)}`);
      }

      console.log('Email sent successfully, updating reminder dates...');
      try {
        for (const reminder of dueRemindersToSend) {
          await sql`UPDATE reminders SET last_reminder_date = CURRENT_TIMESTAMP WHERE id = ${reminder.id};`;
          console.log(`Updated last_reminder_date for reminder ID: ${reminder.id}`);
        }
        console.log('All reminder dates updated successfully');
      } catch (dbError) {
        console.error('Failed to update last_reminder_date after sending email:', dbError);
        throw dbError;
      }
    } catch (error) {
      console.error('Error in sendEmail:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      userId: this.userId,
      reminders: this.reminders.map(reminder => reminder.toJSON()),
      date: this.date.toISOString(),
      hasReminders: this.hasReminders,
      hasDueReminders: this.hasDueReminders,
      dueReminders: this.dueReminders.map(reminder => reminder.toJSON())
    };
  }

  static fromDB(data: { userId: string, reminders: ReminderDataForUserReminders[], date?: string }): UserReminders {
    return new UserReminders(
      data.userId,
      data.reminders.map(reminderData => Reminder.fromDB(reminderData)), // Pass ReminderDataForUserReminders
      data.date ? new Date(data.date) : new Date()
    );
  }
} 