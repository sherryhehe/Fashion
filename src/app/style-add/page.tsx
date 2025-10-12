'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateStyle } from '@/hooks/useApi';

export default function StyleAdd() {
  console.log('🎨 Style Add Page Loaded');
  
  const router = useRouter();
  const createStyle = useCreateStyle();
  
  const [formData, setFormData] = useState({
    styleName: '',
    styleType: '',
    styleSlug: '',
    styleStatus: 'active',
    styleDescription: '',
    featured: false,
    popular: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMITTED - handleSubmit called');
    e.preventDefault();

    try {
      let imageUrl = '';
      let iconUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        console.log('📤 UPLOADING IMAGE...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', imageFile);
        
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
        imageUrl = uploadResult.data.urls[0];
        console.log('✅ IMAGE UPLOADED:', imageUrl);
      }

      // Upload icon if provided
      if (iconFile) {
        console.log('📤 UPLOADING ICON...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', iconFile);
        
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload icon');
        }
        
        const uploadResult = await uploadResponse.json();
        iconUrl = uploadResult.data.urls[0];
        console.log('✅ ICON UPLOADED:', iconUrl);
      }

      const styleData = {
        name: formData.styleName,
        type: formData.styleType as any,
        slug: formData.styleSlug,
        description: formData.styleDescription || undefined,
        status: formData.styleStatus as 'active' | 'inactive',
        image: imageUrl || undefined,
        icon: iconUrl || undefined,
        featured: formData.featured,
        popular: formData.popular,
        productCount: 0,
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 CREATING STYLE WITH TANSTACK QUERY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Style Data:', styleData);

      await createStyle.mutateAsync(styleData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ STYLE CREATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/styles-list');
    } catch (error) {
      console.error('❌ STYLE CREATION FAILED:', error);
    }
  };
  return (
    <Layout pageTitle="Add Style">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/styles-list">Styles</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Add Style</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Add Style Form */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Add New Style</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Style Images */}
                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Style Image</label>
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
                                alt="Style Preview" 
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
                          Upload a style image (optional). Recommended size: 400x400px
                        </small>
                      </div>
                    </div>

                    <div className="col-12 mb-4">
                      <label className="form-label fw-bold">Style Icon</label>
                      <div className="border rounded p-3 bg-light">
                        <input 
                          type="file" 
                          className="form-control mb-3" 
                          accept="image/*" 
                          onChange={handleIconChange}
                        />
                        {iconPreview && (
                          <div className="mt-2">
                            <small className="text-muted d-block mb-2">Icon Preview:</small>
                            <div className="position-relative d-inline-block">
                              <img 
                                src={iconPreview} 
                                alt="Icon Preview" 
                                className="img-fluid rounded border" 
                                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                                onClick={removeIcon}
                                title="Remove icon"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                            </div>
                          </div>
                        )}
                        <small className="text-muted d-block mt-2">
                          <i className="bx bx-info-circle me-1"></i>
                          Upload a style icon (optional). Recommended size: 64x64px
                        </small>
                      </div>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <hr className="my-2" />
                      <h6 className="text-muted">Style Information</h6>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleName" className="form-label">Style Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="styleName" 
                        name="styleName"
                        placeholder="Enter style name" 
                        value={formData.styleName}
                        onChange={handleChange}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleType" className="form-label">Style Type <span className="text-danger">*</span></label>
                      <select 
                        className="form-select" 
                        id="styleType" 
                        name="styleType"
                        value={formData.styleType}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="western">Western</option>
                        <option value="desi">Desi</option>
                        <option value="eastern">Eastern</option>
                        <option value="asian">Asian</option>
                        <option value="traditional">Traditional</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleSlug" className="form-label">Style Slug</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="styleSlug" 
                        name="styleSlug"
                        placeholder="style-slug" 
                        value={formData.styleSlug}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleStatus" className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        id="styleStatus" 
                        name="styleStatus"
                        value={formData.styleStatus}
                        onChange={handleChange}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="styleDescription" className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        id="styleDescription" 
                        name="styleDescription"
                        rows={4} 
                        placeholder="Enter style description"
                        value={formData.styleDescription}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="featured" 
                          name="featured"
                          checked={formData.featured}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="featured">
                          Featured Style
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="popular" 
                          name="popular"
                          checked={formData.popular}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="popular">
                          Popular Style
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={createStyle.isPending}>
                      {createStyle.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i>Create Style
                        </>
                      )}
                    </button>
                    <Link href="/styles-list" className="btn btn-outline-secondary">
                      <i className="bx bx-x me-1"></i>Cancel
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Style Guidelines</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Use clear, descriptive names
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Choose appropriate style type
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Upload high-quality images
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Write detailed descriptions
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Mark featured styles carefully
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
