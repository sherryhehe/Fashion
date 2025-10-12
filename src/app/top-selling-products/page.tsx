'use client';

import Layout from '@/components/layout/Layout';

export default function TopSellingProducts() {
  // Top selling products data
  const topSellingProducts = [
    {
      id: 1,
      rank: 1,
      rankColor: 'bg-warning',
      name: 'G15 Gaming Laptop',
      description: 'High-performance gaming laptop',
      image: '/assets/images/products/product-1(1).png',
      category: 'Electronics',
      categoryColor: 'bg-primary',
      sales: 1247,
      revenue: '$299,880',
      growth: '+12.5%',
      status: 'Hot',
      statusColor: 'bg-success'
    },
    {
      id: 2,
      rank: 2,
      rankColor: 'bg-secondary',
      name: 'Sony Alpha Camera',
      description: 'Professional mirrorless camera',
      image: '/assets/images/products/product-2.png',
      category: 'Electronics',
      categoryColor: 'bg-primary',
      sales: 892,
      revenue: '$121,248',
      growth: '+8.2%',
      status: 'Trending',
      statusColor: 'bg-primary'
    },
    {
      id: 3,
      rank: 3,
      rankColor: 'bg-info',
      name: 'Wireless Headphones',
      description: 'Noise-cancelling wireless audio',
      image: '/assets/images/products/product-3.png',
      category: 'Electronics',
      categoryColor: 'bg-primary',
      sales: 654,
      revenue: '$58,846',
      growth: '+5.7%',
      status: 'Popular',
      statusColor: 'bg-info'
    },
    {
      id: 4,
      rank: 4,
      rankColor: 'bg-dark',
      name: 'Smart Watch',
      description: 'Fitness tracking smartwatch',
      image: '/assets/images/products/product-4.png',
      category: 'Electronics',
      categoryColor: 'bg-primary',
      sales: 432,
      revenue: '$86,400',
      growth: '+3.2%',
      status: 'Rising',
      statusColor: 'bg-warning'
    }
  ];

  // Featured products data for the cards section
  const featuredProducts = [
    {
      id: 1,
      name: 'G15 Gaming Laptop',
      description: 'High-performance gaming laptop with latest specs.',
      image: '/assets/images/products/product-1(1).png',
      price: '$299,880'
    },
    {
      id: 2,
      name: 'Sony Alpha Camera',
      description: 'Professional mirrorless camera for photographers.',
      image: '/assets/images/products/product-2.png',
      price: '$121,248'
    },
    {
      id: 3,
      name: 'Wireless Headphones',
      description: 'Noise-cancelling wireless audio experience.',
      image: '/assets/images/products/product-3.png',
      price: '$58,846'
    },
    {
      id: 4,
      name: 'Smart Watch',
      description: 'Fitness tracking and smart notifications.',
      image: '/assets/images/products/product-4.png',
      price: '$86,400'
    }
  ];

  return (
    <Layout pageTitle="Top Selling Products">
      <div className="container-fluid">
        {/* Top Selling Products Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-success rounded">
                      <i className="bx bx-trophy avatar-title text-success fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Total Products</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">2,847</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">
                      <i className="bx bxs-up-arrow fs-10"></i> 12.5%
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
                    <div className="avatar-sm bg-soft-primary rounded">
                      <i className="bx bx-star avatar-title text-primary fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Top Brands</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">47</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">
                      <i className="bx bxs-up-arrow fs-10"></i> 3
                    </span>
                    <span className="text-muted ms-1 fs-11">New This Week</span>
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
                      <i className="bx bx-trending-up avatar-title text-info fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Revenue</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">$1.2M</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">
                      <i className="bx bxs-up-arrow fs-10"></i> 8.2%
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
                    <div className="avatar-sm bg-soft-warning rounded">
                      <i className="bx bx-target-lock avatar-title text-warning fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Conversion</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">4.2%</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">
                      <i className="bx bxs-up-arrow fs-10"></i> 0.8%
                    </span>
                    <span className="text-muted ms-1 fs-11">vs Last Month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                  <h4 className="card-title">Top Selling Products</h4>
                  <div className="d-flex gap-2">
                    <select className="form-select form-select-sm">
                      <option>All Categories</option>
                      <option>Electronics</option>
                      <option>Clothing</option>
                      <option>Home & Garden</option>
                    </select>
                    <select className="form-select form-select-sm">
                      <option>Last 30 Days</option>
                      <option>Last 7 Days</option>
                      <option>Last 90 Days</option>
                    </select>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Sales</th>
                        <th>Revenue</th>
                        <th>Growth</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSellingProducts.map((product) => (
                        <tr key={product.id}>
                          <td><span className={`badge ${product.rankColor}`}>#{product.rank}</span></td>
                          <td>
                            <div className="d-flex align-items-center">
                              <img src={product.image} alt="Product" className="avatar-sm me-3" />
                              <div>
                                <h6 className="mb-0">{product.name}</h6>
                                <small className="text-muted">{product.description}</small>
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge ${product.categoryColor}`}>{product.category}</span></td>
                          <td>{product.sales.toLocaleString()}</td>
                          <td>{product.revenue}</td>
                          <td><span className="text-success">{product.growth}</span></td>
                          <td><span className={`badge ${product.statusColor}`}>{product.status}</span></td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary me-1">
                              <i className="bx bx-edit"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-info">
                              <i className="bx bx-show"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title">Featured Products</h4>
                  <button 
                    className="btn btn-sm btn-outline-primary" 
                    onClick={() => window.location.href = '/featured-products'}
                  >
                    See More
                  </button>
                </div>
                <div className="row">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="col-md-3 mb-3">
                      <div className="card border">
                        <img src={product.image} className="card-img-top" alt="Product" />
                        <div className="card-body">
                          <h6 className="card-title">{product.name}</h6>
                          <p className="card-text text-muted">{product.description}</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-success fw-bold">{product.price}</span>
                            <button className="btn btn-sm btn-primary">Feature</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
