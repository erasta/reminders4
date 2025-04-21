interface CompanyUserIdInputProps {
  companyUserId: string;
  onCompanyUserIdChange: (userId: string) => void;
  disabled?: boolean;
}

export default function CompanyUserIdInput({ 
  companyUserId, 
  onCompanyUserIdChange,
  disabled = false 
}: CompanyUserIdInputProps) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <label htmlFor="userId" className="font-medium">Company User ID:</label>
      <div className="col-span-2">
        <input
          id="userId"
          type="text"
          value={companyUserId}
          onChange={(e) => onCompanyUserIdChange(e.target.value)}
          placeholder="Your ID/account number with the company"
          className="w-full p-2 border rounded"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
} 