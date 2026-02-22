'use client';

import Layout from '@/components/layout/Layout';
import { getApiUrl } from '@/utils/apiHelper';
import { useState, useEffect } from 'react';

export default function DashboardUserLocation() {
  const [loading, setLoading] = useState(true);
  const [locationData, setLocationData] = useState({
    totalUsers: 0,
    countries: [],
    topCities: []
  });

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Using existing users endpoint
      const response = await fetch(`${getApiUrl()}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocationData({
          totalUsers: data.data.length || 0,
          countries: [],
          topCities: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch location data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="User Location Dashboard">
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-2">Loading location data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="User Location Dashboard">
      <div className="row">
        {/* Total Users */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Total Users</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {locationData.totalUsers.toLocaleString()}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-primary-subtle rounded fs-3">
                      <i className="mdi mdi-account-group text-primary"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Countries */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Countries</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {locationData.countries.length}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-success-subtle rounded fs-3">
                      <i className="mdi mdi-earth text-success"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cities */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Cities</p>
                  <h4 className="fs-22 fw-semibold mb-0">
                    {locationData.topCities.length}
                  </h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-info-subtle rounded fs-3">
                      <i className="mdi mdi-map-marker text-info"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Now */}
        <div className="col-md-6 col-xl-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">Active Now</p>
                  <h4 className="fs-22 fw-semibold mb-0">0</h4>
                </div>
                <div className="flex-shrink-0">
                  <div className="avatar-sm">
                    <span className="avatar-title bg-warning-subtle rounded fs-3">
                      <i className="mdi mdi-account-check text-warning"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">User Distribution Map</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-5" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <i className="mdi mdi-map-marker-radius" style={{ fontSize: '5rem', color: '#0d6efd', opacity: 0.3 }}></i>
                <h5 className="mt-4 text-muted">Interactive Map</h5>
                <p className="text-muted mb-0">User geographic distribution visualization</p>
                <small className="text-muted">Enable location services to see user distribution</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Locations */}
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Top Countries</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-4" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <i className="mdi mdi-flag-variant" style={{ fontSize: '3rem', color: '#dc3545', opacity: 0.3 }}></i>
                <p className="text-muted mt-3 mb-0">Geographic Distribution</p>
                <small className="text-muted">By Country</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Top Cities</h4>
            </div>
            <div className="card-body">
              <div className="text-center py-4" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <i className="mdi mdi-city-variant" style={{ fontSize: '3rem', color: '#ffc107', opacity: 0.3 }}></i>
                <p className="text-muted mt-3 mb-0">Geographic Distribution</p>
                <small className="text-muted">By City</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

