'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function NotificationHistory() {
  return (
    <Layout pageTitle="Notification History">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/notification-list">Notifications</Link></li>
                <li className="breadcrumb-item active" aria-current="page">History</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="header-title">Notification History</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="mdi mdi-history" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">No Notification History</h5>
                <p className="text-muted">Sent notifications will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
