'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCategories, useBrands, useCreateProduct } from '@/hooks/useApi';

export default function ProductAdd() {
  console.log('🎨 Product Add Page Loaded');
  
  const router = useRouter();
  
  // TanStack Query hooks
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: brands = [], isLoading: loadingBrands } = useBrands();
  const createProduct = useCreateProduct();
  
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
    stock: '',
    description: '',
    features: '',
    tags: '',
    status: 'active',
  });

  // Specifications as array of key-value pairs
  const [specifications, setSpecifications] = useState<Array<{key: string, value: string}>>([]);
  const [newSpec, setNewSpec] = useState({key: '', value: ''});

  // Variations as array of objects
  const [variations, setVariations] = useState<Array<{
    id: number;
    size?: string;
    color?: string;
    price?: number;
    stock?: number;
  }>>([]);
  const [newVariation, setNewVariation] = useState({
    size: '',
    color: '',
    price: '',
    stock: '',
  });

  // Image upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // SEO data
  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  // Sales tracking
  const [salesCount, setSalesCount] = useState(0);
  const [isEditingSales, setIsEditingSales] = useState(false);
  const [tempSalesCount, setTempSalesCount] = useState(0);

  // Reviews management
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [showAddReview, setShowAddReview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    console.log('📸 Images selected:', files.length);

    // Add new files
    setImageFiles(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    console.log('🗑️ Removing image at index:', index);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

  const handleDeleteReview = (reviewId: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(review => review.id !== reviewId));
    }
  };

  // Specification handlers
  const handleAddSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setSpecifications([...specifications, { ...newSpec }]);
      setNewSpec({ key: '', value: '' });
    }
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Variation handlers
  const handleAddVariation = () => {
    if (newVariation.size || newVariation.color) {
      const variation = {
        id: Date.now(),
        size: newVariation.size || undefined,
        color: newVariation.color || undefined,
        price: newVariation.price ? parseFloat(newVariation.price) : undefined,
        stock: newVariation.stock ? parseInt(newVariation.stock) : undefined,
      };
      setVariations([...variations, variation]);
      setNewVariation({ size: '', color: '', price: '', stock: '' });
    }
  };

  const handleRemoveVariation = (id: number) => {
    setVariations(variations.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMITTED - handleSubmit called');
    e.preventDefault();

    try {
      let imageUrls: string[] = [];

      // Upload images first if any
      if (imageFiles.length > 0) {
        console.log('📤 Uploading', imageFiles.length, 'images...');
        
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });

        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images');
        }

        const uploadResult = await uploadResponse.json();
        imageUrls = uploadResult.data.urls;
        console.log('✅ Images uploaded:', imageUrls);
      }

      // Convert specifications array to object
      const specificationsObj: Record<string, string> = {};
      specifications.forEach(spec => {
        specificationsObj[spec.key] = spec.value;
      });

      // Clean up variations
      const variationsArray = variations.map(({ id, ...rest }) => rest);

      const featuresArray = formData.features.split('\n').filter(f => f.trim());
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

      const productData = {
        name: formData.productName,
        sku: formData.productSku,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        category: formData.category,
        brand: formData.brand || undefined,
        stock: parseInt(formData.stock),
        status: formData.status,
        featured: false,
        images: imageUrls,
        specifications: specificationsObj,
        variations: variationsArray,
        features: featuresArray,
        tags: tagsArray,
        rating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
        reviewCount: reviews.length,
        salesCount: salesCount,
        style: formData.style,
        reviews: reviews,
        seo: seoData,
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 CREATING PRODUCT WITH TANSTACK QUERY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Product Data:', productData);
      console.log('Reviews:', reviews);
      console.log('Sales Count:', salesCount);

      await createProduct.mutateAsync(productData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ PRODUCT CREATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/product-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ CREATE PRODUCT FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  };

  return (
    <Layout pageTitle="Add Product">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/product-list">Products</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Add Product</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0">Add New Product</h4>
                  <Link href="/product-list" className="btn btn-outline-secondary">
                    <i className="bx bx-arrow-back me-1"></i>Back to Products
                  </Link>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Product Images - First Thing User Will Do */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Product Images <span className="text-danger">*</span></label>
                      <div className="border rounded p-3 bg-light">
                        <input
                          type="file"
                          className="form-control mb-3"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                        
                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                          <div className="row g-2 mt-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="col-md-3 col-sm-4 col-6">
                                <div className="position-relative">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="img-fluid rounded border"
                                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                    onClick={() => removeImage(index)}
                                    title="Remove image"
                                  >
                                    <i className="bx bx-x"></i>
                                  </button>
                                  {index === 0 && (
                                    <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                                      Main Image
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <small className="text-muted d-block mt-2">
                          <i className="bx bx-info-circle me-1"></i>
                          You can select multiple images. First image will be the main product image.
                        </small>
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
                        placeholder="Enter product name" 
                        value={formData.productName}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="productSku" className="form-label">SKU <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="productSku" 
                        name="productSku"
                        placeholder="Enter product SKU" 
                        value={formData.productSku}
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
                        <option value="">{loadingCategories ? 'Loading...' : 'Select Category'}</option>
                        {categories.map((cat: any) => (
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
                        {brands.map((brand) => (
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
                        placeholder="0.00" 
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
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
                        placeholder="0.00" 
                        step="0.01"
                        min="0"
                        value={formData.originalPrice}
                        onChange={handleChange}
                      />
                      <small className="text-muted">For showing discounts</small>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="discount" className="form-label">Discount %</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="discount" 
                        name="discount"
                        placeholder="0" 
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="stock" className="form-label">Stock Quantity <span className="text-danger">*</span></label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="stock" 
                        name="stock"
                        placeholder="0" 
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        required 
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
                    <div className="col-12 mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        id="description" 
                        name="description"
                        rows={4} 
                        placeholder="Enter product description"
                        value={formData.description}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label htmlFor="features" className="form-label">Product Features</label>
                      <textarea 
                        className="form-control" 
                        id="features" 
                        name="features"
                        rows={4} 
                        placeholder="Enter each feature on a new line&#10;Example:&#10;Premium quality fabric&#10;Machine washable&#10;Available in multiple sizes"
                        value={formData.features}
                        onChange={handleChange}
                      ></textarea>
                      <small className="text-muted">One feature per line</small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="tags" className="form-label">Tags</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="tags" 
                        name="tags"
                        placeholder="summer, fashion, trending" 
                        value={formData.tags}
                        onChange={handleChange}
                      />
                      <small className="text-muted">Separate tags with commas</small>
                    </div>

                    {/* Specifications - User Friendly */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Product Specifications</label>
                      <div className="border rounded p-3">
                        {/* Add New Specification */}
                        <div className="row g-2 mb-2">
                          <div className="col-md-5">
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="Attribute (e.g., Material)"
                              value={newSpec.key}
                              onChange={(e) => setNewSpec({...newSpec, key: e.target.value})}
                            />
                          </div>
                          <div className="col-md-5">
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="Value (e.g., Cotton)"
                              value={newSpec.value}
                              onChange={(e) => setNewSpec({...newSpec, value: e.target.value})}
                            />
                          </div>
                          <div className="col-md-2">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-primary w-100"
                              onClick={handleAddSpecification}
                            >
                              <i className="bx bx-plus"></i> Add
                            </button>
                          </div>
                        </div>

                        {/* Specifications List */}
                        {specifications.length > 0 && (
                          <div className="mt-3">
                            <small className="text-muted d-block mb-2">Added Specifications:</small>
                            {specifications.map((spec, index) => (
                              <div key={index} className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-2">
                                <span><strong>{spec.key}:</strong> {spec.value}</span>
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRemoveSpecification(index)}
                                >
                                  <i className="bx bx-trash"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {specifications.length === 0 && (
                          <p className="text-muted text-center small mb-0">No specifications added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Variations - User Friendly */}
                    <div className="col-12 mb-3">
                      <label className="form-label">Product Variations</label>
                      <div className="border rounded p-3">
                        {/* Add New Variation */}
                        <div className="row g-2 mb-2">
                          <div className="col-md-3">
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="Size (e.g., S, M, L)"
                              value={newVariation.size}
                              onChange={(e) => setNewVariation({...newVariation, size: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3">
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              placeholder="Color (e.g., Red)"
                              value={newVariation.color}
                              onChange={(e) => setNewVariation({...newVariation, color: e.target.value})}
                            />
                          </div>
                          <div className="col-md-2">
                            <input 
                              type="number" 
                              className="form-control form-control-sm" 
                              placeholder="Price"
                              step="0.01"
                              value={newVariation.price}
                              onChange={(e) => setNewVariation({...newVariation, price: e.target.value})}
                            />
                          </div>
                          <div className="col-md-2">
                            <input 
                              type="number" 
                              className="form-control form-control-sm" 
                              placeholder="Stock"
                              value={newVariation.stock}
                              onChange={(e) => setNewVariation({...newVariation, stock: e.target.value})}
                            />
                          </div>
                          <div className="col-md-2">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-primary w-100"
                              onClick={handleAddVariation}
                            >
                              <i className="bx bx-plus"></i> Add
                            </button>
                          </div>
                        </div>

                        {/* Variations List */}
                        {variations.length > 0 && (
                          <div className="mt-3">
                            <small className="text-muted d-block mb-2">Added Variations:</small>
                            <div className="table-responsive">
                              <table className="table table-sm table-bordered">
                                <thead className="table-light">
                                  <tr>
                                    <th>Size</th>
                                    <th>Color</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th width="50">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variations.map((variation) => (
                                    <tr key={variation.id}>
                                      <td>{variation.size || '-'}</td>
                                      <td>{variation.color || '-'}</td>
                                      <td>{variation.price ? `$${variation.price}` : '-'}</td>
                                      <td>{variation.stock || '-'}</td>
                                      <td>
                                        <button 
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleRemoveVariation(variation.id)}
                                        >
                                          <i className="bx bx-trash"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {variations.length === 0 && (
                          <p className="text-muted text-center small mb-0">No variations added yet</p>
                        )}
                      </div>
                      <small className="text-muted">Add different sizes, colors, or other variations with their own prices and stock levels</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={createProduct.isPending}>
                      {createProduct.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i>Save Product
                        </>
                      )}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => {
                      setFormData({
                        productName: '',
                        productSku: '',
                        category: '',
                        style: '',
                        price: '',
                        stock: '',
                        description: '',
                        isActive: true,
                      });
                    }}>
                      <i className="bx bx-reset me-1"></i>Reset Form
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            {/* Sales Tracking */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Sales Tracking</h5>
              </div>
              <div className="card-body">
                <div className="text-center">
                  {isEditingSales ? (
                    <div className="mb-3">
                      <div className="input-group input-group-sm justify-content-center mb-2">
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => setTempSalesCount(prev => Math.max(0, prev - 1))}
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
                      <div className="d-flex gap-1 justify-content-center">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={handleSaveSales}
                        >
                          <i className="bx bx-check me-1"></i>Save
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={handleCancelEditSales}
                        >
                          <i className="bx bx-x me-1"></i>Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-success mb-3">{salesCount}</h4>
                      <div className="d-flex gap-1 justify-content-center mb-2">
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
                  <p className="text-muted mb-0">Items Sold</p>
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
                    className="form-control form-control-sm" 
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
                    className="form-control form-control-sm" 
                    id="metaDescription" 
                    name="metaDescription"
                    rows={3} 
                    placeholder="SEO description"
                    value={seoData.metaDescription}
                    onChange={handleSeoChange}
                  ></textarea>
                </div>
                <div className="mb-0">
                  <label htmlFor="metaKeywords" className="form-label">Meta Keywords</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    id="metaKeywords" 
                    name="metaKeywords"
                    placeholder="keyword1, keyword2" 
                    value={seoData.metaKeywords}
                    onChange={handleSeoChange}
                  />
                  <small className="text-muted">Separate with commas</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
