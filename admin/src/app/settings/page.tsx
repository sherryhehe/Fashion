'use client';

import Layout from '@/components/layout/Layout';

export default function Settings() {
  return (
    <Layout pageTitle="Settings">
      <div className="container-fluid">
        {/* Settings Management */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">General Settings</h4>
                <form>
                  <div className="mb-3">
                    <label className="form-label">Site Name</label>
                    <input type="text" className="form-control" defaultValue="Shopo Admin Dashboard" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Site Description</label>
                    <textarea className="form-control" rows="3" defaultValue="A fully responsive premium admin dashboard template"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Admin Email</label>
                    <input type="email" className="form-control" defaultValue="admin@shopo.com" />
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
        </div>
      </div>
    </Layout>
  );
}