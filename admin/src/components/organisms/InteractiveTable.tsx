'use client';

import React, { useState, useMemo } from 'react';
import { useFilters, usePagination, useSearch } from '@/hooks/useInteractive';
import { InteractiveButton } from '@/components/atoms';
import { InteractiveDropdown } from '@/components/molecules';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from './ConfirmDialog';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
}

interface Filter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'number';
  options?: Array<{ value: string | number; label: string }>;
}

interface InteractiveTableProps {
  data: any[];
  columns: Column[];
  filters?: Filter[];
  searchFields?: string[];
  itemsPerPage?: number;
  className?: string;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDuplicate?: (row: any) => void;
  onDelete?: (row: any) => void;
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
}

export default function InteractiveTable({
  data,
  columns,
  filters = [],
  searchFields = [],
  itemsPerPage = 10,
  className = '',
  onRowClick,
  onEdit,
  onDuplicate,
  onDelete,
  showActions = true,
  showSearch = true,
  showFilters = true,
  showPagination = true
}: InteractiveTableProps) {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { filters: activeFilters, updateFilter, clearFilters } = useFilters();
  const { searchTerm, setSearchTerm, filteredData: searchFilteredData } = useSearch(data, searchFields);
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();
  
  const { currentData, currentPage, totalPages, goToPage, nextPage, prevPage, hasNextPage, hasPrevPage } = 
    usePagination(searchFilteredData, itemsPerPage);

  const sortedData = useMemo(() => {
    if (!sortField) return currentData;
    
    return [...currentData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [currentData, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key, value);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return 'bx-sort';
    return sortDirection === 'asc' ? 'bx-sort-up' : 'bx-sort-down';
  };

  return (
    <div className={`interactive-table ${className}`}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="row mb-3">
          {showSearch && (
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bx bx-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {showFilters && filters.length > 0 && (
            <div className="col-md-6">
              <div className="d-flex gap-2 flex-wrap">
                {filters.map((filter) => (
                  <div key={filter.key} className="flex-grow-1" style={{ minWidth: '150px' }}>
                    {filter.type === 'select' ? (
                      <InteractiveDropdown
                        options={filter.options || []}
                        value={activeFilters[filter.key]}
                        onChange={(value) => handleFilterChange(filter.key, value)}
                        placeholder={filter.label}
                        className="w-100"
                      />
                    ) : (
                      <input
                        type={filter.type}
                        className="form-control"
                        placeholder={filter.label}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
                <InteractiveButton
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <i className="bx bx-x me-1"></i>Clear
                </InteractiveButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.sortable ? 'cursor-pointer' : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="d-flex align-items-center">
                    {column.label}
                    {column.sortable && (
                      <i className={`bx ${getSortIcon(column.key)} ms-1`}></i>
                    )}
                  </div>
                </th>
              ))}
              {showActions && (
                <th width="120">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={index}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {showActions && (
                  <td>
                    <div className="btn-group btn-group-sm">
                      {onEdit && (
                        <InteractiveButton
                          variant="outline-primary"
                          size="sm"
                          onClick={() => onEdit(row)}
                        >
                          <i className="bx bx-edit"></i>
                        </InteractiveButton>
                      )}
                      {onDuplicate && (
                        <InteractiveButton
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => onDuplicate(row)}
                        >
                          <i className="bx bx-copy"></i>
                        </InteractiveButton>
                      )}
                      {onDelete && (
                        <InteractiveButton
                          variant="outline-danger"
                          size="sm"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: 'Delete Item',
                              message: 'Are you sure you want to delete this item? This action cannot be undone.',
                              confirmText: 'Delete',
                              cancelText: 'Cancel',
                              variant: 'danger',
                            });
                            if (confirmed) {
                              onDelete(row);
                            }
                          }}
                        >
                          <i className="bx bx-trash"></i>
                        </InteractiveButton>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
          </div>
          
          <div className="d-flex gap-1">
            <InteractiveButton
              variant="outline-secondary"
              size="sm"
              onClick={prevPage}
              disabled={!hasPrevPage}
            >
              <i className="bx bx-chevron-left"></i>
            </InteractiveButton>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <InteractiveButton
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </InteractiveButton>
              );
            })}
            
            <InteractiveButton
              variant="outline-secondary"
              size="sm"
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              <i className="bx bx-chevron-right"></i>
            </InteractiveButton>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        variant={dialog.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
