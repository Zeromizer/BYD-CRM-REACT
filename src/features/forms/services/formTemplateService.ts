import { db, FormTemplate } from '@/shared/lib/db';
import { authService } from '@/features/auth/services/authService';
import { CreateFormTemplateInput, formTemplateSchema, FormField } from '../schemas/form.schema';

/**
 * Form Template Service
 * Handles all form template operations
 */
export class FormTemplateService {
  /**
   * Get all form templates for current consultant
   */
  async getAll(): Promise<FormTemplate[]> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    return db.formTemplates
      .where('consultantId')
      .equals(consultant.id)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * Get form template by ID
   */
  async getById(id: string): Promise<FormTemplate | null> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const template = await db.formTemplates.get(id);

    if (template && template.consultantId !== consultant.id) {
      throw new Error('Unauthorized access to form template');
    }

    return template || null;
  }

  /**
   * Create new form template
   */
  async create(input: CreateFormTemplateInput): Promise<FormTemplate> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const templateData: FormTemplate = {
      ...input,
      id,
      consultantId: consultant.id,
      fields: input.fields || [],
      createdAt: now,
      updatedAt: now,
    };

    const validated = formTemplateSchema.parse(templateData);
    await db.formTemplates.add(validated);

    console.log('✅ Form template created:', validated.id);
    return validated;
  }

  /**
   * Update form template
   */
  async update(id: string, input: Partial<CreateFormTemplateInput>): Promise<FormTemplate> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Form template not found');
    }

    const updated: FormTemplate = {
      ...existing,
      ...input,
      id,
      consultantId: consultant.id,
      updatedAt: new Date().toISOString(),
    };

    const validated = formTemplateSchema.parse(updated);
    await db.formTemplates.put(validated);

    console.log('✅ Form template updated:', validated.id);
    return validated;
  }

  /**
   * Delete form template
   */
  async delete(id: string): Promise<void> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const template = await this.getById(id);
    if (!template) {
      throw new Error('Form template not found');
    }

    await db.formTemplates.delete(id);
    console.log('✅ Form template deleted:', id);
  }

  /**
   * Update field mappings
   */
  async updateFields(id: string, fields: FormField[]): Promise<FormTemplate> {
    return this.update(id, { fields });
  }

  /**
   * Add a single field
   */
  async addField(id: string, field: Omit<FormField, 'id'>): Promise<FormTemplate> {
    const template = await this.getById(id);
    if (!template) {
      throw new Error('Form template not found');
    }

    const newField: FormField = {
      ...field,
      id: crypto.randomUUID(),
    };

    const fields = [...template.fields, newField];
    return this.updateFields(id, fields);
  }

  /**
   * Remove a field
   */
  async removeField(templateId: string, fieldId: string): Promise<FormTemplate> {
    const template = await this.getById(templateId);
    if (!template) {
      throw new Error('Form template not found');
    }

    const fields = template.fields.filter((f) => f.id !== fieldId);
    return this.updateFields(templateId, fields);
  }

  /**
   * Update a single field
   */
  async updateField(
    templateId: string,
    fieldId: string,
    updates: Partial<FormField>
  ): Promise<FormTemplate> {
    const template = await this.getById(templateId);
    if (!template) {
      throw new Error('Form template not found');
    }

    const fields = template.fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } : f
    );
    return this.updateFields(templateId, fields);
  }
}

export const formTemplateService = new FormTemplateService();
