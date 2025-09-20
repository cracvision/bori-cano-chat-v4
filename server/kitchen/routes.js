const express = require('express');
const axios = require('axios');
const DataAdapter = require('./dataAdapter');
const { requireApiKey, requireKitchenAccess } = require('./middleware');
const { normalizePhoneToE164, isValidStatusTransition } = require('./utils');
const { ORDER_STATUS } = require('./types');

const router = express.Router();
const dataAdapter = new DataAdapter();

// Initialize data adapter
dataAdapter.init().catch(console.error);

// POST /api/orders - Create order (from n8n)
router.post('/orders', requireApiKey, async (req, res) => {
  try {
    const {
      client_context_id,
      items = [],
      customer_name,
      phone,
      notes,
      total_amount
    } = req.body;

    if (!client_context_id) {
      return res.status(400).json({ error: 'client_context_id is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and cannot be empty' });
    }

    const orderData = {
      client_context_id,
      items,
      customer_name,
      phone_e164: normalizePhoneToE164(phone),
      notes,
      total_amount: parseFloat(total_amount) || 0
    };

    const order = await dataAdapter.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/orders/:id/status - Update order status
router.post('/orders/:id/status', requireKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { to_status, notes } = req.body;

    if (!to_status || !Object.values(ORDER_STATUS).includes(to_status)) {
      return res.status(400).json({ error: 'Valid to_status is required' });
    }

    // Get current order to validate transition
    const activeOrders = await dataAdapter.getActiveOrders();
    const currentOrder = activeOrders.find(order => order.id === id);
    
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found or not active' });
    }

    if (!isValidStatusTransition(currentOrder.status, to_status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${currentOrder.status} to ${to_status}` 
      });
    }

    const updatedOrder = await dataAdapter.updateOrderStatus(
      id, 
      to_status, 
      req.user?.id, 
      notes
    );

    // Notify via webhook if order is ready and has phone
    if (to_status === ORDER_STATUS.READY && updatedOrder.phone_e164) {
      await notifyOrderReady(updatedOrder);
    }

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// GET /api/orders - Get active orders
router.get('/orders', requireKitchenAccess, async (req, res) => {
  try {
    const { active } = req.query;
    
    if (active === 'true') {
      const orders = await dataAdapter.getActiveOrders();
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
});

// Helper function to notify n8n when order is ready
async function notifyOrderReady(order) {
  const webhookUrl = process.env.N8N_READY_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('N8N_READY_WEBHOOK_URL not configured');
    return;
  }

  try {
    await axios.post(webhookUrl, {
      order_id: order.id,
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
    
    console.log(`Notified n8n about ready order: ${order.id}`);
  } catch (error) {
    console.error(`Failed to notify n8n about order ${order.id}:`, error.message);
  }
}

module.exports = router;
