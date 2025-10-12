'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateBrand } from '@/hooks/useApi';

export default function BrandAdd() {
  console.log('🏢 Brand Add Page Loaded');
  
  const router = useRouter();
  const createBrand = useCreateBrand();
  
  const [brand, setBrand] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    status: 'Pending',
    businessType: 'Individual',
    category: 'Athletic Wear',
    taxId: '',
    licenseNumber: '',
    establishedYear: new Date().getFullYear(),
    description: '',
    profilePicture: null as File | null,
    profilePicturePreview: '',
    banner: null as File | null,
    bannerPreview: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1];
      setBrand(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setBrand(prev => ({
        ...prev,
        [field]: value
      }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 FORM SUBMITTED - handleSubmit called');
    e.preventDefault();

    try {
      let logoUrl = '';
      
      // Upload logo if provided
      if (brand.profilePicture) {
        console.log('📤 UPLOADING LOGO...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', brand.profilePicture);
        
        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload logo');
        }
        
        const uploadResult = await uploadResponse.json();
        logoUrl = uploadResult.data.urls[0];
        console.log('✅ LOGO UPLOADED:', logoUrl);
      }

      // Generate slug from name
      const slug = brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const brandData = {
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
        socialMedia: {
          facebook: brand.socialMedia.facebook || undefined,
          twitter: brand.socialMedia.twitter || undefined,
          instagram: brand.socialMedia.instagram || undefined,
          linkedin: brand.socialMedia.linkedin || undefined,
        },
        businessInfo: {
          businessType: brand.businessType,
          taxId: brand.taxId || undefined,
          licenseNumber: brand.licenseNumber || undefined,
          establishedYear: brand.establishedYear,
        },
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 CREATING BRAND WITH TANSTACK QUERY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Brand Data:', brandData);

      await createBrand.mutateAsync(brandData);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ BRAND CREATED SUCCESSFULLY');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      router.push('/brand-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ BRAND CREATION FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (error.status === 401) {
        console.warn('🔐 Authentication failed - redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
      }
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
                  <li className="breadcrumb-item"><Link href="/">Larkon</Link></li>
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
                    <div className="col-md-6 mb-3">
                      <label htmlFor="category" className="form-label">Clothing Category</label>
                      <select 
                        className="form-select" 
                        id="category"
                        value={brand.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                      >
                        <option value="Athletic Wear">Athletic Wear</option>
                        <option value="Casual Wear">Casual Wear</option>
                        <option value="Fast Fashion">Fast Fashion</option>
                        <option value="Luxury Fashion">Luxury Fashion</option>
                        <option value="Sustainable Fashion">Sustainable Fashion</option>
                        <option value="Denim & Jeans">Denim & Jeans</option>
                        <option value="Footwear">Footwear</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Outerwear">Outerwear</option>
                        <option value="Formal Wear">Formal Wear</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="businessType" className="form-label">Business Type</label>
                      <select 
                        className="form-select" 
                        id="businessType"
                        value={brand.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                      >
                        <option value="Individual">Individual</option>
                        <option value="Corporation">Corporation</option>
                        <option value="LLC">LLC</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Fashion House">Fashion House</option>
                        <option value="Designer Brand">Designer Brand</option>
                        <option value="Retail Chain">Retail Chain</option>
                      </select>
                    </div>
                  </div>

                  <h5 className="mb-3 text-uppercase bg-light p-2 mt-4">
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
                            className="img-fluid mb-3 rounded-circle"
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
                    <i className="solar:document-text-bold-duotone me-1"></i> Business Information
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="taxId" className="form-label">Tax ID</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="taxId" 
                        value={brand.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                        placeholder="Enter tax identification number"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="licenseNumber" className="form-label">License Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="licenseNumber" 
                        value={brand.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        placeholder="Enter business license number"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="establishedYear" className="form-label">Established Year</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        id="establishedYear" 
                        value={brand.establishedYear}
                        onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                        min="1900"
                        max="2024"
                      />
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

                  <h5 className="mb-3 text-uppercase bg-light p-2 mt-4">
                    <i className="solar:share-bold-duotone me-1"></i> Social Media
                  </h5>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="facebook" className="form-label">Facebook</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="facebook" 
                        value={brand.socialMedia.facebook}
                        onChange={(e) => handleInputChange('socialMedia.facebook', e.target.value)}
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="twitter" className="form-label">Twitter</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="twitter" 
                        value={brand.socialMedia.twitter}
                        onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="instagram" className="form-label">Instagram</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="instagram" 
                        value={brand.socialMedia.instagram}
                        onChange={(e) => handleInputChange('socialMedia.instagram', e.target.value)}
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="linkedin" className="form-label">LinkedIn</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        id="linkedin" 
                        value={brand.socialMedia.linkedin}
                        onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/companyname"
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">
                      <i className="bx bx-plus me-1"></i>Create Brand
                    </button>
                    <Link href="/brand-list" className="btn btn-secondary">
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
