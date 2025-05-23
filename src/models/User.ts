import { UserReminders } from './UserReminders';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string | null = null,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  get displayName(): string {
    return this.name || this.email;
  }

  async getDueReminders(): Promise<UserReminders> {
    const response = await fetch(`/api/reminders/due-today`);
    if (!response.ok) {
      throw new Error('Failed to fetch due reminders');
    }

    const data = await response.json();
    const userReminders = data.userReminders.find(
      (ur: UserReminders) => ur.userId === this.id
    );

    if (!userReminders) {
      return UserReminders.fromDB({
        userId: this.id,
        reminders: []
      });
    }

    return UserReminders.fromDB(userReminders);
  }

  async sendReminderEmail(): Promise<void> {
    const userReminders = await this.getDueReminders();
    if (userReminders.hasDueReminders) {
      await userReminders.sendEmail(this.email);
    }
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      displayName: this.displayName,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  static fromDB(data: {
    id: string;
    email: string;
    name?: string | null;
    created_at?: string;
    updated_at?: string;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name || null,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date()
    );
  }
} 