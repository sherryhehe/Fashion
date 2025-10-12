'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function BannerControl() {
  return (
    <Layout pageTitle="Banner Control Management">
      <div className="container-fluid">
        {/* Banner Control Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-primary rounded">
                      <i className="bx bx-image avatar-title text-primary fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Total Banners</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">24</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">
                      <i className="bx bxs-up-arrow fs-10"></i> 3
                    </span>
                    <span className="text-muted ms-1 fs-11">New This Month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-success rounded">
                      <i className="bx bx-show avatar-title text-success fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Active Banners</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">18</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">75%</span>
                    <span className="text-muted ms-1 fs-11">Active Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-warning rounded">
                      <i className="bx bx-trending-up avatar-title text-warning fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Total Clicks</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">45.2K</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">
                      <i className="bx bxs-up-arrow fs-10"></i> 28.5%
                    </span>
                    <span className="text-muted ms-1 fs-11">vs Last Month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-info rounded">
                      <i className="bx bx-mouse-alt avatar-title text-info fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">CTR</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">3.2%</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">
                      <i className="bx bxs-up-arrow fs-10"></i> 0.5%
                    </span>
                    <span className="text-muted ms-1 fs-11">vs Last Month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Control Management */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                  <h4 className="card-title">Banner Control Management</h4>
                  <div className="d-flex gap-2">
                    <select className="form-select form-select-sm">
                      <option>All Positions</option>
                      <option>Header</option>
                      <option>Sidebar</option>
                      <option>Footer</option>
                      <option>Homepage</option>
                    </select>
                    <select className="form-select form-select-sm">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Draft</option>
                    </select>
                    <Link href="/banner-add" className="btn btn-sm btn-primary text-nowrap" style={{ minWidth: '130px' }}>
                      <i className="bx bx-plus"></i> Add Banner
                    </Link>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Banner</th>
                        <th>Title</th>
                        <th>Position</th>
                        <th>Size</th>
                        <th>Clicks</th>
                        <th>CTR</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <img src="/assets/images/products/product-1(1).png" alt="Banner" className="avatar-sm rounded" />
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-0">Summer Sale 2024</h6>
                            <small className="text-muted">Up to 50% off</small>
                          </div>
                        </td>
                        <td><span className="badge bg-primary">Header</span></td>
                        <td><span className="badge bg-info">728x90</span></td>
                        <td><span className="text-primary fw-semibold">12,847</span></td>
                        <td><span className="text-success fw-semibold">4.2%</span></td>
                        <td><span className="badge bg-success">Active</span></td>
                        <td>
                          <Link href="/banner-edit" className="btn btn-sm btn-outline-primary me-1">
                            <i className="bx bx-edit"></i>
                          </Link>
                          <button className="btn btn-sm btn-outline-info me-1">
                            <i className="bx bx-show"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bx bx-trash"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img src="/assets/images/products/product-2.png" alt="Banner" className="avatar-sm rounded" />
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-0">New Arrivals</h6>
                            <small className="text-muted">Fresh collection</small>
                          </div>
                        </td>
                        <td><span className="badge bg-success">Sidebar</span></td>
                        <td><span className="badge bg-info">300x250</span></td>
                        <td><span className="text-primary fw-semibold">8,924</span></td>
                        <td><span className="text-success fw-semibold">3.1%</span></td>
                        <td><span className="badge bg-success">Active</span></td>
                        <td>
                          <Link href="/banner-edit" className="btn btn-sm btn-outline-primary me-1">
                            <i className="bx bx-edit"></i>
                          </Link>
                          <button className="btn btn-sm btn-outline-info me-1">
                            <i className="bx bx-show"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bx bx-trash"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img src="/assets/images/products/product-3.png" alt="Banner" className="avatar-sm rounded" />
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-0">Electronics Deal</h6>
                            <small className="text-muted">Best prices</small>
                          </div>
                        </td>
                        <td><span className="badge bg-warning">Homepage</span></td>
                        <td><span className="badge bg-info">1200x300</span></td>
                        <td><span className="text-primary fw-semibold">15,632</span></td>
                        <td><span className="text-success fw-semibold">5.8%</span></td>
                        <td><span className="badge bg-success">Active</span></td>
                        <td>
                          <Link href="/banner-edit" className="btn btn-sm btn-outline-primary me-1">
                            <i className="bx bx-edit"></i>
                          </Link>
                          <button className="btn btn-sm btn-outline-info me-1">
                            <i className="bx bx-show"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bx bx-trash"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img src="/assets/images/products/product-4.png" alt="Banner" className="avatar-sm rounded" />
                        </td>
                        <td>
                          <div>
                            <h6 className="mb-0">Fashion Week</h6>
                            <small className="text-muted">Trending styles</small>
                          </div>
                        </td>
                        <td><span className="badge bg-info">Footer</span></td>
                        <td><span className="badge bg-info">728x90</span></td>
                        <td><span className="text-primary fw-semibold">6,789</span></td>
                        <td><span className="text-success fw-semibold">2.4%</span></td>
                        <td><span className="badge bg-secondary">Draft</span></td>
                        <td>
                          <Link href="/banner-edit" className="btn btn-sm btn-outline-primary me-1">
                            <i className="bx bx-edit"></i>
                          </Link>
                          <button className="btn btn-sm btn-outline-info me-1">
                            <i className="bx bx-show"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger">
                            <i className="bx bx-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
