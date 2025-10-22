'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { brandsApi, productsApi } from '@/lib/api';

export default function BrandDetails() {
  const searchParams = useSearchParams();
  const brandId = searchParams.get('id');

  const [brand, setBrand] = useState<any>(null);
  const [brandProducts, setBrandProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [togglingFeatured, setTogglingFeatured] = useState(false);

  useEffect(() => {
    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  // Fetch products after brand is loaded
  useEffect(() => {
    if (brand?.name) {
      fetchBrandProducts();
    }
  }, [brand?.name]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await brandsApi.getById(brandId!);
      setBrand(response.data);
    } catch (error) {
      console.error('Failed to fetch brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandProducts = async () => {
    try {
      setLoadingProducts(true);
      console.log('🔍 Fetching products for brand:', brand?.name);
      
      // Fetch products by this brand name
      const response = await productsApi.getAll({ brand: brand?.name });
      console.log('📦 Brand products found:', response.data?.length || 0);
      
      setBrandProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch brand products:', error);
      setBrandProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Brand Details">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading brand details...</p>
        </div>
      </Layout>
    );
  }

  if (!brand) {
    return (
      <Layout pageTitle="Brand Details">
        <div className="text-center py-5">
          <i className="mdi mdi-alert-circle-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
          <h5 className="mt-3">Brand Not Found</h5>
          <p className="text-muted">The requested brand could not be found.</p>
          <Link href="/brand-list" className="btn btn-primary">
            <i className="mdi mdi-arrow-left me-1"></i>Back to Brands
          </Link>
        </div>
      </Layout>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  const placeholderImage = '/assets/images/products/product-1.png';
  
  const getBrandLogo = () => {
    if (!brand.logo) return placeholderImage;
    if (brand.logo.startsWith('http')) return brand.logo;
    if (brand.logo.startsWith('/uploads/')) return `${API_URL}${brand.logo}`;
    return placeholderImage;
  };

  // Toggle featured status
  const handleToggleFeatured = async () => {
    try {
      setTogglingFeatured(true);
      console.log('🌟 Toggling featured status for brand:', brandId);
      console.log('Current featured status:', brand.featured);
      console.log('New featured status:', !brand.featured);

      const response = await brandsApi.update(brandId!, {
        ...brand,
        featured: !brand.featured
      });

      console.log('✅ Featured status updated:', response);

      // Refresh brand data
      await fetchBrand();

      console.log('✅ Brand data refreshed');
    } catch (error) {
      console.error('❌ Failed to update featured status:', error);
    } finally {
      setTogglingFeatured(false);
    }
  };

  return (
    <Layout pageTitle="Brand Details">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                  <li className="breadcrumb-item"><Link href="/brand-list">Brands</Link></li>
                  <li className="breadcrumb-item active">Brand Details</li>
                </ol>
              </div>
              <h4 className="page-title">Brand Details</h4>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Brand Profile Card */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body text-center">
                <img 
                  src={getBrandLogo()} 
                  alt="Brand Logo" 
                  className="rounded-circle mb-3" 
                  width="120" 
                  height="120"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = placeholderImage;
                  }}
                />
                <h4 className="mb-1">{brand.name}</h4>
                <p className="text-muted mb-3">{brand.email}</p>
                
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <span className={`badge ${brand.status === 'active' ? 'bg-success' : brand.status === 'pending' ? 'bg-warning' : 'bg-secondary'} fs-12`}>
                    {brand.status}
                  </span>
                  {brand.verified && (
                    <span className="badge bg-success fs-12">
                      <i className="mdi mdi-check-circle me-1"></i>Verified
                    </span>
                  )}
                  {brand.featured && (
                    <span className="badge bg-warning fs-12">
                      <i className="mdi mdi-star me-1"></i>Featured
                    </span>
                  )}
                </div>

                <div className="row text-center">
                  <div className="col-6">
                    <h5 className="mb-1">{brand.productCount || 0}</h5>
                    <p className="text-muted mb-0">Products</p>
                  </div>
                  <div className="col-6">
                    <h5 className="mb-1">{brand.rating?.toFixed(1) || '0.0'}</h5>
                    <p className="text-muted mb-0">Rating</p>
                  </div>
                </div>

                <style jsx>{`
                  .btn-featured {
                    font-weight: 500;
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    transition: all 0.2s ease;
                    border-width: 2px;
                  }
                  .btn-featured:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  }
                  .btn-featured:disabled {
                    transform: none;
                    box-shadow: none;
                    opacity: 0.7;
                  }
                  .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    align-items: stretch;
                  }
                  .featured-badge {
                    background: linear-gradient(135deg, #ffc107, #ffb300);
                    color: #212529;
                    font-weight: 600;
                  }
                `}</style>

                <div className="mt-3 action-buttons">
                  <Link href={`/brand-edit?id=${brand._id || brand.id}`} className="btn btn-primary btn-featured w-100">
                    <i className="bx bx-edit me-1"></i>Edit Brand
                  </Link>
                  
                  <button
                    className={`btn btn-featured w-100 ${brand.featured ? 'btn-warning text-white' : 'btn-outline-warning'}`}
                    onClick={handleToggleFeatured}
                    disabled={togglingFeatured}
                  >
                    {togglingFeatured ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className={`mdi ${brand.featured ? 'mdi-star' : 'mdi-star-outline'} me-1`}></i>
                        {brand.featured ? 'Remove from Featured' : 'Add to Featured'}
                      </>
                    )}
                  </button>
                  
                  <button 
                    className="btn btn-outline-danger btn-featured w-100"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this brand?')) {
                        brandsApi.delete(brand._id || brand.id).then(() => {
                          window.location.href = '/brand-list';
                        });
                      }
                    }}
                  >
                    <i className="bx bx-trash me-1"></i>Delete Brand
                  </button>
                  
                  <Link href="/brand-list" className="btn btn-outline-secondary btn-featured w-100">
                    <i className="mdi mdi-arrow-left me-1"></i>Back to List
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Contact Information</h5>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <p className="mb-0">{brand.phone || '-'}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Website</label>
                  <p className="mb-0">
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noopener noreferrer">
                        {brand.website}
                      </a>
                    ) : '-'}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Address</label>
                  <p className="mb-0">{brand.address || '-'}</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {brand.socialMedia && (Object.values(brand.socialMedia).some((v: any) => v)) && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Social Media</h5>
                  <div className="d-flex gap-2">
                    {brand.socialMedia.facebook && (
                      <a href={brand.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                        <i className="bx bxl-facebook"></i>
                      </a>
                    )}
                    {brand.socialMedia.twitter && (
                      <a href={brand.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm">
                        <i className="bx bxl-twitter"></i>
                      </a>
                    )}
                    {brand.socialMedia.instagram && (
                      <a href={brand.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger btn-sm">
                        <i className="bx bxl-instagram"></i>
                      </a>
                    )}
                    {brand.socialMedia.linkedin && (
                      <a href={brand.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                        <i className="bx bxl-linkedin"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="col-lg-8">
            {/* Business Information */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Business Information</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Business Type</label>
                    <p className="mb-0">{brand.businessInfo?.businessType || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tax ID</label>
                    <p className="mb-0">{brand.businessInfo?.taxId || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">License Number</label>
                    <p className="mb-0">{brand.businessInfo?.licenseNumber || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Established Year</label>
                    <p className="mb-0">{brand.businessInfo?.establishedYear || '-'}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Commission Rate</label>
                    <p className="mb-0">
                      <span className="badge bg-info">{brand.commission || 10}%</span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Total Sales</label>
                    <p className="mb-0">
                      <strong>${(brand.totalSales || 0).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <p className="mb-0">{brand.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="row">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bx bx-package fs-24 text-primary mb-2"></i>
                    <h4 className="mb-1">{brand.productCount || 0}</h4>
                    <p className="text-muted mb-0">Total Products</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bx bx-dollar-circle fs-24 text-success mb-2"></i>
                    <h4 className="mb-1">${(brand.totalSales || 0).toLocaleString()}</h4>
                    <p className="text-muted mb-0">Total Sales</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card">
                  <div className="card-body text-center">
                    <i className="bx bx-star fs-24 text-warning mb-2"></i>
                    <h4 className="mb-1">{brand.reviewCount || 0}</h4>
                    <p className="text-muted mb-0">Reviews</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Recent Products</h5>
                  <Link href="/product-grid" className="btn btn-sm btn-outline-primary">View All</Link>
                </div>
                <div className="table-responsive">
                  {loadingProducts ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary"></div>
                      <p className="mt-2">Loading products...</p>
                    </div>
                  ) : brandProducts.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="mdi mdi-package-variant-closed" style={{ fontSize: '48px', color: '#ccc' }}></i>
                      <p className="text-muted mt-2">No products yet from this brand</p>
                      <Link href="/product-add" className="btn btn-sm btn-primary">
                        <i className="mdi mdi-plus me-1"></i>Add Product
                      </Link>
                    </div>
                  ) : (
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandProducts.slice(0, 5).map((product) => (
                          <tr key={product._id || product.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {product.images && product.images[0] && (
                                  <img 
                                    src={
                                      product.images[0].startsWith('http') 
                                        ? product.images[0] 
                                        : product.images[0].startsWith('/uploads/')
                                        ? `${API_URL}${product.images[0]}`
                                        : placeholderImage
                                    }
                                    alt={product.name}
                                    className="rounded me-2"
                                    width="40"
                                    height="40"
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = placeholderImage;
                                    }}
                                  />
                                )}
                                <span>{product.name}</span>
                              </div>
                            </td>
                            <td>${product.price?.toFixed(2) || '0.00'}</td>
                            <td>
                              <span className={`badge ${product.stock > 20 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
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
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Recent Orders</h5>
                  <Link href="/orders-list" className="btn btn-sm btn-outline-primary">View All</Link>
                </div>
                <div className="table-responsive">
                  <div className="text-center py-4">
                    <i className="mdi mdi-cart-outline" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    <p className="text-muted mt-2">No orders data available for this brand yet</p>
                    <small className="text-muted">Orders will appear here when customers purchase products from this brand</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
