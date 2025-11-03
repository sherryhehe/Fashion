'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bannersApi, type Banner } from '@/lib/api/banners';
import { useDeleteBanner } from '@/hooks/useApi';

export default function BannerControl() {
	const router = useRouter();
	const deleteBanner = useDeleteBanner();
	const [banners, setBanners] = useState<Banner[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [positionFilter, setPositionFilter] = useState<string>('all');
	const [statusFilter, setStatusFilter] = useState<string>('all');

	const fetchBanners = async () => {
		try {
			setLoading(true);
			const params: { position?: string; status?: string } = {};
			if (positionFilter !== 'all') params.position = positionFilter;
			if (statusFilter !== 'all') params.status = statusFilter;
			
			const res = await bannersApi.list(Object.keys(params).length > 0 ? params : undefined);
			setBanners(res.data || []);
			setError(null);
		} catch (e: any) {
			setError(e?.message || 'Failed to load banners');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchBanners();
	}, [positionFilter, statusFilter]);

	const handleDelete = async (id: string, title: string) => {
		if (!confirm(`Are you sure you want to delete the banner "${title}"?`)) {
			return;
		}

		try {
			await deleteBanner.mutateAsync(id);
			fetchBanners(); // Refresh list
		} catch (error: any) {
			alert(error.message || 'Failed to delete banner');
		}
	};

	const totalBanners = banners.length;
	const activeBanners = banners.filter(b => b.status === 'active').length;
	const totalClicks = banners.reduce((sum, b) => sum + (b.clicks || 0), 0);
	const avgCtr = banners.length ? (banners.reduce((sum, b) => sum + (b.ctr || 0), 0) / banners.length) : 0;

	return (
		<Layout pageTitle="Banner Control Management">
			<div className="container-fluid">
				{/* Metrics */}
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
										<h4 className="text-dark mt-1 mb-0 fs-18">{totalBanners}</h4>
									</div>
								</div>
							</div>
							<div className="card-footer py-2 bg-light bg-opacity-50"></div>
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
										<h4 className="text-dark mt-1 mb-0 fs-18">{activeBanners}</h4>
									</div>
								</div>
							</div>
							<div className="card-footer py-2 bg-light bg-opacity-50"></div>
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
										<h4 className="text-dark mt-1 mb-0 fs-18">{totalClicks}</h4>
									</div>
								</div>
							</div>
							<div className="card-footer py-2 bg-light bg-opacity-50"></div>
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
										<p className="text-muted mb-0 text-truncate fs-12">Avg CTR</p>
										<h4 className="text-dark mt-1 mb-0 fs-18">{avgCtr.toFixed(2)}%</h4>
									</div>
								</div>
							</div>
							<div className="card-footer py-2 bg-light bg-opacity-50"></div>
						</div>
					</div>
				</div>

				{/* Banner list */}
				<div className="row">
					<div className="col-12">
						<div className="card">
							<div className="card-body">
								<div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
									<h4 className="card-title">Banner Control Management</h4>
									<div className="d-flex gap-2">
										<select 
											className="form-select form-select-sm" 
											value={positionFilter}
											onChange={(e) => setPositionFilter(e.target.value)}
											style={{ minWidth: '150px' }}
										>
											<option value="all">All Positions</option>
											<option value="homepage">Homepage</option>
											<option value="header">Header</option>
											<option value="sidebar">Sidebar</option>
											<option value="footer">Footer</option>
										</select>
										<select 
											className="form-select form-select-sm" 
											value={statusFilter}
											onChange={(e) => setStatusFilter(e.target.value)}
											style={{ minWidth: '130px' }}
										>
											<option value="all">All Status</option>
											<option value="active">Active</option>
											<option value="inactive">Inactive</option>
											<option value="draft">Draft</option>
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
												<th>Clicks</th>
												<th>CTR</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{loading && (
												<tr><td colSpan={7}>Loading...</td></tr>
											)}
											{error && !loading && (
												<tr><td colSpan={7} className="text-danger">{error}</td></tr>
											)}
											{!loading && !error && banners.length === 0 && (
												<tr><td colSpan={7}>No banners found.</td></tr>
											)}
											{!loading && !error && banners.map((b) => {
												const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
												const placeholderImage = '/assets/images/products/product-1.png';
												
												let imageUrl = placeholderImage;
												if (b.imageUrl) {
													if (b.imageUrl.startsWith('http')) {
														imageUrl = b.imageUrl;
													} else if (b.imageUrl.startsWith('/uploads/')) {
														imageUrl = `${API_URL}${b.imageUrl}`;
													}
												}
												
												return (
												<tr 
													key={b.id}
													style={{ cursor: 'pointer' }}
													onClick={() => router.push(`/banner-details?id=${b.id}`)}
												>
													<td onClick={(e) => e.stopPropagation()}>
														{b.imageUrl ? (
															<img 
																src={imageUrl} 
																alt={b.title} 
																className="avatar-sm rounded"
																style={{ cursor: 'pointer' }}
																onError={(e) => {
																	(e.target as HTMLImageElement).src = placeholderImage;
																}}
															/>
														) : (
															<span className="text-muted">No image</span>
														)}
													</td>
													<td>
														<div>
															<h6 className="mb-0" style={{ cursor: 'pointer' }}>{b.title}</h6>
															<small className="text-muted">{b.subtitle || ''}</small>
														</div>
													</td>
													<td><span className="badge bg-primary">{b.position}</span></td>
													<td><span className="text-primary fw-semibold">{b.clicks || 0}</span></td>
													<td><span className="text-success fw-semibold">{(b.ctr || 0).toFixed(2)}%</span></td>
													<td>
														<span className={`badge ${b.status === 'active' ? 'bg-success' : b.status === 'inactive' ? 'bg-secondary' : 'bg-info'}`}>{b.status}</span>
													</td>
													<td onClick={(e) => e.stopPropagation()}>
														<Link 
															href={`/banner-edit?id=${b.id}`}
															className="btn btn-sm btn-outline-primary me-1"
															title="Edit banner"
														>
															<i className="bx bx-edit"></i>
														</Link>
														<button 
															className="btn btn-sm btn-outline-danger"
															onClick={(e) => {
																e.stopPropagation();
																handleDelete(b.id!, b.title);
															}}
															disabled={deleteBanner.isPending}
															title="Delete banner"
														>
															{deleteBanner.isPending ? (
																<span className="spinner-border spinner-border-sm" style={{ width: '1rem', height: '1rem' }}></span>
															) : (
																<i className="bx bx-trash"></i>
															)}
														</button>
													</td>
												</tr>
												);
											})}
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
