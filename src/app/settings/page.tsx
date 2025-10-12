'use client';

import Layout from '@/components/layout/Layout';

export default function Settings() {
  return (
    <Layout pageTitle="Settings">
      <div className="container-fluid">
        {/* Settings Overview */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card overflow-hidden metric-card">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="avatar-sm bg-soft-primary rounded">
                      <i className="bx bx-cog avatar-title text-primary fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Active Settings</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">47</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">100%</span>
                    <span className="text-muted ms-1 fs-11">Configured</span>
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
                      <i className="bx bx-shield-check avatar-title text-success fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Security</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">High</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">98%</span>
                    <span className="text-muted ms-1 fs-11">Secure</span>
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
                      <i className="bx bx-bell avatar-title text-info fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Notifications</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">12</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">Active</span>
                    <span className="text-muted ms-1 fs-11">Enabled</span>
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
                      <i className="bx bx-data avatar-title text-warning fs-20"></i>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="text-muted mb-0 text-truncate fs-12">Backups</p>
                    <h4 className="text-dark mt-1 mb-0 fs-18">Daily</h4>
                  </div>
                </div>
              </div>
              <div className="card-footer py-2 bg-light bg-opacity-50">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <span className="text-success fs-11">Last: Today</span>
                    <span className="text-muted ms-1 fs-11">Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Management */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">General Settings</h4>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Site Name</label>
                    <input type="text" className="form-control" defaultValue="Larkon Admin Dashboard" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Site Description</label>
                    <textarea className="form-control" rows="3" defaultValue="A fully responsive premium admin dashboard template"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Admin Email</label>
                    <input type="email" className="form-control" defaultValue="admin@larkon.com" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Timezone</label>
                    <select className="form-select">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (Central European Time)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="maintenance" defaultChecked />
                      <label className="form-check-label" htmlFor="maintenance">
                        Maintenance Mode
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Security Settings</h4>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Password Policy</label>
                    <select className="form-select">
                      <option>Strong (8+ chars, numbers, symbols)</option>
                      <option>Medium (6+ chars, numbers)</option>
                      <option>Basic (4+ chars)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Session Timeout</label>
                    <select className="form-select">
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="twofa" defaultChecked />
                      <label className="form-check-label" htmlFor="twofa">
                        Two-Factor Authentication
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="loginattempts" defaultChecked />
                      <label className="form-check-label" htmlFor="loginattempts">
                        Limit Login Attempts
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="ipwhitelist" />
                      <label className="form-check-label" htmlFor="ipwhitelist">
                        IP Whitelist
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Notification Settings</h4>
                <form>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="emailnotifications" defaultChecked />
                      <label className="form-check-label" htmlFor="emailnotifications">
                        Email Notifications
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="smsnotifications" />
                      <label className="form-check-label" htmlFor="smsnotifications">
                        SMS Notifications
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="pushnotifications" defaultChecked />
                      <label className="form-check-label" htmlFor="pushnotifications">
                        Push Notifications
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Notification Frequency</label>
                    <select className="form-select">
                      <option>Real-time</option>
                      <option>Every 15 minutes</option>
                      <option>Every hour</option>
                      <option>Daily digest</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">System Information</h4>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Version</strong></td>
                        <td>v1.0.0</td>
                      </tr>
                      <tr>
                        <td><strong>Last Updated</strong></td>
                        <td>2024-01-15</td>
                      </tr>
                      <tr>
                        <td><strong>Database</strong></td>
                        <td>MySQL 8.0</td>
                      </tr>
                      <tr>
                        <td><strong>PHP Version</strong></td>
                        <td>8.1.0</td>
                      </tr>
                      <tr>
                        <td><strong>Server</strong></td>
                        <td>Apache 2.4</td>
                      </tr>
                      <tr>
                        <td><strong>Storage Used</strong></td>
                        <td>2.4 GB / 10 GB</td>
                      </tr>
                      <tr>
                        <td><strong>Memory Usage</strong></td>
                        <td>512 MB / 2 GB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <button className="btn btn-outline-primary me-2">
                    <i className="bx bx-download"></i> Export Settings
                  </button>
                  <button className="btn btn-outline-warning">
                    <i className="bx bx-reset"></i> Reset to Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}