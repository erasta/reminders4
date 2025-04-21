'use server';

import { getServerSession } from 'next-auth';
import { isAdmin } from '../server/adminUsers';
import { sql } from '@vercel/postgres';

/**
 * Check if the current user is an admin
 * @returns true if the user is an admin, false otherwise
 */
export async function checkIsAdmin(): Promise<boolean> {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    return false;
  }
  
  return isAdmin(session.user.email);
}

export async function getAllUsers() {
  const session = await getServerSession();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return { error: 'Unauthorized' };
  }

  try {
    const result = await sql.query(
      `SELECT id, email, created_at FROM users ORDER BY created_at DESC`
    );
    return { users: result.rows };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: 'Failed to fetch users' };
  }
} 