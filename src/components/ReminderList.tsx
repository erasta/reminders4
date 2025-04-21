import { Reminder } from '@/types/reminder';

interface ReminderListProps {
  reminders: Reminder[];
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onError: (error: string) => void;
}

export default function ReminderList({ reminders, onEditReminder, onDeleteReminder, onError }: ReminderListProps) {
  // Delete a reminder
  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders?id=${reminderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }

      onDeleteReminder(reminderId);
    } catch (error) {
      console.error('Error deleting reminder:', error);
      onError('Failed to delete reminder');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Reminders</h2>
      {reminders.length === 0 ? (
        <p className="text-gray-500 text-center p-4 border rounded bg-white shadow-sm">
          No reminders yet. Add your first reminder above!
        </p>
      ) : (
        reminders.map((reminder) => (
          <div key={reminder.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{reminder.companyName}</h3>
                <p className="text-gray-600">
                  Days between reminders: {reminder.daysBetweenReminders}
                </p>
                <p className="text-gray-600">
                  Last reminder: {reminder.lastReminderDate ? new Date(reminder.lastReminderDate).toLocaleDateString() : 'Never'}
                </p>
                {reminder.companyUserId && (
                  <p className="text-gray-600">
                    Company User ID: {reminder.companyUserId}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditReminder(reminder)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 