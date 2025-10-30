'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateCategory } from '@/hooks/useApi';

export default function CategoryAdd() {
  console.log('🎨 Category Add Page Loaded');
  
  const router = useRouter();
  const createCategory = useCreateCategory();
  
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMITTED - handleSubmit called');
    e.preventDefault();

    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        console.log('📤 UPLOADING IMAGE...');
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, {
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
        imageUrl = uploadResult.data.url;
        console.log('✅ IMAGE UPLOADED:', imageUrl);
      }

      const categoryData = {
        name: formData.categoryName,
        description: formData.categoryDescription || undefined,
        status: formData.categoryStatus as 'active' | 'inactive',
        productCount: 0,
        slug: formData.categorySlug,
        parentId: formData.parentCategory || undefined,
        image: imageUrl || undefined,
        seo: seoData,
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 CREATING CATEGORY WITH TANSTACK QUERY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Category Data:', categoryData);

      await createCategory.mutateAsync(categoryData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ CATEGORY CREATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/category-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ CREATE CATEGORY FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
  };

  return (
    <Layout pageTitle="Add Category">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/category-list">Categories</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Add Category</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Add Category Form */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Category Information</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Category Image Upload */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Category Image</label>
                      <div className="border rounded p-3 bg-light">
                        <input 
                          type="file" 
                          className="form-control mb-3" 
                          accept="image/*" 
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <small className="text-muted d-block mb-2">Preview:</small>
                            <div className="position-relative d-inline-block">
                              <img 
                                src={imagePreview} 
                                alt="Category Preview" 
                                className="img-fluid rounded border" 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                                onClick={removeImage}
                                title="Remove image"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                            </div>
                          </div>
                        )}
                        <small className="text-muted d-block mt-2">
                          <i className="bx bx-info-circle me-1"></i>
                          Upload a category image (optional). Recommended size: 400x400px
                        </small>
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
                        placeholder="Enter category name" 
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
                        placeholder="category-slug" 
                        value={formData.categorySlug}
                        onChange={handleChange}
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
                        placeholder="Enter category description"
                        value={formData.categoryDescription}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={createCategory.isPending}>
                      {createCategory.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i>Create Category
                        </>
                      )}
                    </button>
                    <Link href="/category-list" className="btn btn-outline-secondary">
                      <i className="bx bx-x me-1"></i>Cancel
                    </Link>
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
