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

    // Get or create Orders sheet with exact headers
    this.ordersSheet = this.doc.sheetsByTitle['Orders'] || await this.doc.addSheet({
      title: 'Orders',
      headerValues: [
        'id', 'client_context_id', 'order_number', 'status', 'items_json', 
        'customer_name', 'phone_e164', 'table_number', 'notes', 'total_amount', 
        'received_at', 'confirmed_at', 'preparing_at', 'ready_at', 'completed_at', 
        'cancelled_at', 'created_at', 'updated_at'
      ]
    });

    // Get or create Events sheet with exact headers
    this.eventsSheet = this.doc.sheetsByTitle['Events'] || await this.doc.addSheet({
      title: 'Events',
      headerValues: ['id', 'order_id', 'event_type', 'from_status', 'to_status', 'metadata_json', 'created_at']
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
    const timestamp = new Date().toISOString();

    const order = {
      id: orderNumber,
      client_context_id: orderData.client_context_id,
      order_number: orderNumber,
      status: OrderStatus.RECEIVED_UNCONFIRMED,
      items_json: JSON.stringify(orderData.items || []),
      customer_name: orderData.customer_name || '',
      phone_e164: orderData.phone_e164 || '',
      table_number: orderData.table_number || '',
      notes: orderData.notes || '',
      total_amount: orderData.total_amount || 0,
      received_at: timestamp,
      confirmed_at: '',
      preparing_at: '',
      ready_at: '',
      completed_at: '',
      cancelled_at: '',
      created_at: timestamp,
      updated_at: timestamp
    };

    await this.ordersSheet.addRow(order);

    // Log creation event
    await this.logEvent({
      id: `evt_${Date.now()}`,
      order_id: orderNumber,
      event_type: EventType.ORDER_CREATED,
      from_status: '',
      to_status: OrderStatus.RECEIVED_UNCONFIRMED,
      metadata_json: JSON.stringify({ user_id: 'system', source: 'n8n' }),
      created_at: timestamp
    });

    return this.formatOrder(order);
  }

  async updateOrderStatus(orderNumber, toStatus, userId = null, notes = null) {
    await this.ensureInit();
    
    const rows = await this.ordersSheet.getRows();
    const orderRow = rows.find(row => row.get('order_number') === orderNumber || row.get('id') === orderNumber);
    
    if (!orderRow) {
      throw new Error(`Order ${orderNumber} not found`);
    }

    const fromStatus = orderRow.get('status');
    const timestamp = new Date().toISOString();
    
    // Update order status and timestamp
    orderRow.set('status', toStatus);
    orderRow.set('updated_at', timestamp);
    
    const timestampField = this.getTimestampField(toStatus);
    if (timestampField) {
      orderRow.set(timestampField, timestamp);
    }
    
    await orderRow.save();

    // Log event
    await this.logEvent({
      id: `evt_${Date.now()}`,
      order_id: orderNumber,
      event_type: EventType.STATUS_CHANGE,
      from_status: fromStatus,
      to_status: toStatus,
      metadata_json: JSON.stringify({ user_id: userId || 'unknown', notes: notes || '' }),
      created_at: timestamp
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
    const orderRow = rows.find(row => row.get('order_number') === orderNumber || row.get('id') === orderNumber);
    
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
      id: row.get('order_number') || row.get('id'),
      order_number: row.get('order_number') || row.get('id'),
      client_context_id: row.get('client_context_id'),
      status: row.get('status'),
      items: JSON.parse(row.get('items_json') || '[]'),
      customer_name: row.get('customer_name'),
      phone_e164: row.get('phone_e164'),
      table_number: row.get('table_number'),
      notes: row.get('notes'),
      total_amount: parseFloat(row.get('total_amount')) || 0,
      received_at: row.get('received_at'),
      confirmed_at: row.get('confirmed_at'),
      preparing_at: row.get('preparing_at'),
      ready_at: row.get('ready_at'),
      completed_at: row.get('completed_at'),
      cancelled_at: row.get('cancelled_at'),
      created_at: row.get('created_at'),
      updated_at: row.get('updated_at')
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
