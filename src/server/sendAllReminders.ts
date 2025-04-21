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
  const reminderDetails = reminders.map(r => 
    `${r.user_email} - ${r.company_name} (Due: ${new Date(r.date_due).toLocaleDateString()})`
  ).join('\n');
  
  alert(`Sending reminders to all users:\n\n${reminderDetails}`);
} 