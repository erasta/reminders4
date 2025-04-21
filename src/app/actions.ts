'use server';

import { getServerSession } from 'next-auth';
import { isAdmin } from '../server/adminUsers';

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