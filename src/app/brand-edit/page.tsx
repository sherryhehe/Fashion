'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { brandsApi } from '@/lib/api';

export default function BrandEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [brand, setBrand] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    status: 'pending',
    businessType: '',
    taxId: '',
    licenseNumber: '',
    establishedYear: new Date().getFullYear(),
    description: '',
    commission: 10,
    verified: false,
    featured: false,
    popular: false,
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  const [existingLogo, setExistingLogo] = useState<string>('');
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string>('');

  useEffect(() => {
    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      const response = await brandsApi.getById(brandId!);
      const brandData = response.data;

      setBrand({
        name: brandData.name || '',
        email: brandData.email || '',
        phone: brandData.phone || '',
        website: brandData.website || '',
        address: brandData.address || '',
        city: brandData.city || '',
        state: brandData.state || '',
        country: brandData.country || '',
        zipCode: brandData.zipCode || '',
        status: brandData.status || 'pending',
        businessType: brandData.businessInfo?.businessType || '',
        taxId: brandData.businessInfo?.taxId || '',
        licenseNumber: brandData.businessInfo?.licenseNumber || '',
        establishedYear: brandData.businessInfo?.establishedYear || new Date().getFullYear(),
        description: brandData.description || '',
        commission: brandData.commission || 10,
        verified: brandData.verified || false,
        featured: brandData.featured || false,
        popular: brandData.popular || false,
        socialMedia: {
          facebook: brandData.socialMedia?.facebook || '',
          twitter: brandData.socialMedia?.twitter || '',
          instagram: brandData.socialMedia?.instagram || '',
          linkedin: brandData.socialMedia?.linkedin || ''
        }
      });

      if (brandData.logo) {
        setExistingLogo(brandData.logo);
      }
    } catch (error) {
      console.error('Failed to fetch brand:', error);
      alert('Failed to load brand');
      router.push('/brand-list');
    } finally {
      setLoading(false);
    }
  };

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

  const handleNewLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setNewLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveExistingLogo = () => {
    setExistingLogo('');
  };

  const handleRemoveNewLogo = () => {
    setNewLogoFile(null);
    setNewLogoPreview('');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalLogo = existingLogo;

      // Upload new logo if provided
      if (newLogoFile) {
        console.log('📤 UPLOADING NEW LOGO...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', newLogoFile);

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
        finalLogo = uploadResult.data.urls[0];
        console.log('✅ NEW LOGO UPLOADED:', finalLogo);
      }

      // Generate slug from name
      const slug = brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const brandData = {
        name: brand.name,
        slug: slug,
        email: brand.email,
        phone: brand.phone || undefined,
        website: brand.website || undefined,
        logo: finalLogo || undefined,
        description: brand.description || undefined,
        address: brand.address || undefined,
        city: brand.city || undefined,
        state: brand.state || undefined,
        country: brand.country || undefined,
        zipCode: brand.zipCode || undefined,
        status: brand.status as 'active' | 'inactive' | 'pending',
        commission: brand.commission,
        verified: brand.verified,
        featured: brand.featured,
        popular: brand.popular,
        socialMedia: {
          facebook: brand.socialMedia.facebook || undefined,
          twitter: brand.socialMedia.twitter || undefined,
          instagram: brand.socialMedia.instagram || undefined,
          linkedin: brand.socialMedia.linkedin || undefined,
        },
        businessInfo: {
          businessType: brand.businessType || undefined,
          taxId: brand.taxId || undefined,
          licenseNumber: brand.licenseNumber || undefined,
          establishedYear: brand.establishedYear,
        },
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 UPDATE BRAND REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Brand ID:', brandId);
      console.log('Brand Data:', brandData);

      const response = await brandsApi.update(brandId!, brandData);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ UPDATE BRAND SUCCESS');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Response:', response);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      router.push('/brand-list');
    } catch (error: any) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ UPDATE BRAND FAILED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error);
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
      <Layout pageTitle="Edit Brand">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading brand details...</p>
        </div>
      </Layout>
    );
  };

  return (
    <Layout pageTitle="Edit Brand">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                  <li className="breadcrumb-item"><Link href="/brand-list">Brands</Link></li>
                  <li className="breadcrumb-item active">Edit Brand</li>
                </ol>
              </div>
              <h4 className="page-title">Edit Brand</h4>
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
                      <label htmlFor="brandName" className="form-label">Brand Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="brandName" 
                        value={brand.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brandEmail" className="form-label">Email</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        id="brandEmail" 
                        value={brand.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="brandPhone" className="form-label">Phone</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        id="brandPhone" 
                        value={brand.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
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
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Pending">Pending</option>
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
                    <i className="solar:user-circle-bold-duotone me-1"></i> Brand Logo
                  </h5>

                  <div className="mb-3">
                    <label className="form-label">Brand Logo</label>
                    <div className="border rounded p-3 bg-light">
                      {existingLogo && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-2">Current Logo:</small>
                          <div className="text-center">
                            <div className="position-relative d-inline-block">
                              <img 
                                src={existingLogo.startsWith('http') ? existingLogo : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${existingLogo}`}
                                alt="Current Logo" 
                                className="img-fluid rounded-circle border" 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                                }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                                onClick={handleRemoveExistingLogo}
                                title="Remove current logo"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                              <span className="badge bg-success position-absolute bottom-0 start-0 m-1">Current</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {newLogoPreview && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-2">New Logo to Upload:</small>
                          <div className="text-center">
                            <div className="position-relative d-inline-block">
                              <img 
                                src={newLogoPreview} 
                                alt="New Logo Preview" 
                                className="img-fluid rounded-circle border" 
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" 
                                onClick={handleRemoveNewLogo}
                                title="Remove new logo"
                              >
                                <i className="bx bx-x"></i>
                              </button>
                              <span className="badge bg-warning position-absolute bottom-0 end-0 m-1">New</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*" 
                          onChange={handleNewLogoChange}
                        />
                        <small className="text-muted d-block mt-2">
                          <i className="bx bx-info-circle me-1"></i>
                          Upload a new logo or keep the existing one. Recommended size: 300x300px
                        </small>
                      </div>
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
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-save me-1"></i>Save Changes
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this brand?')) {
                          brandsApi.delete(brandId!).then(() => {
                            router.push('/brand-list');
                          });
                        }
                      }}
                    >
                      <i className="bx bx-trash me-1"></i>Delete Brand
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
