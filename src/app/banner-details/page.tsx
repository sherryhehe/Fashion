'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { bannersApi, type Banner } from '@/lib/api/banners';

export default function BannerDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerId = searchParams.get('id');

  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

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
      setBanner(response.data);
    } catch (error: any) {
      console.error('Failed to fetch banner:', error);
      alert('Failed to load banner');
      router.push('/banner-control');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = () => {
    if (!banner?.imageUrl) return '/assets/images/products/product-1.png';
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    
    if (banner.imageUrl.startsWith('http')) {
      return banner.imageUrl;
    } else if (banner.imageUrl.startsWith('/uploads/')) {
      return `${API_URL}${banner.imageUrl}`;
    }
    
    return banner.imageUrl;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Banner Details">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading banner details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!banner) {
    return (
      <Layout pageTitle="Banner Details">
        <div className="container-fluid">
          <div className="text-center py-5">
            <i className="bx bx-error-circle" style={{ fontSize: '64px', color: '#ccc' }}></i>
            <h5 className="mt-3">Banner Not Found</h5>
            <p className="text-muted">The requested banner could not be found.</p>
            <Link href="/banner-control" className="btn btn-primary">
              <i className="bx bx-arrow-back me-1"></i>Back to Banners
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const imageUrl = getImageUrl();

  return (
    <Layout pageTitle="Banner Details">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box">
              <div className="page-title-right">
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item"><Link href="/">Shopo</Link></li>
                  <li className="breadcrumb-item"><Link href="/banner-control">Banners</Link></li>
                  <li className="breadcrumb-item active">Banner Details</li>
                </ol>
              </div>
              <h4 className="page-title">Banner Details</h4>
            </div>
          </div>
        </div>

        {/* Banner Image */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <h5 className="card-title mb-3">Banner Image</h5>
                <div className="position-relative d-inline-block">
                  <img 
                    src={imageUrl} 
                    alt={banner.title} 
                    className="img-fluid rounded"
                    style={{ maxHeight: '500px', maxWidth: '100%' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/products/product-1.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Information */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Basic Information</h5>
                
                <div className="table-responsive">
                  <table className="table table-borderless mb-0">
                    <tbody>
                      <tr>
                        <th width="200">Title:</th>
                        <td>
                          <h5 className="mb-0">{banner.title}</h5>
                          {banner.subtitle && (
                            <small className="text-muted">{banner.subtitle}</small>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Position:</th>
                        <td>
                          <span className="badge bg-primary fs-6">{banner.position}</span>
                        </td>
                      </tr>
                      <tr>
                        <th>Status:</th>
                        <td>
                          <span className={`badge fs-6 ${banner.status === 'active' ? 'bg-success' : banner.status === 'inactive' ? 'bg-secondary' : 'bg-info'}`}>
                            {banner.status}
                          </span>
                        </td>
                      </tr>
                      {banner.linkUrl && (
                        <tr>
                          <th>Link URL:</th>
                          <td>
                            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                              {banner.linkUrl}
                              <i className="bx bx-link-external ms-1"></i>
                            </a>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th>Created:</th>
                        <td>{formatDate(banner.createdAt)}</td>
                      </tr>
                      <tr>
                        <th>Last Updated:</th>
                        <td>{formatDate(banner.updatedAt)}</td>
                      </tr>
                      {banner.startDate && (
                        <tr>
                          <th>Start Date:</th>
                          <td>{formatDate(banner.startDate as any)}</td>
                        </tr>
                      )}
                      {banner.endDate && (
                        <tr>
                          <th>End Date:</th>
                          <td>{formatDate(banner.endDate as any)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Statistics */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Statistics</h5>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p className="text-muted mb-0">Total Clicks</p>
                    <h4 className="mt-1 mb-0 text-primary">{banner.clicks || 0}</h4>
                  </div>
                  <div className="avatar-sm bg-soft-primary rounded">
                    <i className="bx bx-mouse-alt avatar-title text-primary fs-20"></i>
                  </div>
                </div>

                <hr />

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-0">Click-Through Rate</p>
                    <h4 className="mt-1 mb-0 text-success">{(banner.ctr || 0).toFixed(2)}%</h4>
                  </div>
                  <div className="avatar-sm bg-soft-success rounded">
                    <i className="bx bx-trending-up avatar-title text-success fs-20"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title mb-3">Actions</h5>
                
                <div className="d-grid gap-2">
                  <Link 
                    href={`/banner-edit?id=${banner.id}`}
                    className="btn btn-primary"
                  >
                    <i className="bx bx-edit me-1"></i> Edit Banner
                  </Link>
                  
                  <Link 
                    href="/banner-control"
                    className="btn btn-outline-secondary"
                  >
                    <i className="bx bx-arrow-back me-1"></i> Back to List
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

