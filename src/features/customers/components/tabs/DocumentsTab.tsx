import { Customer } from '@/shared/lib/db';
import { Card, Button } from '@/shared/components/ui';
import './Tabs.css';

interface DocumentsTabProps {
  customer: Customer;
  onOpenDrive?: () => void;
}

export function DocumentsTab({ customer, onOpenDrive }: DocumentsTabProps) {
  const hasDriveFolder = customer.driveFolderId && customer.driveFolderLink;

  return (
    <div className="tab-content">
      <Card className="details-section">
        <h3 className="section-title">Google Drive Documents</h3>
        {hasDriveFolder ? (
          <div className="documents-section">
            <p className="info-text">
              Customer documents are stored in Google Drive. Click the button below to access the folder.
            </p>
            <Button
              variant="primary"
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
            {customer.subfolders && Object.keys(customer.subfolders).length > 0 && (
              <div className="subfolders">
                <h4>Subfolders:</h4>
                <ul className="subfolder-list">
                  {Object.entries(customer.subfolders).map(([name, id]) => (
                    <li key={id}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          window.open(`https://drive.google.com/drive/folders/${id}`, '_blank');
                        }}
                      >
                        📂 {name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-documents">
            <span className="empty-icon">📄</span>
            <p>No document folder has been created for this customer yet.</p>
            {onOpenDrive && (
              <Button variant="primary" onClick={onOpenDrive}>
                Create Drive Folder
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card className="details-section">
        <h3 className="section-title">Document Checklist</h3>
        <div className="document-checklist">
          <div className="checklist-item">
            <span className="checklist-label">NRIC Copy</span>
            <span className="checklist-status">
              {customer.checklist?.nricCollected ? '✅' : '⏳'}
            </span>
          </div>
          <div className="checklist-item">
            <span className="checklist-label">VSA Signed</span>
            <span className="checklist-status">
              {customer.checklist?.vsaSigned ? '✅' : '⏳'}
            </span>
          </div>
          <div className="checklist-item">
            <span className="checklist-label">Deposit Receipt</span>
            <span className="checklist-status">
              {customer.checklist?.depositReceived ? '✅' : '⏳'}
            </span>
          </div>
          <div className="checklist-item">
            <span className="checklist-label">Loan Approval</span>
            <span className="checklist-status">
              {customer.checklist?.loanApproved ? '✅' : '⏳'}
            </span>
          </div>
          <div className="checklist-item">
            <span className="checklist-label">Insurance Documents</span>
            <span className="checklist-status">
              {customer.checklist?.insuranceArranged ? '✅' : '⏳'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
