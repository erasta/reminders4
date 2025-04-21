# Reminders App

A Next.js application for managing account deactivation reminders across different companies. The app helps users track when they need to take action to prevent their accounts from being deactivated due to inactivity.

## Features

- 🔐 Google Authentication
- 📅 Reminder Management
  - Create reminders for different companies
  - Track last activity date
  - Customize reminder intervals
  - Edit and delete reminders
- 📊 Company Data Management via CSV
- 🎨 Modern UI with Tailwind CSS
- 🔒 Secure API Routes
- 🗄️ PostgreSQL Database

## Architecture

### Tech Stack
- **Frontend**: Next.js 14+ with React Server Components
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google Provider
- **Database**: PostgreSQL
- **API**: Next.js API Routes
- **Type Safety**: TypeScript

### Project Structure
```
reminders4/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── companies/    # Company data endpoints
│   │   │   └── reminders/    # Reminder management endpoints
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/            # React Components
│   │   ├── LoginButton.tsx   # Authentication UI
│   │   └── ReminderManager.tsx # Main reminder interface
│   └── db.ts                  # Database utilities
├── companies.csv              # Company data source
├── schema.sql                 # Database schema
└── .env.local                 # Environment variables
```

### Database Schema

```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_user_id TEXT,
    days_between_reminders INTEGER NOT NULL,
    last_reminder_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Routes

- `GET /api/companies`: Fetches company data from CSV file
- `GET /api/reminders`: Retrieves user's reminders
- `POST /api/reminders`: Creates a new reminder
- `PUT /api/reminders`: Updates an existing reminder
- `DELETE /api/reminders`: Deletes a reminder

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd reminders4
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reminders

# Authentication
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. Set up the database:
```bash
# Create database and tables
psql -U postgres -f schema.sql
```

5. Add company data:
Create a `companies.csv` file in the root directory with the following structure:
```csv
company_id,company_name,days_before_deactivation,link_to_policy,activities_to_avoid_deactivation
```

6. Run the development server:
```bash
npm run dev
```

## Usage

1. Log in using your Google account
2. Select a company from the dropdown
3. The days between reminders will be automatically set based on the company's policy
4. Add your company-specific user ID (optional)
5. Set the last reminder date
6. Manage your reminders through the interface

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Security

- All API routes are protected with NextAuth.js
- Database queries are parameterized to prevent SQL injection
- Environment variables are used for sensitive data
- CORS is configured for API routes
- CSP headers are set for enhanced security

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
