import { useState } from 'react';
import { Customer } from '@/shared/lib/db';
import { Button, Badge, Checkbox, Card, Modal } from '@/shared/components/ui';
import './CustomerDetails.css';

interface CustomerDetailsProps {
  customer: Customer | null;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  onToggleDealClosed: (id: string) => Promise<void>;
  onUpdateChecklist: (id: string, key: string, value: boolean) => Promise<void>;
  onOpenDrive?: () => void;
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

export function CustomerDetails({
  customer,
  onEdit,
  onDelete,
  onToggleDealClosed,
  onUpdateChecklist,
  onOpenDrive,
}: CustomerDetailsProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!customer) {
    return (
      <div className="customer-details empty">
        <div className="empty-details">
          <span className="empty-icon">👈</span>
          <h3>Select a Customer</h3>
          <p>Choose a customer from the list to view their details</p>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(customer.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChecklistChange = async (key: string, checked: boolean) => {
    await onUpdateChecklist(customer.id, key, checked);
  };

  const completedCount = CHECKLIST_ITEMS.filter(
    (item) => customer.checklist?.[item.key]
  ).length;
  const progress = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="customer-details">
      <div className="details-header">
        <div className="details-title">
          <h2>{customer.name}</h2>
          <Badge variant={customer.dealClosed ? 'success' : 'warning'}>
            {customer.dealClosed ? 'Deal Closed' : 'In Progress'}
          </Badge>
        </div>
        <div className="details-actions">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            ✏️ Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onToggleDealClosed(customer.id)}
          >
            {customer.dealClosed ? '🔓 Reopen' : '✅ Close Deal'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Delete
          </Button>
        </div>
      </div>

      <div className="details-content">
        {/* Personal Information */}
        <Card className="details-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>NRIC</label>
              <span>{customer.nric}</span>
            </div>
            <div className="info-item">
              <label>Date of Birth</label>
              <span>{new Date(customer.dob).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span>
                <a href={`tel:${customer.phone}`}>{customer.phone}</a>
              </span>
            </div>
            <div className="info-item">
              <label>Email</label>
              <span>
                {customer.email ? (
                  <a href={`mailto:${customer.email}`}>{customer.email}</a>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="info-item">
              <label>Occupation</label>
              <span>{customer.occupation || '-'}</span>
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

        {/* Sales Information */}
        <Card className="details-section">
          <h3 className="section-title">Sales Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Sales Consultant</label>
              <span>{customer.salesConsultant}</span>
            </div>
            <div className="info-item">
              <label>VSA Number</label>
              <span>{customer.vsaNo || '-'}</span>
            </div>
            <div className="info-item">
              <label>Created</label>
              <span>{new Date(customer.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <label>Last Updated</label>
              <span>{new Date(customer.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Google Drive */}
        {customer.driveFolderId && (
          <Card className="details-section">
            <h3 className="section-title">Documents</h3>
            <div className="drive-section">
              <Button
                variant="secondary"
                onClick={() => {
                  if (customer.driveFolderLink) {
                    window.open(customer.driveFolderLink, '_blank');
                  } else if (onOpenDrive) {
                    onOpenDrive();
                  }
                }}
              >
                📁 Open Google Drive Folder
              </Button>
            </div>
          </Card>
        )}

        {/* Checklist */}
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

        {/* Notes */}
        {customer.notes && (
          <Card className="details-section">
            <h3 className="section-title">Notes</h3>
            <p className="notes-text">{customer.notes}</p>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Customer"
        size="sm"
      >
        <div className="delete-modal">
          <p>
            Are you sure you want to delete <strong>{customer.name}</strong>?
          </p>
          <p className="warning-text">
            This action cannot be undone. All customer data will be permanently
            removed.
          </p>
          <div className="delete-actions">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
