'use client';

import { Layout, InteractiveTable, InteractiveButton } from '@/components';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { brandsApi } from '@/lib/api';
import { getBrandLogoUrl } from '@/utils/imageHelper';
import { formatCurrencyNoDecimals } from '@/utils/currencyHelper';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';

export default function BrandList() {
  const { addNotification } = useNotificationContext();
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, [statusFilter, searchQuery]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await brandsApi.getAll(params);
      setBrands(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch brands:', error);
      addNotification('error', error?.message || 'Failed to load brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Brand',
      message: 'Are you sure you want to delete this brand? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await brandsApi.delete(id);
      addNotification('success', 'Brand deleted successfully');
      fetchBrands(); // Refresh list
    } catch (error: any) {
      addNotification('error', error?.message || 'Failed to delete brand');
    }
  };

  const handleVerifyToggle = async (brand: any) => {
    try {
      const newVerified = !brand.verified;
      await brandsApi.setVerified(brand._id || brand.id, newVerified);
      addNotification('success', `Brand ${newVerified ? 'verified' : 'unverified'} successfully`);
      fetchBrands();
    } catch (error: any) {
      addNotification('error', error?.message || 'Failed to update verification status');
    }
  };

  const columns = [
    {
      key: 'logo',
      label: 'Logo',
      render: (value: string, row: any) => {
        const placeholderImage = '/assets/images/products/product-1.png';
        const imageUrl = getBrandLogoUrl(value, placeholderImage);
        
        return (
          <img 
            src={imageUrl} 
            alt={row.name} 
            className="rounded" 
            style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }} 
            onClick={() => window.location.href = `/brand-details?id=${row._id || row.id}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }}
          />
        );
      }
    },
    { 
      key: 'name', 
      label: 'Brand Name',
      render: (value: string, row: any) => (
        <div>
          <a
            href={`/brand-details?id=${row._id || row.id}`}
            className="text-dark fw-medium text-decoration-none"
            style={{ cursor: 'pointer' }}
          >
            {value}
          </a>
          {row.email && (
            <div>
              <small className="text-muted">{row.email}</small>
            </div>
          )}
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
      key: 'totalSales',
      label: 'Total Sales',
      render: (value: number) => formatCurrencyNoDecimals(value || 0)
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (value: number) => (
        <span className="badge bg-info">
          {value || 10}%
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: any = {
          active: 'bg-success',
          inactive: 'bg-secondary',
          pending: 'bg-warning'
        };
        return (
          <span className={`badge ${statusColors[value] || 'bg-secondary'}`}>
            {value || 'pending'}
          </span>
        );
      }
    },
    {
      key: 'verified',
      label: 'Verified',
      render: (value: boolean) => (
        value ? (
          <span className="badge bg-success">
            <i className="mdi mdi-check-circle me-1"></i>Verified
          </span>
        ) : (
          <span className="badge bg-secondary">Not Verified</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'verifyAction',
      label: 'Actions',
      render: (_: any, row: any) => (
        <button
          className={`btn btn-sm ${row.verified ? 'btn-outline-secondary' : 'btn-outline-success'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleVerifyToggle(row);
          }}
        >
          <i className={`mdi ${row.verified ? 'mdi-cancel' : 'mdi-check-circle'} me-1`}></i>
          {row.verified ? 'Unverify' : 'Verify'}
        </button>
      )
    }
  ];

  const handleEdit = (brand: any) => {
    window.location.href = `/brand-edit?id=${brand._id || brand.id}`;
  };

  const handleDeleteAction = async (brand: any) => {
    await handleDelete(brand._id || brand.id);
  };

  return (
    <Layout pageTitle="Brand List">
                <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">All Brands {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
              <Link href="/brand-add">
                <InteractiveButton variant="primary">
                  <i className="mdi mdi-plus me-1"></i>
                  Add Brand
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
                    <option value="pending">Pending</option>
                    </select>
                </div>
                <div className="col-md-4">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search brands by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
          </div>
        </div>

              {/* Brands Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading brands from MongoDB...</p>
                </div>
              ) : brands.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-tag-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Brands Yet</h5>
                  <p className="text-muted">
                    Register brands/sellers on your marketplace platform.<br/>
                    Brands can then list their products on your site.
                  </p>
                  <Link href="/brand-add">
                    <InteractiveButton variant="primary">
                      <i className="mdi mdi-plus me-1"></i>
                      Add Your First Brand
                    </InteractiveButton>
                  </Link>
              </div>
              ) : (
                <InteractiveTable
                  data={brands}
                  columns={columns}
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
