import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FormTemplate } from '@/shared/lib/db';
import { Customer } from '@/shared/lib/db';
import { formTemplateService } from '../services/formTemplateService';
import { customerService } from '@/features/customers/services/customerService';
import { FormField, CUSTOMER_FIELDS } from '../schemas/form.schema';
import { Button, Card, Modal, Input, Select, Loading, EmptyState, Toast } from '@/shared/components/ui';
import './FormsPage.css';

export function FormsPage() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['formTemplates'],
    queryFn: () => formTemplateService.getAll(),
  });

  // Fetch customers for print preview
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getAll(),
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; imageData: string }) =>
      formTemplateService.create({
        name: data.name,
        imageUrl: data.imageData,
        fields: [],
      }),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      setSelectedTemplate(newTemplate);
      setShowUploadModal(false);
      showToast('Template created successfully!', 'success');
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => formTemplateService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      setSelectedTemplate(null);
      showToast('Template deleted!', 'success');
    },
  });

  // Update fields mutation
  const updateFieldsMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: FormField[] }) =>
      formTemplateService.updateFields(id, fields),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['formTemplates'] });
      setSelectedTemplate(updated);
    },
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Draw canvas with image and fields
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !selectedTemplate) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Draw field markers
    selectedTemplate.fields.forEach((field, index) => {
      // Draw marker
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(field.x, field.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), field.x, field.y);

      // Draw label
      ctx.fillStyle = '#2563eb';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(field.label, field.x + 12, field.y + 4);
    });
  }, [selectedTemplate]);

  // Load image when template changes
  useEffect(() => {
    if (!selectedTemplate?.imageUrl) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        // Set canvas size to match image aspect ratio
        const maxWidth = 800;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        drawCanvas();
      }
    };
    img.src = selectedTemplate.imageUrl;
  }, [selectedTemplate?.imageUrl, selectedTemplate?.id]);

  // Redraw when fields change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, selectedTemplate?.fields]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on existing field
    const clickedField = selectedTemplate.fields.find((field) => {
      const distance = Math.sqrt((field.x - x) ** 2 + (field.y - y) ** 2);
      return distance < 15;
    });

    if (clickedField) {
      setEditingField(clickedField);
      setShowFieldModal(true);
    } else {
      setClickPosition({ x, y });
      setEditingField(null);
      setShowFieldModal(true);
    }
  };

  // Save field
  const handleSaveField = (fieldData: Partial<FormField>) => {
    if (!selectedTemplate) return;

    let newFields: FormField[];

    if (editingField) {
      // Update existing field
      newFields = selectedTemplate.fields.map((f) =>
        f.id === editingField.id ? { ...f, ...fieldData } : f
      );
    } else if (clickPosition) {
      // Add new field
      const newField: FormField = {
        id: crypto.randomUUID(),
        label: fieldData.label || 'New Field',
        customerField: fieldData.customerField || 'name',
        x: clickPosition.x,
        y: clickPosition.y,
        fontSize: fieldData.fontSize || 12,
        fontFamily: fieldData.fontFamily || 'Arial',
        color: fieldData.color || '#000000',
        align: fieldData.align || 'left',
      };
      newFields = [...selectedTemplate.fields, newField];
    } else {
      return;
    }

    updateFieldsMutation.mutate({ id: selectedTemplate.id, fields: newFields });
    setShowFieldModal(false);
    setEditingField(null);
    setClickPosition(null);
  };

  // Delete field
  const handleDeleteField = () => {
    if (!selectedTemplate || !editingField) return;

    const newFields = selectedTemplate.fields.filter((f) => f.id !== editingField.id);
    updateFieldsMutation.mutate({ id: selectedTemplate.id, fields: newFields });
    setShowFieldModal(false);
    setEditingField(null);
  };

  if (isLoading) {
    return <Loading size="lg" text="Loading form templates..." />;
  }

  return (
    <div className="forms-page">
      <div className="forms-header">
        <h1>Form Templates</h1>
        <Button onClick={() => setShowUploadModal(true)}>+ Add Template</Button>
      </div>

      <div className="forms-layout">
        {/* Template List */}
        <aside className="forms-sidebar">
          <div className="template-list">
            {templates.length === 0 ? (
              <EmptyState
                icon="📄"
                title="No templates yet"
                description="Upload a form image to get started"
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
                  <p>{template.fields.length} fields mapped</p>
                </Card>
              ))
            )}
          </div>
        </aside>

        {/* Canvas Editor */}
        <main className="forms-main">
          {selectedTemplate ? (
            <div className="canvas-container">
              <div className="canvas-toolbar">
                <span className="template-name">{selectedTemplate.name}</span>
                <div className="toolbar-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowPrintModal(true)}
                  >
                    🖨️ Print Preview
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
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="form-canvas"
                />
              </div>
              <p className="canvas-hint">
                Click on the form to add field markers. Click existing markers to edit.
              </p>
            </div>
          ) : (
            <EmptyState
              icon="👈"
              title="Select a template"
              description="Choose a template from the list or create a new one"
            />
          )}
        </main>
      </div>

      {/* Upload Modal */}
      <UploadTemplateModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={(name, imageData) => createMutation.mutate({ name, imageData })}
        isLoading={createMutation.isPending}
      />

      {/* Field Edit Modal */}
      <FieldEditModal
        isOpen={showFieldModal}
        onClose={() => {
          setShowFieldModal(false);
          setEditingField(null);
          setClickPosition(null);
        }}
        field={editingField}
        onSave={handleSaveField}
        onDelete={editingField ? handleDeleteField : undefined}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        template={selectedTemplate}
        customers={customers}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

