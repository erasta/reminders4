import { Reminder } from '@/models/Reminder'
import { UserReminders } from '@/models/UserReminders'

// Mock fetch
global.fetch = jest.fn()

// Mock the sendEmail function
jest.mock('@/server/sendgridUtils', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined)
}))

// Mock the database
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn().mockResolvedValue({ rows: [] })
}))

describe('Reminder Email System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should send email for due reminder', async () => {
    // Create a reminder that's due today
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const reminder = new Reminder(
      '1',
      'test@example.com',
      '1',
      'Test Company',
      null,
      1, // days between reminders
      yesterday, // last reminder was yesterday
      new Date()
    )

    // Create UserReminders instance
    const userReminders = new UserReminders('test@example.com', [reminder], new Date())

    // Mock the fetch response for the email API
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/send-reminder-email')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        })
      }
      return Promise.reject(new Error('Not found'))
    })

    // Send the email
    await userReminders.sendEmail('test@example.com')

    // Verify that fetch was called with the correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/send-reminder-email'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: expect.stringContaining('Test Company')
      })
    )

    // Verify the email content
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
    const requestBody = JSON.parse(fetchCall[1].body)
    
    expect(requestBody).toMatchObject({
      to: 'test@example.com',
      subject: 'Reminder: Companies Due Today',
      text: expect.stringContaining('Test Company'),
      html: expect.stringContaining('Test Company')
    })
  })

  it('should not send email if no reminders are due', async () => {
    // Create a reminder that's not due yet
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const reminder = new Reminder(
      '1',
      'test@example.com',
      '1',
      'Test Company',
      null,
      30, // days between reminders
      lastWeek, // last reminder was a week ago
      new Date()
    )

    // Create UserReminders instance
    const userReminders = new UserReminders('test@example.com', [reminder], new Date())

    // Send the email
    await userReminders.sendEmail('test@example.com')

    // Verify that fetch was not called
    expect(global.fetch).not.toHaveBeenCalled()
  })
}) 