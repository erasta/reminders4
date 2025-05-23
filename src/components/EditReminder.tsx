import { useState } from 'react';
import DaysInput from './DaysInput';
import CompanyUserIdInput from './CompanyUserIdInput';
import LastReminderDateInput from './LastReminderDateInput';
import { Reminder } from '@/models/Reminder';

interface EditReminderProps {
  reminder: Reminder;
  onReminderUpdated: (updatedReminder: Reminder) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export default function EditReminder({ reminder, onReminderUpdated, onCancel, onError }: EditReminderProps) {
  const [daysBetweenReminders, setDaysBetweenReminders] = useState(reminder.daysBetweenReminders);
  const [companyUserId, setCompanyUserId] = useState(reminder.companyUserId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [lastReminderDate, setLastReminderDate] = useState<string>(
    reminder.lastReminderDate ? new Date(reminder.lastReminderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );

  // Edit a reminder
  const handleEditReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyUserId.trim() || !daysBetweenReminders) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/reminders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminderId: reminder.id,
          companyUserId: companyUserId.trim(),
          daysBetweenReminders,
          lastReminderDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }

      const updatedReminder = await response.json();
      onReminderUpdated(updatedReminder);
    } catch (error) {
      console.error('Error updating reminder:', error);
      onError('Failed to update reminder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 border rounded bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Edit Reminder</h2>
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="font-medium">Company: {reminder.companyName}</p>
      </div>
      <form onSubmit={handleEditReminder} className="space-y-4">
        <DaysInput
          days={daysBetweenReminders}
          onDaysChange={setDaysBetweenReminders}
          disabled={false}
        />
        <CompanyUserIdInput
          companyUserId={companyUserId}
          onCompanyUserIdChange={setCompanyUserId}
        />
        <LastReminderDateInput
          lastReminderDate={lastReminderDate}
          onLastReminderDateChange={setLastReminderDate}
        />
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 