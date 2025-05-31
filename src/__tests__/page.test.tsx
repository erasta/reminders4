import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null))
}))

// Mock the ReminderManager component
jest.mock('@/components/ReminderManager', () => {
  return function MockReminderManager() {
    return <div data-testid="reminder-manager">Reminder Manager</div>
  }
})

describe('Home Page', () => {
  it('renders the main page with ReminderManager', async () => {
    const { container } = render(await Home())
    
    // Check if the main element exists
    expect(container.querySelector('main')).toBeInTheDocument()
    
    // Check if ReminderManager is rendered
    expect(screen.getByTestId('reminder-manager')).toBeInTheDocument()
  })
}) 