import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscription.service';
import { sendSuccess, sendError } from '../utils/response';

export class SubscriptionController {
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await subscriptionService.getPlans();
      return sendSuccess(res, plans);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async createSubscription(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required to subscribe', 401);
      }

      const subscription = await subscriptionService.createSubscription({
        customerId: req.user.id,
        planId: req.body.plan_id,
        startDate: req.body.start_date,
        addressId: req.body.address_id,
        deliveryAddress: req.body.delivery_address,
        paymentMethod: req.body.payment_method,
        specialNotes: req.body.special_notes,
      });

      return sendSuccess(res, subscription, 'Subscription activated successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getCustomerSubscriptions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }
      const subs = await subscriptionService.getCustomerSubscriptions(req.user.id);
      return sendSuccess(res, subs);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getAdminSubscriptions(req: Request, res: Response) {
    try {
      const subs = await subscriptionService.getAllSubscriptions();
      return sendSuccess(res, subs);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async updateSubscriptionStatus(req: Request, res: Response) {
    try {
      const { status, pause_dates, note } = req.body;
      const updated = await subscriptionService.updateStatus(req.params.id, status, pause_dates, note);
      return sendSuccess(res, updated, `Subscription status updated to ${status}`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const subscriptionController = new SubscriptionController();
