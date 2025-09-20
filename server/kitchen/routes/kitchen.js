const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const GoogleSheetsAdapter = require('../adapters/googleSheetsAdapter');
const FirestoreAdapter = require('../adapters/firestoreAdapter');
const KitchenService = require('../services/kitchenService');
const { OrderStatus } = require('../types/kitchen');

const router = express.Router();

// Create data adapter based on environment
function createDataAdapter() {
  const backend = process.env.DATA_BACKEND || 'sheets';
  
  switch (backend) {
    case 'sheets':
      return new GoogleSheetsAdapter();
    case 'firestore':
      return new FirestoreAdapter();
    default:
      throw new Error(`Unknown DATA_BACKEND: ${backend}`);
  }
}

// Initialize services
const dataAdapter = createDataAdapter();
const kitchenService = new KitchenService(dataAdapter);

// Initialize data adapter
dataAdapter.init().catch(console.error);

// Middleware: API Key validation
function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
}

// Middleware: Kitchen access validation (placeholder - integrate with your auth)
function requireKitchenAccess(req, res, next) {
  // TODO: Implement actual JWT validation and role checking
  // For now, assume user is authenticated with kitchen access
  req.user = { id: 'kitchen-user', role: 'KITCHEN' };
  next();
}

// POST /api/orders - Create order (from n8n)
router.post('/orders',
  requireApiKey,
  [
    body('client_context_id').notEmpty().withMessage('client_context_id is required'),
    body('items').isArray({ min: 1 }).withMessage('items array is required and cannot be empty'),
    body('customer_name').optional().isString(),
    body('phone').optional().isString(),
    body('notes').optional().isString(),
    body('total_amount').optional().isNumeric()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const order = await kitchenService.createOrder(req.body);
      
      res.status(201).json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// GET /api/orders - Get orders
router.get('/orders',
  requireKitchenAccess,
  [
    query('active').optional().isBoolean().toBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { active } = req.query;
      
      if (active === true) {
        const orders = await kitchenService.getActiveOrders();
        res.json({
          success: true,
          orders
        });
      } else {
        res.status(400).json({ error: 'Only active=true is supported currently' });
      }
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  }
);

// GET /api/orders/:id - Get single order
router.get('/orders/:id',
  requireKitchenAccess,
  [
    param('id').notEmpty().withMessage('Order ID is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const order = await kitchenService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  }
);

// POST /api/orders/:id/status - Update order status
router.post('/orders/:id/status',
  requireKitchenAccess,
  [
    param('id').notEmpty().withMessage('Order ID is required'),
    body('to_status').isIn(Object.values(OrderStatus)).withMessage('Valid to_status is required'),
    body('notes').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { to_status, notes } = req.body;

      const updatedOrder = await kitchenService.updateOrderStatus(
        id, 
        to_status, 
        req.user?.id, 
        notes
      );

      res.json({
        success: true,
        order: updatedOrder
      });
    } catch (error) {
      console.error('Update order status error:', error);
      
      if (error.message.includes('not found') || error.message.includes('Invalid status transition')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update order status' });
      }
    }
  }
);

module.exports = router;
