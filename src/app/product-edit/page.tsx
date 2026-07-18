'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { productsApi, categoriesApi, stylesApi } from '@/lib/api';
import { useBrands } from '@/hooks/useApi';
import { getProductImageUrl } from '@/utils/imageHelper';

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const { data: brands = [], isLoading: loadingBrands } = useBrands();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);

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
    description: '',
    features: '',
    status: 'active',
    promoted: false,
    shippingFees: '',
    shippingTime: '',
    notes: '',
  });

  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  const [stats, setStats] = useState({ views: 0, createdAt: '', updatedAt: '' });
  const [salesCount, setSalesCount] = useState(0);
  const [isEditingSales, setIsEditingSales] = useState(false);
  const [tempSalesCount, setTempSalesCount] = useState(0);

  // Variations / size stock tracking
  // Each entry: { size: string, stock: number, outOfStock: boolean }
  const [variations, setVariations] = useState<{ size: string; stock: number; outOfStock: boolean }[]>([]);
  const [showSizeManager, setShowSizeManager] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [showAddReview, setShowAddReview] = useState(false);

  // Mass reviews
  const [showMassReview, setShowMassReview] = useState(false);
  const [massReview, setMassReview] = useState({ count: 10, name: 'Customer', rating: 5, comment: 'Great product!' });
  const [addingMassReviews, setAddingMassReviews] = useState(false);

  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchStyles();
    if (productId) fetchProduct();
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

  const fetchStyles = async () => {
    try {
      setLoadingStyles(true);
      const response = await stylesApi.getAll();
      setStyles(response.data || []);
    } catch (error) {
      console.error('Failed to fetch styles:', error);
    } finally {
      setLoadingStyles(false);
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
        originalPrice: (product as any).originalPrice?.toString() || '',
        discount: (product as any).discount?.toString() || '',
        inventory: (product as any).stock?.toString() || '',
        description: product.description || '',
        features: product.features?.join('\n') || '',
        status: product.status || 'active',
        promoted: (product as any).promoted || false,
        shippingFees: (product as any).shippingFees?.toString() || '',
        shippingTime: (product as any).shippingTime || '',
        notes: (product as any).notes || '',
      });

      setSalesCount((product as any).salesCount || 0);
      setStats({
        views: (product as any).views || 0,
        createdAt: (product as any).createdAt || '',
        updatedAt: (product as any).updatedAt || '',
      });

      if ((product as any).seo) setSeoData((product as any).seo);
      if ((product as any).reviews && Array.isArray((product as any).reviews)) {
        setReviews((product as any).reviews);
      }
      if ((product as any).images && Array.isArray((product as any).images)) {
        setExistingImages((product as any).images);
      }

      // Load size variations
      if ((product as any).variations && Array.isArray((product as any).variations) && (product as any).variations.length > 0) {
        const rawVars = (product as any).variations;
        // Build size-based variations (sizes only, no color for now)
        const sizeVars = rawVars
          .filter((v: any) => v.size)
          .map((v: any) => ({
            size: v.size,
            stock: typeof v.stock === 'number' ? v.stock : 0,
            outOfStock: v.outOfStock === true,
          }));
        if (sizeVars.length > 0) {
          setVariations(sizeVars);
          setShowSizeManager(true);
        }
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  // ─── Sales tracking ───────────────────────────────────────────────────────
  const handleSaveSales = () => {
    if (tempSalesCount >= 0) { setSalesCount(tempSalesCount); setIsEditingSales(false); }
  };

  // ─── Size / variations ────────────────────────────────────────────────────
  const initDefaultSizes = () => {
    setVariations(DEFAULT_SIZES.map(size => ({ size, stock: 0, outOfStock: false })));
    setShowSizeManager(true);
  };

  const addCustomSize = () => {
    const size = prompt('Enter size name (e.g. 32, 34, 38, One Size):');
    if (size && size.trim()) {
      setVariations(prev => [...prev, { size: size.trim(), stock: 0, outOfStock: false }]);
    }
  };

  const updateVariation = (index: number, field: 'stock' | 'outOfStock', value: number | boolean) => {
    setVariations(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const removeVariation = (index: number) => {
    setVariations(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Single review ────────────────────────────────────────────────────────
  const handleAddReview = () => {
    if (newReview.name && newReview.comment) {
      setReviews(prev => [...prev, {
        id: Date.now(),
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
        verified: false,
      }]);
      setNewReview({ name: '', rating: 5, comment: '' });
      setShowAddReview(false);
    }
  };

  const handleDeleteReview = (reviewId: number) => {
    if (confirm('Delete this review?')) setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // ─── Mass reviews ─────────────────────────────────────────────────────────
  const handleMassAddReviews = async () => {
    if (!productId) return;
    try {
      setAddingMassReviews(true);
      await productsApi.addBulkReviews(productId, {
        count: massReview.count,
        name: massReview.name,
        rating: massReview.rating,
        comment: massReview.comment,
      });
      setShowMassReview(false);
      // Reload to get the saved reviews
      await fetchProduct();
      alert(`Successfully added ${massReview.count} reviews!`);
    } catch (error: any) {
      alert(error?.message || 'Failed to add bulk reviews');
    } finally {
      setAddingMassReviews(false);
    }
  };

  // ─── Images ───────────────────────────────────────────────────────────────
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = (index: number) => setExistingImages(prev => prev.filter((_, i) => i !== index));
  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(productId!);
      router.push('/product-list');
    } catch (error: any) {
      if (error.status === 401) { localStorage.removeItem('token'); router.push('/login'); }
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImages: string[] = [...existingImages];

      if (newImageFiles.length > 0) {
        const uploadFormData = new FormData();
        newImageFiles.forEach(file => uploadFormData.append('images', file));
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadFormData,
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload images');
        const uploadResult = await uploadResponse.json();
        finalImages = [...existingImages, ...uploadResult.data.urls];
      }

      const featuresArray = formData.features.split('\n').filter(f => f.trim());
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Build variations payload (only if size manager is active)
      const variationsPayload = showSizeManager ? variations.map(v => ({
        size: v.size,
        stock: v.stock,
        outOfStock: v.outOfStock,
      })) : [];

      const productData: any = {
        name: formData.productName,
        sku: formData.productSku,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        category: formData.category,
        brand: formData.brand || undefined,
        stock: parseInt(formData.inventory) || 0,
        status: formData.status,
        shippingFees: formData.shippingFees ? parseFloat(formData.shippingFees) : 0,
        shippingTime: formData.shippingTime || undefined,
        notes: formData.notes || undefined,
        promoted: formData.promoted,
        style: formData.style,
        features: featuresArray,
        images: finalImages,
        rating: avgRating,
        reviewCount: reviews.length,
        reviews,
        salesCount,
        seo: seoData,
        variations: variationsPayload,
      };

      await productsApi.update(productId!, productData);
      router.push('/product-list');
    } catch (error: any) {
      if (error.status === 401) { localStorage.removeItem('token'); router.push('/login'); }
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
                <li className="breadcrumb-item active">Edit Product</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          {/* Left column — main form */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Product Information</h5>
                {/* Promoted toggle in header for quick access */}
                <div className="form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="promotedToggle"
                    name="promoted"
                    checked={formData.promoted}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="promotedToggle">
                    <i className="bx bxs-star text-warning me-1"></i>
                    Promoted {formData.promoted && <span className="badge bg-warning text-dark ms-1">ON</span>}
                  </label>
                  <div><small className="text-muted">Promoted products appear first in search, categories &amp; styles</small></div>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Product Images */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Product Images</label>
                      <div className="border rounded p-3 bg-light">
                        {existingImages.length > 0 && (
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">Current Images:</small>
                            <div className="row g-2">
                              {existingImages.map((imageUrl, index) => {
                                const placeholder = '/assets/images/products/product-1.png';
                                return (
                                  <div key={`existing-${index}`} className="col-md-3 col-sm-4 col-6">
                                    <div className="position-relative">
                                      <img
                                        src={getProductImageUrl([imageUrl], 0, placeholder)}
                                        alt={`Product ${index + 1}`}
                                        className="img-fluid rounded border"
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        onError={(e) => { (e.target as HTMLImageElement).src = placeholder; }}
                                      />
                                      <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" onClick={() => handleRemoveExistingImage(index)}>
                                        <i className="bx bx-x"></i>
                                      </button>
                                      {index === 0 && <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">Main</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {newImagePreviews.length > 0 && (
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">New Images to Upload:</small>
                            <div className="row g-2">
                              {newImagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="col-md-3 col-sm-4 col-6">
                                  <div className="position-relative">
                                    <img src={preview} alt={`New ${index + 1}`} className="img-fluid rounded border" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                                    <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" onClick={() => handleRemoveNewImage(index)}>
                                      <i className="bx bx-x"></i>
                                    </button>
                                    <span className="badge bg-warning position-absolute bottom-0 end-0 m-1">New</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <input type="file" className="form-control" accept="image/*" multiple onChange={handleNewImageChange} />
                        <small className="text-muted d-block mt-1">First image is the main product image.</small>
                      </div>
                    </div>

                    <div className="col-12 mb-3"><hr className="my-2" /><h6 className="text-muted">Product Details</h6></div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="productName" className="form-label">Product Name <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" id="productName" name="productName" value={formData.productName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="category" className="form-label">Category <span className="text-danger">*</span></label>
                      <select className="form-select" id="category" name="category" value={formData.category} onChange={handleChange} disabled={loadingCategories} required>
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brand" className="form-label">Brand</label>
                      <select className="form-select" id="brand" name="brand" value={formData.brand} onChange={handleChange}>
                        <option value="">Select Brand</option>
                        {brands.map((brand: any) => (
                          <option key={brand._id || brand.id} value={brand.name}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="style" className="form-label">Style</label>
                      <select className="form-select" id="style" name="style" value={formData.style} onChange={handleChange} disabled={loadingStyles}>
                        <option value="">Select Style (Optional)</option>
                        {styles.map((style: any) => (
                          <option key={style._id || style.id} value={style.name}>{style.name}</option>
                        ))}
                      </select>
                      {loadingStyles && <small className="text-muted">Loading styles...</small>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="price" className="form-label">Price <span className="text-danger">*</span></label>
                      <input type="number" className="form-control" id="price" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="originalPrice" className="form-label">Original Price</label>
                      <input type="number" className="form-control" id="originalPrice" name="originalPrice" value={formData.originalPrice} onChange={handleChange} step="0.01" />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label htmlFor="discount" className="form-label">Discount (%)</label>
                      <input type="number" className="form-control" id="discount" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="productSku" className="form-label">SKU</label>
                      <input type="text" className="form-control" id="productSku" name="productSku" value={formData.productSku} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select className="form-select" id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="inventory" className="form-label">Total Inventory Quantity</label>
                      <input type="number" className="form-control" id="inventory" name="inventory" value={formData.inventory} onChange={handleChange} min="0" />
                      <small className="text-muted">Overall stock count. Use Size Stock below for per-size breakdown. Set to 0 to mark out of stock.</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shippingFees" className="form-label">Shipping Cost</label>
                      <input type="number" className="form-control" id="shippingFees" name="shippingFees" placeholder="0" min="0" step="0.01" value={formData.shippingFees} onChange={handleChange} />
                      <small className="text-muted">Per-item shipping charged at checkout.</small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="shippingTime" className="form-label">Shipping Time</label>
                      <input type="text" className="form-control" id="shippingTime" name="shippingTime" placeholder="e.g. 3-5 business days" value={formData.shippingTime} onChange={handleChange} />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="notes" className="form-label">Note</label>
                      <textarea className="form-control" id="notes" name="notes" rows={2} placeholder="Optional note shown with this product / on the order" value={formData.notes} onChange={handleChange}></textarea>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea className="form-control" id="description" name="description" rows={4} value={formData.description} onChange={handleChange}></textarea>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="features" className="form-label">Key Features (one per line)</label>
                      <textarea className="form-control" id="features" name="features" rows={5} value={formData.features} onChange={handleChange} placeholder="Feature 1&#10;Feature 2&#10;Feature 3"></textarea>
                    </div>

                    {/* ─── Size / Stock Manager ──────────────────────────────── */}
                    <div className="col-12 mb-3">
                      <div className="card border">
                        <div className="card-header d-flex justify-content-between align-items-center py-2">
                          <h6 className="mb-0">
                            <i className="bx bx-grid me-1"></i>Size Stock Management
                          </h6>
                          <div className="d-flex gap-2">
                            {!showSizeManager ? (
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={initDefaultSizes}>
                                <i className="bx bx-plus me-1"></i>Add Size Tracking
                              </button>
                            ) : (
                              <>
                                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addCustomSize}>
                                  <i className="bx bx-plus me-1"></i>Add Size
                                </button>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => { setShowSizeManager(false); setVariations([]); }}>
                                  Remove All
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {showSizeManager && (
                          <div className="card-body p-2">
                            <small className="text-muted d-block mb-2">
                              Set per-size stock quantities. Mark "Out of Stock" to hide a size from customers even if stock &gt; 0.
                            </small>
                            <div className="table-responsive">
                              <table className="table table-sm table-bordered mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: '80px' }}>Size</th>
                                    <th>Stock Qty</th>
                                    <th style={{ width: '130px' }}>Out of Stock</th>
                                    <th style={{ width: '50px' }}></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variations.map((v, index) => (
                                    <tr key={index} className={v.outOfStock ? 'table-danger' : ''}>
                                      <td className="fw-bold align-middle">{v.size}</td>
                                      <td>
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          value={v.stock}
                                          min={0}
                                          onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                                          disabled={v.outOfStock}
                                          style={{ maxWidth: '100px' }}
                                        />
                                      </td>
                                      <td className="align-middle">
                                        <div className="form-check form-switch ms-2">
                                          <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={v.outOfStock}
                                            onChange={(e) => updateVariation(index, 'outOfStock', e.target.checked)}
                                          />
                                          <label className={`form-check-label small ${v.outOfStock ? 'text-danger fw-semibold' : 'text-muted'}`}>
                                            {v.outOfStock ? 'Out of Stock' : 'In Stock'}
                                          </label>
                                        </div>
                                      </td>
                                      <td className="align-middle">
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeVariation(index)}>
                                          <i className="bx bx-trash"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {variations.length === 0 && (
                                    <tr><td colSpan={4} className="text-center text-muted py-3">No sizes added. Click "Add Size" to add.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        {!showSizeManager && (
                          <div className="card-body py-2">
                            <small className="text-muted">No size tracking configured. Click "Add Size Tracking" to set per-size stock and mark sizes as out of stock.</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</> : <><i className="bx bx-save me-1"></i>Update Product</>}
                    </button>
                    <Link href="/product-list" className="btn btn-outline-secondary"><i className="bx bx-x me-1"></i>Cancel</Link>
                    <button type="button" className="btn btn-outline-danger" onClick={handleDelete}><i className="bx bx-trash me-1"></i>Delete</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right column — stats, SEO, reviews */}
          <div className="col-lg-4">
            {/* Product Stats */}
            <div className="card">
              <div className="card-header"><h5 className="card-title mb-0">Product Stats</h5></div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6">
                    <h4 className="text-primary mb-1">{stats.views}</h4>
                    <p className="text-muted mb-0">Views</p>
                  </div>
                  <div className="col-6">
                    {isEditingSales ? (
                      <div>
                        <div className="input-group input-group-sm justify-content-center mb-2">
                          <button className="btn btn-outline-danger" onClick={() => setTempSalesCount(p => Math.max(0, p - 1))} disabled={tempSalesCount <= 0}><i className="bx bx-minus"></i></button>
                          <input type="number" className="form-control text-center" value={tempSalesCount} onChange={(e) => setTempSalesCount(Number(e.target.value))} min="0" style={{ maxWidth: '80px' }} />
                          <button className="btn btn-outline-success" onClick={() => setTempSalesCount(p => p + 1)}><i className="bx bx-plus"></i></button>
                        </div>
                        <div className="d-flex gap-1 justify-content-center">
                          <button className="btn btn-sm btn-success" onClick={handleSaveSales}><i className="bx bx-check"></i></button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditingSales(false)}><i className="bx bx-x"></i></button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-success mb-1">{salesCount}</h4>
                        <div className="d-flex gap-1 justify-content-center">
                          <button className="btn btn-sm btn-outline-success" onClick={() => setSalesCount(p => p + 1)}><i className="bx bx-plus"></i></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => setSalesCount(p => Math.max(0, p - 1))} disabled={salesCount <= 0}><i className="bx bx-minus"></i></button>
                          <button className="btn btn-sm btn-outline-primary" onClick={() => { setTempSalesCount(salesCount); setIsEditingSales(true); }}><i className="bx bx-edit"></i></button>
                        </div>
                      </div>
                    )}
                    <p className="text-muted mb-0">Sales</p>
                  </div>
                </div>
                <hr />
                <div className="d-flex justify-content-between"><small className="text-muted">Created:</small><small>{stats.createdAt ? new Date(stats.createdAt).toLocaleDateString() : 'N/A'}</small></div>
                <div className="d-flex justify-content-between"><small className="text-muted">Updated:</small><small>{stats.updatedAt ? new Date(stats.updatedAt).toLocaleDateString() : 'N/A'}</small></div>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Rating:</small>
                  <small>{reviews.length > 0 ? `${(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}/5 (${reviews.length})` : 'No reviews'}</small>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="card mt-3">
              <div className="card-header"><h5 className="card-title mb-0">SEO Settings</h5></div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Meta Title</label>
                  <input type="text" className="form-control" name="metaTitle" placeholder="SEO title" value={seoData.metaTitle} onChange={handleSeoChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Meta Description</label>
                  <textarea className="form-control" name="metaDescription" rows={3} placeholder="SEO description" value={seoData.metaDescription} onChange={handleSeoChange}></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Meta Keywords</label>
                  <input type="text" className="form-control" name="metaKeywords" placeholder="keyword1, keyword2" value={seoData.metaKeywords} onChange={handleSeoChange} />
                </div>
              </div>
            </div>

            {/* Manual Reviews */}
            <div className="card mt-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Reviews</h5>
                <div className="d-flex gap-1">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setShowAddReview(!showAddReview)}>
                    <i className="bx bx-plus me-1"></i>Add One
                  </button>
                  <button type="button" className="btn btn-sm btn-warning" onClick={() => setShowMassReview(true)}>
                    <i className="bx bx-list-plus me-1"></i>Mass Add
                  </button>
                </div>
              </div>
              <div className="card-body">
                {/* Single review form */}
                {showAddReview && (
                  <div className="mb-3 p-3 border rounded bg-light">
                    <h6 className="mb-2">Add Single Review</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <input type="text" className="form-control form-control-sm" placeholder="Customer Name" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <select className="form-select form-select-sm" value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
                          {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <textarea className="form-control form-control-sm" rows={2} placeholder="Review Comment" value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} />
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-success" onClick={handleAddReview}><i className="bx bx-check me-1"></i>Add</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAddReview(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                <div className="reviews-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {reviews.length === 0 ? (
                    <p className="text-muted text-center py-3">No reviews yet</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <strong className="me-2">{review.name}</strong>
                              <div className="me-2">
                                {[...Array(5)].map((_, i) => (
                                  <i key={i} className={`bx ${i < review.rating ? 'bxs-star text-warning' : 'bx-star text-muted'}`}></i>
                                ))}
                              </div>
                              {review.verified && <span className="badge bg-success badge-sm">Verified</span>}
                            </div>
                            <p className="mb-1 small">{review.comment}</p>
                            <small className="text-muted">{review.date}</small>
                          </div>
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteReview(review.id)}>
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

      {/* Mass Add Reviews Modal */}
      {showMassReview && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bx bx-list-plus me-2"></i>Mass Add Reviews</h5>
                <button type="button" className="btn-close" onClick={() => setShowMassReview(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info mb-3">
                  <i className="bx bx-info-circle me-2"></i>
                  This will save reviews <strong>directly to the database</strong> via the API. Reviews will persist even if you don't click "Update Product".
                </div>
                <div className="mb-3">
                  <label className="form-label">Number of Reviews <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={massReview.count}
                    min={1}
                    max={5000}
                    onChange={(e) => setMassReview({ ...massReview, count: parseInt(e.target.value) || 1 })}
                  />
                  <small className="text-muted">Max 5000 per request.</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Reviewer Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={massReview.name}
                    onChange={(e) => setMassReview({ ...massReview, name: e.target.value })}
                    placeholder="Customer"
                  />
                  <small className="text-muted">Will be suffixed with a number: "Customer 1", "Customer 2"...</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <select
                    className="form-select"
                    value={massReview.rating}
                    onChange={(e) => setMassReview({ ...massReview, rating: Number(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Review Comment</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={massReview.comment}
                    onChange={(e) => setMassReview({ ...massReview, comment: e.target.value })}
                    placeholder="Great product!"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMassReview(false)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleMassAddReviews}
                  disabled={addingMassReviews || !massReview.count}
                >
                  {addingMassReviews
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Adding...</>
                    : <><i className="bx bx-list-plus me-1"></i>Add {massReview.count} Reviews</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
