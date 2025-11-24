import { z } from 'zod';

/**
 * Customer validation schema
 * Defines the structure and validation rules for customer data
 */
export const customerSchema = z.object({
  id: z.string().uuid(),
  consultantId: z.string().min(1, 'Consultant ID required'),

  // Personal Information
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),

  phone: z
    .string()
    .regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format')
    .min(8, 'Phone number too short')
    .max(20, 'Phone number too long')
    .trim(),

  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  nric: z
    .string()
    .regex(/^[STFG]\d{7}[A-Z]$/, 'Invalid NRIC format (e.g., S1234567A)')
    .toUpperCase()
    .trim(),

  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  occupation: z
    .string()
    .max(100, 'Occupation too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  // Address
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address too long')
    .trim(),

  addressContinue: z
    .string()
    .max(200, 'Address continuation too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  // Sales Information
  salesConsultant: z.string().min(2, 'Sales consultant name required').trim(),

  vsaNo: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  dealClosed: z.boolean().default(false),

  // Google Drive
  driveFolderId: z.string().optional(),
  driveFolderLink: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  subfolders: z.record(z.string()).optional(),

  // Notes and Checklist
  notes: z
    .string()
    .max(2000, 'Notes too long')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),

  checklist: z.record(z.boolean()).default({}),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  encrypted: z.boolean().default(false),
});

/**
 * Infer TypeScript type from schema
 */
export type Customer = z.infer<typeof customerSchema>;

/**
 * Schema for creating a new customer (omit auto-generated fields)
 */
export const createCustomerSchema = customerSchema.omit({
  id: true,
  consultantId: true,
  createdAt: true,
  updatedAt: true,
  encrypted: true,
  driveFolderId: true,
  driveFolderLink: true,
  subfolders: true,
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

/**
 * Schema for updating a customer (all fields optional except id)
 */
export const updateCustomerSchema = customerSchema.partial().required({ id: true });

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

/**
 * Schema for searching customers
 */
export const searchCustomerSchema = z.object({
  query: z.string().min(1, 'Search query required'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>;
