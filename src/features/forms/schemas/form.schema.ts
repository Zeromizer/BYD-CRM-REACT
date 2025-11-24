import { z } from 'zod';

/**
 * Form field schema
 */
export const formFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Label is required'),
  customerField: z.string().min(1, 'Customer field is required'),
  x: z.number().min(0),
  y: z.number().min(0),
  fontSize: z.number().min(8).max(72).default(12),
  fontFamily: z.string().default('Arial'),
  color: z.string().default('#000000'),
  align: z.enum(['left', 'center', 'right']).default('left'),
});

export type FormField = z.infer<typeof formFieldSchema>;

/**
 * Form template schema
 */
export const formTemplateSchema = z.object({
  id: z.string().uuid(),
  consultantId: z.string(),
  name: z.string().min(1, 'Template name is required').max(100),
  imageUrl: z.string(), // Base64 or blob URL
  imageData: z.string().optional(), // Base64 encoded image for storage
  driveFileId: z.string().optional(),
  fields: z.array(formFieldSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type FormTemplateType = z.infer<typeof formTemplateSchema>;

/**
 * Create form template input
 */
export const createFormTemplateSchema = formTemplateSchema.omit({
  id: true,
  consultantId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateFormTemplateInput = z.infer<typeof createFormTemplateSchema>;

/**
 * Customer fields available for mapping
 */
export const CUSTOMER_FIELDS = [
  { value: 'name', label: 'Full Name' },
  { value: 'nric', label: 'NRIC' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'dob', label: 'Date of Birth' },
  { value: 'occupation', label: 'Occupation' },
  { value: 'address', label: 'Address' },
  { value: 'addressContinue', label: 'Address (cont.)' },
  { value: 'salesConsultant', label: 'Sales Consultant' },
  { value: 'vsaNo', label: 'VSA Number' },
  { value: 'todayDate', label: 'Today\'s Date' },
] as const;
