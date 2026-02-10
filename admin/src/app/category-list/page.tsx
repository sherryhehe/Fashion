'use client';

import { Layout, InteractiveTable, InteractiveButton } from '@/components';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/api';
import { getCategoryImageUrl } from '@/utils/imageHelper';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';

export default function CategoryList() {
  const { addNotification } = useNotificationContext();
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getAll();
      let data = response.data || [];
      
      // Apply filters
      if (statusFilter) {
        data = data.filter((cat: any) => cat.status === statusFilter);
      }
      
      setCategories(data);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      addNotification('error', error?.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await categoriesApi.delete(id);
      addNotification('success', 'Category deleted successfully');
      fetchCategories(); // Refresh list
    } catch (error: any) {
      addNotification('error', error?.message || 'Failed to delete category');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (value: string, row: any) => {
        const placeholderImage = '/assets/images/products/product-1.png';
        const imageUrl = getCategoryImageUrl(value, placeholderImage);
        
        return (
          <img 
            src={imageUrl} 
            alt={row.name} 
            className="rounded" 
            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }}
          />
        );
      }
    },
    { 
      key: 'name', 
      label: 'Category Name',
      render: (value: string, row: any) => (
        <div>
          <Link 
            href={`/category-details?id=${row._id || row.id}`}
            className="fw-medium text-dark text-decoration-none"
          >
            {value}
          </Link>
          {row.slug && (
            <small className="text-muted d-block">/{row.slug}</small>
          )}
        </div>
      )
    },
    { 
      key: 'description', 
      label: 'Description',
      render: (value: string) => (
        <div className="text-truncate" style={{ maxWidth: '200px' }} title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'productCount',
      label: 'Products',
      render: (value: number) => (
        <span className="badge bg-primary">
          {value || 0}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`badge ${value === 'active' ? 'bg-success' : 'bg-secondary'}`}>
          {value || 'inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const handleView = (category: any) => {
    window.location.href = `/category-details?id=${category._id || category.id}`;
  };

  const handleEdit = (category: any) => {
    window.location.href = `/category-edit?id=${category._id || category.id}`;
  };

  const handleDeleteAction = async (category: any) => {
    await handleDelete(category._id || category.id);
  };

  return (
    <Layout pageTitle="Categories">
                <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">All Categories {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
              <Link href="/category-add">
                <InteractiveButton variant="primary">
                  <i className="mdi mdi-plus me-1"></i>
                  Add Category
                </InteractiveButton>
              </Link>
        </div>

              <div className="card-body">
              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-4">
                    <select 
                    className="form-select" 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
          </div>
        </div>

              {/* Categories */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading categories from MongoDB...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-folder-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Categories Yet</h5>
                  <p className="text-muted">Create your first product category!</p>
                  <Link href="/category-add">
                    <InteractiveButton variant="primary">
                      <i className="mdi mdi-plus me-1"></i>
                      Add Your First Category
                    </InteractiveButton>
                  </Link>
              </div>
              ) : (
                <InteractiveTable
                  data={categories}
                  columns={columns}
                  onRowClick={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteAction}
                  itemsPerPage={10}
                />
              )}
            </div>
          </div>
        </div>
      </div>

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
    </Layout>
  );
}
