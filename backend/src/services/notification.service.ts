import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, NotificationOutbox, Order, Subscription } from '../repositories/in-memory-store';
import { whatsAppClient } from '../integrations/whatsapp/whatsapp-client';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class NotificationService {
  /**
   * Queue notification in outbox
   */
  queueNotification(params: {
    recipient_phone: string;
    recipient_type: 'customer' | 'admin';
    event_type: string;
    template_name: string;
    template_params: any;
    reference_id?: string;
  }): NotificationOutbox {
    const entry: NotificationOutbox = {
      id: uuidv4(),
      recipient_phone: params.recipient_phone,
      recipient_type: params.recipient_type,
      event_type: params.event_type,
      template_name: params.template_name,
      template_params: params.template_params,
      reference_id: params.reference_id,
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      next_retry_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    inMemoryStore.notification_outbox.push(entry);
    logger.info(`Queued WhatsApp outbox entry [${entry.id}] for ${entry.recipient_phone} (${entry.event_type})`);

    // Process asynchronously without waiting
    setImmediate(() => {
      this.processOutboxItem(entry.id).catch((err) => {
        logger.error(`Error processing immediate outbox notification ${entry.id}:`, err);
      });
    });

    return entry;
  }

  /**
   * Send Order Confirmation Notifications to both Customer and Admin
   */
  notifyOrderCreated(order: Order): void {
    const customerPhone = order.address_snapshot?.phone_number || '';
    const customerName = order.address_snapshot?.customer_name || 'Customer';
    const itemsSummary = (order.items || [])
      .map((item) => `${item.food_name} x ${item.quantity}`)
      .join(', ');
    const formattedAmount = `₹${(order.total_amount / 100).toFixed(2)}`;

    // 1. Customer Notification
    if (customerPhone) {
      this.queueNotification({
        recipient_phone: customerPhone,
        recipient_type: 'customer',
        event_type: 'order_confirmed',
        template_name: 'homekitchen_order_confirmed',
        reference_id: order.id,
        template_params: {
          customer_name: customerName,
          order_id: order.order_number,
          food_items: itemsSummary,
          delivery_date: order.delivery_date,
          delivery_slot: order.delivery_slot,
          total_amount: formattedAmount,
          payment_status: order.payment_status.toUpperCase(),
          order_status: order.order_status.toUpperCase(),
          textFallback: `Namaste ${customerName}! Your HOME KITCHEN order ${order.order_number} is confirmed! Dishes: ${itemsSummary}. Scheduled for ${order.delivery_date} (${order.delivery_slot}). Total: ${formattedAmount} (${order.payment_method.toUpperCase()}).`,
        },
      });
    }

    // 2. Admin Notification
    const adminNumber = config.whatsapp.adminNumber;
    if (adminNumber) {
      this.queueNotification({
        recipient_phone: adminNumber,
        recipient_type: 'admin',
        event_type: 'admin_new_order_alert',
        template_name: 'homekitchen_admin_new_order',
        reference_id: order.id,
        template_params: {
          order_id: order.order_number,
          customer_name: customerName,
          mobile_number: customerPhone,
          food_items: itemsSummary,
          delivery_address: `${order.address_snapshot?.address_line1}, ${order.address_snapshot?.city} - ${order.address_snapshot?.pincode}`,
          delivery_schedule: `${order.delivery_date} (${order.delivery_slot})`,
          total_amount: formattedAmount,
          textFallback: `[KITCHEN ALERT] New Order Received! Order #${order.order_number} by ${customerName} (${customerPhone}). Items: ${itemsSummary}. Delivery: ${order.delivery_date} ${order.delivery_slot}. Total: ${formattedAmount}.`,
        },
      });
    }
  }

  /**
   * Notify Status Change (out_for_delivery, delivered, cancelled)
   */
  notifyOrderStatusChanged(order: Order, oldStatus: string, newStatus: string): void {
    const customerPhone = order.address_snapshot?.phone_number;
    if (!customerPhone) return;

    const customerName = order.address_snapshot?.customer_name || 'Customer';
    const formattedAmount = `₹${(order.total_amount / 100).toFixed(2)}`;

    let message = '';
    if (newStatus === 'out_for_delivery') {
      message = `Hello ${customerName}, your delicious HOME KITCHEN meal for Order #${order.order_number} is freshly packed and Out for Delivery! Keep your appetite ready.`;
    } else if (newStatus === 'delivered') {
      message = `Delivered! Order #${order.order_number} has arrived warm at your doorstep. We hope you relish every bite. Thank you for choosing HOME KITCHEN!`;
    } else if (newStatus === 'cancelled') {
      message = `Notice: Your HOME KITCHEN Order #${order.order_number} has been cancelled. If any advance service charges were collected, they will be promptly settled.`;
    }

    this.queueNotification({
      recipient_phone: customerPhone,
      recipient_type: 'customer',
      event_type: `order_${newStatus}`,
      template_name: `homekitchen_order_${newStatus}`,
      reference_id: order.id,
      template_params: {
        customer_name: customerName,
        order_id: order.order_number,
        new_status: newStatus.toUpperCase(),
        total_amount: formattedAmount,
        textFallback: message,
      },
    });
  }

  /**
   * Notify Subscription Activation
   */
  notifySubscriptionActivated(subscription: Subscription, planName: string): void {
    const customerPhone = subscription.address_snapshot?.phone_number;
    if (!customerPhone) return;

    const customerName = subscription.address_snapshot?.customer_name || 'Customer';
    const formattedAmount = `₹${(subscription.total_amount / 100).toFixed(2)}`;

    this.queueNotification({
      recipient_phone: customerPhone,
      recipient_type: 'customer',
      event_type: 'subscription_activated',
      template_name: 'homekitchen_subscription_activated',
      reference_id: subscription.id,
      template_params: {
        customer_name: customerName,
        subscription_number: subscription.subscription_number,
        plan_name: planName,
        start_date: subscription.start_date,
        end_date: subscription.end_date,
        total_amount: formattedAmount,
        textFallback: `Welcome to HOME KITCHEN Subscriptions, ${customerName}! Your 7-Day Plan (${planName}) #${subscription.subscription_number} is active from ${subscription.start_date} to ${subscription.end_date}. Fresh home meals will be delivered daily!`,
      },
    });
  }

  /**
   * Process a single outbox item
   */
  async processOutboxItem(outboxId: string): Promise<boolean> {
    const item = inMemoryStore.notification_outbox.find((o) => o.id === outboxId);
    if (!item || item.status === 'sent') return true;

    item.status = 'processing';

    try {
      const res = await whatsAppClient.sendMessage({
        to: item.recipient_phone,
        templateName: item.template_name,
        textFallback: item.template_params?.textFallback,
      });

      item.status = 'sent';
      item.processed_at = new Date().toISOString();

      inMemoryStore.notification_logs.push({
        id: uuidv4(),
        outbox_id: item.id,
        whatsapp_message_id: res.messageId,
        recipient_phone: item.recipient_phone,
        status: 'sent',
        response_payload: res.response,
        created_at: new Date().toISOString(),
      });

      return true;
    } catch (err: any) {
      item.retry_count += 1;
      item.error_message = err.message || 'Dispatch failure';

      if (item.retry_count >= item.max_retries) {
        item.status = 'failed';
      } else {
        item.status = 'pending';
        // Exponential backoff
        const delaySeconds = Math.pow(2, item.retry_count) * 10;
        item.next_retry_at = new Date(Date.now() + delaySeconds * 1000).toISOString();
      }

      inMemoryStore.notification_logs.push({
        id: uuidv4(),
        outbox_id: item.id,
        recipient_phone: item.recipient_phone,
        status: 'failed',
        response_payload: { error: err.message },
        created_at: new Date().toISOString(),
      });

      return false;
    }
  }

  /**
   * Process all pending outbox entries
   */
  async processPendingOutbox(): Promise<number> {
    const now = new Date();
    const pending = inMemoryStore.notification_outbox.filter(
      (item) => item.status === 'pending' && new Date(item.next_retry_at) <= now
    );

    let processedCount = 0;
    for (const item of pending) {
      await this.processOutboxItem(item.id);
      processedCount++;
    }
    return processedCount;
  }
}

export const notificationService = new NotificationService();
