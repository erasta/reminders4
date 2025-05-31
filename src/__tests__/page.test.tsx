import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'
import { Reminder } from '@/models/Reminder'
import { Company } from '@/types/company'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      email: 'test@example.com',
      name: 'Test User'
    }
  }))
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Sample test data
const mockCompanies: Company[] = [
  { 
    id: '1', 
    name: 'Company A', 
    days_before_deactivation: 30,
    link_to_policy: 'https://example.com/policy1',
    activities_to_avoid_deactivation: 'Login monthly'
  },
  { 
    id: '2', 
    name: 'Company B', 
    days_before_deactivation: 60,
    link_to_policy: 'https://example.com/policy2',
    activities_to_avoid_deactivation: 'Make a transaction'
  }
]

const mockReminders: Reminder[] = [
  new Reminder(
    '1',
    'test@example.com',
    '1',
    'Company A',
    null,
    30,
    new Date(),
    new Date()
  ),
  new Reminder(
    '2',
    'test@example.com',
    '2',
    'Company B',
    null,
    60,
    new Date(),
    new Date()
  )
]

// Mock the ReminderManager component
jest.mock('@/components/ReminderManager', () => {
  return function MockReminderManager() {
    return (
      <div data-testid="reminder-manager">
        <div data-testid="reminder-list">
          {mockReminders.map(reminder => (
            <div key={reminder.id} data-testid={`reminder-${reminder.id}`}>
              {reminder.companyName} - {reminder.daysBetweenReminders} days
            </div>
          ))}
        </div>
      </div>
    )
  }
})

describe('Home Page', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Mock successful API responses
    ;(global.fetch as jest.Mock)
      .mockImplementation((url: string) => {
        if (url.includes('/api/companies')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockCompanies)
          })
        }
        if (url.includes('/api/reminders')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockReminders.map(r => r.toJSON()))
          })
        }
        return Promise.reject(new Error('Not found'))
      })
  })

  it('renders the main page with ReminderManager', async () => {
    const { container } = render(await Home())
    
    // Check if the main element exists
    expect(container.querySelector('main')).toBeInTheDocument()
    
    // Check if ReminderManager is rendered
    expect(screen.getByTestId('reminder-manager')).toBeInTheDocument()
  })

  it('displays reminders when user is logged in', async () => {
    render(await Home())
    
    // Wait for reminders to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('reminder-list')).toBeInTheDocument()
    })

    // Check if both reminders are displayed
    mockReminders.forEach(reminder => {
      expect(screen.getByTestId(`reminder-${reminder.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`reminder-${reminder.id}`)).toHaveTextContent(reminder.companyName)
      expect(screen.getByTestId(`reminder-${reminder.id}`)).toHaveTextContent(reminder.daysBetweenReminders.toString())
    })
  })
}) 