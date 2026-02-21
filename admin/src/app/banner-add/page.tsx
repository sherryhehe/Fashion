'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateBanner } from '@/hooks/useApi';
import { getApiUrl } from '@/utils/apiHelper';

export default function BannerAdd() {
  const router = useRouter();
  const createBanner = useCreateBanner();
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    position: 'homepage' as 'header' | 'sidebar' | 'footer' | 'homepage',
    status: 'active' as 'active' | 'inactive' | 'draft',
    startDate: '',
    endDate: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Invalid file type. Please select an image file.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

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
      // Validate required fields
      if (!formData.title) {
        alert('Title is required');
        return;
      }

      if (!imageFile) {
        alert('Banner image is required');
        return;
      }

      let imageUrl = '';
      
      // Upload image
      if (imageFile) {
        console.log('📤 UPLOADING IMAGE...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', imageFile);
        
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${getApiUrl()}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.data.urls[0];
        console.log('✅ IMAGE UPLOADED:', imageUrl);
      }

      const bannerData: any = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        imageUrl: imageUrl,
        position: formData.position,
        status: formData.status,
        clicks: 0,
        ctr: 0,
      };

      // Add dates if provided
      if (formData.startDate) {
        bannerData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        bannerData.endDate = new Date(formData.endDate);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 CREATING BANNER WITH TANSTACK QUERY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Banner Data:', bannerData);

      await createBanner.mutateAsync(bannerData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ BANNER CREATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/banner-control');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ BANNER CREATION FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (error.message?.includes('401') || error.status === 401) {
        console.warn('🔐 Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        alert(error.message || 'Failed to create banner. Please try again.');
      }
    }
  };

  return (
    <Layout pageTitle="Add Banner">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                  <li className="breadcrumb-item"><Link href="/banner-control">Banners</Link></li>
                  <li className="breadcrumb-item active">Add Banner</li>
                </ol>
              </div>
              <h4 className="page-title">Add Banner</h4>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Banner Image */}
                  <h5 className="mb-3 text-uppercase bg-light p-2">
                    <i className="bx bx-image me-1"></i> Banner Image
                  </h5>

                  <div className="mb-3">
                    <label htmlFor="bannerImageUpload" className="form-label">Banner Image <span className="text-danger">*</span></label>
                    <div className="border rounded p-3" style={{ borderStyle: 'dashed' }}>
                      {imagePreview ? (
                        <div className="text-center">
                          <img 
                            src={imagePreview} 
                            alt="Banner preview" 
                            className="img-fluid mb-3 rounded"
                            style={{ maxHeight: '300px', maxWidth: '100%' }}
                          />
                          <div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={removeImage}
                            >
                              <i className="bx bx-trash me-1"></i>Remove Image
                            </button>
                            <label htmlFor="bannerImageUpload" className="btn btn-sm btn-outline-primary">
                              <i className="bx bx-edit me-1"></i>Change Image
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <i className="bx bx-cloud-upload text-muted" style={{ fontSize: '3rem' }}></i>
                          <p className="text-muted mt-2">Click to upload banner image</p>
                          <label htmlFor="bannerImageUpload" className="btn btn-outline-primary">
                            <i className="bx bx-plus me-1"></i>Upload Image
                          </label>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="form-control d-none" 
                        id="bannerImageUpload" 
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!imagePreview}
                      />
                    </div>
                    <small className="text-muted">Recommended: JPG, PNG, or WebP. Max size: 5MB</small>
                  </div>

                  {/* Basic Information */}
                  <h5 className="mb-3 mt-4 text-uppercase bg-light p-2">
                    <i className="bx bx-info-circle me-1"></i> Basic Information
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="title" className="form-label">Title <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter banner title"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="subtitle" className="form-label">Subtitle</label>
                      <input
                        type="text"
                        className="form-control"
                        id="subtitle"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        placeholder="Enter banner subtitle (optional)"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="position" className="form-label">Position <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                      >
                        <option value="homepage">Homepage</option>
                        <option value="header">Header</option>
                        <option value="sidebar">Sidebar</option>
                        <option value="footer">Footer</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="status" className="form-label">Status <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Schedule (Optional) */}
                  <h5 className="mb-3 mt-4 text-uppercase bg-light p-2">
                    <i className="bx bx-calendar me-1"></i> Schedule (Optional)
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="startDate" className="form-label">Start Date</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                      <small className="text-muted">When the banner should start showing</small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="endDate" className="form-label">End Date</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                      <small className="text-muted">When the banner should stop showing</small>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="d-flex gap-2 mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={createBanner.isPending}
                    >
                      {createBanner.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i> Create Banner
                        </>
                      )}
                    </button>
                    <Link href="/banner-control" className="btn btn-secondary">
                      <i className="bx bx-x me-1"></i> Cancel
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

