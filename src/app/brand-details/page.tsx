'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { brandsApi, productsApi } from '@/lib/api';
import { getBrandLogoUrl, getBrandBannerUrl, getImageUrl } from '@/utils/imageHelper';

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

  // Log brand data changes (especially banner)
  useEffect(() => {
    if (brand) {
      console.log('📦 Brand state updated:', {
        id: brand._id || brand.id,
        name: brand.name,
        banner: brand.banner,
        logo: brand.logo
      });
    }
  }, [brand]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await brandsApi.getById(brandId!);
      console.log('📥 Fetched brand data:', response.data);
      console.log('🖼️ Banner in response:', response.data?.banner);
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
      const products = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      console.log('📦 Brand products found:', products.length || 0);
      
      setBrandProducts(products);
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

  const placeholderImage = '/assets/images/products/product-1.png';
  
  const getBrandLogo = () => {
    return getBrandLogoUrl(brand.logo, placeholderImage);
  };

  const getBrandBanner = () => {
    if (!brand || !brand.banner || brand.banner === 'null') {
      console.log('🔍 No banner found in brand data:', brand?.banner);
      return null;
    }
    const bannerUrl = getBrandBannerUrl(brand.banner);
    console.log('✅ Banner URL:', bannerUrl);
    return bannerUrl;
  };

  const brandBanner = getBrandBanner();
  console.log('🖼️ Brand Banner:', brandBanner);
  console.log('📦 Full Brand Data:', brand);

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
      </div>

      {/* Redesigned Brand Header Section */}
      <div className="container-fluid mb-4">
        <div className="row">
          <div className="col-12 p-0">
            {/* Hero Banner Section */}
            <div 
              className="position-relative overflow-hidden rounded-4 shadow-lg"
              style={{ 
                minHeight: '450px',
                background: brandBanner 
                  ? `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%), url(${brandBanner})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Decorative Overlay */}
              <div 
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                }}
              ></div>

              {/* Content Container */}
              <div className="container-fluid">
                <div className="row align-items-center justify-content-center" style={{ minHeight: '450px' }}>
                  <div className="col-lg-6 col-md-8 text-center position-relative" style={{ zIndex: 2 }}>
                    {/* Logo Section */}
                    <div className="mb-4">
                      <div 
                        className="d-inline-block position-relative"
                        style={{
                          padding: '8px',
                          background: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '24px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <img 
                          src={getBrandLogo()} 
                          alt="Brand Logo" 
                          className="rounded-circle" 
                          width="160" 
                          height="160"
                          style={{ 
                            objectFit: 'cover',
                            display: 'block',
                            border: '4px solid white',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderImage;
                          }}
                        />
                        {/* Verified Badge Overlay */}
                        {brand.verified && (
                          <div 
                            className="position-absolute bottom-0 end-0"
                            style={{
                              background: '#10b981',
                              borderRadius: '50%',
                              width: '48px',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '4px solid white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                          >
                            <i className="mdi mdi-check text-white fs-5"></i>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Brand Info */}
                    <div className="text-white">
                      <h1 className="display-5 fw-bold mb-3 text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                        {brand.name}
                      </h1>
                      <p className="fs-5 mb-4 text-white-50" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                        <i className="mdi mdi-email-outline me-2"></i>
                        {brand.email}
                      </p>
                      
                      {/* Status Badges */}
                      <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                        <span 
                          className={`badge fs-6 px-3 py-2 ${
                            brand.status === 'active' ? 'bg-success' : 
                            brand.status === 'pending' ? 'bg-warning text-dark' : 
                            'bg-secondary'
                          }`}
                          style={{ borderRadius: '12px' }}
                        >
                          <i className={`mdi ${
                            brand.status === 'active' ? 'mdi-check-circle' :
                            brand.status === 'pending' ? 'mdi-clock-outline' :
                            'mdi-cancel'
                          } me-1`}></i>
                          {brand.status?.toUpperCase() || 'INACTIVE'}
                        </span>
                        {brand.verified && (
                          <span 
                            className="badge bg-success fs-6 px-3 py-2"
                            style={{ borderRadius: '12px' }}
                          >
                            <i className="mdi mdi-check-circle me-1"></i>
                            Verified
                          </span>
                        )}
                        {brand.featured && (
                          <span 
                            className="badge bg-warning text-dark fs-6 px-3 py-2"
                            style={{ borderRadius: '12px' }}
                          >
                            <i className="mdi mdi-star me-1"></i>
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Gradient Fade */}
              <div 
                className="position-absolute bottom-0 start-0 w-100"
                style={{
                  height: '120px',
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3))',
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">

        <div className="row">
          {/* Brand Profile Card */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <div className="row text-center mb-3">
                  <div className="col-6">
                    <h5 className="mb-1">{brand.productCount || 0}</h5>
                    <p className="text-muted mb-0">Products</p>
                  </div>
                  <div className="col-6">
                    <h5 className="mb-1">{brand.rating?.toFixed(1) || '0.0'}</h5>
                    <p className="text-muted mb-0">Rating</p>
                  </div>
                </div>

                <style dangerouslySetInnerHTML={{__html: `
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
                `}} />

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

          </div>

          {/* Main Content */}
          <div className="col-lg-8">
            {/* Brand Description */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Description</h5>
                <p className="mb-0">{brand.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* Brand Stats */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Brand Statistics</h5>
                <div className="row">
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
                                    src={getImageUrl(product.images[0], placeholderImage)}
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
