'use client';

import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { formatCurrencyNoDecimals, formatCurrency } from '@/utils/currencyHelper';

export default function DashboardSales() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    todaySales: 0,
    weeklySales: 0,
    monthlySales: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Using existing dashboard stats endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSalesData({
          totalSales: data.data.totalRevenue || 0,
          todaySales: 0, // TODO: Add this to backend
          weeklySales: 0, // TODO: Add this to backend
          monthlySales: data.data.totalRevenue || 0,
          totalOrders: data.data.totalOrders || 0,
          averageOrderValue: data.data.totalOrders > 0 
            ? data.data.totalRevenue / data.data.totalOrders 
            : 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Sales Dashboard">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading sales data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Sales Dashboard">
      <div className="row">
        {/* Total Sales */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Total Sales</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {formatCurrencyNoDecimals(salesData.totalSales)}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-primary-subtle rounded fs-3">
                      <i className="mdi mdi-chart-areaspline text-primary"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Today's Sales</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {formatCurrencyNoDecimals(salesData.todaySales)}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-success-subtle rounded fs-3">
                      <i className="mdi mdi-calendar-today text-success"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Total Orders</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {salesData.totalOrders.toLocaleString()}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-info-subtle rounded fs-3">
                      <i className="mdi mdi-shopping text-info"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Avg. Order Value</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {formatCurrency(salesData.averageOrderValue)}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-warning-subtle rounded fs-3">
                      <i className="mdi mdi-cart-outline text-warning"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Sales Overview</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <i className="mdi mdi-trending-up" style={{ fontSize: '5rem', color: '#0dcaf0', opacity: 0.3 }}></i>
                <h5 className="mt-4 text-muted">Sales Trends</h5>
                <p className="text-muted mb-0">Track daily, weekly, and monthly sales performance</p>
                <small className="text-muted">Showing data from {salesData.totalOrders} orders</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Top Selling Products</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-4" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <i className="mdi mdi-trophy-variant" style={{ fontSize: '3rem', color: '#fd7e14', opacity: 0.3 }}></i>
                <p className="text-muted mt-3 mb-0">Best Sellers</p>
                <small className="text-muted">Top performing products</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

