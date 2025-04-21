// This file is only accessible from server-side code
// List of admin email addresses from environment variable
export const adminEmails = process.env.ADMIN_EMAILS 
  ? process.env.ADMIN_EMAILS.split(',') 
  : [];

/**
 * Check if a user is an admin
 * @param email User's email address
 * @returns true if the user is an admin, false otherwise
 */
export function isAdmin(email: string): boolean {
  return adminEmails.includes(email);
} 