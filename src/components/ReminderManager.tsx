'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Company {
  id: string;
  name: string;
  days_before_deactivation: number;
  link_to_policy: string;
  activities_to_avoid_deactivation: string;
}

interface Reminder {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyUserId?: string;
  daysBetweenReminders: number;
  lastReminderDate: string | null;
  createdAt: string;
}

export default function ReminderManager() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [daysBetweenReminders, setDaysBetweenReminders] = useState(120);
  const [companyUserId, setCompanyUserId] = useState('');
  const [isDaysEditable, setIsDaysEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies from CSV and reminders from API
  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.email) return;
      
      try {
        // Fetch companies from CSV
        const companiesResponse = await fetch('/api/companies');
        if (!companiesResponse.ok) {
          throw new Error('Failed to fetch companies');
        }
        const companiesData = await companiesResponse.json();
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
        
        // Fetch reminders
        const remindersResponse = await fetch('/api/reminders');
        if (!remindersResponse.ok) {
          throw new Error('Failed to fetch reminders');
        }
        const remindersData = await remindersResponse.json();
        setReminders(Array.isArray(remindersData) ? remindersData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      }
    }

    fetchData();
  }, [session]);

  // Update days when company is selected
  useEffect(() => {
    if (selectedCompany) {
      const company = companies.find(c => c.id === selectedCompany);
      if (company) {
        const days = company.days_before_deactivation || 120;
        setDaysBetweenReminders(days);
        setIsDaysEditable(days === 0);
      }
    }
  }, [selectedCompany, companies]);

  // Add a new reminder
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !daysBetweenReminders) return;

    // Find the selected company to get its name
    const selectedCompanyData = companies.find(company => company.id === selectedCompany);
    if (!selectedCompanyData) {
      setError('Selected company not found');
      return;
    }

    setIsLoading(true);
    setError(null);
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
          companyUserId: companyUserId.trim() || undefined,
          daysBetweenReminders: daysBetweenReminders
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.error || responseData.details || 'Failed to add reminder');
      }

      setReminders(prevReminders => [responseData, ...prevReminders]);
      setSelectedCompany('');
      setDaysBetweenReminders(120);
      setCompanyUserId('');
      setIsDaysEditable(false);
    } catch (error) {
      console.error('Error adding reminder:', error);
      setError(error instanceof Error ? error.message : 'Failed to add reminder');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a reminder as completed
  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reminderId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }

      const updatedReminder = await response.json();
      setReminders(prevReminders => 
        prevReminders.map(reminder => 
          reminder.id === reminderId ? updatedReminder : reminder
        )
      );
    } catch (error) {
      console.error('Error updating reminder:', error);
      setError('Failed to update reminder');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add Reminder Form */}
      <div className="mb-8 p-6 border rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Reminder</h2>
        <form onSubmit={handleAddReminder} className="space-y-4">
          <div className="flex gap-4">
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="flex-1 p-2 border rounded"
              required
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.days_before_deactivation || 120} days)
                </option>
              ))}
            </select>
            <input
              type="number"
              value={daysBetweenReminders}
              onChange={(e) => setDaysBetweenReminders(parseInt(e.target.value))}
              placeholder="Days between reminders"
              min="1"
              className="w-48 p-2 border rounded"
              required
              disabled={!isDaysEditable}
            />
          </div>
          <div>
            <input
              type="text"
              value={companyUserId}
              onChange={(e) => setCompanyUserId(e.target.value)}
              placeholder="Your ID/account number with the company (optional)"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !selectedCompany}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Adding...' : 'Add Reminder'}
          </button>
        </form>
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Your Reminders</h2>
        {reminders.length === 0 ? (
          <p className="text-gray-500 text-center p-4 border rounded bg-white shadow-sm">
            No reminders yet. Add your first reminder above!
          </p>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-4 border rounded bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{reminder.companyName}</h3>
                  {reminder.companyUserId && (
                    <p className="text-sm text-gray-600">
                      Your ID: {reminder.companyUserId}
                    </p>
                  )}
                  <p className="text-gray-600">
                    Remind every {reminder.daysBetweenReminders} days
                  </p>
                  {reminder.lastReminderDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Last reminded: {new Date(reminder.lastReminderDate).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(reminder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCompleteReminder(reminder.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 