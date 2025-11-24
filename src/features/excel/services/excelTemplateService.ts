import { db, ExcelTemplate } from '@/shared/lib/db';
import { authService } from '@/features/auth/services/authService';
import { CreateExcelTemplateInput, excelTemplateSchema, ExcelMappingType } from '../schemas/excel.schema';

/**
 * Excel Template Service
 * Handles all Excel template operations
 */
export class ExcelTemplateService {
  /**
   * Get all Excel templates for current consultant
   */
  async getAll(): Promise<ExcelTemplate[]> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    return db.excelTemplates
      .where('consultantId')
      .equals(consultant.id)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * Get Excel template by ID
   */
  async getById(id: string): Promise<ExcelTemplate | null> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const template = await db.excelTemplates.get(id);

    if (template && template.consultantId !== consultant.id) {
      throw new Error('Unauthorized access to Excel template');
    }

    return template || null;
  }

  /**
   * Create new Excel template
   */
  async create(input: CreateExcelTemplateInput): Promise<ExcelTemplate> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const templateData: ExcelTemplate = {
      ...input,
      id,
      consultantId: consultant.id,
      mappings: input.mappings || [],
      createdAt: now,
      updatedAt: now,
    };

    const validated = excelTemplateSchema.parse(templateData);
    await db.excelTemplates.add(validated);

    console.log('✅ Excel template created:', validated.id);
    return validated;
  }

  /**
   * Update Excel template
   */
  async update(id: string, input: Partial<CreateExcelTemplateInput>): Promise<ExcelTemplate> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Excel template not found');
    }

    const updated: ExcelTemplate = {
      ...existing,
      ...input,
      id,
      consultantId: consultant.id,
      updatedAt: new Date().toISOString(),
    };

    const validated = excelTemplateSchema.parse(updated);
    await db.excelTemplates.put(validated);

    console.log('✅ Excel template updated:', validated.id);
    return validated;
  }

  /**
   * Delete Excel template
   */
  async delete(id: string): Promise<void> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const template = await this.getById(id);
    if (!template) {
      throw new Error('Excel template not found');
    }

    await db.excelTemplates.delete(id);
    console.log('✅ Excel template deleted:', id);
  }

  /**
   * Update cell mappings
   */
  async updateMappings(id: string, mappings: ExcelMappingType[]): Promise<ExcelTemplate> {
    return this.update(id, { mappings });
  }

  /**
   * Add a cell mapping
   */
  async addMapping(id: string, mapping: Omit<ExcelMappingType, 'id'>): Promise<ExcelTemplate> {
    const template = await this.getById(id);
    if (!template) {
      throw new Error('Excel template not found');
    }

    const newMapping: ExcelMappingType = {
      ...mapping,
      id: crypto.randomUUID(),
    };

    const mappings = [...template.mappings, newMapping];
    return this.updateMappings(id, mappings);
  }

  /**
   * Remove a cell mapping
   */
  async removeMapping(templateId: string, mappingId: string): Promise<ExcelTemplate> {
    const template = await this.getById(templateId);
    if (!template) {
      throw new Error('Excel template not found');
    }

    const mappings = template.mappings.filter((m) => m.id !== mappingId);
    return this.updateMappings(templateId, mappings);
  }
}

export const excelTemplateService = new ExcelTemplateService();
