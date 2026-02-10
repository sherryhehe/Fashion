'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { categoriesApi, productsApi } from '@/lib/api';
import { getCategoryImageUrl, getProductImageUrl } from '@/utils/imageHelper';
import { formatCurrency } from '@/utils/currencyHelper';

export default function CategoryDetails() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');

  const [category, setCategory] = useState<any>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // Fetch products after category is loaded
  useEffect(() => {
    if (category?.name) {
      fetchCategoryProducts();
    }
  }, [category?.name]);

  // Fetch parent category if exists
  useEffect(() => {
    if (category?.parentId) {
      fetchParentCategory();
    }
  }, [category?.parentId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getById(categoryId!);
      setCategory(response.data);
    } catch (error: any) {
      console.error('Failed to fetch category:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productsApi.getAll({ category: category?.name, limit: 10 });
      setCategoryProducts(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch category products:', error);
      setCategoryProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchParentCategory = async () => {
    try {
      const response = await categoriesApi.getById(category.parentId);
      setParentCategory(response.data);
    } catch (error: any) {
      console.error('Failed to fetch parent category:', error);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Category Details">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading category details...</p>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout pageTitle="Category Details">
        <div className="text-center py-5">
          <i className="mdi mdi-alert-circle-outline" style={{ fontSize: '64px', color: '#dc3545' }}></i>
          <h5 className="mt-3">Category Not Found</h5>
          <p className="text-muted">The category you're looking for doesn't exist.</p>
          <Link href="/category-list" className="btn btn-primary mt-2">
            <i className="mdi mdi-arrow-left me-1"></i>
            Back to Categories
          </Link>
        </div>
      </Layout>
    );
  }

  const categoryImage = getCategoryImageUrl(category.image);

  return (
    <Layout pageTitle={`Category: ${category.name}`}>
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/category-list">Categories</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{category.name}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            {/* Category Image and Info */}
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="category-img">
                      <img
                        src={categoryImage}
                        alt={category.name}
                        className="img-fluid rounded"
                        style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-8">
                    <h3 className="mt-0">{category.name}</h3>
                    
                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted mb-3">
                      <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {category.status || 'inactive'}
                      </span>
                      {category.slug && (
                        <>
                          <span className="text-muted">|</span>
                          <span><strong>Slug:</strong> {category.slug}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-3">
                      <h6>Product Count</h6>
                      <p className="mb-0">
                        <span className="badge bg-primary fs-16">
                          {category.productCount || 0} Products
                        </span>
                      </p>
                    </div>

                    {parentCategory && (
                      <div className="mt-3">
                        <h6>Parent Category</h6>
                        <Link href={`/category-details?id=${parentCategory._id || parentCategory.id}`} className="text-decoration-none">
                          <span className="badge bg-info">
                            {parentCategory.name}
                          </span>
                        </Link>
                      </div>
                    )}

                    <div className="action-buttons mt-4">
                      <Link href={`/category-edit?id=${category._id || category.id}`} className="btn btn-primary">
                        <i className="mdi mdi-pencil me-1"></i>
                        Edit Category
                      </Link>
                      <Link href="/category-list" className="btn btn-outline-secondary">
                        <i className="mdi mdi-arrow-left me-1"></i>
                        Back to List
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Description */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Description</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-0">{category.description || 'No description available.'}</p>
              </div>
            </div>

            {/* SEO Information */}
            {category.seo && Object.keys(category.seo).length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="mdi mdi-search-web me-1"></i>
                    SEO Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-borderless mb-0">
                      <tbody>
                        {category.seo.metaTitle && (
                          <tr>
                            <th style={{ width: '30%' }} className="text-muted">Meta Title</th>
                            <td>{category.seo.metaTitle}</td>
                          </tr>
                        )}
                        {category.seo.metaDescription && (
                          <tr>
                            <th className="text-muted">Meta Description</th>
                            <td>{category.seo.metaDescription}</td>
                          </tr>
                        )}
                        {category.seo.metaKeywords && (
                          <tr>
                            <th className="text-muted">Meta Keywords</th>
                            <td>{category.seo.metaKeywords}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Category Products */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Products in this Category</h5>
                <Link href={`/product-list?category=${encodeURIComponent(category.name)}`} className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {loadingProducts ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                    <p className="text-muted mt-2 small">Loading products...</p>
                  </div>
                ) : categoryProducts.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="mdi mdi-package-variant-closed" style={{ fontSize: '48px', color: '#ccc' }}></i>
                    <p className="text-muted mt-2">No products in this category yet</p>
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
                        {categoryProducts.map((product: any) => (
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
            {/* Category Stats */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Category Statistics</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Total Products</span>
                  <span className="badge bg-primary fs-16">{category.productCount || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Status</span>
                  <span className={`badge ${category.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {category.status || 'inactive'}
                  </span>
                </div>
                {category.createdAt && (
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Created</span>
                    <small>{new Date(category.createdAt).toLocaleDateString()}</small>
                  </div>
                )}
                {category.updatedAt && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">Last Updated</span>
                    <small>{new Date(category.updatedAt).toLocaleDateString()}</small>
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
                <Link href={`/category-edit?id=${category._id || category.id}`} className="btn btn-primary w-100 mb-2">
                  <i className="mdi mdi-pencil me-1"></i>
                  Edit Category
                </Link>
                <Link href={`/product-add?category=${encodeURIComponent(category.name)}`} className="btn btn-success w-100 mb-2">
                  <i className="mdi mdi-plus me-1"></i>
                  Add Product to Category
                </Link>
                <Link href="/category-list" className="btn btn-outline-secondary w-100">
                  <i className="mdi mdi-arrow-left me-1"></i>
                  Back to Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

