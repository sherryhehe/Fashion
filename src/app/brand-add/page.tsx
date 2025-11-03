'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateBrand } from '@/hooks/useApi';
import { useNotificationContext } from '@/contexts/NotificationContext';

export default function BrandAdd() {
  console.log('🏢 Brand Add Page Loaded');
  
  const router = useRouter();
  const createBrand = useCreateBrand();
  const { addNotification } = useNotificationContext();
  
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  const [brand, setBrand] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    status: 'Pending',
    description: '',
    profilePicture: null as File | null,
    profilePicturePreview: '',
    banner: null as File | null,
    bannerPreview: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setBrand(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('❌ Invalid file type. Please select an image file.');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        console.log('❌ File size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setBrand(prev => ({
          ...prev,
          banner: file,
          bannerPreview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('❌ Invalid file type. Please select an image file (JPG, PNG, GIF).');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        console.log('❌ File size must be less than 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setBrand(prev => ({
          ...prev,
          profilePicture: file,
          profilePicturePreview: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setBrand(prev => ({
      ...prev,
      profilePicture: null,
      profilePicturePreview: ''
    }));
  };

  const removeBanner = () => {
    setBrand(prev => ({
      ...prev,
      banner: null,
      bannerPreview: ''
    }));
  };

  // Helper function to upload image with timeout and error handling
  const uploadImage = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append('images', file);
    
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.buyshopo.com/api';
    
    // Create timeout controller
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 30000); // 30 second timeout
    
    try {
      const uploadResponse = await fetch(`${apiUrl}/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
        signal: timeoutController.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!uploadResponse.ok) {
        let errorMessage = `Upload failed with status ${uploadResponse.status}`;
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }
      
      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success || !uploadResult.data?.urls?.[0]) {
        throw new Error('Invalid response from upload endpoint');
      }
      
      return uploadResult.data.urls[0];
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError' || timeoutController.signal.aborted) {
        throw new Error('Upload timeout - please try again');
      }
      if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
        throw new Error('Network error: Please check your connection and try again');
      }
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMITTED - handleSubmit called');
    e.preventDefault();

    if (loading) return; // Prevent double submission

    setLoading(true);
    let logoUrl = '';
    let bannerUrl = '';

    try {
      // Upload logo if provided
      if (brand.profilePicture) {
        setUploadingLogo(true);
        console.log('📤 UPLOADING LOGO...');
        try {
          logoUrl = await uploadImage(brand.profilePicture);
          console.log('✅ LOGO UPLOADED:', logoUrl);
        } catch (error: any) {
          setUploadingLogo(false);
          addNotification('error', `Failed to upload logo: ${error.message}`);
          setLoading(false);
          return;
        } finally {
          setUploadingLogo(false);
        }
      }

      // Upload banner if provided
      if (brand.banner) {
        setUploadingBanner(true);
        console.log('📤 UPLOADING BANNER...');
        try {
          bannerUrl = await uploadImage(brand.banner);
          console.log('✅ BANNER UPLOADED:', bannerUrl);
        } catch (error: any) {
          setUploadingBanner(false);
          addNotification('error', `Failed to upload banner: ${error.message}`);
          setLoading(false);
          return;
        } finally {
          setUploadingBanner(false);
        }
      }

      // Generate slug from name
      const slug = brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Build brand data, only including banner if it exists
      const brandData: any = {
        name: brand.name,
        slug: slug,
        email: brand.email,
        phone: brand.phone || undefined,
        website: brand.website || undefined,
        logo: logoUrl || undefined,
        description: brand.description || undefined,
        address: brand.address || undefined,
        status: brand.status.toLowerCase() as 'active' | 'inactive' | 'pending',
        commission: 10, // Default 10% commission
      };
      
      // Only add banner if it has a value (undefined fields are excluded by JSON.stringify)
      if (bannerUrl && bannerUrl.trim() !== '') {
        brandData.banner = bannerUrl;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 CREATING BRAND WITH TANSTACK QUERY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Brand Data:', brandData);

      await createBrand.mutateAsync(brandData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ BRAND CREATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      addNotification('success', 'Brand created successfully!');
      router.push('/brand-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ BRAND CREATION FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const errorMessage = error?.message || error?.error || 'Failed to create brand. Please try again.';
      addNotification('error', errorMessage);

      if (error?.status === 401 || error?.response?.status === 401) {
        console.warn('🔐 Authentication failed - redirecting to login');
        addNotification('warning', 'Session expired. Please login again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  };

  return (
    <Layout pageTitle="Add Brand">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                  <li className="breadcrumb-item"><Link href="/brand-list">Brands</Link></li>
                  <li className="breadcrumb-item active">Add Brand</li>
                </ol>
              </div>
              <h4 className="page-title">Add Brand</h4>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <h5 className="mb-3 text-uppercase bg-light p-2">
                    <i className="solar:user-circle-bold-duotone me-1"></i> Profile Picture
                  </h5>

                  <div className="mb-3">
                    <label htmlFor="profilePictureUpload" className="form-label">Brand Profile Picture</label>
                    <div className="border rounded p-3" style={{ borderStyle: 'dashed' }}>
                      {brand.profilePicturePreview ? (
                        <div className="text-center">
                          <img 
                            src={brand.profilePicturePreview} 
                            alt="Profile preview" 
                            className="img-fluid mb-3 rounded-circle d-block mx-auto"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                          />
                          <div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={removeProfilePicture}
                            >
                              <i className="bx bx-trash me-1"></i>Remove Picture
                            </button>
                            <label htmlFor="profilePictureUpload" className="btn btn-sm btn-outline-primary">
                              <i className="bx bx-edit me-1"></i>Change Picture
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div 
                            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{ 
                              width: '150px', 
                              height: '150px', 
                              backgroundColor: '#f8f9fa',
                              border: '2px dashed #dee2e6'
                            }}
                          >
                            <i className="bx bx-user text-muted" style={{ fontSize: '3rem' }}></i>
                          </div>
                          <p className="text-muted mt-2">Click to upload profile picture</p>
                          <label htmlFor="profilePictureUpload" className="btn btn-outline-primary">
                            <i className="bx bx-plus me-1"></i>Upload Picture
                          </label>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="form-control d-none" 
                        id="profilePictureUpload" 
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                      />
                    </div>
                    <div className="form-text">
                      <small className="text-muted">
                        <i className="bx bx-info-circle me-1"></i>
                        Recommended size: 300x300px. Max file size: 5MB. Supported formats: JPG, PNG, GIF
                      </small>
                    </div>
                  </div>

                  <h5 className="mb-3 text-uppercase bg-light p-2 mt-4">
                    <i className="solar:image-bold-duotone me-1"></i> Banner Image
                  </h5>

                  <div className="mb-3">
                    <label htmlFor="bannerUpload" className="form-label">Brand Banner</label>
                    <div className="border rounded p-3" style={{ borderStyle: 'dashed' }}>
                      {brand.bannerPreview ? (
                        <div className="text-center">
                          <img 
                            src={brand.bannerPreview} 
                            alt="Banner preview" 
                            className="img-fluid mb-3 rounded"
                            style={{ maxHeight: '200px', maxWidth: '100%' }}
                          />
                          <div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={removeBanner}
                            >
                              <i className="bx bx-trash me-1"></i>Remove Banner
                            </button>
                            <label htmlFor="bannerUpload" className="btn btn-sm btn-outline-primary">
                              <i className="bx bx-edit me-1"></i>Change Banner
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <i className="bx bx-cloud-upload text-muted" style={{ fontSize: '3rem' }}></i>
                          <p className="text-muted mt-2">Click to upload banner image</p>
                          <label htmlFor="bannerUpload" className="btn btn-outline-primary">
                            <i className="bx bx-plus me-1"></i>Upload Banner
                          </label>
                        </div>
                      )}
                      <input 
                        type="file" 
                        className="form-control d-none" 
                        id="bannerUpload" 
                        accept="image/*"
                        onChange={handleBannerUpload}
                      />
                    </div>
                    <div className="form-text">
                      <small className="text-muted">
                        <i className="bx bx-info-circle me-1"></i>
                        Recommended size: 1200x400px. Max file size: 5MB. Supported formats: JPG, PNG, GIF
                      </small>
                    </div>
                  </div>

                  <h5 className="mb-3 text-uppercase bg-light p-2 mt-4">
                    <i className="solar:info-circle-bold-duotone me-1"></i> Basic Information
                  </h5>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brandName" className="form-label">Brand Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="brandName" 
                        value={brand.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter brand name"
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brandEmail" className="form-label">Email *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="brandEmail" 
                        value={brand.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        required 
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brandPhone" className="form-label">Phone *</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="brandPhone" 
                        value={brand.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brandWebsite" className="form-label">Website</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="brandWebsite" 
                        value={brand.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="brandAddress" className="form-label">Address</label>
                    <textarea 
                      className="form-control" 
                      id="brandAddress" 
                      rows={3}
                      value={brand.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter business address"
                    ></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brandStatus" className="form-label">Status</label>
                      <select 
                        className="form-select" 
                        id="brandStatus"
                        value={brand.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      id="description" 
                      rows={4}
                      value={brand.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter business description"
                    ></textarea>
                  </div>

                  {/* Loading/Upload Status */}
                  {(loading || uploadingLogo || uploadingBanner) && (
                    <div className="alert alert-info mt-3">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <div>
                          {uploadingLogo && <div>Uploading logo...</div>}
                          {uploadingBanner && <div>Uploading banner...</div>}
                          {loading && !uploadingLogo && !uploadingBanner && <div>Creating brand...</div>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading || uploadingLogo || uploadingBanner}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          {uploadingLogo ? 'Uploading Logo...' : uploadingBanner ? 'Uploading Banner...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <i className="bx bx-plus me-1"></i>Create Brand
                        </>
                      )}
                    </button>
                    <Link 
                      href="/brand-list" 
                      className="btn btn-secondary"
                      onClick={(e) => {
                        if (loading || uploadingLogo || uploadingBanner) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <i className="bx bx-x me-1"></i>Cancel
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
