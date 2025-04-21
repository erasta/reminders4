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
  const [companyUserId, setCompanyUserId] = useState(session?.user?.email || '');
  const [isDaysEditable, setIsDaysEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [lastReminderDate, setLastReminderDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  // Update companyUserId when session changes
  useEffect(() => {
    if (session?.user?.email) {
      setCompanyUserId(session.user.email);
    }
  }, [session]);

  // Add a new reminder
  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !daysBetweenReminders || !companyUserId.trim()) return;

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

      setReminders(prevReminders => [responseData, ...prevReminders]);
      setSelectedCompany('');
      setDaysBetweenReminders(120);
      setCompanyUserId(session?.user?.email || '');
      setIsDaysEditable(false);
      setLastReminderDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error adding reminder:', error);
      setError(error instanceof Error ? error.message : 'Failed to add reminder');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a reminder
  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders?id=${reminderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }

      setReminders(prevReminders => 
        prevReminders.filter(reminder => reminder.id !== reminderId)
      );
    } catch (error) {
      console.error('Error deleting reminder:', error);
      setError('Failed to delete reminder');
    }
  };

  // Edit a reminder
  const handleEditReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReminder || !companyUserId.trim() || !daysBetweenReminders) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reminders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reminderId: editingReminder.id,
          companyUserId: companyUserId.trim(),
          daysBetweenReminders,
          lastReminderDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }

      const updatedReminder = await response.json();
      setReminders(prevReminders =>
        prevReminders.map(reminder =>
          reminder.id === editingReminder.id ? updatedReminder : reminder
        )
      );
      setEditingReminder(null);
      setCompanyUserId('');
      setDaysBetweenReminders(120);
      setIsDaysEditable(false);
    } catch (error) {
      console.error('Error updating reminder:', error);
      setError('Failed to update reminder');
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing a reminder
  const startEditing = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setCompanyUserId(reminder.companyUserId || '');
    setDaysBetweenReminders(reminder.daysBetweenReminders);
    setIsDaysEditable(true);
    setLastReminderDate(reminder.lastReminderDate ? new Date(reminder.lastReminderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingReminder(null);
    setCompanyUserId(session?.user?.email || '');
    setDaysBetweenReminders(120);
    setIsDaysEditable(false);
    setLastReminderDate(new Date().toISOString().split('T')[0]);
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

      {/* Add/Edit Reminder Form */}
      <div className="mb-8 p-6 border rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
        </h2>
        {editingReminder && (
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p className="font-medium">Company: {editingReminder.companyName}</p>
          </div>
        )}
        <form onSubmit={editingReminder ? handleEditReminder : handleAddReminder} className="space-y-4">
          {!editingReminder && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <label htmlFor="company" className="font-medium">Company:</label>
              <div className="col-span-2">
                <select
                  id="company"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.days_before_deactivation || 120} days)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 items-center">
            <label htmlFor="days" className="font-medium">Days between reminders:</label>
            <div className="col-span-2">
              <input
                id="days"
                type="number"
                value={daysBetweenReminders}
                onChange={(e) => setDaysBetweenReminders(parseInt(e.target.value))}
                placeholder="Days between reminders"
                min="1"
                className="w-full p-2 border rounded"
                required
                disabled={!isDaysEditable}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <label htmlFor="userId" className="font-medium">Company User ID:</label>
            <div className="col-span-2">
              <input
                id="userId"
                type="text"
                value={companyUserId}
                onChange={(e) => setCompanyUserId(e.target.value)}
                placeholder="Your ID/account number with the company"
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center">
            <label htmlFor="lastDate" className="font-medium">Last Reminder Date:</label>
            <div className="col-span-2">
              <input
                id="lastDate"
                type="date"
                value={lastReminderDate}
                onChange={(e) => setLastReminderDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? 'Saving...' : (editingReminder ? 'Save Changes' : 'Add Reminder')}
            </button>
            {editingReminder && (
              <button
                type="button"
                onClick={cancelEditing}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
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
                    onClick={() => startEditing(reminder)}
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
    </div>
  );
} 