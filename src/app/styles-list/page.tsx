'use client';

import { Layout, InteractiveTable, InteractiveButton } from '@/components';
import { useNotification } from '@/hooks/useInteractive';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { stylesApi } from '@/lib/api';

export default function StylesList() {
  const { addNotification } = useNotification();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [styles, setStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStyles();
  }, [statusFilter, typeFilter]);

  const fetchStyles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await stylesApi.getAll(params);
      setStyles(response.data || []);
    } catch (error) {
      console.error('Failed to fetch styles:', error);
      addNotification('Failed to load styles', 'error');
      setStyles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this style?')) return;

    try {
      await stylesApi.delete(id);
      addNotification('Style deleted successfully', 'success');
      fetchStyles(); // Refresh list
    } catch (error) {
      addNotification('Failed to delete style', 'error');
    }
  };
  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (value: string, row: any) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
        const placeholderImage = '/assets/images/products/product-1.png';
        
        let imageUrl = placeholderImage;
        
        if (value) {
          if (value.startsWith('http')) {
            imageUrl = value;
          } else if (value.startsWith('/uploads/')) {
            imageUrl = `${API_URL}${value}`;
          }
        }
        
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
      label: 'Style Name',
      render: (value: string, row: any) => (
        <div>
          <div className="fw-medium text-dark">{value}</div>
          {row.slug && (
            <small className="text-muted">/{row.slug}</small>
          )}
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (value: string) => (
        <span className="badge bg-primary text-capitalize">
          {value}
        </span>
      )
    },
    {
      key: 'productCount',
      label: 'Products',
      render: (value: number) => (
        <span className="badge bg-success">
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
      key: 'featured',
      label: 'Featured',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'bg-warning' : 'bg-secondary'}`}>
          {value ? 'Featured' : 'Regular'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const handleEdit = (style: any) => {
    window.location.href = `/style-edit?id=${style._id || style.id}`;
  };

  const handleDeleteAction = async (style: any) => {
    await handleDelete(style._id || style.id);
  };

  return (
    <Layout pageTitle="Styles Management">
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">All Styles {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
              <Link href="/style-add">
                <InteractiveButton variant="primary">
                  <i className="mdi mdi-plus me-1"></i>
                  Add Style
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
                <div className="col-md-4">
                  <select 
                    className="form-select" 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="western">Western</option>
                    <option value="desi">Desi</option>
                    <option value="eastern">Eastern</option>
                    <option value="asian">Asian</option>
                    <option value="traditional">Traditional</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>
              </div>

              {/* Styles Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading styles from MongoDB...</p>
                </div>
              ) : styles.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-palette-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Styles Yet</h5>
                  <p className="text-muted">Create your first style to get started!</p>
                  <Link href="/style-add">
                    <InteractiveButton variant="primary">
                      <i className="mdi mdi-plus me-1"></i>
                      Add Your First Style
                    </InteractiveButton>
                  </Link>
                </div>
              ) : (
                <InteractiveTable
                  data={styles}
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
    </Layout>
  );
}
