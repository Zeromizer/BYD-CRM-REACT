import { ButtonHTMLAttributes, forwardRef } from 'react';
import './ui.css';

// ============ BUTTON ============
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`btn btn-${variant} btn-${size} ${loading ? 'btn-loading' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="btn-spinner" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============ INPUT ============
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={`input-wrapper ${error ? 'has-error' : ''} ${className}`}>
        {label && <label htmlFor={inputId} className="input-label">{label}</label>}
        <input ref={ref} id={inputId} className="input-field" {...props} />
        {error && <span className="input-error">{error}</span>}
        {helperText && !error && <span className="input-helper">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============ TEXTAREA ============
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={`input-wrapper ${error ? 'has-error' : ''} ${className}`}>
        {label && <label htmlFor={textareaId} className="input-label">{label}</label>}
        <textarea ref={ref} id={textareaId} className="input-field textarea" {...props} />
        {error && <span className="input-error">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============ SELECT ============
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className={`input-wrapper ${error ? 'has-error' : ''} ${className}`}>
        {label && <label htmlFor={selectId} className="input-label">{label}</label>}
        <select ref={ref} id={selectId} className="input-field select" {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <span className="input-error">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============ MODAL ============
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============ CARD ============
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({ children, className = '', onClick, selected }: CardProps) {
  return (
    <div
      className={`card ${onClick ? 'card-clickable' : ''} ${selected ? 'card-selected' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ============ LOADING ============
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function Loading({ size = 'md', text }: LoadingProps) {
  return (
    <div className={`loading loading-${size}`}>
      <div className="loading-spinner" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

// ============ EMPTY STATE ============
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <span className="empty-state-icon">{icon}</span>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

// ============ BADGE ============
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ============ CHECKBOX ============
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <label htmlFor={checkboxId} className={`checkbox-wrapper ${className}`}>
        <input ref={ref} type="checkbox" id={checkboxId} className="checkbox-input" {...props} />
        <span className="checkbox-label">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============ TOAST ============
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
