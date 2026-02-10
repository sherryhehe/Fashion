'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { stylesApi, productsApi } from '@/lib/api';
import { getStyleImageUrl, getProductImageUrl } from '@/utils/imageHelper';
import { formatCurrency } from '@/utils/currencyHelper';

export default function StyleDetails() {
  const searchParams = useSearchParams();
  const styleId = searchParams.get('id');

  const [style, setStyle] = useState<any>(null);
  const [styleProducts, setStyleProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (styleId) {
      fetchStyle();
    }
  }, [styleId]);

  // Fetch products after style is loaded
  useEffect(() => {
    if (style?.name) {
      fetchStyleProducts();
    }
  }, [style?.name]);

  const fetchStyle = async () => {
    try {
      setLoading(true);
      const response = await stylesApi.getById(styleId!);
      setStyle(response.data);
    } catch (error: any) {
      console.error('Failed to fetch style:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStyleProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.getAll({ style: style?.name, limit: 10 });
      setStyleProducts(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch style products:', error);
      setStyleProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Style Details">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading style details...</p>
        </div>
      </Layout>
    );
  }

  if (!style) {
    return (
      <Layout pageTitle="Style Details">
        <div className="text-center py-5">
          <i className="mdi mdi-alert-circle-outline" style={{ fontSize: '64px', color: '#dc3545' }}></i>
          <h5 className="mt-3">Style Not Found</h5>
          <p className="text-muted">The style you're looking for doesn't exist.</p>
          <Link href="/styles-list" className="btn btn-primary mt-2">
            <i className="mdi mdi-arrow-left me-1"></i>
            Back to Styles
          </Link>
        </div>
      </Layout>
    );
  }

  const styleImage = getStyleImageUrl(style.image);
  const styleIcon = getStyleImageUrl(style.icon);

  return (
    <Layout pageTitle={`Style: ${style.name}`}>
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/styles-list">Styles</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{style.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            {/* Style Image and Info */}
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="style-img">
                      {styleImage && (
                        <img
                          src={styleImage}
                          alt={style.name}
                          className="img-fluid rounded mb-3"
                          style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                          }}
                        />
                      )}
                      {styleIcon && (
                        <div className="text-center">
                          <img
                            src={styleIcon}
                            alt={`${style.name} icon`}
                            className="img-fluid"
                            style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                            }}
                          />
                          <p className="text-muted small mt-2">Icon</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-8">
                    <h3 className="mt-0">{style.name}</h3>
                    
                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted mb-3">
                      <span className={`badge ${style.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {style.status || 'inactive'}
                      </span>
                      {style.featured && (
                        <span className="badge bg-warning">
                          <i className="mdi mdi-star me-1"></i>Featured
                        </span>
                      )}
                      {style.popular && (
                        <span className="badge bg-info">
                          <i className="mdi mdi-fire me-1"></i>Popular
                        </span>
                      )}
                      {style.slug && (
                        <>
                          <span className="text-muted">|</span>
                          <span><strong>Slug:</strong> {style.slug}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-3">
                      <h6>Product Count</h6>
                      <p className="mb-0">
                        <span className="badge bg-primary fs-16">
                          {style.productCount || 0} Products
                        </span>
                      </p>
                    </div>

                    <div className="action-buttons mt-4">
                      <Link href={`/style-edit?id=${style._id || style.id}`} className="btn btn-primary">
                        <i className="mdi mdi-pencil me-1"></i>
                        Edit Style
                      </Link>
                      <Link href="/styles-list" className="btn btn-outline-secondary">
                        <i className="mdi mdi-arrow-left me-1"></i>
                        Back to List
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Style Description */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Description</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-0">{style.description || 'No description available.'}</p>
              </div>
            </div>

            {/* Style Products */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Products with this Style</h5>
                <Link href={`/product-list?style=${encodeURIComponent(style.name)}`} className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {loadingProducts ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                    <p className="text-muted mt-2 small">Loading products...</p>
                  </div>
                ) : styleProducts.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="mdi mdi-package-variant-closed" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    <p className="text-muted mt-2">No products with this style yet</p>
                    <Link href="/product-add" className="btn btn-sm btn-primary">
                      <i className="mdi mdi-plus me-1"></i>
                      Add Product
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {styleProducts.map((product: any) => (
                          <tr key={product._id || product.id}>
                            <td>
                              <img
                                src={getProductImageUrl(product.images, 0)}
                                alt={product.name}
                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                                }}
                              />
                            </td>
                            <td>
                              <Link href={`/product-details?id=${product._id || product.id}`} className="text-decoration-none">
                                {product.name}
                              </Link>
                            </td>
                            <td>{formatCurrency(product.price)}</td>
                            <td>
                              <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                                {product.stock || 0}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                {product.status || 'inactive'}
                              </span>
                            </td>
                            <td>
                              <Link
                                href={`/product-details?id=${product._id || product.id}`}
                                className="btn btn-sm btn-outline-primary"
                                title="View Details"
                              >
                                <i className="bx bx-show"></i>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Style Stats */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Style Statistics</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Total Products</span>
                  <span className="badge bg-primary fs-16">{style.productCount || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Status</span>
                  <span className={`badge ${style.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {style.status || 'inactive'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Featured</span>
                  <span className={`badge ${style.featured ? 'bg-warning' : 'bg-secondary'}`}>
                    {style.featured ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Popular</span>
                  <span className={`badge ${style.popular ? 'bg-info' : 'bg-secondary'}`}>
                    {style.popular ? 'Yes' : 'No'}
                  </span>
                </div>
                {style.createdAt && (
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Created</span>
                    <small>{new Date(style.createdAt).toLocaleDateString()}</small>
                  </div>
                )}
                {style.updatedAt && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Last Updated</span>
                    <small>{new Date(style.updatedAt).toLocaleDateString()}</small>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <Link href={`/style-edit?id=${style._id || style.id}`} className="btn btn-primary w-100 mb-2">
                  <i className="mdi mdi-pencil me-1"></i>
                  Edit Style
                </Link>
                <Link href={`/product-add?style=${encodeURIComponent(style.name)}`} className="btn btn-success w-100 mb-2">
                  <i className="mdi mdi-plus me-1"></i>
                  Add Product with Style
                </Link>
                <Link href="/styles-list" className="btn btn-outline-secondary w-100">
                  <i className="mdi mdi-arrow-left me-1"></i>
                  Back to Styles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

