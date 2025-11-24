import { Customer } from '@/shared/lib/db';
import { Card, Button } from '@/shared/components/ui';
import './Tabs.css';

interface ScannerTabProps {
  customer: Customer;
}

export function ScannerTab({}: ScannerTabProps) {
  return (
    <div className="tab-content">
      <Card className="details-section">
        <h3 className="section-title">Document Scanner</h3>
        <div className="scanner-section">
          <div className="scanner-placeholder">
            <h4>Mobile Scanner Integration</h4>
            <p>
              Use your mobile device camera to scan and upload customer documents directly to Google Drive.
            </p>
            <p className="info-text">
              This feature will integrate with mobile camera APIs for document scanning.
            </p>
          </div>
        </div>
      </Card>

      <Card className="details-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="scanner-actions">
          <Button variant="primary" disabled>
            Scan Document
          </Button>
          <Button variant="secondary" disabled>
            Upload from Device
          </Button>
          <Button variant="secondary" disabled>
            Scan QR Code
          </Button>
        </div>
        <p className="helper-text">
          Scanner functionality coming soon. Currently, please upload documents directly to the Google Drive folder in the Documents tab.
        </p>
      </Card>

      <Card className="details-section">
        <h3 className="section-title">Recent Scans</h3>
        <div className="empty-scans">
          <p>No scanned documents yet</p>
        </div>
      </Card>
    </div>
  );
}
