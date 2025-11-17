'use client';

import React from 'react';
import { useForm } from '@/hooks/useInteractive';
import InteractiveButton from '../atoms/InteractiveButton';
import InteractiveDropdown from './InteractiveDropdown';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  rows?: number;
  min?: number;
  max?: number;
}

interface InteractiveFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  submitText?: string;
  submitVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
  showReset?: boolean;
  resetText?: string;
}

export default function InteractiveForm({
  fields,
  initialValues = {},
  onSubmit,
  submitText = 'Submit',
  submitVariant = 'primary',
  className = '',
  showReset = true,
  resetText = 'Reset'
}: InteractiveFormProps) {
  const { values, errors, touched, handleChange, handleBlur, setError, clearErrors, reset } = useForm(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    let hasErrors = false;
    fields.forEach(field => {
      if (field.required && !values[field.name]) {
        setError(field.name, `${field.label} is required`);
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      onSubmit(values);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: values[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(field.name, e.target.value),
      onBlur: () => handleBlur(field.name),
      className: `form-control ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''}`,
      placeholder: field.placeholder,
      required: field.required
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 3}
          />
        );
      
      case 'select':
        return (
          <InteractiveDropdown
            options={field.options || []}
            value={values[field.name] || ''}
            onChange={(value) => handleChange(field.name, value)}
            placeholder={field.placeholder || `Select ${field.label}`}
            required={field.required}
            error={errors[field.name] && touched[field.name] ? errors[field.name] : undefined}
          />
        );
      
      case 'checkbox':
        return (
          <div className="form-check">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={values[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              onBlur={() => handleBlur(field.name)}
              className={`form-check-input ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''}`}
            />
            <label className="form-check-label" htmlFor={field.name}>
              {field.label}
            </label>
          </div>
        );
      
      case 'radio':
        return (
          <div>
            {field.options?.map((option) => (
              <div key={option.value} className="form-check">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={values[field.name] === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  className={`form-check-input ${errors[field.name] && touched[field.name] ? 'is-invalid' : ''}`}
                />
                <label className="form-check-label" htmlFor={`${field.name}-${option.value}`}>
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type={field.type}
            {...commonProps}
            min={field.min}
            max={field.max}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {fields.map((field) => (
        <div key={field.name} className="mb-3">
          {field.type !== 'checkbox' && field.type !== 'radio' && (
            <label htmlFor={field.name} className="form-label">
              {field.label}
              {field.required && <span className="text-danger ms-1">*</span>}
            </label>
          )}
          
          {renderField(field)}
          
          {errors[field.name] && touched[field.name] && (
            <div className="invalid-feedback d-block">
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}
      
      <div className="d-flex gap-2">
        <InteractiveButton
          type="submit"
          variant={submitVariant}
        >
          {submitText}
        </InteractiveButton>
        
        {showReset && (
          <InteractiveButton
            type="button"
            variant="outline-secondary"
            onClick={reset}
          >
            {resetText}
          </InteractiveButton>
        )}
      </div>
    </form>
  );
}
