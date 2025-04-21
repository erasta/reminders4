import { getRemindersDueToday } from '../app/actions';

type Reminder = {
  id: string;
  company_id: string;
  company_name: string;
  company_user_id: string | null;
  days_between_reminders: number;
  last_reminder_date: Date;
  date_due: string;
  user_email: string;
};

// Helper function to convert string to title case
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Group reminders by user email
function groupRemindersByUser(reminders: Reminder[]): Record<string, Reminder[]> {
  return reminders.reduce((acc, reminder) => {
    if (!acc[reminder.user_email]) {
      acc[reminder.user_email] = [];
    }
    acc[reminder.user_email].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);
}

// Create a message for a single user
function createUserMessage(userEmail: string, userReminders: Reminder[]): string {
  const companyList = userReminders
    .map(r => `  - ${r.company_name}\n    User ID: ${r.company_user_id || 'Not assigned'}`)
    .join('\n');
  
  const dueDates = userReminders
    .map(r => new Date(r.date_due).toLocaleDateString())
    .join(', ');
  
  const userName = toTitleCase(userEmail.split('@')[0].replace(/[._-]/g, ' '));
  
  return `Dear ${userName},\n\n` +
         `This is a reminder that the following companies have reached their due date (${dueDates}):\n\n` +
         `${companyList}\n\n` +
         `Please take necessary action.\n` +
         `Best regards,\n` +
         `Your Reminder System`;
}

export async function sendAllReminders() {
  const result = await getRemindersDueToday();
  
  if (result.error) {
    alert(`Error fetching reminders: ${result.error}`);
    return;
  }

  const reminders = result.reminders as Reminder[];
  const remindersByUser = groupRemindersByUser(reminders);

  // Format messages by user
  const messages = Object.entries(remindersByUser)
    .map(([userEmail, userReminders]) => createUserMessage(userEmail, userReminders))
    .join('\n\n' + '='.repeat(50) + '\n\n');
  
  alert(`Preparing to send the following messages:\n\n${messages}`);
} 