'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function FeaturedBrands() {
  return (
    <Layout pageTitle="Featured Brands">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="header-title">Featured Brands</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="mdi mdi-star-box-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">Featured Brands Coming Soon</h5>
                <p className="text-muted">Highlight top brands on your storefront.</p>
                <Link href="/product-list" className="btn btn-primary mt-2">
                  <i className="mdi mdi-package-variant me-1"></i>
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
