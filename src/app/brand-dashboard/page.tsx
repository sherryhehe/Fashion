'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function BrandDashboard() {
  return (
    <Layout pageTitle="Brand Dashboard">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="header-title">Brand Analytics</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="mdi mdi-chart-bar" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">Brand Analytics Coming Soon</h5>
                <p className="text-muted">Track brand performance, sales, and trends.</p>
                <Link href="/" className="btn btn-primary mt-2">
                  <i className="mdi mdi-view-dashboard me-1"></i>
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
