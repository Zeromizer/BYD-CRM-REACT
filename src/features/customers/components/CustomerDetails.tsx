import { useState } from 'react';
import { Customer } from '@/shared/lib/db';
import { Button, Modal } from '@/shared/components/ui';
import { DetailsTab } from './tabs/DetailsTab';
import { ProposalTab } from './tabs/ProposalTab';
import { VSATab } from './tabs/VSATab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { ScannerTab } from './tabs/ScannerTab';
import './CustomerDetails.css';

interface CustomerDetailsProps {
  customer: Customer | null;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
  onToggleDealClosed: (id: string) => Promise<void>;
  onUpdateChecklist: (id: string, key: string, value: boolean) => Promise<void>;
  onOpenDrive?: () => void;
}

type TabType = 'details' | 'proposal' | 'vsa' | 'documents' | 'scanner';

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
  const [activeTab, setActiveTab] = useState<TabType>('details');

  if (!customer) {
    return (
      <div className="customer-details empty">
        <div className="empty-details">
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

  const renderTabContent = () => {
    if (!customer) return null;

    switch (activeTab) {
      case 'details':
        return <DetailsTab customer={customer} onUpdateChecklist={onUpdateChecklist} onEdit={onEdit} />;
      case 'proposal':
        return <ProposalTab customer={customer} onEdit={onEdit} />;
      case 'vsa':
        return <VSATab customer={customer} onEdit={onEdit} />;
      case 'documents':
        return <DocumentsTab customer={customer} onOpenDrive={onOpenDrive} />;
      case 'scanner':
        return <ScannerTab customer={customer} />;
      default:
        return null;
    }
  };

  return (
    <div className="customer-details">
      <div className="details-header">
        <h1 className="details-customer-name">{customer.name}</h1>
        <div className="details-actions">
          <Button size="sm" onClick={onEdit}>
            Print Form
          </Button>
          <Button size="sm" onClick={() => onToggleDealClosed(customer.id)}>
            Combine & Print
          </Button>
          <Button size="sm" onClick={onOpenDrive}>
            Populate Excel
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`tab-button ${activeTab === 'proposal' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposal')}
        >
          Proposal
        </button>
        <button
          className={`tab-button ${activeTab === 'vsa' ? 'active' : ''}`}
          onClick={() => setActiveTab('vsa')}
        >
          VSA
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button
          className={`tab-button ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          Scanner
        </button>
      </div>

      {/* Tab Content */}
      <div className="details-content">
        {renderTabContent()}

        {/* Delete Button */}
        <div className="details-footer">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Customer
          </Button>
        </div>
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
