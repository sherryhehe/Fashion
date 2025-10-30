import apiClient from './client';
import { ApiResponse } from '@/types';

export interface Banner {
	id?: string;
	title: string;
	subtitle?: string;
	imageUrl: string;
	linkUrl?: string;
	position: 'header' | 'sidebar' | 'footer' | 'homepage';
	size?: string;
	status: 'active' | 'inactive' | 'draft';
	clicks?: number;
	ctr?: number;
	createdAt?: string;
	updatedAt?: string;
}

export const bannersApi = {
	list(params?: { position?: string; status?: string }) {
		return apiClient.get<Banner[]>('/banners', params);
	},
	get(id: string) {
		return apiClient.get<Banner>(`/banners/${id}`);
	},
	create(payload: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>) {
		return apiClient.post<Banner>('/banners', payload);
	},
	update(id: string, payload: Partial<Banner>) {
		return apiClient.put<Banner>(`/banners/${id}`);
	},
	remove(id: string) {
		return apiClient.delete<Banner>(`/banners/${id}`);
	},
};
