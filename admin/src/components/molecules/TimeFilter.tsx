'use client';

import { useState } from 'react';

export type TimeFilterOption = 'ALL' | '1M' | '6M' | '1Y';

interface TimeFilterProps {
  defaultValue?: TimeFilterOption;
  onFilterChange?: (filter: TimeFilterOption) => void;
  className?: string;
  isLoading?: boolean;
}

export default function TimeFilter({ 
  defaultValue = '1Y', 
  onFilterChange,
  className = '',
  isLoading = false
}: TimeFilterProps) {
  const [activeFilter, setActiveFilter] = useState<TimeFilterOption>(defaultValue);

  const filterOptions: TimeFilterOption[] = ['ALL', '1M', '6M', '1Y'];

  const handleFilterClick = (filter: TimeFilterOption) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
    
    // Optional: Add visual feedback
    const button = document.querySelector(`[data-filter="${filter}"]`) as HTMLButtonElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 150);
    }
  };

  const getFilterLabel = (filter: TimeFilterOption): string => {
    switch (filter) {
      case 'ALL':
        return 'All Time';
      case '1M':
        return 'Last Month';
      case '6M':
        return 'Last 6 Months';
      case '1Y':
        return 'Last Year';
      default:
        return filter;
    }
  };

  return (
    <div className={`d-flex gap-1 ${className}`}>
      {filterOptions.map((filter) => (
        <button
          key={filter}
          type="button"
          data-filter={filter}
          className={`btn btn-sm btn-outline-light ${
            activeFilter === filter ? 'active' : ''
          }`}
          onClick={() => handleFilterClick(filter)}
          title={getFilterLabel(filter)}
          style={{ transition: 'all 0.15s ease' }}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
