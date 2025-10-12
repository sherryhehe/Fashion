'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function ReviewsPage() {
  return (
    <Layout pageTitle="Product Reviews">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">Product Reviews</h4>
            </div>

            <div className="card-body">
              <div className="text-center py-5">
                <i className="mdi mdi-star-outline" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                <h4 className="mt-3">No Reviews Yet</h4>
                <p className="text-muted mb-4">
                  Review system is not yet implemented.<br/>
                  This requires creating a Review model and API endpoints.
                </p>
                <div className="alert alert-info mx-auto" style={{ maxWidth: '500px' }}>
                  <strong>To implement reviews:</strong>
                  <ul className="text-start mb-0 mt-2">
                    <li>Create Review model in MongoDB</li>
                    <li>Add review CRUD endpoints</li>
                    <li>Enable customer reviews in mobile app</li>
                    <li>Add moderation features</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
