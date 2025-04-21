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

export async function sendAllReminders() {
  const result = await getRemindersDueToday();
  
  if (result.error) {
    alert(`Error fetching reminders: ${result.error}`);
    return;
  }

  const reminders = result.reminders as Reminder[];
  
  // Group reminders by user email
  const remindersByUser = reminders.reduce((acc, reminder) => {
    if (!acc[reminder.user_email]) {
      acc[reminder.user_email] = [];
    }
    acc[reminder.user_email].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);

  // Format messages by user
  const messages = Object.entries(remindersByUser)
    .map(([userEmail, userReminders]) => {
      const companyList = userReminders
        .map(r => `  - ${r.company_name}`)
        .join('\n');
      
      const dueDates = userReminders
        .map(r => new Date(r.date_due).toLocaleDateString())
        .join(', ');
      
      return `Dear ${userEmail.split('@')[0]},\n\n` +
             `This is a reminder that the following companies have reached their due date (${dueDates}):\n\n` +
             `${companyList}\n\n` +
             `Please take necessary action.\n` +
             `Best regards,\n` +
             `Your Reminder System`;
    })
    .join('\n\n' + '='.repeat(50) + '\n\n');
  
  alert(`Preparing to send the following messages:\n\n${messages}`);
} 