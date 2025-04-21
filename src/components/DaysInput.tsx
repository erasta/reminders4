interface DaysInputProps {
  days: number;
  onDaysChange: (days: number) => void;
  disabled?: boolean;
}

export default function DaysInput({ 
  days, 
  onDaysChange,
  disabled = false 
}: DaysInputProps) {
  console.log('DaysInput disabled:', disabled);
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <label htmlFor="days" className="font-medium">Days between reminders:</label>
      <div className="col-span-2">
        <input
          id="days"
          type="number"
          value={days}
          onChange={(e) => onDaysChange(parseInt(e.target.value))}
          placeholder="Days between reminders"
          min="1"
          className="w-full p-2 border rounded"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
} 