import { Request, Response } from 'express';
import PaymentMethod from '../models/PaymentMethod';
import { successResponse, errorResponse } from '../utils/responseHelper';

export const getAllPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const methods = await PaymentMethod.find().sort({ createdAt: -1 }).lean();
    successResponse(res, methods);
  } catch (error) {
    errorResponse(res, 'Failed to fetch payment methods', 500);
  }
};

export const getPaymentMethodById = async (req: Request, res: Response): Promise<void> => {
  try {
    const method = await PaymentMethod.findById(req.params.id).lean();
    if (!method) { errorResponse(res, 'Payment method not found', 404); return; }
    successResponse(res, method);
  } catch (error) {
    errorResponse(res, 'Failed to fetch payment method', 500);
  }
};

export const createPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, instructions, isActive } = req.body;
    if (!name?.trim()) { errorResponse(res, 'Name is required', 400); return; }
    if (!instructions?.trim()) { errorResponse(res, 'Instructions are required', 400); return; }

    const method = await PaymentMethod.create({ name: name.trim(), instructions: instructions.trim(), isActive: isActive !== false });
    successResponse(res, method, 'Payment method created', 201);
  } catch (error) {
    errorResponse(res, 'Failed to create payment method', 500);
  }
};

export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, instructions, isActive } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = name.trim();
    if (instructions !== undefined) update.instructions = instructions.trim();
    if (isActive !== undefined) update.isActive = isActive;

    const method = await PaymentMethod.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!method) { errorResponse(res, 'Payment method not found', 404); return; }
    successResponse(res, method, 'Payment method updated');
  } catch (error) {
    errorResponse(res, 'Failed to update payment method', 500);
  }
};

export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const method = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!method) { errorResponse(res, 'Payment method not found', 404); return; }
    successResponse(res, null, 'Payment method deleted');
  } catch (error) {
    errorResponse(res, 'Failed to delete payment method', 500);
  }
};
