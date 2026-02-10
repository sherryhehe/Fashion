'use client';

import Layout from '@/components/layout/Layout';
import { getBrandLogoUrl } from '@/utils/imageHelper';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { brandsApi } from '@/lib/api';

export default function FeaturedBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandsApi.getFeatured();
        setBrands(res.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load featured brands');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <Layout pageTitle="Featured Brands">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title mb-0">Featured Brands</h4>
              <Link href="/brand-list" className="btn btn-sm btn-outline-primary">Manage Brands</Link>
            </div>
            <div className="card-body">
              {loading && (
                <div className="text-center py-5 text-muted">Loading...</div>
              )}
              {!!error && !loading && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}
              {!loading && !error && brands.length === 0 && (
                <div className="text-center py-5">
                  <i className="mdi mdi-star-box-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No featured brands yet</h5>
                  <p className="text-muted">Mark some brands as featured to show them here.</p>
                </div>
              )}

              <div className="row">
                {brands.map((brand) => {
                  const placeholderImage = '/assets/images/products/product-1.png';
                  const imageUrl = getBrandLogoUrl(brand.logo, placeholderImage);

                  return (
                    <div className="col-md-3 mb-3" key={brand._id}>
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <img
                            src={imageUrl}
                            alt={brand.name}
                            className="img-fluid mb-3 rounded"
                            style={{ maxHeight: 64, objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = placeholderImage;
                            }}
                          />
                          <h6 className="mb-1">{brand.name}</h6>
                          {brand.totalSales !== undefined && (
                            <small className="text-muted d-block">Sales: {brand.totalSales}</small>
                          )}
                          {brand.rating !== undefined && (
                            <small className="text-warning d-block">
                              <i className="mdi mdi-star"></i> {brand.rating}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
