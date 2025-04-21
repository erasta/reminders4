export interface Company {
  id: string;
  name: string;
  days_before_deactivation: number;
  link_to_policy: string;
  activities_to_avoid_deactivation: string;
}

export interface Reminder {
  id: string;
  userId: string;
  companyId: string;
  companyName: string;
  companyUserId?: string;
  daysBetweenReminders: number;
  lastReminderDate: string | null;
  createdAt: string;
} 