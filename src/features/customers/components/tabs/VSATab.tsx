import { Customer } from '@/shared/lib/db';
import { Card, Button } from '@/shared/components/ui';
import './Tabs.css';

interface VSATabProps {
  customer: Customer;
  onEdit: () => void;
}

export function VSATab({ customer, onEdit }: VSATabProps) {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h3 className="tab-title">VSA Information</h3>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit VSA Details
        </Button>
      </div>

      {/* BYD New Car Details */}
      <Card className="details-section">
        <h3 className="section-title">BYD New Car Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>MAKE & MODEL</label>
            <span>{customer.vsaMakeModel || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>YEAR OF MANUFACTURE</label>
            <span>{customer.vsaYearOfManufacture || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>BODY COLOUR</label>
            <span>{customer.vsaBodyColour || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>UPHOLSTERY</label>
            <span>{customer.vsaUpholstery || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>P/R/Z TYPE</label>
            <span>{customer.vsaPrzType || 'N/A'}</span>
          </div>
        </div>
      </Card>

      {/* BYD New Car Package */}
      <Card className="details-section">
        <h3 className="section-title">BYD New Car Package</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>PACKAGE</label>
            <span>{customer.vsaPackage || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>SELLING WITH COE</label>
            <span>{customer.vsaSellingWithCOE || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>SELLING PRICE ON PRICE LIST</label>
            <span>
              {customer.vsaSellingPriceOnPriceList
                ? `$${customer.vsaSellingPriceOnPriceList.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>PURCHASE PRICE WITH COE</label>
            <span>
              {customer.vsaPurchasePriceWithCOE
                ? `$${customer.vsaPurchasePriceWithCOE.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>COE REBATE LEVEL</label>
            <span>
              {customer.vsaCoeRebateLevel
                ? `$${customer.vsaCoeRebateLevel.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>DEPOSIT</label>
            <span>
              {customer.vsaDeposit
                ? `$${customer.vsaDeposit.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>LESS: OTHERS</label>
            <span>
              {customer.vsaLessOthers
                ? `$${customer.vsaLessOthers.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>ADD: OTHERS</label>
            <span>
              {customer.vsaAddOthers
                ? `$${customer.vsaAddOthers.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>APPROXIMATE DELIVERY DATE</label>
            <span>
              {customer.vsaApproximateDeliveryDate
                ? new Date(customer.vsaApproximateDeliveryDate).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Trade In Car Details */}
      <Card className="details-section">
        <h3 className="section-title">Trade In Car Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>TRADE IN CAR NO</label>
            <span>{customer.vsaTradeInCarNo || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>TRADE IN CAR MODEL</label>
            <span>{customer.vsaTradeInCarModel || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>TRADE IN AMOUNT</label>
            <span>
              {customer.vsaTradeInAmount
                ? `$${customer.vsaTradeInAmount.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Delivery Details */}
      <Card className="details-section">
        <h3 className="section-title">Delivery Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>DATE OF REGISTRATION</label>
            <span>
              {customer.vsaDateOfRegistration
                ? new Date(customer.vsaDateOfRegistration).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>REGISTRATION NO</label>
            <span>{customer.vsaRegistrationNo || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>CHASSIS NO</label>
            <span>{customer.vsaChassisNo || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>ENGINE NO</label>
            <span>{customer.vsaEngineNo || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>MOTOR NO</label>
            <span>{customer.vsaMotorNo || 'N/A'}</span>
          </div>
        </div>
      </Card>

      {/* Insurance */}
      <Card className="details-section">
        <h3 className="section-title">Insurance</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>INSURANCE COMPANY</label>
            <span>{customer.vsaInsuranceCompany || 'N/A'}</span>
          </div>
          <div className="info-item">
            <label>INSURANCE FEE</label>
            <span>
              {customer.vsaInsuranceFee
                ? `$${customer.vsaInsuranceFee.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>

      {/* Remarks & Loan Details */}
      <Card className="details-section">
        <h3 className="section-title">Remarks & Loan Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <label>LOAN AMOUNT</label>
            <span>
              {customer.vsaLoanAmount
                ? `$${customer.vsaLoanAmount.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>INTEREST</label>
            <span>
              {customer.vsaInterest ? `${customer.vsaInterest}%` : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>TENURE</label>
            <span>
              {customer.vsaTenure ? `${customer.vsaTenure} months` : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>ADMIN FEE</label>
            <span>
              {customer.vsaAdminFee
                ? `$${customer.vsaAdminFee.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>INSURANCE SUBSIDY</label>
            <span>
              {customer.vsaInsuranceSubsidy
                ? `$${customer.vsaInsuranceSubsidy.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
          <div className="info-item">
            <label>MONTHLY REPAYMENT</label>
            <span>
              {customer.vsaMonthlyRepayment
                ? `$${customer.vsaMonthlyRepayment.toLocaleString()}`
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
