import { Customer } from '@/shared/lib/db';
import { Card, Checkbox, Button } from '@/shared/components/ui';
import './Tabs.css';

interface DetailsTabProps {
  customer: Customer;
  onUpdateChecklist: (id: string, key: string, value: boolean) => Promise<void>;
  onEdit: () => void;
}

const CHECKLIST_ITEMS = [
  { key: 'nricCollected', label: 'NRIC Collected' },
  { key: 'testDriveCompleted', label: 'Test Drive Completed' },
  { key: 'vsaSigned', label: 'VSA Signed' },
  { key: 'depositReceived', label: 'Deposit Received' },
  { key: 'loanApproved', label: 'Loan Approved' },
  { key: 'insuranceArranged', label: 'Insurance Arranged' },
  { key: 'vehicleReady', label: 'Vehicle Ready' },
  { key: 'deliveryScheduled', label: 'Delivery Scheduled' },
  { key: 'handoverCompleted', label: 'Handover Completed' },
];

export function DetailsTab({ customer, onUpdateChecklist, onEdit }: DetailsTabProps) {
  const handleChecklistChange = async (key: string, checked: boolean) => {
    await onUpdateChecklist(customer.id, key, checked);
  };

  const completedCount = CHECKLIST_ITEMS.filter(
    (item) => customer.checklist?.[item.key]
  ).length;
  const progress = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="tab-content">
      {/* Contact Information */}
      <Card className="details-section">
        <div className="section-header">
          <h3 className="section-title">Contact Information</h3>
          <Button variant="primary" size="sm" onClick={onEdit}>
            Edit Details
          </Button>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <label>PHONE</label>
            <span>
              <a href={`tel:${customer.phone}`}>{customer.phone}</a>
            </span>
          </div>
          <div className="info-item">
            <label>EMAIL</label>
            <span>
              {customer.email ? (
                <a href={`mailto:${customer.email}`}>{customer.email}</a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
          <div className="info-item">
            <label>NRIC/FIN</label>
            <span>{customer.nric}</span>
          </div>
          <div className="info-item">
            <label>DATE OF BIRTH</label>
            <span>{new Date(customer.dob).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="details-section">
        <h3 className="section-title">Additional Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>OCCUPATION</label>
            <span>{customer.occupation || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>SALES CONSULTANT</label>
            <span>{customer.salesConsultant}</span>
          </div>
          <div className="info-item">
            <label>VSA NO</label>
            <span>{customer.vsaNo || 'N/A'}</span>
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card className="details-section">
        <h3 className="section-title">Address</h3>
        <p className="address-text">
          {customer.address}
          {customer.addressContinue && <br />}
          {customer.addressContinue}
        </p>
      </Card>

      {/* Notes */}
      <Card className="details-section">
        <h3 className="section-title">Notes</h3>
        <p className="notes-text">{customer.notes || 'N/A'}</p>
      </Card>

      {/* Progress Checklist */}
      <Card className="details-section">
        <div className="section-header">
          <h3 className="section-title">Progress Checklist</h3>
          <span className="progress-text">
            {completedCount}/{CHECKLIST_ITEMS.length} ({progress}%)
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="checklist">
          {CHECKLIST_ITEMS.map((item) => (
            <Checkbox
              key={item.key}
              label={item.label}
              checked={customer.checklist?.[item.key] || false}
              onChange={(e) =>
                handleChecklistChange(item.key, e.target.checked)
              }
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
