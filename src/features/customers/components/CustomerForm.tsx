import { useState, useEffect } from 'react';
import { Customer } from '@/shared/lib/db';
import { createCustomerSchema, CreateCustomerInput } from '../schemas/customer.schema';
import { Button, Input, Textarea, Checkbox, Modal } from '@/shared/components/ui';
import { ZodError } from 'zod';
import './CustomerForm.css';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerInput) => Promise<void>;
  customer?: Customer | null;
  salesConsultantName: string;
}

const initialFormData: any = {
  name: '',
  phone: '',
  email: '',
  nric: '',
  dob: '',
  occupation: '',
  address: '',
  addressContinue: '',
  salesConsultant: '',
  vsaNo: '',
  dealClosed: false,
  notes: '',
  checklist: {},

  // Proposal fields
  proposalModel: '',
  proposalBank: '',
  proposalSellingPrice: '',
  proposalInterestRate: '',
  proposalDownpayment: '',
  proposalLoanTenure: '',
  proposalLoanAmount: '',
  proposalAdminFee: '',
  proposalReferralFee: '',
  proposalTradeInModel: '',
  proposalTradeInCarPlate: '',
  proposalQuotedTradeInPrice: '',
  proposalLowLoanSurcharge: '',
  proposalNoLoanSurcharge: '',
  proposalBenefitsGiven: '',
  proposalRemarks: '',

  // VSA fields
  vsaMakeModel: '',
  vsaYearOfManufacture: '',
  vsaBodyColour: '',
  vsaUpholstery: '',
  vsaPrzType: '',
  vsaPackage: '',
  vsaSellingWithCOE: '',
  vsaSellingPriceOnPriceList: '',
  vsaPurchasePriceWithCOE: '',
  vsaCoeRebateLevel: '',
  vsaDeposit: '',
  vsaLessOthers: '',
  vsaAddOthers: '',
  vsaApproximateDeliveryDate: '',
  vsaTradeInCarNo: '',
  vsaTradeInCarModel: '',
  vsaTradeInAmount: '',
  vsaDateOfRegistration: '',
  vsaRegistrationNo: '',
  vsaChassisNo: '',
  vsaEngineNo: '',
  vsaMotorNo: '',
  vsaInsuranceCompany: '',
  vsaInsuranceFee: '',
  vsaLoanAmount: '',
  vsaInterest: '',
  vsaTenure: '',
  vsaAdminFee: '',
  vsaInsuranceSubsidy: '',
  vsaMonthlyRepayment: '',
};

