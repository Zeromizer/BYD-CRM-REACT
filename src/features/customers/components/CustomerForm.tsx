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

const initialFormData: CreateCustomerInput = {
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
};

export function CustomerForm({
  isOpen,
  onClose,
  onSubmit,
  customer,
  salesConsultantName,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CreateCustomerInput>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      });
    } else {
      setFormData({
        ...initialFormData,
        salesConsultant: salesConsultantName,
      });
    }
    setErrors({});
  }, [customer, salesConsultantName, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
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
