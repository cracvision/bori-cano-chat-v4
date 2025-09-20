const DataAdapter = require('./dataAdapter');

/**
 * Firestore Data Adapter (Placeholder)
 * TODO: Implement when Firestore is needed
 */
class FirestoreAdapter extends DataAdapter {
  constructor(options = {}) {
    super();
    this.options = options;
    console.warn('FirestoreAdapter is not implemented yet');
  }

  async init() {
    throw new Error('FirestoreAdapter not implemented');
  }

  async createOrder(orderData) {
    throw new Error('FirestoreAdapter not implemented');
  }

  async updateOrderStatus(orderNumber, toStatus, userId = null, notes = null) {
    throw new Error('FirestoreAdapter not implemented');
  }

  async getActiveOrders() {
    throw new Error('FirestoreAdapter not implemented');
  }

  async getOrderById(orderNumber) {
    throw new Error('FirestoreAdapter not implemented');
  }

  async logEvent(eventData) {
    throw new Error('FirestoreAdapter not implemented');
  }
}

module.exports = FirestoreAdapter;
