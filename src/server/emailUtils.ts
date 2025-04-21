export async function sendTestEmail(userEmail: string): Promise<{ success: boolean; error?: string }> {
  // For now, just show an alert
  alert(`Test email would be sent to: ${userEmail}\nSubject: Test Email from Reminder App`);
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { success: true };
} 