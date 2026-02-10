'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';
import { useBrands } from '@/hooks/useApi';
import { getProductImageUrl } from '@/utils/imageHelper';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';

export default function ProductEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();
  
  // TanStack Query hooks
  const { data: brands = [], isLoading: loadingBrands } = useBrands();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Product form data
  const [formData, setFormData] = useState({
    productName: '',
    productSku: '',
    category: '',
    brand: '',
    style: '',
    price: '',
    originalPrice: '',
    discount: '',
    inventory: '',
    productImages: '',
    description: '',
    features: '',
    status: 'active',
  });

  // SEO data
  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  // Stats
  const [stats, setStats] = useState({
    views: 0,
    createdAt: '',
    updatedAt: '',
  });

  // Sales tracking
  const [salesCount, setSalesCount] = useState(0);
  const [isEditingSales, setIsEditingSales] = useState(false);
  const [tempSalesCount, setTempSalesCount] = useState(0);

  // Reviews management
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [showAddReview, setShowAddReview] = useState(false);

  // Image management
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoriesApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(productId!);
      const product = response.data;
      
      setFormData({
        productName: product.name || '',
        productSku: product.sku || '',
        category: product.category || '',
        brand: product.brand || '',
        style: product.style || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        discount: product.discount?.toString() || '',
        inventory: product.stock?.toString() || '',
        productImages: product.images?.join(', ') || '',
        description: product.description || '',
        features: product.features?.join('\n') || '',
        status: product.status || 'active',
      });

      setSalesCount(product.salesCount || 0);
      setStats({
        views: product.views || 0,
        createdAt: product.createdAt || '',
        updatedAt: product.updatedAt || '',
      });

      // Load reviews if any
      if (product.reviews && Array.isArray(product.reviews)) {
        setReviews(product.reviews);
      }

      // Load existing images
      if (product.images && Array.isArray(product.images)) {
        setExistingImages(product.images);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      alert('Failed to load product');
      router.push('/product-list');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  // Sales tracking handlers
  const handleStartEditSales = () => {
    setTempSalesCount(salesCount);
    setIsEditingSales(true);
  };

  const handleSaveSales = () => {
    if (tempSalesCount >= 0) {
      setSalesCount(tempSalesCount);
      setIsEditingSales(false);
    }
  };

  const handleCancelEditSales = () => {
    setTempSalesCount(salesCount);
    setIsEditingSales(false);
  };

  const handleIncrementSales = () => {
    setSalesCount(prev => prev + 1);
  };

  const handleDecrementSales = () => {
    if (salesCount > 0) {
      setSalesCount(prev => prev - 1);
    }
  };

  // Review handlers
  const handleAddReview = () => {
    if (newReview.name && newReview.comment) {
      const review = {
        id: Date.now(),
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
        verified: false
      };
      setReviews([...reviews, review]);
      setNewReview({ name: '', rating: 5, comment: '' });
      setShowAddReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const confirmed = await showConfirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      setReviews(reviews.filter(review => review.id !== reviewId));
    }
  };

  // Image handlers
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImageFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      console.log('🗑️ Deleting product:', productId);
      const response = await productsApi.delete(productId!);
      console.log('✅ Product deleted:', response);
      router.push('/product-list');
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      if (error.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImages: string[] = [...existingImages];

      // Upload new images if any
      if (newImageFiles.length > 0) {
        console.log('📤 Uploading', newImageFiles.length, 'new images...');
        
        const uploadFormData = new FormData();
        newImageFiles.forEach(file => {
          uploadFormData.append('images', file);
        });

        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images');
        }

        const uploadResult = await uploadResponse.json();
        const newImageUrls = uploadResult.data.urls;
        console.log('✅ New images uploaded:', newImageUrls);
        
        // Combine existing and new images
        finalImages = [...existingImages, ...newImageUrls];
      }

      const featuresArray = formData.features.split('\n').filter(f => f.trim());
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      const productData = {
        name: formData.productName,
        sku: formData.productSku,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        category: formData.category,
        brand: formData.brand || undefined,
        stock: parseInt(formData.inventory),
        status: formData.status,
        style: formData.style,
        features: featuresArray,
        images: finalImages,
        rating: avgRating,
        reviewCount: reviews.length,
        reviews: reviews,
        salesCount: salesCount,
        seo: seoData,
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 UPDATE PRODUCT REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Product ID:', productId);
      console.log('Product Data:', productData);
      
      const response = await productsApi.update(productId!, productData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ UPDATE PRODUCT SUCCESS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Response:', response);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/product-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ UPDATE PRODUCT FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (error.status === 401) {
        console.warn('🔐 Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Edit Product">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading product...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Edit Product">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/product-list">Products</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Edit Product</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Edit Product Form */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Product Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Product Images - First Thing */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Product Images</label>
                      <div className="border rounded p-3 bg-light">
                        
                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">Current Images:</small>
                            <div className="row g-2">
                              {existingImages.map((imageUrl, index) => {
                                const placeholderImage = '/assets/images/products/product-1.png';
                                const fullImageUrl = getProductImageUrl([imageUrl], 0, placeholderImage);
                                
                                return (
                                  <div key={`existing-${index}`} className="col-md-3 col-sm-4 col-6">
                                    <div className="position-relative">
                                      <img
                                        src={fullImageUrl}
                                        alt={`Product ${index + 1}`}
                                        className="img-fluid rounded border"
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                        onClick={() => handleRemoveExistingImage(index)}
                                        title="Remove image"
                                      >
                                        <i className="bx bx-x"></i>
                                      </button>
                                      {index === 0 && (
                                        <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                                          Main Image
                                        </span>
                                      )}
                                      <span className="badge bg-success position-absolute bottom-0 end-0 m-1">
                                        Existing
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* New Images */}
                        {newImagePreviews.length > 0 && (
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">New Images to Upload:</small>
                            <div className="row g-2">
                              {newImagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="col-md-3 col-sm-4 col-6">
                                  <div className="position-relative">
                                    <img
                                      src={preview}
                                      alt={`New ${index + 1}`}
                                      className="img-fluid rounded border"
                                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                      onClick={() => handleRemoveNewImage(index)}
                                      title="Remove new image"
                                    >
                                      <i className="bx bx-x"></i>
                                    </button>
                                    <span className="badge bg-warning position-absolute bottom-0 end-0 m-1">
                                      New
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upload New Images */}
                        <div>
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            multiple
                            onChange={handleNewImageChange}
                          />
                          <small className="text-muted d-block mt-2">
                            <i className="bx bx-info-circle me-1"></i>
                            Add more images or replace existing ones. First image will be the main product image.
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <hr className="my-2" />
                      <h6 className="text-muted">Product Information</h6>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="productName" className="form-label">Product Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="productName" 
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        id="category" 
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={loadingCategories}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id || cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brand" className="form-label">Brand</label>
                      <select 
                        className="form-select" 
                        id="brand" 
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand: any) => (
                          <option key={brand._id || brand.id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Select the brand/seller for this product</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="style" className="form-label">Style</label>
                      <select 
                        className="form-select" 
                        id="style" 
                        name="style"
                        value={formData.style}
                        onChange={handleChange}
                      >
                        <option value="">Select Style (Optional)</option>
                        <option value="western">Western</option>
                        <option value="desi">Desi</option>
                        <option value="eastern">Eastern</option>
                        <option value="asian">Asian</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="price" className="form-label">Price <span className="text-danger">*</span></label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="price" 
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01" 
                        required 
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="originalPrice" className="form-label">Original Price</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="originalPrice" 
                        name="originalPrice"
                        value={formData.originalPrice}
                        onChange={handleChange}
                        step="0.01" 
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="discount" className="form-label">Discount (%)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="discount" 
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0" 
                        max="100" 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="productSku" className="form-label">SKU</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="productSku" 
                        name="productSku"
                        value={formData.productSku}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        id="status" 
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="inventory" className="form-label">Inventory Quantity</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="inventory" 
                        name="inventory"
                        value={formData.inventory}
                        onChange={handleChange}
                        min="0" 
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        id="description" 
                        name="description"
                        rows={4} 
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="features" className="form-label">Key Features (one per line)</label>
                      <textarea 
                        className="form-control" 
                        id="features" 
                        name="features"
                        rows={6} 
                        value={formData.features}
                        onChange={handleChange}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      ></textarea>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i>Update Product
                        </>
                      )}
                    </button>
                    <Link href="/product-list" className="btn btn-outline-secondary">
                      <i className="bx bx-x me-1"></i>Cancel
                    </Link>
                    <button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
                      <i className="bx bx-trash me-1"></i>Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            {/* Product Stats */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Product Stats</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6">
                    <h4 className="text-primary mb-1">{stats.views}</h4>
                    <p className="text-muted mb-0">Views</p>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      {isEditingSales ? (
                        <div className="mb-2">
                          <div className="input-group input-group-sm justify-content-center">
                            <button 
                              className="btn btn-outline-danger"
                              onClick={handleDecrementSales}
                              disabled={tempSalesCount <= 0}
                            >
                              <i className="bx bx-minus"></i>
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={tempSalesCount}
                              onChange={(e) => setTempSalesCount(Number(e.target.value))}
                              min="0"
                              style={{ maxWidth: '80px' }}
                            />
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => setTempSalesCount(prev => prev + 1)}
                            >
                              <i className="bx bx-plus"></i>
                            </button>
                          </div>
                          <div className="d-flex gap-1 justify-content-center mt-2">
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={handleSaveSales}
                            >
                              <i className="bx bx-check"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleCancelEditSales}
                            >
                              <i className="bx bx-x"></i>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-success mb-1">{salesCount}</h4>
                          <div className="d-flex gap-1 justify-content-center">
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={handleIncrementSales}
                              title="Add Sale"
                            >
                              <i className="bx bx-plus"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={handleDecrementSales}
                              disabled={salesCount <= 0}
                              title="Remove Sale"
                            >
                              <i className="bx bx-minus"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={handleStartEditSales}
                              title="Edit Sales Count"
                            >
                              <i className="bx bx-edit"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-muted mb-0">Sales</p>
                  </div>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Created:</small>
                  <small>{stats.createdAt ? new Date(stats.createdAt).toLocaleDateString() : 'N/A'}</small>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Updated:</small>
                  <small>{stats.updatedAt ? new Date(stats.updatedAt).toLocaleDateString() : 'N/A'}</small>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Rating:</small>
                  <small>
                    {reviews.length > 0 
                      ? `${(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}/5 (${reviews.length} reviews)` 
                      : 'No reviews'}
                  </small>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">SEO Settings</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="metaTitle" className="form-label">Meta Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="metaTitle" 
                    name="metaTitle"
                    placeholder="SEO title" 
                    value={seoData.metaTitle}
                    onChange={handleSeoChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="metaDescription" className="form-label">Meta Description</label>
                  <textarea 
                    className="form-control" 
                    id="metaDescription" 
                    name="metaDescription"
                    rows={3} 
                    placeholder="SEO description"
                    value={seoData.metaDescription}
                    onChange={handleSeoChange}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="metaKeywords" className="form-label">Meta Keywords</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="metaKeywords" 
                    name="metaKeywords"
                    placeholder="keyword1, keyword2" 
                    value={seoData.metaKeywords}
                    onChange={handleSeoChange}
                  />
                </div>
              </div>
            </div>

            {/* Manual Review Management */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Manual Reviews</h5>
                <button 
                  type="button"
                  className="btn btn-sm btn-primary text-nowrap"
                  onClick={() => setShowAddReview(!showAddReview)}
                  style={{ minWidth: '130px' }}
                >
                  <i className="bx bx-plus me-1"></i>Add Review
                </button>
              </div>
              <div className="card-body">
                {showAddReview && (
                  <div className="mb-3 p-3 border rounded">
                    <h6>Add New Review</h6>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Customer Name"
                          value={newReview.name}
                          onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6 mb-2">
                        <select
                          className="form-select form-select-sm"
                          value={newReview.rating}
                          onChange={(e) => setNewReview({...newReview, rating: Number(e.target.value)})}
                        >
                          <option value={1}>1 Star</option>
                          <option value={2}>2 Stars</option>
                          <option value={3}>3 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={5}>5 Stars</option>
                        </select>
                      </div>
                      <div className="col-12 mb-2">
                        <textarea
                          className="form-control form-control-sm"
                          rows={2}
                          placeholder="Review Comment"
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        />
                      </div>
                      <div className="col-12">
                        <button 
                          type="button"
                          className="btn btn-sm btn-success me-2"
                          onClick={handleAddReview}
                        >
                          <i className="bx bx-check me-1"></i>Add
                        </button>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowAddReview(false)}
                        >
                          <i className="bx bx-x me-1"></i>Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <p className="text-muted text-center">No reviews added yet</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <strong className="me-2">{review.name}</strong>
                              <div className="rating me-2">
                                {[...Array(5)].map((_, i) => (
                                  <i key={i} className={`bx ${i < review.rating ? 'bxs-star text-warning' : 'bx-star text-muted'}`}></i>
                                ))}
                              </div>
                              {review.verified && <span className="badge bg-success badge-sm">Verified</span>}
                            </div>
                            <p className="mb-1 small">{review.comment}</p>
                            <small className="text-muted">{review.date}</small>
                          </div>
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteReview(review.id)}
                            title="Delete Review"
                          >
                            <i className="bx bx-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
