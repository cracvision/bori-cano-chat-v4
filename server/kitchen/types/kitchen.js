/**
 * Kitchen Module Types and Enums
 */

const OrderStatus = {
  RECEIVED_UNCONFIRMED: 'RECEIVED_UNCONFIRMED',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const EventType = {
  STATUS_CHANGE: 'STATUS_CHANGE',
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_UPDATED: 'ORDER_UPDATED'
};

const VALID_STATUS_TRANSITIONS = {
  [OrderStatus.RECEIVED_UNCONFIRMED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: []
};

module.exports = {
  OrderStatus,
  EventType,
  VALID_STATUS_TRANSITIONS
};
 * @property {number} [price]
 */

/**
 * @typedef {Object} Order
 * @property {string} order_number - Auto-generated order number
 * @property {string} client_context_id - From n8n for idempotency
 * @property {string} status - OrderStatus enum
 * @property {Item[]} items
 * @property {string} [customer_name]
 * @property {string} [phone_e164]
 * @property {string} [notes]
 * @property {number} [total_amount]
 * @property {string} received_at - ISO timestamp
 * @property {string} [confirmed_at]
 * @property {string} [preparing_at]
 * @property {string} [ready_at]
 * @property {string} [completed_at]
 * @property {string} [cancelled_at]
 */

/**
 * @typedef {Object} Event
 * @property {string} order_number
 * @property {string} event_type
 * @property {string} from_status
 * @property {string} to_status
 * @property {string} timestamp - ISO
 * @property {string} [user_id]
 * @property {string} [notes]
 */

module.exports = {
  OrderStatus,
  EventType,
  VALID_STATUS_TRANSITIONS
};
