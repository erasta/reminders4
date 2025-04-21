import { sendAllReminders } from '../../../server/sendAllReminders';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const userCount = await sendAllReminders();
    return NextResponse.json({ 
      success: true, 
      message: `Reminders sent to ${userCount} users` 
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 