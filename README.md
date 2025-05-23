# Reminders System

A system for managing and sending reminders to users about their company-related tasks.

## Architecture

The system is built around four core objects:

1. **User**
   - Represents a system user
   - Contains UserReminders for managing their reminders

2. **UserReminders**
   - Manages a collection of reminders for a specific user
   - Handles email notifications for due reminders
   - Contains an array of Reminder objects

3. **Reminder**
   - Represents a single reminder for a company
   - Contains company reference and reminder settings
   - Tracks due dates and reminder history

4. **Company**
   - Represents a company in the system
   - Contains company-specific settings and policies

## Features

- User management with email notifications
- Reminder tracking and scheduling
- Company-specific reminder settings
- Email notifications for due reminders
- Automatic reminder processing

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Database

The system uses PostgreSQL with the following main tables:
- users
- reminders

See `docs/ARCHITECTURE.md` for detailed database schema.

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

The system is designed to be deployed on any Node.js hosting platform. See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## License

MIT
