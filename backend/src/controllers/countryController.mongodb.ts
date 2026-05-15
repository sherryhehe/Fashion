import { Request, Response } from 'express';
import Country from '../models/Country';
import { successResponse, errorResponse } from '../utils/responseHelper';

export const getAllCountries = async (req: Request, res: Response): Promise<void> => {
  try {
    const countries = await Country.find().sort({ name: 1 }).lean();
    successResponse(res, countries);
  } catch (error) {
    errorResponse(res, 'Failed to fetch countries', 500);
  }
};

export const addCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name } = req.body;
    if (!code?.trim()) { errorResponse(res, 'Code is required', 400); return; }
    if (!name?.trim()) { errorResponse(res, 'Name is required', 400); return; }

    const existing = await Country.findOne({ code: code.trim().toUpperCase() });
    if (existing) { errorResponse(res, 'Country with this code already exists', 400); return; }

    const country = await Country.create({ code: code.trim().toUpperCase(), name: name.trim() });
    successResponse(res, country, 'Country added', 201);
  } catch (error) {
    errorResponse(res, 'Failed to add country', 500);
  }
};

export const updateCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { name, isActive } = req.body;
    const update: any = {};
    if (name !== undefined) update.name = name.trim();
    if (isActive !== undefined) update.isActive = isActive;

    const country = await Country.findOneAndUpdate({ code: code.toUpperCase() }, { $set: update }, { new: true, runValidators: true });
    if (!country) { errorResponse(res, 'Country not found', 404); return; }
    successResponse(res, country, 'Country updated');
  } catch (error) {
    errorResponse(res, 'Failed to update country', 500);
  }
};

export const removeCountry = async (req: Request, res: Response): Promise<void> => {
  try {
    const country = await Country.findOneAndDelete({ code: req.params.code.toUpperCase() });
    if (!country) { errorResponse(res, 'Country not found', 404); return; }
    successResponse(res, null, 'Country removed');
  } catch (error) {
    errorResponse(res, 'Failed to remove country', 500);
  }
};
