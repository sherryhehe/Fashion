'use client';

import { Layout, InteractiveTable, InteractiveButton } from '@/components';
import { useNotificationContext } from '@/contexts/NotificationContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { getProductImageUrl } from '@/utils/imageHelper';
import { formatCurrency } from '@/utils/currencyHelper';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';

export default function ProductList() {
  const { addNotification } = useNotificationContext();
  const searchParams = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  // Sync search query from URL
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  // Fetch products from MongoDB backend
  useEffect(() => {
    fetchProducts();
  }, [statusFilter, categoryFilter]);

  // Filter products when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(query);
      const descriptionMatch = product.description?.toLowerCase().includes(query);
      const skuMatch = product.sku?.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);
      
      return nameMatch || descriptionMatch || skuMatch || categoryMatch;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await productsApi.getAll(params);
      const fetchedProducts = response.data || [];
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      addNotification('error', error?.message || 'Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await productsApi.delete(id);
      addNotification('success', 'Product deleted successfully');
      fetchProducts(); // Refresh list
    } catch (error: any) {
      addNotification('error', error?.message || 'Failed to delete product');
    }
  };

  const makeDuplicateSku = (sku?: string) => {
    const suffix = Date.now().toString().slice(-6);
    const base = (sku || 'SKU')
      .toString()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^A-Za-z0-9-_]/g, '')
      .toUpperCase();
    return `${base}-COPY-${suffix}`;
  };

  const handleDuplicate = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Duplicate Product',
      message: 'This will create a new product copy (as Draft) with a new SKU. Continue?',
      confirmText: 'Duplicate',
      cancelText: 'Cancel',
      variant: 'info',
    });

    if (!confirmed) return;

    try {
      setDuplicatingId(id);

      const sourceResp = await productsApi.getById(id);
      const source: any = sourceResp.data;

      const payload: any = {
        name: `${source.name || 'Product'} (Copy)`,
        description: source.description || '',
        price: source.price || 0,
        originalPrice: source.originalPrice,
        discount: source.discount,
        category: source.category || '',
        brand: source.brand,
        style: source.style,
        sku: makeDuplicateSku(source.sku),
        stock: source.stock ?? 0,
        images: Array.isArray(source.images) ? source.images : [],
        features: Array.isArray(source.features) ? source.features : [],
        tags: Array.isArray(source.tags) ? source.tags : [],
        specifications: source.specifications || {},
        variations: source.variations || [],
        seo: source.seo || {},
        featured: false,
        status: 'draft',
        // Do not carry over reviews/ratings/sales
        reviews: [],
        reviewCount: 0,
        rating: 0,
        salesCount: 0,
        views: 0,
      };

      const createdResp = await productsApi.create(payload);
      const created: any = createdResp.data;

      addNotification('success', 'Product duplicated. You can edit it now.');

      // Go straight to edit screen for faster workflow
      window.location.href = `/product-edit?id=${created._id || created.id}`;
    } catch (error: any) {
      console.error('Failed to duplicate product:', error);
      addNotification('error', error?.message || 'Failed to duplicate product');
    } finally {
      setDuplicatingId(null);
    }
  };

  const columns = [
    {
      key: 'images',
      label: 'Image',
      render: (value: string[], row: any) => {
        const placeholderImage = '/assets/images/products/product-1.png';
        const imageUrl = getProductImageUrl(value, 0, placeholderImage);
        
        return (
          <img 
            src={imageUrl} 
            alt={row.name} 
            className="rounded" 
            style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }} 
            onClick={() => window.location.href = `/product-details?id=${row._id || row.id}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }}
          />
        );
      }
    },
    { 
      key: 'name', 
      label: 'Product Name',
      render: (value: string, row: any) => (
        <a 
          href={`/product-details?id=${row._id || row.id}`}
          className="text-dark fw-medium text-decoration-none"
          style={{ cursor: 'pointer' }}
        >
          {value}
        </a>
      )
    },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (value: number) => (
        <span className={`badge ${value > 20 ? 'bg-success' : value > 0 ? 'bg-warning' : 'bg-danger'}`}>
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
    }
  ];

  const handleEdit = (product: any) => {
    window.location.href = `/product-edit?id=${product._id || product.id}`;
  };

  const handleDuplicateAction = async (product: any) => {
    const id = product._id || product.id;
    if (!id) return;
    if (duplicatingId) return;
    await handleDuplicate(id);
  };

  const handleDeleteAction = async (product: any) => {
    await handleDelete(product._id || product.id);
  };

  return (
    <Layout pageTitle="Product List">
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">Products {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
              <Link href="/product-add">
                <InteractiveButton variant="primary">
                  <i className="mdi mdi-plus me-1"></i>
                  Add Product
                </InteractiveButton>
              </Link>
            </div>

            <div className="card-body">
              {/* Search Info */}
              {searchQuery && (
                <div className="alert alert-info mb-3 d-flex justify-content-between align-items-center">
                  <span>
                    <i className="mdi mdi-information-outline me-2"></i>
                    Searching for: <strong>"{searchQuery}"</strong> ({filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'})
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setSearchQuery('');
                      window.history.replaceState({}, '', '/product-list');
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              )}

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
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filter by category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Products Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading products from MongoDB...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-package-variant-closed" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">
                    {searchQuery ? 'No Products Found' : 'No Products Yet'}
                  </h5>
                  <p className="text-muted">
                    {searchQuery 
                      ? `No products match "${searchQuery}". Try a different search term.`
                      : 'Start by adding your first product!'
                    }
                  </p>
                  {!searchQuery && (
                    <Link href="/product-add">
                      <InteractiveButton variant="primary">
                        <i className="mdi mdi-plus me-1"></i>
                        Add Your First Product
                      </InteractiveButton>
                    </Link>
                  )}
                </div>
              ) : (
                <InteractiveTable
                  data={filteredProducts}
                  columns={columns}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicateAction}
                  onDelete={handleDeleteAction}
                  itemsPerPage={10}
                  showSearch={false}
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
