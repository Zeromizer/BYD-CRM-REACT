import { useState, useMemo } from 'react';
import { Customer } from '@/shared/lib/db';
import { Input, Loading, EmptyState, Button } from '@/shared/components/ui';
import './CustomerList.css';

interface CustomerListProps {
  customers: Customer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export function CustomerList({
  customers,
  selectedId,
  onSelect,
  onAddNew,
  isLoading,
}: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus] = useState<'all' | 'open' | 'closed'>('all');

  const filteredCustomers = useMemo(() => {
    let result = customers;

    // Filter by status
    if (filterStatus === 'open') {
      result = result.filter((c) => !c.dealClosed);
    } else if (filterStatus === 'closed') {
      result = result.filter((c) => c.dealClosed);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.nric.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [customers, searchQuery, filterStatus]);


  if (isLoading) {
    return (
      <div className="customer-list">
        <Loading text="Loading customers..." />
      </div>
    );
  }

  return (
    <div className="customer-list">
      <div className="customer-list-header">
        <h2>Customer List</h2>
        <Button onClick={onAddNew} size="sm">
          + Add Customer
        </Button>
      </div>

      <div className="customer-list-filters">
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="customer-list-items">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No customers found' : 'No customers yet'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Add your first customer to get started'
            }
            action={
              !searchQuery && (
                <Button onClick={onAddNew}>Add Customer</Button>
              )
            }
          />
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              selected={customer.id === selectedId}
              onClick={() => onSelect(customer.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CustomerCardProps {
  customer: Customer;
  selected: boolean;
  onClick: () => void;
}

function CustomerCard({ customer, selected, onClick }: CustomerCardProps) {
  const getInitials = (name: string) => {
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={`customer-card ${selected ? 'selected' : ''}`} onClick={onClick}>
      <div className="customer-avatar">
        {getInitials(customer.name)}
      </div>
      <div className="customer-info">
        <h3 className="customer-name">{customer.name}</h3>
        <span className="customer-id">{customer.nric}</span>
      </div>
    </div>
  );
}
