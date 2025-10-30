'use client';

import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { bannersApi, type Banner } from '@/lib/api/banners';

export default function BannerControl() {
	const [banners, setBanners] = useState<Banner[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const abort = new AbortController();
		(async () => {
			try {
				setLoading(true);
				const res = await bannersApi.list(undefined);
				setBanners(res.data || []);
			} catch (e: any) {
				setError(e?.message || 'Failed to load banners');
			} finally {
				setLoading(false);
			}
		})();
		return () => abort.abort();
	}, []);

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
										<select className="form-select form-select-sm" disabled>
											<option>All Positions</option>
										</select>
										<select className="form-select form-select-sm" disabled>
											<option>All Status</option>
										</select>
										<Link href="#" className="btn btn-sm btn-primary text-nowrap disabled" aria-disabled="true" style={{ minWidth: '130px' }}>
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
												<th>Size</th>
												<th>Clicks</th>
												<th>CTR</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{loading && (
												<tr><td colSpan={8}>Loading...</td></tr>
											)}
											{error && !loading && (
												<tr><td colSpan={8} className="text-danger">{error}</td></tr>
											)}
											{!loading && !error && banners.length === 0 && (
												<tr><td colSpan={8}>No banners found.</td></tr>
											)}
											{!loading && !error && banners.map((b) => (
												<tr key={b.id}>
													<td>
														{b.imageUrl ? (
															<img src={b.imageUrl} alt={b.title} className="avatar-sm rounded" />
														) : (
															<span className="text-muted">No image</span>
														)}
													</td>
													<td>
														<div>
															<h6 className="mb-0">{b.title}</h6>
															<small className="text-muted">{b.subtitle || ''}</small>
														</div>
													</td>
													<td><span className="badge bg-primary">{b.position}</span></td>
													<td><span className="badge bg-info">{b.size || '-'}</span></td>
													<td><span className="text-primary fw-semibold">{b.clicks || 0}</span></td>
													<td><span className="text-success fw-semibold">{(b.ctr || 0).toFixed(2)}%</span></td>
													<td>
														<span className={`badge ${b.status === 'active' ? 'bg-success' : b.status === 'inactive' ? 'bg-secondary' : 'bg-info'}`}>{b.status}</span>
													</td>
													<td>
														<button className="btn btn-sm btn-outline-primary me-1" disabled>
															<i className="bx bx-edit"></i>
														</button>
														<button className="btn btn-sm btn-outline-danger" disabled>
															<i className="bx bx-trash"></i>
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
			</div>
		</Layout>
	);
}
