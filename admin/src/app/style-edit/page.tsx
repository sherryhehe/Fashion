'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { stylesApi } from '@/lib/api';
import { getStyleImageUrl } from '@/utils/imageHelper';
import { getApiUrl } from '@/utils/apiHelper';

export default function StyleEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const styleId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [style, setStyle] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    featured: false,
    popular: false,
  });

  // Image states
  const [existingImage, setExistingImage] = useState<string>('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');

  const [existingIcon, setExistingIcon] = useState<string>('');
  const [newIconFile, setNewIconFile] = useState<File | null>(null);
  const [newIconPreview, setNewIconPreview] = useState<string>('');
  const [prevStyleId, setPrevStyleId] = useState<string | null>(null);
  const [nextStyleId, setNextStyleId] = useState<string | null>(null);

  useEffect(() => {
    if (styleId) {
      fetchStyle();
    }
  }, [styleId]);

  // Fetch style list to get prev/next for navigation arrows
  useEffect(() => {
    if (!styleId) return;
    let cancelled = false;
    stylesApi.getAll({ limit: 500 }).then((res: any) => {
      if (cancelled) return;
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? res?.data ?? []);
      const ids = (Array.isArray(list) ? list : []).map((s: any) => s._id || s.id).filter(Boolean);
      const idx = ids.indexOf(styleId);
      if (idx > 0) setPrevStyleId(ids[idx - 1]);
      else setPrevStyleId(null);
      if (idx >= 0 && idx < ids.length - 1) setNextStyleId(ids[idx + 1]);
      else setNextStyleId(null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [styleId]);

  const fetchStyle = async () => {
    try {
      setLoading(true);
      const response = await stylesApi.getById(styleId!);
      const styleData = response.data;

      setStyle({
        name: styleData.name || '',
        slug: styleData.slug || '',
        description: styleData.description || '',
        status: styleData.status || 'active',
        featured: styleData.featured || false,
        popular: styleData.popular || false,
      });

      if (styleData.image) {
        setExistingImage(styleData.image);
      }
      if (styleData.icon) {
        setExistingIcon(styleData.icon);
      }
    } catch (error) {
      console.error('Failed to fetch style:', error);
      alert('Failed to load style');
      router.push('/styles-list');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setStyle(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
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

  const handleNewIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      setNewIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveExistingImage = () => {
    setExistingImage('');
  };

  const handleRemoveExistingIcon = () => {
    setExistingIcon('');
  };

  const handleRemoveNewImage = () => {
    setNewImageFile(null);
    setNewImagePreview('');
    // Reset file input
    const fileInput = document.getElementById('styleImageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleRemoveNewIcon = () => {
    setNewIconFile(null);
    setNewIconPreview('');
    // Reset file input
    const fileInput = document.getElementById('styleIconUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImage = existingImage;
      let finalIcon = existingIcon;

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
          throw new Error('Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();
        finalImage = uploadResult.data.urls[0];
        console.log('✅ NEW IMAGE UPLOADED:', finalImage);
      } else if (!existingImage) {
        // If no existing image and no new image, set to empty
        finalImage = '';
      }

      // Upload new icon if provided
      if (newIconFile) {
        console.log('📤 UPLOADING NEW ICON...');
        const uploadFormData = new FormData();
        uploadFormData.append('images', newIconFile);

        const token = localStorage.getItem('token');
        const uploadResponse = await fetch(`${getApiUrl()}/upload/images`, {
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
        finalIcon = uploadResult.data.urls[0];
        console.log('✅ NEW ICON UPLOADED:', finalIcon);
      } else if (!existingIcon) {
        // If no existing icon and no new icon, set to empty
        finalIcon = '';
      }

      // Generate slug from name if not provided
      const slug = style.slug || style.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const styleData: any = {
        name: style.name,
        slug: slug,
        description: style.description || undefined,
        status: style.status,
        featured: style.featured,
        popular: style.popular,
      };

      // Only add image/icon if they have values
      if (finalImage && finalImage.trim() !== '') {
        styleData.image = finalImage;
      }
      if (finalIcon && finalIcon.trim() !== '') {
        styleData.icon = finalIcon;
      }

      console.log('📤 UPDATE STYLE REQUEST');
      console.log('Style Data:', styleData);

      await stylesApi.update(styleId!, styleData);

      console.log('✅ STYLE UPDATED SUCCESSFULLY');
      router.push('/styles-list');
    } catch (error: any) {
      console.error('Error updating style:', error);
      alert('Failed to update style');
      
      if (error.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Edit Style">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading style details...</p>
        </div>
      </Layout>
    );
  }

  const placeholderImage = '/assets/images/products/product-1.png';
  const imageDisplayUrl = newImagePreview || (existingImage ? getStyleImageUrl(existingImage, placeholderImage) : placeholderImage);
  const iconDisplayUrl = newIconPreview || (existingIcon ? getStyleImageUrl(existingIcon, placeholderImage) : placeholderImage);

  return (
    <Layout pageTitle="Edit Style">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                  <li className="breadcrumb-item"><Link href="/styles-list">Styles</Link></li>
                  <li className="breadcrumb-item active">Edit Style</li>
                </ol>
              </div>
              <h4 className="page-title">Edit Style</h4>
            </div>
            <div className="d-flex gap-2">
              {prevStyleId && (
                <Link href={`/style-edit?id=${prevStyleId}`} className="btn btn-sm btn-outline-primary">
                  <i className="mdi mdi-arrow-left me-1" /> Previous
                </Link>
              )}
              {nextStyleId && (
                <Link href={`/style-edit?id=${nextStyleId}`} className="btn btn-sm btn-outline-primary">
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
                  {/* Style Images - At the Top */}
                  <h5 className="mb-3 text-uppercase bg-light p-2">
                    <i className="mdi mdi-image me-1"></i> Style Images
                  </h5>

                  <div className="row mb-4">
                    {/* Style Image */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleImageUpload" className="form-label fw-bold">Style Image</label>
                      <div className="border rounded p-3" style={{ borderStyle: 'dashed' }}>
                        {(existingImage || newImagePreview) ? (
                          <div className="text-center">
                            <img 
                              src={imageDisplayUrl}
                              alt="Style Image" 
                              className="img-fluid mb-3 rounded d-block mx-auto"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = placeholderImage;
                              }}
                            />
                            <div>
                              {existingImage && !newImagePreview && (
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger me-2"
                                  onClick={handleRemoveExistingImage}
                                >
                                  <i className="bx bx-trash me-1"></i>Remove Image
                                </button>
                              )}
                              {newImagePreview && (
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger me-2"
                                  onClick={handleRemoveNewImage}
                                >
                                  <i className="bx bx-trash me-1"></i>Remove Image
                                </button>
                              )}
                              <label htmlFor="styleImageUpload" className="btn btn-sm btn-outline-primary">
                                <i className="bx bx-edit me-1"></i>Change Image
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <i className="mdi mdi-image-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                            <p className="mt-2 text-muted">No image uploaded</p>
                            <label htmlFor="styleImageUpload" className="btn btn-sm btn-primary">
                              <i className="bx bx-upload me-1"></i>Upload Image
                            </label>
                          </div>
                        )}
                        <input
                          type="file"
                          id="styleImageUpload"
                          className="d-none"
                          accept="image/*"
                          onChange={handleNewImageChange}
                        />
                        <small className="text-muted d-block mt-2">
                          Recommended size: 800x600px. Max file size: 5MB. Supported formats: JPG, PNG, GIF
                        </small>
                      </div>
                    </div>

                    {/* Style Icon */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleIconUpload" className="form-label fw-bold">Style Icon</label>
                      <div className="border rounded p-3" style={{ borderStyle: 'dashed' }}>
                        {(existingIcon || newIconPreview) ? (
                          <div className="text-center">
                            <img 
                              src={iconDisplayUrl}
                              alt="Style Icon" 
                              className="img-fluid mb-3 rounded d-block mx-auto"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = placeholderImage;
                              }}
                            />
                            <div>
                              {existingIcon && !newIconPreview && (
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger me-2"
                                  onClick={handleRemoveExistingIcon}
                                >
                                  <i className="bx bx-trash me-1"></i>Remove Icon
                                </button>
                              )}
                              {newIconPreview && (
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger me-2"
                                  onClick={handleRemoveNewIcon}
                                >
                                  <i className="bx bx-trash me-1"></i>Remove Icon
                                </button>
                              )}
                              <label htmlFor="styleIconUpload" className="btn btn-sm btn-outline-primary">
                                <i className="bx bx-edit me-1"></i>Change Icon
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <i className="mdi mdi-image-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                            <p className="mt-2 text-muted">No icon uploaded</p>
                            <label htmlFor="styleIconUpload" className="btn btn-sm btn-primary">
                              <i className="bx bx-upload me-1"></i>Upload Icon
                            </label>
                          </div>
                        )}
                        <input
                          type="file"
                          id="styleIconUpload"
                          className="d-none"
                          accept="image/*"
                          onChange={handleNewIconChange}
                        />
                        <small className="text-muted d-block mt-2">
                          Recommended size: 200x200px. Max file size: 5MB. Supported formats: JPG, PNG, GIF
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <h5 className="mb-3 text-uppercase bg-light p-2">
                    <i className="mdi mdi-information-outline me-1"></i> Basic Information
                  </h5>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label">Style Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={style.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="slug" className="form-label">Style Slug</label>
                      <input
                        type="text"
                        className="form-control"
                        id="slug"
                        value={style.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="Auto-generated from name"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                        className="form-select"
                        id="status"
                        value={style.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows={4}
                      value={style.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter style description..."
                    />
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="featured"
                        checked={style.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="featured">
                        Featured Style
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="popular"
                        checked={style.popular}
                        onChange={(e) => handleInputChange('popular', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="popular">
                        Popular Style
                      </label>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        'Update Style'
                      )}
                    </button>
                    <Link href="/styles-list" className="btn btn-secondary">
                      Cancel
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
