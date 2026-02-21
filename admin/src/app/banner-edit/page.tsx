'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { bannersApi, type Banner } from '@/lib/api/banners';
import { useUpdateBanner } from '@/hooks/useApi';
import { getImageUrl } from '@/utils/imageHelper';
import { getApiUrl } from '@/utils/apiHelper';

export default function BannerEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerId = searchParams.get('id');
  const updateBanner = useUpdateBanner();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    position: 'homepage' as 'header' | 'sidebar' | 'footer' | 'homepage',
    status: 'active' as 'active' | 'inactive' | 'draft',
    startDate: '',
    endDate: '',
  });

  const [existingImage, setExistingImage] = useState<string>('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');

  useEffect(() => {
    if (bannerId) {
      fetchBanner();
    } else {
      router.push('/banner-control');
    }
  }, [bannerId]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const response = await bannersApi.get(bannerId!);
      const bannerData = response.data;

      setFormData({
        title: bannerData.title || '',
        subtitle: bannerData.subtitle || '',
        position: bannerData.position || 'homepage',
        status: bannerData.status || 'active',
        startDate: bannerData.startDate ? new Date(bannerData.startDate).toISOString().slice(0, 16) : '',
        endDate: bannerData.endDate ? new Date(bannerData.endDate).toISOString().slice(0, 16) : '',
      });

      if (bannerData.imageUrl) {
        setExistingImage(bannerData.imageUrl);
      }
    } catch (error: any) {
      console.error('Failed to fetch banner:', error);
      alert('Failed to load banner');
      router.push('/banner-control');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setNewImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.title) {
        alert('Title is required');
        return;
      }

      let finalImageUrl = existingImage;
      
      // Upload new image if provided
      if (newImageFile) {
        console.log('📤 UPLOADING NEW IMAGE...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', newImageFile);
        
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
        finalImageUrl = uploadResult.data.urls[0];
        console.log('✅ NEW IMAGE UPLOADED:', finalImageUrl);
      }

      if (!finalImageUrl) {
        alert('Banner image is required');
        return;
      }

      const bannerData: any = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        imageUrl: finalImageUrl,
        position: formData.position,
        status: formData.status,
      };

      // Add dates if provided
      if (formData.startDate) {
        bannerData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        bannerData.endDate = new Date(formData.endDate);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 UPDATING BANNER');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Banner Data:', bannerData);

      await updateBanner.mutateAsync({ id: bannerId!, data: bannerData });
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ BANNER UPDATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/banner-control');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ BANNER UPDATE FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (error.message?.includes('401') || error.status === 401) {
        console.warn('🔐 Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        alert(error.message || 'Failed to update banner. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Edit Banner">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Edit Banner">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                  <li className="breadcrumb-item"><Link href="/banner-control">Banners</Link></li>
                  <li className="breadcrumb-item active">Edit Banner</li>
                </ol>
              </div>
              <h4 className="page-title">Edit Banner</h4>
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
                      {newImagePreview ? (
                        <div className="text-center">
                          <p className="text-muted mb-2"><small>New Image Preview:</small></p>
                          <img 
                            src={newImagePreview} 
                            alt="New banner preview" 
                            className="img-fluid mb-3 rounded"
                            style={{ maxHeight: '300px', maxWidth: '100%' }}
                          />
                          <div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={handleRemoveNewImage}
                            >
                              <i className="bx bx-trash me-1"></i>Remove New Image
                            </button>
                            <label htmlFor="bannerImageUpload" className="btn btn-sm btn-outline-primary">
                              <i className="bx bx-edit me-1"></i>Change Image
                            </label>
                          </div>
                        </div>
                      ) : existingImage ? (
                        <div className="text-center">
                          <p className="text-muted mb-2"><small>Current Image:</small></p>
                          <img 
                            src={getImageUrl(existingImage, '/assets/images/products/product-1.png')} 
                            alt="Current banner" 
                            className="img-fluid mb-3 rounded"
                            style={{ maxHeight: '300px', maxWidth: '100%' }}
                          />
                          <div>
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
                        onChange={handleNewImageChange}
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
                      disabled={updateBanner.isPending}
                    >
                      {updateBanner.isPending ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i> Update Banner
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

