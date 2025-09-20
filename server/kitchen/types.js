/**
 * Kitchen Module Types
 */

const ORDER_STATUS = {
  RECEIVED_UNCONFIRMED: 'RECEIVED_UNCONFIRMED',
  CONFIRMED: 'CONFIRMED', 
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const VALID_STATUS_TRANSITIONS = {
  [ORDER_STATUS.RECEIVED_UNCONFIRMED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: []
};

/**
 * @typedef {Object} Item
 * @property {string} name
 * @property {number} quantity
 * @property {string} [notes]
 * @property {number} [price]
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Auto-generated order number
 * @property {string} client_context_id - From n8n for idempotency
 * @property {string} status - ORDER_STATUS enum
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
 * @property {string} order_id
 * @property {string} from_status
 * @property {string} to_status
 * @property {string} timestamp - ISO
 * @property {string} [user_id]
 * @property {string} [notes]
 */

module.exports = {
  ORDER_STATUS,
  VALID_STATUS_TRANSITIONS
};
