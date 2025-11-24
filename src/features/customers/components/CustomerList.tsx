import { useState, useMemo } from 'react';
import { Customer } from '@/shared/lib/db';
import { Input, Card, Badge, Loading, EmptyState, Button } from '@/shared/components/ui';
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
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');

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

  const stats = useMemo(() => {
    return {
      total: customers.length,
      open: customers.filter((c) => !c.dealClosed).length,
      closed: customers.filter((c) => c.dealClosed).length,
    };
  }, [customers]);

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
        <div className="customer-list-title">
          <h2>Customers</h2>
          <span className="customer-count">{stats.total}</span>
        </div>
        <Button onClick={onAddNew} size="sm">
          + Add Customer
        </Button>
      </div>

      <div className="customer-list-filters">
        <Input
          placeholder="Search by name, phone, NRIC..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'open' ? 'active' : ''}`}
            onClick={() => setFilterStatus('open')}
          >
            Open ({stats.open})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'closed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('closed')}
          >
            Closed ({stats.closed})
          </button>
        </div>
      </div>

      <div className="customer-list-items">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon="👤"
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
  return (
    <Card
      className="customer-card"
      selected={selected}
      onClick={onClick}
    >
      <div className="customer-card-header">
        <h3 className="customer-name">{customer.name}</h3>
        <Badge variant={customer.dealClosed ? 'success' : 'warning'}>
          {customer.dealClosed ? 'Closed' : 'Open'}
        </Badge>
      </div>
      <div className="customer-card-details">
        <span className="customer-phone">📱 {customer.phone}</span>
        {customer.vsaNo && (
          <span className="customer-vsa">VSA: {customer.vsaNo}</span>
        )}
      </div>
      <div className="customer-card-footer">
        <span className="customer-date">
          Added: {new Date(customer.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Card>
  );
}
