import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer } from '@/shared/lib/db';
import { customerService } from '../services/customerService';
import { CreateCustomerInput } from '../schemas/customer.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { CustomerList } from '../components/CustomerList';
import { CustomerDetails } from '../components/CustomerDetails';
import { CustomerForm } from '../components/CustomerForm';
import { Loading, Toast } from '@/shared/components/ui';
import './CustomersPage.css';

export function CustomersPage() {
  const { consultant, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch customers
  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
    enabled: isSignedIn,
  });

  // Get selected customer
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || null;

  // Auto-select first customer when list loads
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Clear selection if customer is deleted
  useEffect(() => {
    if (selectedCustomerId && !customers.find((c) => c.id === selectedCustomerId)) {
      setSelectedCustomerId(customers[0]?.id || null);
    }
  }, [customers, selectedCustomerId]);

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerInput) => customerService.create(data),
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSelectedCustomerId(newCustomer.id);
      showToast('Customer created successfully!', 'success');
    },
    onError: () => {
      showToast('Failed to create customer', 'error');
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerInput> }) =>
      customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('Customer updated successfully!', 'success');
    },
    onError: () => {
      showToast('Failed to update customer', 'error');
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      showToast('Customer deleted successfully!', 'success');
    },
    onError: () => {
      showToast('Failed to delete customer', 'error');
    },
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddNew = useCallback(() => {
    setEditingCustomer(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (selectedCustomer) {
      setEditingCustomer(selectedCustomer);
      setShowForm(true);
    }
  }, [selectedCustomer]);

  const handleFormSubmit = async (data: CreateCustomerInput) => {
    if (editingCustomer) {
      await updateMutation.mutateAsync({ id: editingCustomer.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleToggleDealClosed = async (id: string) => {
    await customerService.toggleDealClosed(id);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    showToast('Deal status updated!', 'success');
  };

  const handleUpdateChecklist = async (id: string, key: string, value: boolean) => {
    await customerService.updateChecklistItem(id, key, value);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  if (!isSignedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="customers-page">
        <Loading size="lg" text="Loading customers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="customers-page">
        <div className="error-state">
          <h2>Error loading customers</h2>
          <p>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="customers-layout">
        <aside className="customers-sidebar">
          <CustomerList
            customers={customers}
            selectedId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
            onAddNew={handleAddNew}
            isLoading={isLoading}
          />
        </aside>
        <main className="customers-main">
          <CustomerDetails
            customer={selectedCustomer}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleDealClosed={handleToggleDealClosed}
            onUpdateChecklist={handleUpdateChecklist}
          />
        </main>
      </div>

      <CustomerForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleFormSubmit}
        customer={editingCustomer}
        salesConsultantName={consultant?.name || ''}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
