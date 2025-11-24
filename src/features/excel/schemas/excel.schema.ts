import { z } from 'zod';

/**
 * Excel cell mapping schema
 */
export const excelMappingSchema = z.object({
  id: z.string(),
  customerField: z.string().min(1, 'Customer field is required'),
  cell: z.string().regex(/^[A-Z]+[0-9]+$/, 'Invalid cell reference (e.g., A1, B2)'),
  sheetName: z.string().optional(),
});

export type ExcelMappingType = z.infer<typeof excelMappingSchema>;

/**
 * Excel template schema
 */
export const excelTemplateSchema = z.object({
  id: z.string().uuid(),
  consultantId: z.string(),
  name: z.string().min(1, 'Template name is required').max(100),
  driveFileId: z.string(),
  driveFileName: z.string(),
  fileData: z.string().optional(), // Base64 encoded for local storage
  mappings: z.array(excelMappingSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ExcelTemplateType = z.infer<typeof excelTemplateSchema>;

/**
 * Create excel template input
 */
export const createExcelTemplateSchema = excelTemplateSchema.omit({
  id: true,
  consultantId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateExcelTemplateInput = z.infer<typeof createExcelTemplateSchema>;

/**
 * Customer fields for Excel mapping
 */
export const EXCEL_CUSTOMER_FIELDS = [
  { value: 'name', label: 'Full Name' },
  { value: 'nric', label: 'NRIC' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'dob', label: 'Date of Birth' },
  { value: 'occupation', label: 'Occupation' },
  { value: 'address', label: 'Address Line 1' },
  { value: 'addressContinue', label: 'Address Line 2' },
  { value: 'fullAddress', label: 'Full Address' },
  { value: 'salesConsultant', label: 'Sales Consultant' },
  { value: 'vsaNo', label: 'VSA Number' },
  { value: 'todayDate', label: "Today's Date" },
  { value: 'todayDateFormatted', label: "Today's Date (DD/MM/YYYY)" },
] as const;
