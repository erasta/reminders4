// import { sendEmail } from '../server/sendgridUtils'; // This import is unused

// Define an interface for the data structure expected by fromDB
export interface ReminderDataFromDB {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyUserId: string | null;
  daysBetweenReminders: number;
  lastReminderDate: string | Date | null; // Can be string from DB or already Date
  createdAt: string | Date; // Can be string from DB or already Date
  // Include other fields if they come directly from the database and are used here
}

export class Reminder {
  constructor(
    public id: string,
    public userId: string,
    public companyId: string,
    public companyName: string,
    public companyUserId: string | null,
    public daysBetweenReminders: number,
    public lastReminderDate: Date | null,
    public createdAt: Date
  ) {}

  getNextDueDate(): Date | null {
    if (!this.lastReminderDate) {
      return null;
    }
    const dueDate = new Date(this.lastReminderDate);
    dueDate.setDate(dueDate.getDate() + this.daysBetweenReminders);
    return dueDate;
  }

  isDue(): boolean {
    const nextDueDate = this.getNextDueDate();
    if (!nextDueDate) {
      return false;
    }
    return nextDueDate <= new Date();
  }

  getDaysUntilDue(): number | null {
    const nextDueDate = this.getNextDueDate();
    if (!nextDueDate) {
      return null;
    }
    const today = new Date();
    const diffTime = nextDueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      companyId: this.companyId,
      companyName: this.companyName,
      companyUserId: this.companyUserId,
      daysBetweenReminders: this.daysBetweenReminders,
      lastReminderDate: this.lastReminderDate?.toISOString() || null,
      nextDueDate: this.getNextDueDate()?.toISOString() || null,
      createdAt: this.createdAt.toISOString(),
      isDue: this.isDue(),
      daysUntilDue: this.getDaysUntilDue()
    };
  }

  getEmailMessage(): string {
    const nextDueDate = this.getNextDueDate();
    return `- ${this.companyName} (Due: ${nextDueDate?.toLocaleDateString() || 'Not set'})`;
  }

  // This static method might be unused. If linting confirms, it can be removed later.
  static async sendRemindersEmail(reminders: Reminder[]): Promise<void> {
    if (reminders.length === 0) return;

    const userEmail = reminders[0].userId; 
    const reminderList = reminders.map(reminder => reminder.getEmailMessage()).join('\n');
    
    const message = `Hello,\n\nYou have the following reminders due:\n\n${reminderList}\n\nPlease take action on these reminders.\n\nBest regards,\nYour Reminder System`;

    // This fetch call would also need an absolute URL for server-side execution
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/send-reminder-email`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userEmail,
        subject: 'Reminder: Companies Due Today',
        text: message,
        html: message.replace(/\n/g, '<br>')
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send reminder email');
    }
  }

  static fromDB(data: ReminderDataFromDB): Reminder { // Use the defined interface
    return new Reminder(
      data.id,
      data.userId,
      data.companyId,
      data.companyName,
      data.companyUserId,
      data.daysBetweenReminders,
      data.lastReminderDate ? new Date(data.lastReminderDate) : null,
      new Date(data.createdAt)
    );
  }
} 