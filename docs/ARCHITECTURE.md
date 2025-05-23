# Reminder System Architecture

## Objects in the System
1. User
2. UserReminders
3. Reminder
4. Company

## Object Containment Relationships
1. User
   - Contains: UserReminders

2. UserReminders
   - Contains: Array of Reminders
   - Contains: Email functionality (sends aggregated reminders to users via sendReminderEmail method)

3. Reminder
   - Contains: Company reference

4. Company
   - No containment of other objects

