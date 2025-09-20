const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const DataAdapter = require('./dataAdapter');
const { OrderStatus, EventType } = require('../types/kitchen');
const { generateOrderNumber } = require('../utils/phoneHelper');

class GoogleSheetsAdapter extends DataAdapter {
  constructor(options = {}) {
    super();
    this.spreadsheetId = options.spreadsheetId || process.env.GOOGLE_SHEETS_ID;
    this.serviceAccount = options.serviceAccount || {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };
    this.doc = null;
    this.ordersSheet = null;
    this.eventsSheet = null;
  }

  async init() {
    if (!this.spreadsheetId || !this.serviceAccount.client_email) {
      throw new Error('Google Sheets configuration missing');
    }

    const auth = new JWT({
      email: this.serviceAccount.client_email,
      key: this.serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    this.doc = new GoogleSpreadsheet(this.spreadsheetId, auth);
    await this.doc.loadInfo();

    // Get or create Orders sheet
    this.ordersSheet = this.doc.sheetsByTitle['Orders'] || await this.doc.addSheet({
      title: 'Orders',
      headerValues: [
        'order_number', 'client_context_id', 'status', 'items_json', 'customer_name',
        'phone_e164', 'notes', 'total_amount', 'received_at', 'confirmed_at',
        'preparing_at', 'ready_at', 'completed_at', 'cancelled_at'
      ]
    });

    // Get or create Events sheet
    this.eventsSheet = this.doc.sheetsByTitle['Events'] || await this.doc.addSheet({
      title: 'Events',
      headerValues: ['order_number', 'event_type', 'from_status', 'to_status', 'timestamp', 'user_id', 'notes']
    });
  }

  async createOrder(orderData) {
    await this.ensureInit();
    
    // Check for existing order by client_context_id
    const rows = await this.ordersSheet.getRows();
    const existing = rows.find(row => row.get('client_context_id') === orderData.client_context_id);
    
    if (existing) {
      return this.rowToOrder(existing);
    }

    // Generate new order number
    const orderCount = rows.length;
    const orderNumber = generateOrderNumber(orderCount);

    const order = {
      order_number: orderNumber,
      client_context_id: orderData.client_context_id,
      status: OrderStatus.RECEIVED_UNCONFIRMED,
      items_json: JSON.stringify(orderData.items || []),
      customer_name: orderData.customer_name || '',
      phone_e164: orderData.phone_e164 || '',
      notes: orderData.notes || '',
      total_amount: orderData.total_amount || 0,
      received_at: new Date().toISOString(),
      confirmed_at: '',
      preparing_at: '',
      ready_at: '',
      completed_at: '',
      cancelled_at: ''
    };

    await this.ordersSheet.addRow(order);

    // Log creation event
    await this.logEvent({
      order_number: orderNumber,
      event_type: EventType.ORDER_CREATED,
      from_status: '',
      to_status: OrderStatus.RECEIVED_UNCONFIRMED,
      timestamp: order.received_at,
      user_id: 'system',
      notes: 'Order created from n8n'
    });

    return this.formatOrder(order);
  }

  async updateOrderStatus(orderNumber, toStatus, userId = null, notes = null) {
    await this.ensureInit();
    
    const rows = await this.ordersSheet.getRows();
    const orderRow = rows.find(row => row.get('order_number') === orderNumber);
    
    if (!orderRow) {
      throw new Error(`Order ${orderNumber} not found`);
    }

    const fromStatus = orderRow.get('status');
    const timestamp = new Date().toISOString();
    
    // Update order status and timestamp
    orderRow.set('status', toStatus);
    
    const timestampField = this.getTimestampField(toStatus);
    if (timestampField) {
      orderRow.set(timestampField, timestamp);
    }
    
    await orderRow.save();

    // Log event
    await this.logEvent({
      order_number: orderNumber,
      event_type: EventType.STATUS_CHANGE,
      from_status: fromStatus,
      to_status: toStatus,
      timestamp,
      user_id: userId || 'unknown',
      notes: notes || ''
    });

    return this.rowToOrder(orderRow);
  }

  async getActiveOrders() {
    await this.ensureInit();
    
    const rows = await this.ordersSheet.getRows();
    const activeStatuses = [
      OrderStatus.RECEIVED_UNCONFIRMED,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY
    ];

    return rows
      .filter(row => activeStatuses.includes(row.get('status')))
      .map(row => this.rowToOrder(row))
      .sort((a, b) => new Date(a.received_at) - new Date(b.received_at));
  }

  async getOrderById(orderNumber) {
    await this.ensureInit();
    
    const rows = await this.ordersSheet.getRows();
    const orderRow = rows.find(row => row.get('order_number') === orderNumber);
    
    if (!orderRow) {
      return null;
    }

    return this.rowToOrder(orderRow);
  }

  async logEvent(eventData) {
    await this.ensureInit();
    await this.eventsSheet.addRow(eventData);
  }

  // Helper methods
  async ensureInit() {
    if (!this.doc) {
      await this.init();
    }
  }

  rowToOrder(row) {
    const data = {
      order_number: row.get('order_number'),
      client_context_id: row.get('client_context_id'),
      status: row.get('status'),
      items: JSON.parse(row.get('items_json') || '[]'),
      customer_name: row.get('customer_name'),
      phone_e164: row.get('phone_e164'),
      notes: row.get('notes'),
      total_amount: parseFloat(row.get('total_amount')) || 0,
      received_at: row.get('received_at'),
      confirmed_at: row.get('confirmed_at'),
      preparing_at: row.get('preparing_at'),
      ready_at: row.get('ready_at'),
      completed_at: row.get('completed_at'),
      cancelled_at: row.get('cancelled_at')
    };
    return this.formatOrder(data);
  }

  formatOrder(data) {
    return {
      ...data,
      items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items
    };
  }

  getTimestampField(status) {
    const mapping = {
      [OrderStatus.CONFIRMED]: 'confirmed_at',
      [OrderStatus.PREPARING]: 'preparing_at',
      [OrderStatus.READY]: 'ready_at',
      [OrderStatus.COMPLETED]: 'completed_at',
      [OrderStatus.CANCELLED]: 'cancelled_at'
    };
    return mapping[status];
  }
}

module.exports = GoogleSheetsAdapter;
