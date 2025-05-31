import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import RemindersList from '@/components/admin/RemindersList'
import { Reminder } from '@/models/Reminder'
import { sendAllReminders } from '@/server/sendAllReminders'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'

jest.mock('@/server/sendAllReminders', () => ({
  sendAllReminders: jest.fn().mockResolvedValue(['user1'])
}))

beforeAll(() => {
  // Mock window.alert for all tests
  window.alert = jest.fn()
})

const mockReminders = [
  // Due today
  new Reminder('1', 'user1', 'c1', 'Company A', null, 1, new Date(Date.now() - 24*60*60*1000), new Date()),
  // Overdue
  new Reminder('2', 'user2', 'c2', 'Company B', null, 1, new Date(Date.now() - 3*24*60*60*1000), new Date()),
  // Not due
  new Reminder('3', 'user3', 'c3', 'Company C', null, 10, new Date(), new Date())
]

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  )
}

describe('RemindersList (admin)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders due today and overdue reminders', () => {
    renderWithI18n(<RemindersList reminders={mockReminders} error={null} onRemindersSent={jest.fn()} />)
    expect(screen.getAllByText('Reminders Due Today').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Overdue Reminders').length).toBeGreaterThan(0)
    expect(screen.getByText('Company A')).toBeInTheDocument()
    expect(screen.getByText('Company B')).toBeInTheDocument()
    // Company C is not due or overdue, so it should not be in the table
    // expect(screen.getByText('Company C')).toBeInTheDocument()
  })

  it('calls sendAllReminders with due today reminders', async () => {
    renderWithI18n(<RemindersList reminders={mockReminders} error={null} onRemindersSent={jest.fn()} />)
    const sendTodayBtn = screen.getByText(/Send Due Today/)
    fireEvent.click(sendTodayBtn)
    await waitFor(() => {
      expect(sendAllReminders).toHaveBeenCalled()
    })
  })

  it('calls sendAllReminders with overdue reminders', async () => {
    renderWithI18n(<RemindersList reminders={mockReminders} error={null} onRemindersSent={jest.fn()} />)
    const sendOverdueBtn = screen.getByText(/Send Overdue/)
    fireEvent.click(sendOverdueBtn)
    await waitFor(() => {
      expect(sendAllReminders).toHaveBeenCalled()
    })
  })

  it('shows error alert if error prop is set', () => {
    renderWithI18n(<RemindersList reminders={mockReminders} error={'Test error'} onRemindersSent={jest.fn()} />)
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })
}) 