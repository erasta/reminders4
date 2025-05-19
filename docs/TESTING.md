# Testing Documentation

## Unit Tests

### Models

#### Reminder Model
- `getNextDueDate()`: Should calculate correct next due date based on last reminder date and days between
- `isDue()`: Should correctly identify if a reminder is due
- `getDaysUntilDue()`: Should calculate correct number of days until due
- `toJSON()`: Should correctly serialize reminder to JSON
- `getEmailMessage()`: Should format reminder message correctly
- `fromDB()`: Should correctly create Reminder instance from database data

#### User Model
- `fromDB()`: Should correctly create User instance from database data
- `toJSON()`: Should correctly serialize user to JSON

#### UserReminders Model
- `hasReminders`: Should correctly identify if user has any reminders
- `dueReminders`: Should correctly filter due reminders
- `hasDueReminders`: Should correctly identify if user has any due reminders
- `sendEmail()`: Should correctly format and send email
- `fromDB()`: Should correctly create UserReminders instance from database data

### Components

#### ReminderList
- Should render empty state when no reminders
- Should render list of reminders
- Should sort reminders by due date
- Should handle delete action
- Should handle edit action
- Should show loading state

#### ReminderRow
- Should render reminder details correctly
- Should show correct status based on due date
- Should handle delete action
- Should handle edit action
- Should handle send action when provided

#### UsersList
- Should render list of users
- Should expand/collapse user details
- Should load user reminders on expand
- Should handle send test email action
- Should handle send all due reminders action
- Should handle delete reminder action
- Should show loading states

#### AddReminder
- Should render form with company selection
- Should validate required fields
- Should handle form submission
- Should show error messages
- Should handle edit mode

### API Routes

#### /api/reminders
- GET: Should return user's reminders
- POST: Should create new reminder
- PUT: Should update existing reminder
- DELETE: Should delete reminder

#### /api/admin/user-reminders
- GET: Should return user's reminders
- Should handle unauthorized access

#### /api/admin/send-test-email
- POST: Should send test email
- Should handle unauthorized access

#### /api/admin/send-single-reminder
- POST: Should send single reminder
- Should handle unauthorized access

#### /api/admin/send-user-due-reminders
- POST: Should send all due reminders for user
- Should handle unauthorized access

## Integration Tests

- User flow: Create reminder -> Edit reminder -> Delete reminder
- Admin flow: View users -> Send test email -> Send reminders
- Email sending flow: Create reminder -> Wait for due date -> Receive email

## End-to-End Tests

- Complete user journey: Sign in -> Create reminder -> Receive email
- Complete admin journey: Sign in -> View users -> Send reminders

## Test Setup

1. Create test database
2. Set up test environment variables
3. Create test utilities for common operations
4. Set up mock email service
5. Create test data fixtures 