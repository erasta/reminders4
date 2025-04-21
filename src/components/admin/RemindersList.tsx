'use client';

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

// Helper function to format dates safely
function formatDate(dateString: string | Date): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

type RemindersListProps = {
  reminders: Reminder[];
  error: string | null;
};

export default function RemindersList({ reminders, error }: RemindersListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Reminders Due Today</h3>
      {error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-md">
          <p className="font-medium">Error loading reminders:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : reminders.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No reminders are due today.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Reminder</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reminders.map((reminder) => (
              <tr key={reminder.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reminder.user_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {reminder.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(reminder.last_reminder_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reminder.days_between_reminders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(reminder.date_due)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 