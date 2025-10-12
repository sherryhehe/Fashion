'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function StyleEdit() {
  const style = {
    id: 1,
    name: 'Western',
    type: 'western',
    slug: 'western',
    status: 'active',
    description: 'Modern western fashion and contemporary styles',
    image: '/assets/images/styles/western.jpg',
    icon: '/assets/images/styles/western-icon.png',
    featured: true,
    popular: true,
    productCount: 2847,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  };

  return (
    <Layout pageTitle="Edit Style">
      <div className="container-fluid">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="/styles-list">Styles</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Edit Style</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Edit Style Form */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Edit Style: {style.name}</h4>
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleName" className="form-label">Style Name</label>
                      <input type="text" className="form-control" id="styleName" defaultValue={style.name} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleType" className="form-label">Style Type</label>
                      <select className="form-select" id="styleType" defaultValue={style.type}>
                        <option value="">Select Type</option>
                        <option value="western">Western</option>
                        <option value="desi">Desi</option>
                        <option value="eastern">Eastern</option>
                        <option value="asian">Asian</option>
                        <option value="traditional">Traditional</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleSlug" className="form-label">Style Slug</label>
                      <input type="text" className="form-control" id="styleSlug" defaultValue={style.slug} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select className="form-select" id="status" defaultValue={style.status}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea className="form-control" id="description" rows={4} defaultValue={style.description}></textarea>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleImage" className="form-label">Style Image</label>
                      <div className="mb-2">
                        <img src={style.image} alt="Current" className="img-fluid" style={{ maxHeight: '100px' }} />
                      </div>
                      <input type="file" className="form-control" id="styleImage" accept="image/*" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="styleIcon" className="form-label">Style Icon</label>
                      <div className="mb-2">
                        <img src={style.icon} alt="Current Icon" className="img-fluid" style={{ maxHeight: '100px' }} />
                      </div>
                      <input type="file" className="form-control" id="styleIcon" accept="image/*" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="featured" defaultChecked={style.featured} />
                      <label className="form-check-label" htmlFor="featured">
                        Featured Style
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="popular" defaultChecked={style.popular} />
                      <label className="form-check-label" htmlFor="popular">
                        Popular Style
                      </label>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">Update Style</button>
                    <Link href="/styles-list" className="btn btn-secondary">Cancel</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Style Information</h5>
                <div className="row">
                  <div className="col-6">
                    <p className="text-muted mb-1">Products</p>
                    <h6 className="mb-0">{style.productCount.toLocaleString()}</h6>
                  </div>
                  <div className="col-6">
                    <p className="text-muted mb-1">Status</p>
                    <span className={`badge ${style.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {style.status}
                    </span>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-12">
                    <p className="text-muted mb-1">Created</p>
                    <h6 className="mb-0">{style.createdAt}</h6>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <p className="text-muted mb-1">Last Updated</p>
                    <h6 className="mb-0">{style.updatedAt}</h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Style Guidelines</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Use clear, descriptive names
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Choose appropriate style type
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Upload high-quality images
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Write detailed descriptions
                  </li>
                  <li className="mb-2">
                    <i className="bx bx-check-circle text-success me-2"></i>
                    Mark featured styles carefully
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
