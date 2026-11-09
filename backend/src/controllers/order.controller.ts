import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import { sendSuccess, sendError } from '../utils/response';

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required to place an order', 401);
      }

      const order = await orderService.createOrder({
        customerId: req.user.id,
        categoryId: req.body.category_id,
        deliveryDate: req.body.delivery_date,
        deliverySlot: req.body.delivery_slot,
        addressId: req.body.address_id,
        deliveryAddress: req.body.delivery_address,
        items: req.body.items,
        paymentMethod: req.body.payment_method,
        specialInstructions: req.body.special_instructions,
        whatsappOptIn: req.body.whatsapp_opt_in,
      });

      return sendSuccess(res, order, 'Order confirmed and placed successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getCustomerOrders(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Authentication required', 401);
      }
      const orders = await orderService.getCustomerOrders(req.user.id);
      return sendSuccess(res, orders);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getAdminOrders(req: Request, res: Response) {
    try {
      const { status, delivery_date, search } = req.query;
      const orders = await orderService.getAllOrders({
        status: status as string,
        delivery_date: delivery_date as string,
        search: search as string,
      });
      return sendSuccess(res, orders);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) {
        return sendError(res, 'Order not found', 404);
      }
      // Check customer ownership
      if (req.user?.role !== 'admin' && req.user?.id !== order.customer_id) {
        return sendError(res, 'Access forbidden', 403);
      }
      return sendSuccess(res, order);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  async updateOrderStatus(req: Request, res: Response) {
    try {
      const { status, payment_status, note } = req.body;
      const updated = await orderService.updateOrderStatus(
        req.params.id,
        status,
        payment_status,
        note,
        req.user?.id
      );
      return sendSuccess(res, updated, `Order status changed to ${status}`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const orderController = new OrderController();
