import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CompanySelect from './CompanySelect';
import DaysInput from './DaysInput';
import CompanyUserIdInput from './CompanyUserIdInput';
import LastReminderDateInput from './LastReminderDateInput';
import { Company, Reminder } from '@/types/reminder';

interface AddReminderProps {
  companies: Company[];
  onReminderAdded: (newReminder: Reminder) => void;
  onError: (error: string) => void;
}

export default function AddReminder({ companies, onReminderAdded, onError }: AddReminderProps) {
  const { data: session } = useSession();
  const [selectedCompany, setSelectedCompany] = useState('');
  const [daysBetweenReminders, setDaysBetweenReminders] = useState(120);
  const [companyUserId, setCompanyUserId] = useState(session?.user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [lastReminderDate, setLastReminderDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Update days when company is selected
  useEffect(() => {
    if (selectedCompany) {
      const company = companies.find(c => c.id === selectedCompany);
      if (company) {
        const days = company.days_before_deactivation || 120;
        setDaysBetweenReminders(days);
      }
    } else {
      // Reset to default state when no company is selected
      setDaysBetweenReminders(120);
    }
  }, [selectedCompany, companies]);

  // Update companyUserId when session changes
  useEffect(() => {
    if (session?.user?.email) {
      setCompanyUserId(session.user.email);
    }
  }, [session]);

  // Compute isDaysEditable based on company's default days
  const isDaysEditable = selectedCompany !== '' && companies.find(c => c.id === selectedCompany)?.days_before_deactivation === 0;

  // Add a new reminder
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !daysBetweenReminders || !companyUserId.trim()) return;

    // Find the selected company to get its name
    const selectedCompanyData = companies.find(company => company.id === selectedCompany);
    if (!selectedCompanyData) {
      onError('Selected company not found');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Adding reminder for company:', selectedCompanyData.name);
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId: selectedCompany,
          companyName: selectedCompanyData.name,
          companyUserId: companyUserId.trim(),
          daysBetweenReminders: daysBetweenReminders,
          lastReminderDate: lastReminderDate
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.error || responseData.details || 'Failed to add reminder');
      }

      onReminderAdded(responseData);
      
      // Reset form
      setSelectedCompany('');
      setDaysBetweenReminders(120);
      setCompanyUserId(session?.user?.email || '');
      setLastReminderDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error adding reminder:', error);
      onError(error instanceof Error ? error.message : 'Failed to add reminder');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 border rounded bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Add New Reminder</h2>
      <form onSubmit={handleAddReminder} className="space-y-4">
        <CompanySelect
          companies={companies}
          selectedCompany={selectedCompany}
          onCompanyChange={setSelectedCompany}
        />
        <DaysInput
          days={daysBetweenReminders}
          onDaysChange={setDaysBetweenReminders}
          disabled={!isDaysEditable}
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
            {isLoading ? 'Saving...' : 'Add Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
} 