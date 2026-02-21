'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { brandsApi } from '@/lib/api';
import { getBrandLogoUrl, getBrandBannerUrl } from '@/utils/imageHelper';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import { getApiUrl } from '@/utils/apiHelper';

export default function BrandEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get('id');
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();

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
    description: '',
    commission: 10,
    verified: false,
    featured: false,
    popular: false,
    allowedPaymentMethods: ['card', 'cash'] as string[],
  });

  const [existingLogo, setExistingLogo] = useState<string>('');
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string>('');
  const [existingBanner, setExistingBanner] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [prevBrandId, setPrevBrandId] = useState<string | null>(null);
  const [nextBrandId, setNextBrandId] = useState<string | null>(null);

  useEffect(() => {
    if (brandId) {
      fetchBrand();
    }
  }, [brandId]);

  // Fetch brand list to get prev/next for navigation arrows
  useEffect(() => {
    if (!brandId) return;
    let cancelled = false;
    brandsApi.getAll({ limit: 500 }).then((res: any) => {
      if (cancelled) return;
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? res?.data ?? []);
      const ids = (Array.isArray(list) ? list : []).map((b: any) => b._id || b.id).filter(Boolean);
      const idx = ids.indexOf(brandId);
      if (idx > 0) setPrevBrandId(ids[idx - 1]);
      else setPrevBrandId(null);
      if (idx >= 0 && idx < ids.length - 1) setNextBrandId(ids[idx + 1]);
      else setNextBrandId(null);
    }).catch(() => {});
    return () => { cancelled = true; };
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
        description: brandData.description || '',
        commission: brandData.commission || 10,
        verified: brandData.verified || false,
        featured: brandData.featured || false,
        popular: brandData.popular || false,
        allowedPaymentMethods: Array.isArray(brandData.allowedPaymentMethods) && brandData.allowedPaymentMethods.length > 0
          ? brandData.allowedPaymentMethods
          : ['card', 'cash'],
      });

      if (brandData.logo) {
        setExistingLogo(brandData.logo);
      }
      if (brandData.banner) {
        setExistingBanner(brandData.banner);
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
    setBrand(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('🖼️ Banner file selected:', file);
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

      setBannerFile(file);
      console.log('✅ Banner file set in state');
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
        console.log('✅ Banner preview set');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview('');
    setExistingBanner('');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalLogo = existingLogo;
      let finalBanner: string | undefined = existingBanner || undefined;

      // Upload new logo if provided
      if (newLogoFile) {
        console.log('📤 UPLOADING NEW LOGO...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', newLogoFile);

        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${getApiUrl()}/upload/images`, {
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

      // Upload banner if provided
      console.log('🔍 Checking banner file:', bannerFile);
      console.log('🔍 Existing banner:', existingBanner);
      
      if (bannerFile) {
        console.log('📤 UPLOADING NEW BANNER...', bannerFile.name, bannerFile.size);
        const uploadFormData = new FormData();
        uploadFormData.append('images', bannerFile);

        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${getApiUrl()}/upload/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('❌ Banner upload failed:', errorText);
          throw new Error('Failed to upload banner');
        }

        const uploadResult = await uploadResponse.json();
        console.log('📦 Upload result:', uploadResult);
        finalBanner = uploadResult.data.urls[0];
        console.log('✅ NEW BANNER UPLOADED:', finalBanner);
      } else if (existingBanner && existingBanner.trim() !== '') {
        // Use existing banner if no new file uploaded
        console.log('ℹ️ No new banner file. Using existing banner:', existingBanner);
        finalBanner = existingBanner;
      } else {
        console.log('ℹ️ No banner (new or existing)');
        finalBanner = undefined;
      }
      
      console.log('✅ Final banner value:', finalBanner);

      // Generate slug from name
      const slug = brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Build brand data, only including banner if it exists
      const brandData: any = {
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
        allowedPaymentMethods: brand.allowedPaymentMethods?.length ? brand.allowedPaymentMethods : ['card', 'cash'],
      };
      
      // Only add banner if it has a value (undefined fields are excluded by JSON.stringify)
      if (finalBanner && finalBanner.trim() !== '') {
        brandData.banner = finalBanner;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📤 UPDATE BRAND REQUEST');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Brand ID:', brandId);
      console.log('Final Logo:', finalLogo);
      console.log('Final Banner:', finalBanner);
      console.log('Banner in brandData:', brandData.banner);
      console.log('Brand Data:', JSON.stringify(brandData, null, 2));

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
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
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
            <div className="d-flex gap-2">
              {prevBrandId && (
                <Link href={`/brand-edit?id=${prevBrandId}`} className="btn btn-sm btn-outline-primary">
                  <i className="mdi mdi-arrow-left me-1" /> Previous
                </Link>
              )}
              {nextBrandId && (
                <Link href={`/brand-edit?id=${nextBrandId}`} className="btn btn-sm btn-outline-primary">
                  Next <i className="mdi mdi-arrow-right ms-1" />
                </Link>
              )}
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
                      {existingLogo && !newLogoPreview && (
                        <div className="text-center">
                          <img 
                            src={getBrandLogoUrl(existingLogo, '/assets/images/products/product-1.png')}
                            alt="Profile preview" 
                            className="img-fluid mb-3 rounded-circle d-block mx-auto"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                            }}
                          />
                          <div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={handleRemoveExistingLogo}
                            >
                              <i className="bx bx-trash me-1"></i>Remove Picture
                            </button>
                            <label htmlFor="profilePictureUpload" className="btn btn-sm btn-outline-primary">
                              <i className="bx bx-edit me-1"></i>Change Picture
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {newLogoPreview && (
                        <div className="text-center">
                          <img 
                            src={newLogoPreview} 
                            alt="Profile preview" 
                            className="img-fluid mb-3 rounded-circle d-block mx-auto"
                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                          />
                          <div>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger me-2"
                              onClick={handleRemoveNewLogo}
                            >
                              <i className="bx bx-trash me-1"></i>Remove Picture
                            </button>
                            <label htmlFor="profilePictureUpload" className="btn btn-sm btn-outline-primary">
                              <i className="bx bx-edit me-1"></i>Change Picture
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {!existingLogo && !newLogoPreview && (
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
                        onChange={handleNewLogoChange}
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
                      {bannerPreview ? (
                        <div className="text-center">
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="img-fluid mb-3 rounded d-block mx-auto"
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
                      ) : existingBanner ? (
                        <div className="text-center">
                          <img 
                            src={getBrandBannerUrl(existingBanner) || '/assets/images/products/product-1.png'} 
                            alt="Banner preview" 
                            className="img-fluid mb-3 rounded d-block mx-auto"
                            style={{ maxHeight: '200px', maxWidth: '100%' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                            }}
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
                    <label className="form-label">Checkout methods</label>
                    <p className="text-muted small mb-2">Select which payment methods this brand accepts. Customers will only see allowed options at checkout.</p>
                    <div className="d-flex gap-4">
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={brand.allowedPaymentMethods.includes('card')}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...new Set([...brand.allowedPaymentMethods, 'card'])]
                              : brand.allowedPaymentMethods.filter((m: string) => m !== 'card');
                            setBrand(prev => ({ ...prev, allowedPaymentMethods: next.length ? next : ['cash'] }));
                          }}
                        />
                        Card
                      </label>
                      <label className="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={brand.allowedPaymentMethods.includes('cash')}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...new Set([...brand.allowedPaymentMethods, 'cash'])]
                              : brand.allowedPaymentMethods.filter((m: string) => m !== 'cash');
                            setBrand(prev => ({ ...prev, allowedPaymentMethods: next.length ? next : ['card'] }));
                          }}
                        />
                        Cash on Delivery
                      </label>
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
                      onClick={async () => {
                        const confirmed = await showConfirm({
                          title: 'Delete Brand',
                          message: 'Are you sure you want to delete this brand? This action cannot be undone.',
                          confirmText: 'Delete',
                          cancelText: 'Cancel',
                          variant: 'danger',
                        });

                        if (confirmed) {
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
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        variant={dialog.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Layout>
  );
}
