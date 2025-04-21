interface LastReminderDateInputProps {
  lastReminderDate: string;
  onLastReminderDateChange: (date: string) => void;
  disabled?: boolean;
}

export default function LastReminderDateInput({ 
  lastReminderDate, 
  onLastReminderDateChange,
  disabled = false 
}: LastReminderDateInputProps) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <label htmlFor="lastDate" className="font-medium">Last Reminder Date:</label>
      <div className="col-span-2">
        <input
          id="lastDate"
          type="date"
          value={lastReminderDate}
          onChange={(e) => onLastReminderDateChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
} 