const axios = require('axios');
const { OrderStatus } = require('../types/kitchen');
const { normalizePhoneToE164, isValidStatusTransition } = require('../utils/phoneHelper');

class KitchenService {
  constructor(dataAdapter) {
    this.dataAdapter = dataAdapter;
  }

  async createOrder(orderData) {
    // Normalize phone if provided
    if (orderData.phone) {
      orderData.phone_e164 = normalizePhoneToE164(orderData.phone);
    }

    return await this.dataAdapter.createOrder(orderData);
  }

  async updateOrderStatus(orderNumber, toStatus, userId = null, notes = null) {
    // Get current order to validate transition
    const currentOrder = await this.dataAdapter.getOrderById(orderNumber);
    
    if (!currentOrder) {
      throw new Error(`Order ${orderNumber} not found`);
    }

    if (!isValidStatusTransition(currentOrder.status, toStatus)) {
      throw new Error(`Invalid status transition from ${currentOrder.status} to ${toStatus}`);
    }

    const updatedOrder = await this.dataAdapter.updateOrderStatus(
      orderNumber, 
      toStatus, 
      userId, 
      notes
    );

    // Send notification if order is ready and has phone
    if (toStatus === OrderStatus.READY && updatedOrder.phone_e164) {
      await this.sendReadyNotification(updatedOrder);
    }

    return updatedOrder;
  }

  async getActiveOrders() {
    return await this.dataAdapter.getActiveOrders();
  }

  async getOrderById(orderNumber) {
    return await this.dataAdapter.getOrderById(orderNumber);
  }

  async sendReadyNotification(order) {
    const webhookUrl = process.env.N8N_READY_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.warn('N8N_READY_WEBHOOK_URL not configured');
      return;
    }

    try {
      await axios.post(webhookUrl, {
        order_number: order.order_number,
        customer_name: order.customer_name,
        phone_e164: order.phone_e164,
        items: order.items,
        total_amount: order.total_amount,
        ready_at: order.ready_at
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`Ready notification sent for order ${order.order_number}`);
    } catch (error) {
      console.error(`Failed to send ready notification for order ${order.order_number}: ${error.message}`);
    }
  }
}

module.exports = KitchenService;
