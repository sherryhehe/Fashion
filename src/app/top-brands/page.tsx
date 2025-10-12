'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useState } from 'react';

export default function TopBrands() {
  return (
    <Layout pageTitle="Top Brands">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="header-title">Top Brands</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="mdi mdi-tag-multiple" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">Brands Feature Coming Soon</h5>
                <p className="text-muted">This feature will display top-performing brands based on sales data.</p>
                <p className="text-muted fs-13">For now, manage products and categories.</p>
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
