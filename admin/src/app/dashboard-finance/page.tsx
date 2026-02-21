'use client';

import Layout from '@/components/layout/Layout';
import { formatCurrencyNoDecimals } from '@/utils/currencyHelper';
import { getApiUrl } from '@/utils/apiHelper';
import { useState, useEffect } from 'react';

export default function DashboardFinance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    profit: 0,
    expenses: 0,
    profitMargin: 0,
    growthRate: 0
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/dashboard/finance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success && data.data) {
        setFinancialData(data.data);
      } else {
        setError(data.error || data.message || 'Failed to load financial data');
      }
    } catch (err) {
      setError('Could not load financial data. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Finance Dashboard">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading financial data...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle="Finance Dashboard">
        <div className="alert alert-danger mx-3 mt-3" role="alert">
          <strong>Error:</strong> {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Finance Dashboard">
      <div className="row">
        {/* Revenue Card */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Total Revenue</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {formatCurrencyNoDecimals(financialData.totalRevenue)}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-primary-subtle rounded fs-3">
                      <i className="mdi mdi-currency-usd text-primary"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Card */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Monthly Revenue</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {formatCurrencyNoDecimals(financialData.monthlyRevenue)}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-success-subtle rounded fs-3">
                      <i className="mdi mdi-calendar-month text-success"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profit Card */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Total Profit</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {formatCurrencyNoDecimals(financialData.profit)}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-info-subtle rounded fs-3">
                      <i className="mdi mdi-chart-line text-info"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Total Expenses</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {formatCurrencyNoDecimals(financialData.expenses)}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-danger-subtle rounded fs-3">
                      <i className="mdi mdi-cash-minus text-danger"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Financial Overview</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <i className="mdi mdi-chart-line-variant" style={{ fontSize: '5rem', color: '#198754', opacity: 0.3 }}></i>
                <h5 className="mt-4 text-muted">Revenue Trends</h5>
                <p className="text-muted mb-0">Financial performance visualization</p>
                <small className="text-muted">Track revenue, profit, and expenses over time</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Recent Transactions</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-4" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <i className="mdi mdi-receipt-text" style={{ fontSize: '3rem', color: '#6f42c1', opacity: 0.3 }}></i>
                <p className="text-muted mt-3 mb-0">Transaction History</p>
                <small className="text-muted">Recent financial transactions</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

