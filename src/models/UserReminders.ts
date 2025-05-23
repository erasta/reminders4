import { Reminder } from './Reminder';

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
    if (!this.hasDueReminders) return;

    const reminderList = this.dueReminders
      .map(reminder => reminder.getEmailMessage())
      .join('\n');
    
    const message = `Hello,\n\nYou have the following reminders due today:\n\n${reminderList}\n\nPlease take action on these reminders.\n\nBest regards,\nYour Reminder System`;

    // Construct absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/send-reminder-email`;

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

    if (!response.ok) {
      throw new Error('Failed to send reminder email');
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

  static fromDB(data: { userId: string, reminders: any[], date?: string }): UserReminders {
    return new UserReminders(
      data.userId,
      data.reminders.map(reminder => Reminder.fromDB(reminder)),
      data.date ? new Date(data.date) : new Date()
    );
  }
} 