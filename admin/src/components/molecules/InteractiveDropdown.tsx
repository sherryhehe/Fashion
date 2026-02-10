'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDropdown } from '@/hooks/useInteractive';

interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: string;
}

interface InteractiveDropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
  multiple?: boolean;
  searchable?: boolean;
}

export default function InteractiveDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  label,
  required = false,
  error,
  multiple = false,
  searchable = false
}: InteractiveDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>(
    value ? (Array.isArray(value) ? value : [value]) : []
  );
  const { isOpen, toggle, close } = useDropdown();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleOptionClick = (optionValue: string | number) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      
      setSelectedValues(newValues);
      if (onChange) {
        onChange(newValues);
      }
    } else {
      setSelectedValues([optionValue]);
      if (onChange) {
        onChange(optionValue);
      }
      close();
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || placeholder;
      }
      return `${selectedValues.length} items selected`;
    } else {
      const option = options.find(opt => opt.value === value);
      return option?.label || placeholder;
    }
  };

  const isSelected = (optionValue: string | number) => {
    return multiple ? selectedValues.includes(optionValue) : value === optionValue;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close]);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      
      <button
        className={`btn btn-outline-secondary dropdown-toggle w-100 d-flex justify-content-between align-items-center ${error ? 'is-invalid' : ''}`}
        type="button"
        onClick={toggle}
        disabled={disabled}
      >
        <span className="text-start flex-grow-1">{getDisplayText()}</span>
        <i className={`bx bx-chevron-down ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {error && <div className="invalid-feedback d-block">{error}</div>}

      {isOpen && (
        <div className="dropdown-menu show w-100" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {searchable && (
            <div className="p-2 border-bottom">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          {filteredOptions.length === 0 ? (
            <div className="dropdown-item-text text-muted">No options found</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                className={`dropdown-item d-flex align-items-center ${isSelected(option.value) ? 'active' : ''}`}
                onClick={() => handleOptionClick(option.value)}
                disabled={option.disabled}
              >
                {option.icon && <i className={`${option.icon} me-2`}></i>}
                <span className="flex-grow-1">{option.label}</span>
                {isSelected(option.value) && (
                  <i className="bx bx-check text-primary"></i>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
