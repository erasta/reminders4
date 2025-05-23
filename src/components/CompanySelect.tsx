import { Company } from '@/types/company';

interface CompanySelectProps {
  companies: Company[];
  selectedCompany: string;
  onCompanyChange: (companyId: string) => void;
  disabled?: boolean;
}

export default function CompanySelect({ 
  companies, 
  selectedCompany, 
  onCompanyChange,
  disabled = false 
}: CompanySelectProps) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      <label htmlFor="company" className="font-medium">Company:</label>
      <div className="col-span-2">
        <select
          id="company"
          value={selectedCompany}
          onChange={(e) => onCompanyChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={disabled}
        >
          <option value="">Select a company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name} ({company.days_before_deactivation || 120} days)
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 