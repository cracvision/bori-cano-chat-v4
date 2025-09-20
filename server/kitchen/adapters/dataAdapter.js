/**
 * Base Data Adapter Interface
 */

class DataAdapter {
  async init() {
    throw new Error('init() must be implemented by subclass');
  }

  async createOrder(orderData) {
    throw new Error('createOrder() must be implemented by subclass');
  }

  async updateOrderStatus(orderNumber, toStatus, userId = null, notes = null) {
    throw new Error('updateOrderStatus() must be implemented by subclass');
  }

  async getActiveOrders() {
    throw new Error('getActiveOrders() must be implemented by subclass');
  }

  async getOrderById(orderNumber) {
    throw new Error('getOrderById() must be implemented by subclass');
  }

  async logEvent(eventData) {
    throw new Error('logEvent() must be implemented by subclass');
  }
}

module.exports = DataAdapter;
