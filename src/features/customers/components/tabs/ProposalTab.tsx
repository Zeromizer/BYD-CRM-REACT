import { Customer } from '@/shared/lib/db';
import { Card, Button } from '@/shared/components/ui';
import './Tabs.css';

interface ProposalTabProps {
  customer: Customer;
  onEdit: () => void;
}

export function ProposalTab({ customer, onEdit }: ProposalTabProps) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3 className="tab-title">Proposal Information</h3>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit Proposal Details
        </Button>
      </div>

      {/* Proposal Information */}
      <Card className="details-section">
        <h3 className="section-title">Proposal Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>MODEL</label>
            <span>{customer.proposalModel || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>BANK</label>
            <span>{customer.proposalBank || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>SELLING PRICE</label>
            <span>
              {customer.proposalSellingPrice
                ? `$${customer.proposalSellingPrice.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>INTEREST RATE</label>
            <span>
              {customer.proposalInterestRate
                ? `${customer.proposalInterestRate}%`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>DOWNPAYMENT</label>
            <span>
              {customer.proposalDownpayment
                ? `$${customer.proposalDownpayment.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>LOAN TENURE</label>
            <span>
              {customer.proposalLoanTenure
                ? `${customer.proposalLoanTenure} months`
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Loan & Fee Details */}
      <Card className="details-section">
        <h3 className="section-title">Loan & Fee Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>LOAN AMOUNT</label>
            <span>
              {customer.proposalLoanAmount
                ? `$${customer.proposalLoanAmount.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>ADMIN FEE</label>
            <span>
              {customer.proposalAdminFee
                ? `$${customer.proposalAdminFee.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>REFERRAL FEE</label>
            <span>
              {customer.proposalReferralFee
                ? `$${customer.proposalReferralFee.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Trade-In Details */}
      <Card className="details-section">
        <h3 className="section-title">Trade-In Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>TRADE IN MODEL</label>
            <span>{customer.proposalTradeInModel || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>TRADE IN CAR PLATE</label>
            <span>{customer.proposalTradeInCarPlate || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>QUOTED TRADE IN PRICE</label>
            <span>
              {customer.proposalQuotedTradeInPrice
                ? `$${customer.proposalQuotedTradeInPrice.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>LOW LOAN SURCHARGE</label>
            <span>
              {customer.proposalLowLoanSurcharge
                ? `$${customer.proposalLowLoanSurcharge.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>NO LOAN SURCHARGE</label>
            <span>
              {customer.proposalNoLoanSurcharge
                ? `$${customer.proposalNoLoanSurcharge.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card className="details-section">
        <h3 className="section-title">Additional Information</h3>
        <div className="info-item">
          <label>BENEFITS GIVEN</label>
          <p className="notes-text">{customer.proposalBenefitsGiven || 'N/A'}</p>
        </div>
        <div className="info-item">
          <label>REMARKS</label>
          <p className="notes-text">{customer.proposalRemarks || 'N/A'}</p>
        </div>
      </Card>
    </div>
  );
}
