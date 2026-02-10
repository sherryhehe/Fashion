import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const successResponse = (
  res: Response,
  data: any,
  message?: string,
  statusCode: number = 200,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): Response => {
  const response: ApiResponse = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: string,
  statusCode: number = 400
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
  };

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (
  res: Response,
  data: any[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  const response: ApiResponse = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  if (message) {
    response.message = message;
  }

  return res.status(200).json(response);
};

