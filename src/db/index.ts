import { sql } from '@vercel/postgres';

export async function getTexts(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM texts 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching texts:', error);
    throw error;
  }
}

export async function addText(userId: string, content: string) {
  try {
    const result = await sql`
      INSERT INTO texts (user_id, content)
      VALUES (${userId}, ${content})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error adding text:', error);
    throw error;
  }
} 