import Dexie, { Table } from 'dexie';

/**
 * Customer interface
 */
export interface Customer {
  id: string;
  consultantId: string;
  name: string;
  phone: string;
  email?: string;
  nric: string;
  dob: string;
  occupation?: string;
  address: string;
  addressContinue?: string;
  salesConsultant: string;
  vsaNo?: string;
  dealClosed: boolean;
  driveFolderId?: string;
  driveFolderLink?: string;
  subfolders?: Record<string, string>;
  notes?: string;
  checklist: Record<string, boolean>;

  // Proposal Information
  proposalModel?: string;
  proposalBank?: string;
  proposalSellingPrice?: number;
  proposalInterestRate?: number;
  proposalDownpayment?: number;
  proposalLoanTenure?: number;

  // Loan & Fee Details
  proposalLoanAmount?: number;
  proposalAdminFee?: number;
  proposalReferralFee?: number;

  // Trade-In Details (Proposal)
  proposalTradeInModel?: string;
  proposalTradeInCarPlate?: string;
  proposalQuotedTradeInPrice?: number;
  proposalLowLoanSurcharge?: number;
  proposalNoLoanSurcharge?: number;

  // Additional Proposal Information
  proposalBenefitsGiven?: string;
  proposalRemarks?: string;

  // BYD New Car Details
  vsaMakeModel?: string;
  vsaYearOfManufacture?: number;
  vsaBodyColour?: string;
  vsaUpholstery?: string;
  vsaPrzType?: string;

  // BYD New Car Package
  vsaPackage?: string;
  vsaSellingWithCOE?: string;
  vsaSellingPriceOnPriceList?: number;
  vsaPurchasePriceWithCOE?: number;
  vsaCoeRebateLevel?: number;
  vsaDeposit?: number;
  vsaLessOthers?: number;
  vsaAddOthers?: number;
  vsaApproximateDeliveryDate?: string;

  // Trade In Car Details (VSA)
  vsaTradeInCarNo?: string;
  vsaTradeInCarModel?: string;
  vsaTradeInAmount?: number;

  // Delivery Details
  vsaDateOfRegistration?: string;
  vsaRegistrationNo?: string;
  vsaChassisNo?: string;
  vsaEngineNo?: string;
  vsaMotorNo?: string;

  // Insurance
  vsaInsuranceCompany?: string;
  vsaInsuranceFee?: number;

  // Remarks & Loan Details (VSA)
  vsaLoanAmount?: number;
  vsaInterest?: number;
  vsaTenure?: number;
  vsaAdminFee?: number;
  vsaInsuranceSubsidy?: number;
  vsaMonthlyRepayment?: number;

  createdAt: string;
  updatedAt: string;
  encrypted: boolean;
}

/**
 * Form field configuration
 */
export interface FormField {
  id: string;
  label: string;
  customerField: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
}

/**
 * Form template
 */
export interface FormTemplate {
  id: string;
  consultantId: string;
  name: string;
  imageUrl: string;
  driveFileId?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Excel cell mapping
 */
export interface ExcelMapping {
  id: string;
  customerField: string;
  cell: string;
  sheetName?: string;
}

/**
 * Excel template
 */
export interface ExcelTemplate {
  id: string;
  consultantId: string;
  name: string;
  driveFileId: string;
  driveFileName: string;
  mappings: ExcelMapping[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Sync operation for offline queue
 */
export interface SyncOperation {
  id: string;
  consultantId: string;
  type: string;
  entityType: 'customer' | 'form' | 'excel';
  entityId: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * BYD CRM Database
 * Uses IndexedDB via Dexie for local storage
 */
export class BYDDatabase extends Dexie {
  customers!: Table<Customer, string>;
  formTemplates!: Table<FormTemplate, string>;
  excelTemplates!: Table<ExcelTemplate, string>;
  syncQueue!: Table<SyncOperation, string>;

  constructor() {
    super('BYD_CRM_DB');

    this.version(1).stores({
      customers: 'id, consultantId, name, createdAt, updatedAt, dealClosed',
      formTemplates: 'id, consultantId, name, createdAt',
      excelTemplates: 'id, consultantId, name, createdAt',
      syncQueue: 'id, consultantId, status, entityType, createdAt',
    });
  }

  /**
   * Clear all data for a specific consultant (for testing/logout)
   */
  async clearConsultantData(consultantId: string): Promise<void> {
    await this.transaction(
      'rw',
      [this.customers, this.formTemplates, this.excelTemplates, this.syncQueue],
      async () => {
        await this.customers.where('consultantId').equals(consultantId).delete();
        await this.formTemplates
          .where('consultantId')
          .equals(consultantId)
          .delete();
        await this.excelTemplates
          .where('consultantId')
          .equals(consultantId)
          .delete();
        await this.syncQueue
          .where('consultantId')
          .equals(consultantId)
          .delete();
      }
    );
  }

  /**
   * Get database statistics for a consultant
   */
  async getStats(consultantId: string): Promise<{
    customers: number;
    forms: number;
    excel: number;
    pendingSync: number;
  }> {
    return {
      customers: await this.customers
        .where('consultantId')
        .equals(consultantId)
        .count(),
      forms: await this.formTemplates
        .where('consultantId')
        .equals(consultantId)
        .count(),
      excel: await this.excelTemplates
        .where('consultantId')
        .equals(consultantId)
        .count(),
      pendingSync: await this.syncQueue
        .where({ consultantId, status: 'pending' })
        .count(),
    };
  }
}

/**
 * Export singleton database instance
 */
export const db = new BYDDatabase();
