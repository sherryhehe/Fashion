'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useProduct } from '@/hooks/useApi';
import { productsApi } from '@/lib/api';

export default function ProductDetails() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const { data: product, isLoading, error, refetch } = useProduct(productId);
  const [togglingFeatured, setTogglingFeatured] = useState(false);

  if (isLoading) {
    return (
      <Layout pageTitle="Product Details">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout pageTitle="Product Details">
        <div className="text-center py-5">
          <i className="mdi mdi-alert-circle-outline" style={{ fontSize: '64px', color: '#dc3545' }}></i>
          <h5 className="mt-3">Product Not Found</h5>
          <p className="text-muted">The product you're looking for doesn't exist.</p>
          <Link href="/product-list" className="btn btn-primary mt-2">
            <i className="mdi mdi-arrow-left me-1"></i>
            Back to Products
          </Link>
        </div>
      </Layout>
    );
  }

  // Get main image and thumbnail images - use uploaded images or placeholder
  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
  const placeholderImage = '/assets/images/products/product-1.png';
  
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return placeholderImage;
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else if (imagePath.startsWith('/uploads/')) {
      return `${API_URL}${imagePath}`;
    } else {
      return placeholderImage;
    }
  };
  
  const mainImage = Array.isArray(product.images) && product.images.length > 0 
    ? getImageUrl(product.images[0]) 
    : placeholderImage;

  // Toggle featured status
  const handleToggleFeatured = async () => {
    try {
      setTogglingFeatured(true);
      console.log('🌟 Toggling featured status for product:', productId);
      console.log('Current featured status:', product.featured);
      console.log('New featured status:', !product.featured);
      
      const response = await productsApi.update(productId!, {
        ...product,
        featured: !product.featured
      });
      
      console.log('✅ Featured status updated:', response);
      
      // Refetch product to get updated data
      await refetch();
      
      console.log('✅ Product data refreshed');
    } catch (error) {
      console.error('❌ Failed to update featured status:', error);
    } finally {
      setTogglingFeatured(false);
    }
  };

  return (
    <Layout pageTitle="Product Details">
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
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }
        .featured-badge {
          background: linear-gradient(135deg, #ffc107, #ffb300);
          color: #212529;
          font-weight: 600;
        }
      `}</style>
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/product-list">Products</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            {/* Product Images */}
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="product-img">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="img-fluid rounded"
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                        }}
                      />
                    </div>
                    
                    {/* Thumbnail Gallery */}
                    {Array.isArray(product.images) && product.images.length > 1 && (
                      <div className="row mt-2 g-2">
                        {product.images.slice(0, 4).map((img: string, idx: number) => (
                          <div key={idx} className="col-3">
                            <img
                              src={getImageUrl(img)}
                              alt={`${product.name} ${idx + 1}`}
                              className="img-fluid rounded border"
                              style={{ width: '100%', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = placeholderImage;
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <h3 className="mt-0">{product.name}</h3>
                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted mb-3">
                      <span><strong>SKU:</strong> {product.sku}</span>
                      <span className="text-muted">|</span>
                      <span><strong>Category:</strong> {product.category}</span>
                      {product.brand && (
                        <>
                          <span className="text-muted">|</span>
                          <span><strong>Brand:</strong> {product.brand}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-primary">${product.price?.toFixed(2)}</h4>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-muted">
                          <del>${product.originalPrice.toFixed(2)}</del>
                          <span className="badge bg-danger ms-2">{product.discount}% OFF</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-3">
                      <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'} me-2`}>
                        {product.status || 'inactive'}
                      </span>
                      {product.featured && (
                        <span className="badge featured-badge me-2">
                          <i className="mdi mdi-star me-1"></i>Featured
                        </span>
                      )}
                      {product.style && (
                        <span className="badge bg-info me-2">{product.style}</span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h6>Stock Availability</h6>
                      <div className="d-flex align-items-center">
                        <span className={`badge ${product.stock > 20 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'} me-2`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <span className="text-muted">{product.stock || 0} units available</span>
                      </div>
                    </div>

                    {product.rating > 0 && (
                      <div className="mt-3">
                        <h6>Customer Rating</h6>
                        <div className="d-flex align-items-center">
                          <div className="rating me-2">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bx ${i < Math.round(product.rating) ? 'bxs-star text-warning' : 'bx-star text-muted'} fs-18`}></i>
                            ))}
                          </div>
                          <span className="text-muted">
                            {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </div>
                    )}

                    {product.salesCount > 0 && (
                      <div className="mt-3">
                        <h6>Sales Performance</h6>
                        <p className="mb-0">
                          <i className="mdi mdi-chart-line text-success me-1"></i>
                          <strong>{product.salesCount}</strong> units sold
                        </p>
                      </div>
                    )}

                    <div className="action-buttons mt-4">
                      <Link href={`/product-edit?id=${product._id || product.id}`} className="btn btn-primary btn-featured">
                        <i className="mdi mdi-pencil me-1"></i>
                        Edit Product
                      </Link>
                      <button 
                        className={`btn btn-featured ${product.featured ? 'btn-warning text-white' : 'btn-outline-warning'}`}
                        onClick={handleToggleFeatured}
                        disabled={togglingFeatured}
                        style={{ minWidth: '200px' }}
                      >
                        {togglingFeatured ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <i className={`mdi ${product.featured ? 'mdi-star' : 'mdi-star-outline'} me-1`}></i>
                            {product.featured ? 'Remove from Featured' : 'Add to Featured'}
                          </>
                        )}
                      </button>
                      <Link href="/product-list" className="btn btn-outline-secondary btn-featured">
                        <i className="mdi mdi-arrow-left me-1"></i>
                        Back to List
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Product Description</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-0">{product.description || 'No description available.'}</p>
                  </div>
                </div>

            {/* Product Features */}
            {product.features && Array.isArray(product.features) && product.features.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Key Features</h5>
                </div>
                <div className="card-body">
                  <ul className="mb-0">
                    {product.features.map((feature: string, idx: number) => (
                      <li key={idx} className="mb-2">{feature}</li>
                    ))}
                  </ul>
                </div>
                </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Specifications</h5>
                </div>
              <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-borderless mb-0">
                          <tbody>
                        {Object.entries(product.specifications).map(([key, value]: [string, any], idx) => (
                          <tr key={idx}>
                            <th style={{ width: '30%' }} className="text-muted">{key}</th>
                                <td>{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
            )}

            {/* Tags */}
            {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Tags</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    {product.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="badge bg-light text-dark border">
                        <i className="mdi mdi-tag-outline me-1"></i>{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Variations */}
            {product.variations && Array.isArray(product.variations) && product.variations.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Product Variations</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Size</th>
                          <th>Color</th>
                          <th>Price</th>
                          <th>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variations.map((variation: any, idx: number) => (
                          <tr key={idx}>
                            <td>{variation.size || '-'}</td>
                            <td>{variation.color || '-'}</td>
                            <td>{variation.price ? `$${variation.price}` : '-'}</td>
                            <td>{variation.stock || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Reviews - Always Show */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Customer Reviews 
                  {product.reviews && Array.isArray(product.reviews) && ` (${product.reviews.length})`}
                </h5>
              </div>
              <div className="card-body">
                {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? (
                  product.reviews.map((review: any, idx: number) => (
                    <div key={review.id || idx} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <strong className="me-2">{review.name}</strong>
                            <div className="rating me-2">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`bx ${i < review.rating ? 'bxs-star text-warning' : 'bx-star text-muted'} fs-18`}></i>
                              ))}
                            </div>
                            {review.verified && (
                              <span className="badge bg-success badge-sm">Verified Purchase</span>
                            )}
                          </div>
                          <p className="mb-2">{review.comment}</p>
                          <small className="text-muted">
                            <i className="mdi mdi-calendar me-1"></i>
                            {new Date(review.date).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <i className="bx bx-message-rounded-dots display-4 text-muted"></i>
                    <p className="text-muted mt-2 mb-0">No customer reviews yet</p>
                    <small className="text-muted">Reviews added during product creation will appear here</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Product Info */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Product Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <p className="text-muted mb-1">Category</p>
                  <p className="mb-0 fw-semibold">{product.category || 'Uncategorized'}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted mb-1">Brand</p>
                  <p className="mb-0 fw-semibold">{product.brand || 'N/A'}</p>
                </div>
                <div className="mb-3">
                  <p className="text-muted mb-1">SKU</p>
                  <p className="mb-0 fw-semibold">{product.sku}</p>
                  </div>
                <div className="mb-3">
                  <p className="text-muted mb-1">Status</p>
                  <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {product.status || 'inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Pricing</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <p className="text-muted mb-1">Current Price</p>
                  <h4 className="mb-0 text-primary">${product.price?.toFixed(2)}</h4>
                </div>
                {product.originalPrice && (
                  <div className="mb-3">
                    <p className="text-muted mb-1">Original Price</p>
                    <p className="mb-0"><del>${product.originalPrice.toFixed(2)}</del></p>
                  </div>
                )}
                {product.discount > 0 && (
                  <div className="mb-3">
                    <p className="text-muted mb-1">Discount</p>
                    <span className="badge bg-danger">{product.discount}% OFF</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Timeline</h5>
              </div>
              <div className="card-body">
                {product.createdAt && (
                  <div className="mb-2">
                    <p className="text-muted mb-1">Created</p>
                    <p className="mb-0">{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
                {product.updatedAt && (
                  <div className="mb-2">
                    <p className="text-muted mb-1">Last Updated</p>
                    <p className="mb-0">{new Date(product.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
