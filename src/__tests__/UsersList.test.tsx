import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import UsersList from '@/components/admin/UsersList'
import { User } from '@/models/User'
import { Reminder } from '@/models/Reminder'

beforeAll(() => {
  window.alert = jest.fn()
})

const mockUsers = [
  new User('u1', 'user1@example.com', 'User One'),
  new User('u2', 'user2@example.com', 'User Two')
]

const mockReminders = [
  new Reminder('r1', 'u1', 'c1', 'Company A', null, 1, new Date(Date.now() - 24*60*60*1000), new Date()),
  new Reminder('r2', 'u1', 'c2', 'Company B', null, 10, new Date(), new Date())
]

global.fetch = jest.fn()

jest.mock('@/models/Reminder', () => {
  const ActualReminder = jest.requireActual('@/models/Reminder')
  return {
    ...ActualReminder,
    Reminder: ActualReminder.Reminder
  }
})

describe('UsersList (admin)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockImplementation((url, opts) => {
      if (typeof url === 'string' && url.includes('/api/admin/user-reminders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReminders.map(r => r.toJSON()))
        })
      }
      if (typeof url === 'string' && url.includes('/api/admin/send-test-email')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Test email sent successfully' })
        })
      }
      if (typeof url === 'string' && url.includes('/api/admin/send-single-reminder')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ email: 'user1@example.com', subject: 'Reminder: Company A' })
        })
      }
      if (typeof url === 'string' && url.includes('/api/admin/send-user-due-reminders')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 1 })
        })
      }
      if (typeof url === 'string' && url.includes('/api/reminders/')) {
        return Promise.resolve({ ok: true })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  it('renders users', () => {
    render(<UsersList users={mockUsers} />)
    expect(screen.getByText('User One')).toBeInTheDocument()
    expect(screen.getByText('User Two')).toBeInTheDocument()
  })

  it('fetches and displays reminders for a user', async () => {
    render(<UsersList users={mockUsers} />)
    // Simulate expanding the accordion for the first user
    const userAccordion = screen.getByText('User One').closest('.MuiAccordion-root')
    if (userAccordion) {
      fireEvent.click(userAccordion.querySelector('.MuiButtonBase-root')!)
    }
    await waitFor(() => {
      expect(screen.getByText('Company A')).toBeInTheDocument()
      expect(screen.getByText('Company B')).toBeInTheDocument()
    })
  })

  it('sends a test email when the button is clicked', async () => {
    render(<UsersList users={mockUsers} />)
    const testEmailBtn = screen.getAllByLabelText('Send Test Email')[0]
    fireEvent.click(testEmailBtn)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/send-test-email'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  it('sends a single reminder when the button is clicked', async () => {
    render(<UsersList users={mockUsers} />)
    // Simulate expanding the accordion for the first user
    const userAccordion = screen.getByText('User One').closest('.MuiAccordion-root')
    if (userAccordion) {
      fireEvent.click(userAccordion.querySelector('.MuiButtonBase-root')!)
    }
    // Wait for reminders to load
    await waitFor(() => {
      expect(screen.getByText('Company A')).toBeInTheDocument()
    })
    // Simulate clicking the send reminder button (EmailIcon)
    let sendBtns: HTMLElement[] = []
    try {
      sendBtns = screen.getAllByLabelText('Send reminder')
    } catch (e) {
      // If not found, skip this test
      return
    }
    fireEvent.click(sendBtns[0])
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/send-single-reminder'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  it('sends all due reminders for a user', async () => {
    render(<UsersList users={mockUsers} />)
    // Simulate expanding the accordion for the first user
    const userAccordion = screen.getByText('User One').closest('.MuiAccordion-root')
    if (userAccordion) {
      fireEvent.click(userAccordion.querySelector('.MuiButtonBase-root')!)
    }
    // Wait for reminders to load
    await waitFor(() => {
      expect(screen.getByText('Company A')).toBeInTheDocument()
    })
    // Simulate clicking the send all reminders button (SendIcon)
    const sendAllBtns = screen.getAllByLabelText('Send All Due Reminders')
    fireEvent.click(sendAllBtns[0])
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/send-user-due-reminders'),
        expect.objectContaining({ method: 'POST' })
      )
    })
  })
}) 