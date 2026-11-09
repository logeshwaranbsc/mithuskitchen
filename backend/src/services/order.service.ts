import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, Order, OrderItem, OrderStatusHistory } from '../repositories/in-memory-store';
import { checkMealCutoffPassed, getNowInKolkata, formatDateString } from '../utils/time';
import { notificationService } from './notification.service';
import { logger } from '../utils/logger';

export interface CreateOrderDTO {
  customerId: string;
  categoryId: string;
  deliveryDate: string; // YYYY-MM-DD
  deliverySlot: string;
  addressId?: string;
  deliveryAddress?: {
    customer_name: string;
    phone_number: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    pincode: string;
  };
  items: Array<{
    food_item_id: string;
    quantity: number;
  }>;
  paymentMethod: 'cash_on_delivery' | 'cash_on_service';
  specialInstructions?: string;
  whatsappOptIn?: boolean;
}

export class OrderService {
  /**
   * Place a new meal order with strict cutoff, capacity, and price protection
   */
  async createOrder(dto: CreateOrderDTO): Promise<Order> {
    const now = new Date().toISOString();

    // 1. Validate Category
    const category = inMemoryStore.meal_categories.find((c) => c.id === dto.categoryId);
    if (!category) {
      throw new Error('Selected meal category was not found');
    }
    if (!category.is_enabled) {
      throw new Error(`The ${category.name} meal service is currently disabled.`);
    }

    // 2. Validate Cutoff Rule (Asia/Kolkata, 5 hours advance cutoff)
    const cutoffCheck = checkMealCutoffPassed(
      dto.deliveryDate,
      category.default_delivery_time,
      category.cutoff_hours
    );

    if (cutoffCheck.isCutoffPassed) {
      throw new Error('Ordering is closed for this meal. Please select the next available slot.');
    }

    // 3. Address Snapshot Resolution
    let addressSnapshot: any = null;
    if (dto.addressId) {
      const savedAddress = inMemoryStore.customer_addresses.find((a) => a.id === dto.addressId);
      if (savedAddress) {
        const customer = inMemoryStore.profiles.find((p) => p.id === dto.customerId);
        addressSnapshot = {
          customer_name: customer?.full_name || 'Customer',
          phone_number: customer?.phone_number || '',
          address_line1: savedAddress.address_line1,
          address_line2: savedAddress.address_line2,
          landmark: savedAddress.landmark,
          city: savedAddress.city,
          state: savedAddress.state,
          pincode: savedAddress.pincode,
        };
      }
    }

    if (!addressSnapshot && dto.deliveryAddress) {
      addressSnapshot = { ...dto.deliveryAddress };
    }

    if (!addressSnapshot || !addressSnapshot.address_line1 || !addressSnapshot.pincode) {
      throw new Error('A valid delivery address and pincode are required');
    }

    // 4. Validate Delivery Pincode Serviceability
    const serviceableArea = inMemoryStore.delivery_areas.find(
      (a) => a.pincode === addressSnapshot.pincode && a.is_serviceable
    );
    if (!serviceableArea) {
      throw new Error(`We do not currently deliver to pincode ${addressSnapshot.pincode}. Please choose a serviceable location.`);
    }

    // 5. Kitchen Capacity Check & Reservation
    let capacityRecord = inMemoryStore.meal_capacity.find(
      (c) => c.capacity_date === dto.deliveryDate && c.category_id === category.id
    );

    const defaultMaxCapacity = 60; // From kitchen defaults
    if (!capacityRecord) {
      capacityRecord = {
        id: uuidv4(),
        capacity_date: dto.deliveryDate,
        category_id: category.id,
        max_capacity: defaultMaxCapacity,
        booked_orders: 0,
        created_at: now,
        updated_at: now,
      };
      inMemoryStore.meal_capacity.push(capacityRecord);
    }

    if (capacityRecord.booked_orders >= capacityRecord.max_capacity) {
      throw new Error('Kitchen capacity is full for this meal slot. Please choose another meal or date.');
    }

    // 6. Price Protection & Item Snapshotting
    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    const orderId = uuidv4();

    for (const itemDto of dto.items) {
      const food = inMemoryStore.food_items.find((f) => f.id === itemDto.food_item_id);
      if (!food) {
        throw new Error(`Food item not found with ID ${itemDto.food_item_id}`);
      }
      if (!food.is_active || !food.is_available) {
        throw new Error(`Item "${food.name}" is currently unavailable.`);
      }

      const itemTotal = food.base_price * itemDto.quantity;
      subtotal += itemTotal;

      const orderItem: OrderItem = {
        id: uuidv4(),
        order_id: orderId,
        food_item_id: food.id,
        food_name: food.name, // Immutable snapshot
        unit_price: food.base_price, // Immutable snapshot in paise
        quantity: itemDto.quantity,
        total_price: itemTotal,
        item_snapshot: {
          name: food.name,
          base_price: food.base_price,
          description: food.description,
          is_veg: food.is_veg,
          category_id: food.category_id,
        },
      };

      orderItems.push(orderItem);
    }

    // 7. Delivery Fee Calculation (Paise: Free delivery above Rs 299 / 29900 paise, else Rs 30 / 3000 paise)
    const deliveryFee = subtotal >= 29900 ? 0 : 3000;
    const discountAmount = 0;
    const totalAmount = subtotal + deliveryFee - discountAmount;

    // 8. Generate Unique Order Number: HK-YYYYMMDD-XXXX
    const dateTag = dto.deliveryDate.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `HK-${dateTag}-${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: dto.customerId,
      category_id: dto.categoryId,
      delivery_date: dto.deliveryDate,
      delivery_slot: dto.deliverySlot,
      address_id: dto.addressId,
      address_snapshot: addressSnapshot,
      subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      payment_method: dto.paymentMethod,
      payment_status: 'pending',
      order_status: 'confirmed',
      special_instructions: dto.specialInstructions,
      whatsapp_notified: Boolean(dto.whatsappOptIn),
      created_at: now,
      updated_at: now,
      items: orderItems,
    };

    // Commit order and items to store
    inMemoryStore.orders.unshift(newOrder);
    inMemoryStore.order_items.push(...orderItems);

    // Increment capacity booked count
    capacityRecord.booked_orders += 1;
    capacityRecord.updated_at = now;

    // Record initial status history
    inMemoryStore.order_status_history.push({
      id: uuidv4(),
      order_id: orderId,
      new_status: 'confirmed',
      changed_by: dto.customerId,
      note: 'Order confirmed by customer',
      created_at: now,
    });

    logger.info(`Order placed successfully: ${newOrder.order_number} for ₹${totalAmount / 100}`);

    // Queue WhatsApp notification asynchronously
    if (dto.whatsappOptIn !== false) {
      notificationService.notifyOrderCreated(newOrder);
    }

    return newOrder;
  }

  /**
   * Get orders for a customer
   */
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const orders = inMemoryStore.orders.filter((o) => o.customer_id === customerId);
    return orders.map((order) => {
      const items = inMemoryStore.order_items.filter((i) => i.order_id === order.id);
      return { ...order, items };
    });
  }

  /**
   * Get all orders for Admin
   */
  async getAllOrders(filters?: {
    status?: string;
    delivery_date?: string;
    search?: string;
  }): Promise<Order[]> {
    let orders = inMemoryStore.orders.map((order) => {
      const items = inMemoryStore.order_items.filter((i) => i.order_id === order.id);
      return { ...order, items };
    });

    if (filters?.status) {
      orders = orders.filter((o) => o.order_status === filters.status);
    }
    if (filters?.delivery_date) {
      orders = orders.filter((o) => o.delivery_date === filters.delivery_date);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          o.address_snapshot?.customer_name?.toLowerCase().includes(q) ||
          o.address_snapshot?.phone_number?.includes(q)
      );
    }

    return orders;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const order = inMemoryStore.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const items = inMemoryStore.order_items.filter((i) => i.order_id === order.id);
    return { ...order, items };
  }

  /**
   * Update order status by Admin
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled',
    paymentStatus?: 'pending' | 'collected' | 'failed' | 'refunded',
    note?: string,
    changedBy?: string
  ): Promise<Order> {
    const order = inMemoryStore.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.order_status;
    order.order_status = newStatus;
    if (paymentStatus) {
      order.payment_status = paymentStatus;
    }
    order.updated_at = new Date().toISOString();

    // Log history
    inMemoryStore.order_status_history.push({
      id: uuidv4(),
      order_id: order.id,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy,
      note: note || `Status changed from ${oldStatus} to ${newStatus}`,
      created_at: new Date().toISOString(),
    });

    // Notify customer on status update
    if (oldStatus !== newStatus) {
      notificationService.notifyOrderStatusChanged(order, oldStatus, newStatus);
    }

    const items = inMemoryStore.order_items.filter((i) => i.order_id === order.id);
    return { ...order, items };
  }
}

export const orderService = new OrderService();
