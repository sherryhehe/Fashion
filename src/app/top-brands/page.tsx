'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { brandsApi } from '@/lib/api';

export default function TopBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTopBrands = async () => {
      try {
        const res = await brandsApi.getTop(12);
        setBrands(res.data || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load top brands');
      } finally {
        setLoading(false);
      }
    };
    fetchTopBrands();
  }, []);
  return (
    <Layout pageTitle="Top Brands">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title mb-0">Top Brands</h4>
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
                  <i className="mdi mdi-tag-multiple" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No top brands found</h5>
                  <p className="text-muted">Brands will appear here once they have sales.</p>
                </div>
              )}
              <div className="row">
                {brands.map((brand, idx) => {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
                  const placeholderImage = '/assets/images/products/product-1.png';

                  let imageUrl = placeholderImage;
                  if (brand.logo) {
                    if (brand.logo.startsWith('http')) {
                      imageUrl = brand.logo;
                    } else if (brand.logo.startsWith('/uploads/')) {
                      imageUrl = `${API_URL}${brand.logo}`;
                    }
                  }

                  return (
                    <div className="col-md-3 mb-3" key={brand._id}>
                      <div className="card h-100">
                        <div className="card-body text-center">
                          <div className="d-flex justify-content-between">
                            <span className="badge bg-primary">#{idx + 1}</span>
                            {brand.rating !== undefined && (
                              <span className="text-warning"><i className="mdi mdi-star"></i> {brand.rating}</span>
                            )}
                          </div>
                          <img
                            src={imageUrl}
                            alt={brand.name}
                            className="img-fluid my-3 rounded"
                            style={{ maxHeight: 56, objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = placeholderImage;
                            }}
                          />
                          <h6 className="mb-1">{brand.name}</h6>
                          {brand.totalSales !== undefined && (
                            <small className="text-muted d-block">Sales: {brand.totalSales}</small>
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
