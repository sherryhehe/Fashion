'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useHomeCategories, useDeleteHomeCategory } from '@/hooks/useApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import ConfirmDialog from '@/components/organisms/ConfirmDialog';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { InteractiveButton } from '@/components';

export default function HomeCategoriesList() {
  const { addNotification } = useNotificationContext();
  const { data: categories = [], isLoading } = useHomeCategories();
  const deleteCategory = useDeleteHomeCategory();
  const { dialog, showConfirm, handleCancel, handleConfirm } = useConfirmDialog();

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Home Category',
      message: `Are you sure you want to delete "${name}"? This will remove it from the homepage.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await deleteCategory.mutateAsync(id);
      addNotification('success', 'Home category deleted');
    } catch (e: any) {
      addNotification('error', e?.message || 'Failed to delete');
    }
  };

  return (
    <Layout pageTitle="Home Categories">
      <div className="container-fluid">
        <div className="row mb-3">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Home Categories</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="header-title">Custom Home Categories {isLoading && <span className="spinner-border spinner-border-sm ms-2" />}</h4>
                <Link href="/home-category-add">
                  <InteractiveButton variant="primary">
                    <i className="mdi mdi-plus me-1" /> Add Home Category
                  </InteractiveButton>
                </Link>
              </div>
              <div className="card-body">
                <p className="text-muted">These sections appear on the app homepage below Featured. Reorder by changing the Order value.</p>
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading...</p>
                  </div>
                ) : !Array.isArray(categories) || categories.length === 0 ? (
                  <div className="text-center py-5">
                    <h5>No home categories yet</h5>
                    <p className="text-muted">Add custom sections (e.g. &quot;Summer Picks&quot;) to show below Featured on the app.</p>
                    <Link href="/home-category-add">
                      <InteractiveButton variant="primary">Add Home Category</InteractiveButton>
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Name</th>
                          <th>Slug</th>
                          <th>Products</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat: any) => (
                          <tr key={cat._id || cat.id}>
                            <td>{cat.order ?? 0}</td>
                            <td>{cat.name}</td>
                            <td><code>{cat.slug || '-'}</code></td>
                            <td>{(cat.productIds && cat.productIds.length) || 0}</td>
                            <td>
                              <span className={`badge ${cat.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                {cat.status || 'inactive'}
                              </span>
                            </td>
                            <td>
                              <Link href={`/home-category-edit?id=${cat._id || cat.id}`} className="btn btn-sm btn-outline-primary me-1">Edit</Link>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(cat._id || cat.id, cat.name)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        variant={dialog.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Layout>
  );
}
