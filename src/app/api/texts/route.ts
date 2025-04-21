import { NextResponse } from 'next/server';
import { getTexts, addText } from '@/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const texts = await getTexts(session.user.email);
    return NextResponse.json(texts);
  } catch (err) {
    console.error('Error fetching texts:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newText = await addText(session.user.email, content);
    return NextResponse.json(newText);
  } catch (err) {
    console.error('Error adding text:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 