export function CustomerForm({
  isOpen,
  onClose,
  onSubmit,
  customer,
  salesConsultantName,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<any>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    address: true,
    sales: true,
    proposal: false,
    vsa: false,
  });

  const isEditing = !!customer;

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        nric: customer.nric,
        dob: customer.dob,
        occupation: customer.occupation || '',
        address: customer.address,
        addressContinue: customer.addressContinue || '',
        salesConsultant: customer.salesConsultant,
        vsaNo: customer.vsaNo || '',
        dealClosed: customer.dealClosed,
        notes: customer.notes || '',
        checklist: customer.checklist || {},

        // Proposal fields
        proposalModel: customer.proposalModel || '',
        proposalBank: customer.proposalBank || '',
        proposalSellingPrice: customer.proposalSellingPrice || '',
        proposalInterestRate: customer.proposalInterestRate || '',
        proposalDownpayment: customer.proposalDownpayment || '',
        proposalLoanTenure: customer.proposalLoanTenure || '',
        proposalLoanAmount: customer.proposalLoanAmount || '',
        proposalAdminFee: customer.proposalAdminFee || '',
        proposalReferralFee: customer.proposalReferralFee || '',
        proposalTradeInModel: customer.proposalTradeInModel || '',
        proposalTradeInCarPlate: customer.proposalTradeInCarPlate || '',
        proposalQuotedTradeInPrice: customer.proposalQuotedTradeInPrice || '',
        proposalLowLoanSurcharge: customer.proposalLowLoanSurcharge || '',
        proposalNoLoanSurcharge: customer.proposalNoLoanSurcharge || '',
        proposalBenefitsGiven: customer.proposalBenefitsGiven || '',
        proposalRemarks: customer.proposalRemarks || '',

        // VSA fields
        vsaMakeModel: customer.vsaMakeModel || '',
        vsaYearOfManufacture: customer.vsaYearOfManufacture || '',
        vsaBodyColour: customer.vsaBodyColour || '',
        vsaUpholstery: customer.vsaUpholstery || '',
        vsaPrzType: customer.vsaPrzType || '',
        vsaPackage: customer.vsaPackage || '',
        vsaSellingWithCOE: customer.vsaSellingWithCOE || '',
        vsaSellingPriceOnPriceList: customer.vsaSellingPriceOnPriceList || '',
        vsaPurchasePriceWithCOE: customer.vsaPurchasePriceWithCOE || '',
        vsaCoeRebateLevel: customer.vsaCoeRebateLevel || '',
        vsaDeposit: customer.vsaDeposit || '',
        vsaLessOthers: customer.vsaLessOthers || '',
        vsaAddOthers: customer.vsaAddOthers || '',
        vsaApproximateDeliveryDate: customer.vsaApproximateDeliveryDate || '',
        vsaTradeInCarNo: customer.vsaTradeInCarNo || '',
        vsaTradeInCarModel: customer.vsaTradeInCarModel || '',
        vsaTradeInAmount: customer.vsaTradeInAmount || '',
        vsaDateOfRegistration: customer.vsaDateOfRegistration || '',
        vsaRegistrationNo: customer.vsaRegistrationNo || '',
        vsaChassisNo: customer.vsaChassisNo || '',
        vsaEngineNo: customer.vsaEngineNo || '',
        vsaMotorNo: customer.vsaMotorNo || '',
        vsaInsuranceCompany: customer.vsaInsuranceCompany || '',
        vsaInsuranceFee: customer.vsaInsuranceFee || '',
        vsaLoanAmount: customer.vsaLoanAmount || '',
        vsaInterest: customer.vsaInterest || '',
        vsaTenure: customer.vsaTenure || '',
        vsaAdminFee: customer.vsaAdminFee || '',
        vsaInsuranceSubsidy: customer.vsaInsuranceSubsidy || '',
        vsaMonthlyRepayment: customer.vsaMonthlyRepayment || '',
      });
    } else {
      setFormData({
        ...initialFormData,
        salesConsultant: salesConsultantName,
      });
    }
    setErrors({});
  }, [customer, salesConsultantName, isOpen]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev: Record<string, boolean>) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev: any) => ({ ...prev, [name]: newValue }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      createCustomerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save customer:', error);
      setErrors({ submit: 'Failed to save customer. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Customer' : 'Add New Customer'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="customer-form">
        {errors.submit && (
          <div className="form-error-banner">{errors.submit}</div>
        )}

        <div className="form-section">
          <h3 className="form-section-title">Personal Information</h3>
          <div className="form-grid">
            <Input
              label="Full Name *"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="e.g., John Doe"
            />
            <Input
              label="NRIC *"
              name="nric"
              value={formData.nric}
              onChange={handleChange}
              error={errors.nric}
              placeholder="e.g., S1234567A"
              style={{ textTransform: 'uppercase' }}
            />
            <Input
              label="Phone Number *"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="e.g., +65 9123 4567"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="e.g., john@email.com"
            />
            <Input
              label="Date of Birth *"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              error={errors.dob}
            />
            <Input
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              error={errors.occupation}
              placeholder="e.g., Engineer"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Address</h3>
          <div className="form-grid">
            <Input
              label="Address *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="e.g., 123 Main Street #01-01"
              className="full-width"
            />
            <Input
              label="Address (continued)"
              name="addressContinue"
              value={formData.addressContinue}
              onChange={handleChange}
              error={errors.addressContinue}
              placeholder="e.g., Singapore 123456"
              className="full-width"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Sales Information</h3>
          <div className="form-grid">
            <Input
              label="Sales Consultant *"
              name="salesConsultant"
              value={formData.salesConsultant}
              onChange={handleChange}
              error={errors.salesConsultant}
            />
            <Input
              label="VSA Number"
              name="vsaNo"
              value={formData.vsaNo}
              onChange={handleChange}
              error={errors.vsaNo}
              placeholder="e.g., VSA-2024-001"
            />
          </div>
          <div className="form-checkbox-row">
            <Checkbox
              label="Deal Closed"
              name="dealClosed"
              checked={formData.dealClosed}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Proposal Section */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('proposal')}>
            <h3 className="form-section-title">Proposal Information</h3>
            <span className="toggle-icon">{expandedSections.proposal ? '▼' : '▶'}</span>
          </div>
          {expandedSections.proposal && (
            <>
              <div className="form-grid">
                <Input
                  label="Model"
                  name="proposalModel"
                  value={formData.proposalModel}
                  onChange={handleChange}
                  placeholder="e.g., BYD Seal"
                />
                <Input
                  label="Bank"
                  name="proposalBank"
                  value={formData.proposalBank}
                  onChange={handleChange}
                  placeholder="e.g., DBS"
                />
                <Input
                  label="Selling Price"
                  name="proposalSellingPrice"
                  type="number"
                  value={formData.proposalSellingPrice}
                  onChange={handleChange}
                  placeholder="e.g., 150000"
                />
                <Input
                  label="Interest Rate (%)"
                  name="proposalInterestRate"
                  type="number"
                  step="0.01"
                  value={formData.proposalInterestRate}
                  onChange={handleChange}
                  placeholder="e.g., 2.68"
                />
                <Input
                  label="Downpayment"
                  name="proposalDownpayment"
                  type="number"
                  value={formData.proposalDownpayment}
                  onChange={handleChange}
                  placeholder="e.g., 30000"
                />
                <Input
                  label="Loan Tenure (months)"
                  name="proposalLoanTenure"
                  type="number"
                  value={formData.proposalLoanTenure}
                  onChange={handleChange}
                  placeholder="e.g., 84"
                />
                <Input
                  label="Loan Amount"
                  name="proposalLoanAmount"
                  type="number"
                  value={formData.proposalLoanAmount}
                  onChange={handleChange}
                  placeholder="e.g., 120000"
                />
                <Input
                  label="Admin Fee"
                  name="proposalAdminFee"
                  type="number"
                  value={formData.proposalAdminFee}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                />
                <Input
                  label="Referral Fee"
                  name="proposalReferralFee"
                  type="number"
                  value={formData.proposalReferralFee}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                />
              </div>
              <h4 className="form-subsection-title">Trade-In Details</h4>
              <div className="form-grid">
                <Input
                  label="Trade In Model"
                  name="proposalTradeInModel"
                  value={formData.proposalTradeInModel}
                  onChange={handleChange}
                  placeholder="e.g., Honda Civic"
                />
                <Input
                  label="Trade In Car Plate"
                  name="proposalTradeInCarPlate"
                  value={formData.proposalTradeInCarPlate}
                  onChange={handleChange}
                  placeholder="e.g., SXX1234A"
                />
                <Input
                  label="Quoted Trade In Price"
                  name="proposalQuotedTradeInPrice"
                  type="number"
                  value={formData.proposalQuotedTradeInPrice}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                />
              </div>
              <h4 className="form-subsection-title">Additional Information</h4>
              <Textarea
                label="Benefits Given"
                name="proposalBenefitsGiven"
                value={formData.proposalBenefitsGiven}
                onChange={handleChange}
                placeholder="List any additional benefits..."
                rows={3}
              />
              <Textarea
                label="Remarks"
                name="proposalRemarks"
                value={formData.proposalRemarks}
                onChange={handleChange}
                placeholder="Additional remarks for proposal..."
                rows={3}
              />
            </>
          )}
        </div>

        {/* VSA Section */}
        <div className="form-section">
          <div className="form-section-header" onClick={() => toggleSection('vsa')}>
            <h3 className="form-section-title">VSA Details</h3>
            <span className="toggle-icon">{expandedSections.vsa ? '▼' : '▶'}</span>
          </div>
          {expandedSections.vsa && (
            <>
              <h4 className="form-subsection-title">New Car Details</h4>
              <div className="form-grid">
                <Input
                  label="Make & Model"
                  name="vsaMakeModel"
                  value={formData.vsaMakeModel}
                  onChange={handleChange}
                  placeholder="e.g., BYD Seal Premium"
                />
                <Input
                  label="Year of Manufacture"
                  name="vsaYearOfManufacture"
                  type="number"
                  value={formData.vsaYearOfManufacture}
                  onChange={handleChange}
                  placeholder="e.g., 2025"
                />
                <Input
                  label="Body Colour"
                  name="vsaBodyColour"
                  value={formData.vsaBodyColour}
                  onChange={handleChange}
                  placeholder="e.g., Atlantis Grey"
                />
                <Input
                  label="Upholstery"
                  name="vsaUpholstery"
                  value={formData.vsaUpholstery}
                  onChange={handleChange}
                  placeholder="e.g., Standard"
                />
                <Input
                  label="P/R/Z Type"
                  name="vsaPrzType"
                  value={formData.vsaPrzType}
                  onChange={handleChange}
                  placeholder="e.g., P - Passenger Motor Car"
                />
                <Input
                  label="Package"
                  name="vsaPackage"
                  value={formData.vsaPackage}
                  onChange={handleChange}
                  placeholder="e.g., Excite"
                />
              </div>
              <h4 className="form-subsection-title">Package Details</h4>
              <div className="form-grid">
                <Input
                  label="Selling With COE"
                  name="vsaSellingWithCOE"
                  value={formData.vsaSellingWithCOE}
                  onChange={handleChange}
                  placeholder="e.g., WITH"
                />
                <Input
                  label="Selling Price on Price List"
                  name="vsaSellingPriceOnPriceList"
                  type="number"
                  value={formData.vsaSellingPriceOnPriceList}
                  onChange={handleChange}
                  placeholder="e.g., 212388"
                />
                <Input
                  label="Purchase Price with COE"
                  name="vsaPurchasePriceWithCOE"
                  type="number"
                  value={formData.vsaPurchasePriceWithCOE}
                  onChange={handleChange}
                  placeholder="e.g., 205388"
                />
                <Input
                  label="COE Rebate Level"
                  name="vsaCoeRebateLevel"
                  type="number"
                  value={formData.vsaCoeRebateLevel}
                  onChange={handleChange}
                  placeholder="e.g., 115001"
                />
                <Input
                  label="Deposit"
                  name="vsaDeposit"
                  type="number"
                  value={formData.vsaDeposit}
                  onChange={handleChange}
                  placeholder="e.g., 16350"
                />
                <Input
                  label="Less: Others"
                  name="vsaLessOthers"
                  type="number"
                  value={formData.vsaLessOthers}
                  onChange={handleChange}
                  placeholder="e.g., 7000"
                />
                <Input
                  label="Approximate Delivery Date"
                  name="vsaApproximateDeliveryDate"
                  type="date"
                  value={formData.vsaApproximateDeliveryDate}
                  onChange={handleChange}
                />
              </div>
              <h4 className="form-subsection-title">Trade In Car</h4>
              <div className="form-grid">
                <Input
                  label="Trade In Car No"
                  name="vsaTradeInCarNo"
                  value={formData.vsaTradeInCarNo}
                  onChange={handleChange}
                  placeholder="e.g., SMU2890U"
                />
                <Input
                  label="Trade In Car Model"
                  name="vsaTradeInCarModel"
                  value={formData.vsaTradeInCarModel}
                  onChange={handleChange}
                  placeholder="e.g., COROLLA ALTIS 1.6"
                />
                <Input
                  label="Trade In Amount"
                  name="vsaTradeInAmount"
                  type="number"
                  value={formData.vsaTradeInAmount}
                  onChange={handleChange}
                  placeholder="e.g., 78000"
                />
              </div>
              <h4 className="form-subsection-title">Delivery & Insurance</h4>
              <div className="form-grid">
                <Input
                  label="Date of Registration"
                  name="vsaDateOfRegistration"
                  type="date"
                  value={formData.vsaDateOfRegistration}
                  onChange={handleChange}
                />
                <Input
                  label="Registration No"
                  name="vsaRegistrationNo"
                  value={formData.vsaRegistrationNo}
                  onChange={handleChange}
                  placeholder="e.g., SXX1234A"
                />
                <Input
                  label="Chassis No"
                  name="vsaChassisNo"
                  value={formData.vsaChassisNo}
                  onChange={handleChange}
                />
                <Input
                  label="Engine No"
                  name="vsaEngineNo"
                  value={formData.vsaEngineNo}
                  onChange={handleChange}
                />
                <Input
                  label="Motor No"
                  name="vsaMotorNo"
                  value={formData.vsaMotorNo}
                  onChange={handleChange}
                />
                <Input
                  label="Insurance Company"
                  name="vsaInsuranceCompany"
                  value={formData.vsaInsuranceCompany}
                  onChange={handleChange}
                  placeholder="e.g., Liberty"
                />
                <Input
                  label="Insurance Fee"
                  name="vsaInsuranceFee"
                  type="number"
                  step="0.01"
                  value={formData.vsaInsuranceFee}
                  onChange={handleChange}
                  placeholder="e.g., 1521.52"
                />
              </div>
              <h4 className="form-subsection-title">Loan Details</h4>
              <div className="form-grid">
                <Input
                  label="Loan Amount"
                  name="vsaLoanAmount"
                  type="number"
                  value={formData.vsaLoanAmount}
                  onChange={handleChange}
                  placeholder="e.g., 100000"
                />
                <Input
                  label="Interest Rate (%)"
                  name="vsaInterest"
                  type="number"
                  step="0.01"
                  value={formData.vsaInterest}
                  onChange={handleChange}
                  placeholder="e.g., 2.28"
                />
                <Input
                  label="Tenure (months)"
                  name="vsaTenure"
                  type="number"
                  value={formData.vsaTenure}
                  onChange={handleChange}
                  placeholder="e.g., 60"
                />
                <Input
                  label="Admin Fee"
                  name="vsaAdminFee"
                  type="number"
                  value={formData.vsaAdminFee}
                  onChange={handleChange}
                />
                <Input
                  label="Insurance Subsidy"
                  name="vsaInsuranceSubsidy"
                  type="number"
                  value={formData.vsaInsuranceSubsidy}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                />
                <Input
                  label="Monthly Repayment"
                  name="vsaMonthlyRepayment"
                  type="number"
                  step="0.01"
                  value={formData.vsaMonthlyRepayment}
                  onChange={handleChange}
                  placeholder="e.g., 1857"
                />
              </div>
            </>
          )}
        </div>

        <div className="form-section">
          <h3 className="form-section-title">Notes</h3>
          <Textarea
            label=""
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            error={errors.notes}
            placeholder="Add any additional notes about this customer..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
