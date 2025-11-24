import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExcelTemplate, Customer } from '@/shared/lib/db';
import { excelTemplateService } from '../services/excelTemplateService';
import { customerService } from '@/features/customers/services/customerService';
import { ExcelMappingType, EXCEL_CUSTOMER_FIELDS } from '../schemas/excel.schema';
import { Button, Card, Modal, Input, Select, Loading, EmptyState, Toast, Badge } from '@/shared/components/ui';
import './ExcelPage.css';

export function ExcelPage() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ExcelTemplate | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['excelTemplates'],
    queryFn: () => excelTemplateService.getAll(),
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; fileName: string; fileData: string }) =>
      excelTemplateService.create({
        name: data.name,
        driveFileId: '',
        driveFileName: data.fileName,
        mappings: [],
      }),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['excelTemplates'] });
      setSelectedTemplate(newTemplate);
      setShowUploadModal(false);
      showToast('Excel template created!', 'success');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => excelTemplateService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['excelTemplates'] });
      setSelectedTemplate(null);
      showToast('Template deleted!', 'success');
    },
  });

  // Update mappings mutation
  const updateMappingsMutation = useMutation({
    mutationFn: ({ id, mappings }: { id: string; mappings: ExcelMappingType[] }) =>
      excelTemplateService.updateMappings(id, mappings),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['excelTemplates'] });
      setSelectedTemplate(updated);
      showToast('Mappings saved!', 'success');
    },
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddMapping = () => {
    if (!selectedTemplate) return;
    
    const newMapping: ExcelMappingType = {
      id: crypto.randomUUID(),
      customerField: 'name',
      cell: 'A1',
    };
    
    const mappings = [...selectedTemplate.mappings, newMapping];
    updateMappingsMutation.mutate({ id: selectedTemplate.id, mappings });
  };

  const handleUpdateMapping = (mappingId: string, updates: Partial<ExcelMappingType>) => {
    if (!selectedTemplate) return;
    
    const mappings = selectedTemplate.mappings.map((m) =>
      m.id === mappingId ? { ...m, ...updates } : m
    );
    updateMappingsMutation.mutate({ id: selectedTemplate.id, mappings });
  };

  const handleDeleteMapping = (mappingId: string) => {
    if (!selectedTemplate) return;
    
    const mappings = selectedTemplate.mappings.filter((m) => m.id !== mappingId);
    updateMappingsMutation.mutate({ id: selectedTemplate.id, mappings });
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading Excel templates..." />;
  }

  return (
    <div className="excel-page">
      <div className="excel-header">
        <h1>Excel Templates</h1>
        <Button onClick={() => setShowUploadModal(true)}>+ Add Template</Button>
      </div>

      <div className="excel-layout">
        {/* Template List */}
        <aside className="excel-sidebar">
          <div className="template-list">
            {templates.length === 0 ? (
              <EmptyState
                icon="📊"
                title="No templates yet"
                description="Upload an Excel template to get started"
              />
            ) : (
              templates.map((template) => (
                <Card
                  key={template.id}
                  className="template-card"
                  selected={selectedTemplate?.id === template.id}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h3>{template.name}</h3>
                  <p>{template.driveFileName}</p>
                  <Badge variant="info">{template.mappings.length} mappings</Badge>
                </Card>
              ))
            )}
          </div>
        </aside>

        {/* Mapping Editor */}
        <main className="excel-main">
          {selectedTemplate ? (
            <div className="mapping-container">
              <div className="mapping-toolbar">
                <div>
                  <h2>{selectedTemplate.name}</h2>
                  <span className="file-name">{selectedTemplate.driveFileName}</span>
                </div>
                <div className="toolbar-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowGenerateModal(true)}
                  >
                    📝 Generate Excel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this template?')) {
                        deleteMutation.mutate(selectedTemplate.id);
                      }
                    }}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </div>

              <div className="mappings-section">
                <div className="mappings-header">
                  <h3>Cell Mappings</h3>
                  <Button size="sm" onClick={handleAddMapping}>
                    + Add Mapping
                  </Button>
                </div>

                {selectedTemplate.mappings.length === 0 ? (
                  <EmptyState
                    icon="🔗"
                    title="No mappings yet"
                    description="Add cell mappings to populate customer data into your Excel template"
                    action={<Button onClick={handleAddMapping}>Add First Mapping</Button>}
                  />
                ) : (
                  <div className="mappings-list">
                    {selectedTemplate.mappings.map((mapping) => (
                      <MappingRow
                        key={mapping.id}
                        mapping={mapping}
                        onUpdate={(updates) => handleUpdateMapping(mapping.id, updates)}
                        onDelete={() => handleDeleteMapping(mapping.id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mapping-info">
                <h4>How it works:</h4>
                <ol>
                  <li>Upload your Excel template file</li>
                  <li>Add mappings to specify which customer field goes into which cell</li>
                  <li>Use cell references like A1, B5, C10, etc.</li>
                  <li>Click "Generate Excel" to create a filled version for any customer</li>
                </ol>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="👈"
              title="Select a template"
              description="Choose an Excel template from the list or create a new one"
            />
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadExcelModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(name, fileName, fileData) =>
          createMutation.mutate({ name, fileName, fileData })
        }
        isLoading={createMutation.isPending}
      />

      {/* Generate Modal */}
      <GenerateExcelModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        template={selectedTemplate}
        customers={customers}
        onSuccess={() => showToast('Excel generated!', 'success')}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

// ============ Mapping Row ============
function MappingRow({
  mapping,
  onUpdate,
  onDelete,
}: {
  mapping: ExcelMappingType;
  onUpdate: (updates: Partial<ExcelMappingType>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="mapping-row">
      <Select
        value={mapping.customerField}
        onChange={(e) => onUpdate({ customerField: e.target.value })}
        options={EXCEL_CUSTOMER_FIELDS.map((f) => ({ value: f.value, label: f.label }))}
      />
      <span className="mapping-arrow">→</span>
      <Input
        value={mapping.cell}
        onChange={(e) => onUpdate({ cell: e.target.value.toUpperCase() })}
        placeholder="e.g., A1"
        style={{ width: '80px', textTransform: 'uppercase' }}
      />
      <Input
        value={mapping.sheetName || ''}
        onChange={(e) => onUpdate({ sheetName: e.target.value })}
        placeholder="Sheet (optional)"
        style={{ width: '120px' }}
      />
      <Button variant="ghost" size="sm" onClick={onDelete}>
        ✕
      </Button>
    </div>
  );
}

// ============ Upload Modal ============
function UploadExcelModal({
  isOpen,
  onClose,
  onUpload,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (name: string, fileName: string, fileData: string) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!name) {
      setName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (name && fileName && fileData) {
      onUpload(name, fileName, fileData);
      setName('');
      setFileName('');
      setFileData(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Excel Template" size="md">
      <div className="upload-form">
        <Input
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sales Agreement"
        />

        <div className="file-input-wrapper">
          <label className="file-input-label">Excel File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="file-input"
          />
          {fileName && (
            <div className="file-selected">
              📊 {fileName}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isLoading} disabled={!name || !fileData}>
            Create Template
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============ Generate Modal ============
function GenerateExcelModal({
  isOpen,
  onClose,
  template,
  customers,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  template: ExcelTemplate | null;
  customers: Customer[];
  onSuccess: () => void;
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const getFieldValue = (customer: Customer, fieldKey: string): string => {
    switch (fieldKey) {
      case 'todayDate':
        return new Date().toISOString().split('T')[0];
      case 'todayDateFormatted':
        return new Date().toLocaleDateString('en-GB');
      case 'fullAddress':
        return [customer.address, customer.addressContinue].filter(Boolean).join(', ');
      default:
        return String((customer as unknown as Record<string, unknown>)[fieldKey] || '');
    }
  };

  const handleGenerate = async () => {
    if (!template || !selectedCustomer) return;

    setIsGenerating(true);
    try {
      // Create a simple CSV/text representation for now
      // In production, you would use xlsx-populate here
      const data = template.mappings.map((m) => ({
        cell: m.cell,
        value: getFieldValue(selectedCustomer, m.customerField),
      }));

      // For demo purposes, download as JSON mapping
      // Real implementation would use xlsx-populate
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name}_${selectedCustomer.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to generate Excel:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Excel" size="md">
      <div className="generate-form">
        <p>Select a customer to generate a filled Excel file using template: <strong>{template.name}</strong></p>
        
        <Select
          label="Select Customer"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          options={[
            { value: '', label: '-- Select a customer --' },
            ...customers.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />

        {selectedCustomer && (
          <div className="preview-data">
            <h4>Data to fill:</h4>
            <div className="preview-list">
              {template.mappings.map((m) => (
                <div key={m.id} className="preview-item">
                  <span className="preview-cell">{m.cell}</span>
                  <span className="preview-value">
                    {getFieldValue(selectedCustomer, m.customerField)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleGenerate} 
            loading={isGenerating}
            disabled={!selectedCustomer}
          >
            Generate & Download
          </Button>
        </div>
      </div>
    </Modal>
  );
}
