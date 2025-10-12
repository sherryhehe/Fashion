'use client';

import { Layout, InteractiveTable, InteractiveButton } from '@/components';
import { useNotification } from '@/hooks/useInteractive';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { notificationsApi } from '@/lib/api';

export default function NotificationList() {
  const { addNotification } = useNotification();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [statusFilter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await notificationsApi.getAll(params);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      addNotification('Failed to load notifications', 'error');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notificationsApi.delete(id);
      addNotification('Notification deleted successfully', 'success');
      fetchNotifications();
    } catch (error) {
      addNotification('Failed to delete notification', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value: string, row: any) => (
        <div>
          <div className="fw-medium text-dark">{value}</div>
          <small className="text-muted">{row.message?.substring(0, 60)}...</small>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => {
        const typeIcons: any = {
          discount: '💰',
          sale: '🏷️',
          new_product: '🆕',
          order_update: '📦',
          general: '📢'
        };
        return (
          <span className="badge bg-primary">
            {typeIcons[value]} {value.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      key: 'targetAudience',
      label: 'Target',
      render: (value: string, row: any) => (
        <div>
          <span className="badge bg-info">
            {value === 'all' ? '👥 All Users' : '🎯 Specific'}
          </span>
          {row.targetSegment && (
            <div><small className="text-muted">{row.targetSegment}</small></div>
          )}
        </div>
      )
    },
    {
      key: 'sentCount',
      label: 'Sent',
      render: (value: number) => (
        <span className="badge bg-success">
          {value || 0}
        </span>
      )
    },
    {
      key: 'viewedCount',
      label: 'Viewed',
      render: (value: number, row: any) => {
        const rate = row.sentCount > 0 ? ((value / row.sentCount) * 100).toFixed(0) : 0;
        return (
          <div>
            <span className="badge bg-info">{value || 0}</span>
            <div><small className="text-muted">{rate}%</small></div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: any = {
          draft: 'bg-secondary',
          scheduled: 'bg-warning',
          sent: 'bg-success',
          failed: 'bg-danger'
        };
        return (
          <span className={`badge ${statusColors[value] || 'bg-secondary'}`}>
            {value || 'draft'}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const handleEdit = (notification: any) => {
    // Only draft notifications can be edited
    if (notification.status === 'draft') {
      window.location.href = `/notification-edit?id=${notification._id || notification.id}`;
    } else {
      addNotification('Only draft notifications can be edited', 'warning');
    }
  };

  const handleDeleteAction = async (notification: any) => {
    await handleDelete(notification._id || notification.id);
  };

  return (
    <Layout pageTitle="Notifications">
      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="header-title">All Notifications {loading && <span className="spinner-border spinner-border-sm ms-2"></span>}</h4>
              <Link href="/notification-create">
                <InteractiveButton variant="primary">
                  <i className="mdi mdi-plus me-1"></i>
                  Create Notification
                </InteractiveButton>
              </Link>
            </div>

            <div className="card-body">
              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="discount">Discount</option>
                    <option value="sale">Sale</option>
                    <option value="new_product">New Product</option>
                    <option value="order_update">Order Update</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              {/* Notifications Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading notifications from MongoDB...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-5">
                  <i className="mdi mdi-bell-outline" style={{ fontSize: '64px', color: '#ccc' }}></i>
                  <h5 className="mt-3">No Notifications Yet</h5>
                  <p className="text-muted">
                    Create notifications to engage with your mobile app users.<br/>
                    Send discounts, sales alerts, and product updates!
                  </p>
                  <Link href="/notification-create">
                    <InteractiveButton variant="primary">
                      <i className="mdi mdi-plus me-1"></i>
                      Create Your First Notification
                    </InteractiveButton>
                  </Link>
                </div>
              ) : (
                <InteractiveTable
                  data={notifications}
                  columns={columns}
                  onEdit={handleEdit}
                  onDelete={handleDeleteAction}
                  itemsPerPage={10}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
