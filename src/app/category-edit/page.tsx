'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/api';
import { getCategoryImageUrl } from '@/utils/imageHelper';

export default function CategoryEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    categoryName: '',
    categorySlug: '',
    parentCategory: '',
    categoryStatus: 'active',
    categoryDescription: '',
  });

  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  const [stats, setStats] = useState({
    productCount: 0,
    subcategories: 0,
    createdAt: '',
    updatedAt: '',
  });

  const [existingImage, setExistingImage] = useState<string>('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getById(categoryId!);
      const category = response.data;
      
      setFormData({
        categoryName: category.name || '',
        categorySlug: category.slug || '',
        parentCategory: category.parentId || '',
        categoryStatus: category.status || 'active',
        categoryDescription: category.description || '',
      });

      if (category.seo) {
        setSeoData(category.seo);
      }

      if (category.image) {
        setExistingImage(category.image);
      }

      setStats({
        productCount: category.productCount || 0,
        subcategories: category.subcategories || 0,
        createdAt: category.createdAt || '',
        updatedAt: category.updatedAt || '',
      });
    } catch (error) {
      console.error('Failed to fetch category:', error);
      alert('Failed to load category');
      router.push('/category-list');
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

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveExistingImage = () => {
    setExistingImage('');
  };

  const handleRemoveNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview('');
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        console.log('🗑️ Deleting category:', categoryId);
        const response = await categoriesApi.delete(categoryId!);
        console.log('✅ Category deleted:', response);
        router.push('/category-list');
      } catch (error: any) {
        console.error('❌ Delete failed:', error);
        if (error.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImage = existingImage;
      
      // Upload new image if provided
      if (newImageFile) {
        console.log('📤 UPLOADING NEW IMAGE...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', newImageFile);
        
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadResult = await uploadResponse.json();
        finalImage = uploadResult.data.urls[0];
        console.log('✅ NEW IMAGE UPLOADED:', finalImage);
      }

      const categoryData = {
        name: formData.categoryName,
        description: formData.categoryDescription || undefined,
        status: formData.categoryStatus as 'active' | 'inactive',
        slug: formData.categorySlug,
        parentId: formData.parentCategory || undefined,
        image: finalImage || undefined,
        seo: seoData,
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 UPDATE CATEGORY REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Category ID:', categoryId);
      console.log('Category Data:', categoryData);
      
      const response = await categoriesApi.update(categoryId!, categoryData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ UPDATE CATEGORY SUCCESS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Response:', response);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/category-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ UPDATE CATEGORY FAILED');
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
      <Layout pageTitle="Edit Category">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading category...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Edit Category">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/category-list">Categories</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Edit Category</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Edit Category Form */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Category Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Category Image Management */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Category Image</label>
                      <div className="border rounded p-3 bg-light">
                        {existingImage && (
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">Current Image:</small>
                            <div className="position-relative d-inline-block">
                              <img 
                                src={getCategoryImageUrl(existingImage, '/assets/images/products/product-1.png')}
                                alt="Current Category" 
                                className="img-fluid rounded border" 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                                }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                                onClick={handleRemoveExistingImage}
                                title="Remove current image"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                              <span className="badge bg-success position-absolute bottom-0 start-0 m-1">Current</span>
                            </div>
                          </div>
                        )}
                        
                        {newImagePreview && (
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">New Image to Upload:</small>
                            <div className="position-relative d-inline-block">
                              <img 
                                src={newImagePreview} 
                                alt="New Category Preview" 
                                className="img-fluid rounded border" 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                                onClick={handleRemoveNewImage}
                                title="Remove new image"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                              <span className="badge bg-warning position-absolute bottom-0 end-0 m-1">New</span>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <input 
                            type="file" 
                            className="form-control" 
                            accept="image/*" 
                            onChange={handleNewImageChange}
                          />
                          <small className="text-muted d-block mt-2">
                            <i className="bx bx-info-circle me-1"></i>
                            Add a new image or replace the existing one. Recommended size: 400x400px
                          </small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <hr className="my-2" />
                      <h6 className="text-muted">Category Information</h6>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="categoryName" className="form-label">Category Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="categoryName" 
                        name="categoryName"
                        value={formData.categoryName}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="categorySlug" className="form-label">Category Slug</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="categorySlug" 
                        name="categorySlug"
                        value={formData.categorySlug}
                        onChange={handleChange}
                        placeholder="category-slug" 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="parentCategory" className="form-label">Parent Category</label>
                      <select 
                        className="form-select" 
                        id="parentCategory" 
                        name="parentCategory"
                        value={formData.parentCategory}
                        onChange={handleChange}
                      >
                        <option value="">Select parent category</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="books">Books</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="categoryStatus" className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        id="categoryStatus" 
                        name="categoryStatus"
                        value={formData.categoryStatus}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="categoryDescription" className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        id="categoryDescription" 
                        name="categoryDescription"
                        rows={4} 
                        value={formData.categoryDescription}
                        onChange={handleChange}
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
                          <i className="bx bx-save me-1"></i>Update Category
                        </>
                      )}
                    </button>
                    <Link href="/category-list" className="btn btn-outline-secondary">
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

            {/* Category Stats */}
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Category Stats</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-6">
                    <h4 className="text-primary mb-1">{stats.productCount}</h4>
                    <p className="text-muted mb-0">Products</p>
                  </div>
                  <div className="col-6">
                    <h4 className="text-success mb-1">{stats.subcategories}</h4>
                    <p className="text-muted mb-0">Subcategories</p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
