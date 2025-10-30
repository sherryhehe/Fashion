/**
 * API Service Layer - Central export point
 * 
 * This module provides a centralized API client with organized endpoints
 * for all backend communication.
 */

export { default as apiClient } from './client';
export * from './products';
export * from './orders';
export * from './customers';
export * from './categories';
export * from './styles';
export * from './dashboard';
export * from './brands';
export * from './notifications';
export { bannersApi } from './banners';

