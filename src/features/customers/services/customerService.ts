import { db, type Customer } from '@/shared/lib/db';
import {
  customerSchema,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from '../schemas/customer.schema';
import { authService } from '@/features/auth/services/authService';

/**
 * Customer Service
 * Handles all customer-related business logic
 */
export class CustomerService {
  /**
   * Get all customers for current consultant
   */
  async getAll(): Promise<Customer[]> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    return db.customers
      .where('consultantId')
      .equals(consultant.id)
      .reverse()
      .sortBy('createdAt');
  }

  /**
   * Get customer by ID
   */
  async getById(id: string): Promise<Customer | null> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const customer = await db.customers.get(id);

    // Security: Verify consultant ownership
    if (customer && customer.consultantId !== consultant.id) {
      throw new Error('Unauthorized: Cannot access another consultant\'s customer');
    }

    return customer || null;
  }

  /**
   * Create new customer
   */
  async create(input: CreateCustomerInput): Promise<Customer> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    // Generate UUID
    const id = crypto.randomUUID();

    // Prepare customer data
    const customerData: Customer = {
      ...input,
      id,
      consultantId: consultant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      encrypted: false,
      checklist: input.checklist || {},
      dealClosed: input.dealClosed || false,
    };

    // Validate
    const validated = customerSchema.parse(customerData);

    // Save to IndexedDB
    await db.customers.add(validated);

    console.log('✅ Customer created:', validated.id);
    return validated;
  }

  /**
   * Update customer
   */
  async update(
    id: string,
    input: Partial<UpdateCustomerInput>
  ): Promise<Customer> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    // Get existing customer
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Customer not found');
    }

    // Merge updates
    const updated: Customer = {
      ...existing,
      ...input,
      id, // Ensure ID doesn't change
      consultantId: consultant.id, // Ensure consultant doesn't change
      updatedAt: new Date().toISOString(),
    };

    // Validate
    const validated = customerSchema.parse(updated);

    // Save to IndexedDB
    await db.customers.put(validated);

    console.log('✅ Customer updated:', validated.id);
    return validated;
  }

  /**
   * Delete customer
   */
  async delete(id: string): Promise<void> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    // Verify ownership
    const customer = await this.getById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Delete from IndexedDB
    await db.customers.delete(id);

    console.log('✅ Customer deleted:', id);
  }

  /**
   * Search customers
   */
  async search(query: string): Promise<Customer[]> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const all = await this.getAll();
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      return all;
    }

    return all.filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowerQuery) ||
        customer.phone.includes(query) ||
        customer.email?.toLowerCase().includes(lowerQuery) ||
        customer.nric.toLowerCase().includes(lowerQuery) ||
        customer.vsaNo?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get customers by deal status
   */
  async getByDealStatus(dealClosed: boolean): Promise<Customer[]> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    return db.customers
      .where({ consultantId: consultant.id, dealClosed })
      .reverse()
      .sortBy('updatedAt');
  }

  /**
   * Toggle deal closed status
   */
  async toggleDealClosed(id: string): Promise<Customer> {
    const customer = await this.getById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    return this.update(id, { dealClosed: !customer.dealClosed });
  }

  /**
   * Update checklist item
   */
  async updateChecklistItem(
    id: string,
    itemKey: string,
    value: boolean
  ): Promise<Customer> {
    const customer = await this.getById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedChecklist = {
      ...customer.checklist,
      [itemKey]: value,
    };

    return this.update(id, { checklist: updatedChecklist });
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number;
    open: number;
    closed: number;
  }> {
    const consultant = authService.getCurrentConsultant();
    if (!consultant) {
      throw new Error('Not authenticated');
    }

    const all = await this.getAll();

    return {
      total: all.length,
      open: all.filter((c) => !c.dealClosed).length,
      closed: all.filter((c) => c.dealClosed).length,
    };
  }
}

/**
 * Export singleton instance
 */
export const customerService = new CustomerService();
