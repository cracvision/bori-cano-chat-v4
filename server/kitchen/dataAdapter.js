const GoogleSheetsAdapter = require('./adapters/googleSheetsAdapter');
const FirestoreAdapter = require('./adapters/firestoreAdapter');

class DataAdapter {
  constructor() {
    const backend = process.env.DATA_BACKEND || 'sheets';
    
    switch (backend) {
      case 'sheets':
        this.adapter = new GoogleSheetsAdapter();
        break;
      case 'firestore':
        this.adapter = new FirestoreAdapter();
        break;
      default:
        throw new Error(`Unsupported data backend: ${backend}`);
    }
  }

  async init() {
    return this.adapter.init();
  }

  async createOrder(orderData) {
    return this.adapter.createOrder(orderData);
  }

  async updateOrderStatus(orderId, toStatus, userId = null, notes = null) {
    return this.adapter.updateOrderStatus(orderId, toStatus, userId, notes);
  }

  async getActiveOrders() {
    return this.adapter.getActiveOrders();
  }

  async logEvent(eventData) {
    return this.adapter.logEvent(eventData);
  }
}

module.exports = DataAdapter;