// ============ Upload Modal ============
function UploadTemplateModal({
  isOpen,
  onClose,
  onUpload,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (name: string, imageData: string) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (name && imageData) {
      onUpload(name, imageData);
      setName('');
      setImageData(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Form Template" size="md">
      <div className="upload-form">
        <Input
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., VSA Form"
        />
        
        <div className="file-input-wrapper">
          <label className="file-input-label">Form Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
          {imageData && (
            <img src={imageData} alt="Preview" className="image-preview" />
          )}
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isLoading} disabled={!name || !imageData}>
            Create Template
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============ Field Edit Modal ============
function FieldEditModal({
  isOpen,
  onClose,
  field,
  onSave,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  field: FormField | null;
  onSave: (data: Partial<FormField>) => void;
  onDelete?: () => void;
}) {
  const [label, setLabel] = useState('');
  const [customerField, setCustomerField] = useState('name');
  const [fontSize, setFontSize] = useState(12);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    if (field) {
      setLabel(field.label);
      setCustomerField(field.customerField);
      setFontSize(field.fontSize);
      setColor(field.color);
    } else {
      setLabel('');
      setCustomerField('name');
      setFontSize(12);
      setColor('#000000');
    }
  }, [field, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={field ? 'Edit Field' : 'Add Field'}
      size="sm"
    >
      <div className="field-form">
        <Input
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Customer Name"
        />
        
        <Select
          label="Customer Field"
          value={customerField}
          onChange={(e) => setCustomerField(e.target.value)}
          options={CUSTOMER_FIELDS.map((f) => ({ value: f.value, label: f.label }))}
        />

        <div className="field-row">
          <Input
            label="Font Size"
            type="number"
            value={String(fontSize)}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <Input
            label="Color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          {onDelete && (
            <Button variant="danger" onClick={onDelete}>Delete</Button>
          )}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ label, customerField, fontSize, color })}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============ Print Preview Modal ============
function PrintPreviewModal({
  isOpen,
  onClose,
  template,
  customers,
}: {
  isOpen: boolean;
  onClose: () => void;
  template: FormTemplate | null;
  customers: Customer[];
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const printCanvasRef = useRef<HTMLCanvasElement>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    if (!template || !selectedCustomer || !isOpen) return;

    const canvas = printCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw field values
      template.fields.forEach((field) => {
        const value = getFieldValue(selectedCustomer, field.customerField);
        
        ctx.font = `${field.fontSize}px ${field.fontFamily}`;
        ctx.fillStyle = field.color;
        ctx.textAlign = field.align;
        ctx.fillText(value, field.x, field.y);
      });
    };
    img.src = template.imageUrl;
  }, [template, selectedCustomer, isOpen]);

  const getFieldValue = (customer: Customer, fieldKey: string): string => {
    if (fieldKey === 'todayDate') {
      return new Date().toLocaleDateString();
    }
    return String((customer as unknown as Record<string, unknown>)[fieldKey] || '');
  };

  const handlePrint = () => {
    const canvas = printCanvasRef.current;
    if (!canvas) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Print Form</title></head>
        <body style="margin:0;display:flex;justify-content:center;">
          <img src="${canvas.toDataURL()}" style="max-width:100%;height:auto;" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Preview" size="xl">
      <div className="print-preview">
        <div className="print-controls">
          <Select
            label="Select Customer"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            options={[
              { value: '', label: '-- Select a customer --' },
              ...customers.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Button onClick={handlePrint} disabled={!selectedCustomer}>
            🖨️ Print
          </Button>
        </div>
        
        <div className="print-canvas-wrapper">
          <canvas ref={printCanvasRef} className="print-canvas" />
        </div>
      </div>
    </Modal>
  );
}
