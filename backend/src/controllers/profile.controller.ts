import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, CustomerAddress } from '../repositories/in-memory-store';
import { sendSuccess, sendError } from '../utils/response';

export class ProfileController {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const profile = inMemoryStore.profiles.find((p) => p.id === req.user?.id);
      return sendSuccess(res, profile);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const profile = inMemoryStore.profiles.find((p) => p.id === req.user?.id);
      if (!profile) return sendError(res, 'Profile not found', 404);

      Object.assign(profile, req.body, { updated_at: new Date().toISOString() });
      return sendSuccess(res, profile, 'Profile updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getAddresses(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const addresses = inMemoryStore.customer_addresses.filter((a) => a.profile_id === req.user?.id);
      return sendSuccess(res, addresses);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async createAddress(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const now = new Date().toISOString();

      if (req.body.is_default) {
        inMemoryStore.customer_addresses
          .filter((a) => a.profile_id === req.user?.id)
          .forEach((a) => {
            a.is_default = false;
          });
      }

      const newAddress: CustomerAddress = {
        id: uuidv4(),
        profile_id: req.user.id,
        ...req.body,
        created_at: now,
        updated_at: now,
      };

      inMemoryStore.customer_addresses.push(newAddress);
      return sendSuccess(res, newAddress, 'Address saved successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const address = inMemoryStore.customer_addresses.find(
        (a) => a.id === req.params.id && a.profile_id === req.user?.id
      );
      if (!address) return sendError(res, 'Address not found', 404);

      if (req.body.is_default) {
        inMemoryStore.customer_addresses
          .filter((a) => a.profile_id === req.user?.id)
          .forEach((a) => {
            a.is_default = false;
          });
      }

      Object.assign(address, req.body, { updated_at: new Date().toISOString() });
      return sendSuccess(res, address, 'Address updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async deleteAddress(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Authentication required', 401);
      const index = inMemoryStore.customer_addresses.findIndex(
        (a) => a.id === req.params.id && a.profile_id === req.user?.id
      );
      if (index === -1) return sendError(res, 'Address not found', 404);

      inMemoryStore.customer_addresses.splice(index, 1);
      return sendSuccess(res, { id: req.params.id }, 'Address deleted');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const profileController = new ProfileController();
