/**
 * Kitchen Dashboard JavaScript
 */

class KitchenDashboard {
  constructor() {
    this.orders = [];
    this.selectedOrderId = null;
    this.isLoading = false;
    this.pollInterval = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startPolling();
    this.loadOrders();
  }

  setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.loadOrders();
    });

    // Mobile modal close
    document.getElementById('closeMobileModal').addEventListener('click', () => {
      this.closeMobileModal();
    });

    document.querySelector('.mobile-modal-overlay').addEventListener('click', () => {
      this.closeMobileModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileModal();
      }
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.loadOrders();
      }
    });
  }

  startPolling() {
    // Poll every 2.5 seconds
    this.pollInterval = setInterval(() => {
      this.loadOrders(true); // Silent refresh
    }, 2500);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async loadOrders(silent = false) {
    if (this.isLoading && !silent) return;

    this.isLoading = true;
    if (!silent) this.showLoading();

    try {
      const response = await fetch('/api/orders?active=true', {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.orders = data.orders || [];
      this.renderOrders();
      this.updateLastUpdateTime();
      
      if (!silent) {
        this.showToast('Orders refreshed', 'success');
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      this.showToast('Failed to load orders: ' + error.message, 'error');
    } finally {
      this.isLoading = false;
      if (!silent) this.hideLoading();
    }
  }

  renderOrders() {
    const container = document.getElementById('ordersList');
    const countEl = document.getElementById('orderCount');
    
    countEl.textContent = `${this.orders.length} orders`;

    if (this.orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No active orders</h3>
          <p>New orders will appear here automatically</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.orders.map(order => this.renderOrderCard(order)).join('');
    
    // Add click listeners
    container.querySelectorAll('.order-card').forEach(card => {
      card.addEventListener('click', () => {
        const orderId = card.dataset.orderId;
        this.selectOrder(orderId);
      });
    });

    // Re-select previously selected order if it still exists
    if (this.selectedOrderId) {
      const stillExists = this.orders.find(o => o.id === this.selectedOrderId);
      if (stillExists) {
        this.selectOrder(this.selectedOrderId);
      } else {
        this.selectedOrderId = null;
        this.renderOrderDetail(null);
      }
    }
  }

  renderOrderCard(order) {
    const statusClass = `status-${order.status.toLowerCase().replace('_', '')}`;
    const timeAgo = this.getTimeAgo(order.received_at);
    const itemsSummary = order.items.slice(0, 2).map(item => 
      `${item.quantity}x ${item.name}`
    ).join(', ');
    const moreItems = order.items.length > 2 ? ` +${order.items.length - 2} more` : '';

    return `
      <div class="order-card ${this.selectedOrderId === order.id ? 'selected' : ''}" 
           data-order-id="${order.id}">
        <div class="order-header">
          <div class="order-id">${order.id}</div>
          <div class="order-status ${statusClass}">
            ${this.getStatusDisplay(order.status)}
          </div>
        </div>
        <div class="order-customer">
          ${order.customer_name || 'No name provided'}
        </div>
        <div class="order-items">
          ${itemsSummary}${moreItems}
        </div>
        <div class="order-time">
          ${timeAgo}
        </div>
      </div>
    `;
  }

  selectOrder(orderId) {
    this.selectedOrderId = orderId;
    
    // Update selected state in UI
    document.querySelectorAll('.order-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.orderId === orderId);
    });

    const order = this.orders.find(o => o.id === orderId);
    this.renderOrderDetail(order);

    // On mobile, show modal
    if (window.innerWidth <= 768) {
      this.showMobileModal(order);
    }
  }

  renderOrderDetail(order) {
    const container = document.getElementById('orderDetail');
    
    if (!order) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>Select an order to view details</h3>
          <p>Choose an order from the left panel to see items and actions</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.buildOrderDetailHTML(order);
    this.attachDetailEventListeners(order);
  }

  buildOrderDetailHTML(order) {
    const timeFormatted = new Date(order.received_at).toLocaleString();
    const total = order.total_amount > 0 ? `$${order.total_amount.toFixed(2)}` : '';
    
    return `
      <div class="detail-header">
        <div>
          <div class="detail-title">${order.id}</div>
          <div class="order-status ${this.getStatusClass(order.status)}">
            ${this.getStatusDisplay(order.status)}
          </div>
        </div>
        <div class="detail-meta">
          <div>Received: ${timeFormatted}</div>
          ${total ? `<div>Total: ${total}</div>` : ''}
        </div>
      </div>

      ${order.customer_name || order.phone_e164 ? `
        <div class="detail-customer">
          ${order.customer_name ? `<div class="customer-name">${order.customer_name}</div>` : ''}
          ${order.phone_e164 ? `<div class="customer-phone">${order.phone_e164}</div>` : ''}
        </div>
      ` : ''}

      <div class="items-section">
        <h3 class="section-title">Items (${order.items.length})</h3>
        ${order.items.map(item => `
          <div class="item">
            <div class="item-info">
              <div class="item-name">${item.name}</div>
              ${item.notes ? `<div class="item-notes">${item.notes}</div>` : ''}
            </div>
            <div class="item-quantity">${item.quantity}</div>
          </div>
        `).join('')}
      </div>

      ${order.notes ? `
        <div class="notes-section">
          <h3 class="section-title">Order Notes</h3>
          <div class="notes-content">${order.notes}</div>
        </div>
      ` : ''}

      <div class="actions-section">
        ${this.buildActionButtons(order)}
      </div>
    `;
  }

  buildActionButtons(order) {
    const buttons = [];
    
    switch (order.status) {
      case 'RECEIVED_UNCONFIRMED':
        buttons.push({
          text: '✅ Confirmar',
          class: 'btn-success btn-xl',
          action: 'confirm',
          toStatus: 'CONFIRMED'
        });
        buttons.push({
          text: '❌ Cancelar',
          class: 'btn-danger',
          action: 'cancel',
          toStatus: 'CANCELLED'
        });
        break;
        
      case 'CONFIRMED':
        buttons.push({
          text: '🍳 En Preparación',
          class: 'btn-warning btn-xl',
          action: 'prepare',
          toStatus: 'PREPARING'
        });
        buttons.push({
          text: '❌ Cancelar',
          class: 'btn-danger',
          action: 'cancel',
          toStatus: 'CANCELLED'
        });
        break;
        
      case 'PREPARING':
        buttons.push({
          text: '🔔 Lista',
          class: 'btn-primary btn-xl',
          action: 'ready',
          toStatus: 'READY'
        });
        buttons.push({
          text: '❌ Cancelar',
          class: 'btn-danger',
          action: 'cancel',
          toStatus: 'CANCELLED'
        });
        break;
        
      case 'READY':
        buttons.push({
          text: '✅ Completar',
          class: 'btn-success btn-xl',
          action: 'complete',
          toStatus: 'COMPLETED'
        });
        break;
    }

    return buttons.map(btn => `
      <button class="btn ${btn.class}" 
              data-action="${btn.action}" 
              data-to-status="${btn.toStatus}"
              data-order-id="${order.id}">
        ${btn.text}
      </button>
    `).join('');
  }

  attachDetailEventListeners(order) {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const action = e.target.dataset.action;
        const toStatus = e.target.dataset.toStatus;
        const orderId = e.target.dataset.orderId;
        
        await this.updateOrderStatus(orderId, toStatus, action);
      });
    });
  }

  async updateOrderStatus(orderId, toStatus, actionName) {
    this.showLoading();
    
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_status: toStatus,
          notes: `Action: ${actionName}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      this.showToast(`Order ${actionName}ed successfully`, 'success');
      
      // Refresh orders to get updated data
      await this.loadOrders(true);
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      this.showToast('Failed to update order: ' + error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  showMobileModal(order) {
    const modal = document.getElementById('mobileModal');
    const title = document.getElementById('mobileModalTitle');
    const body = document.getElementById('mobileModalBody');
    
    title.textContent = order.id;
    body.innerHTML = this.buildOrderDetailHTML(order);
    this.attachDetailEventListeners(order);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeMobileModal() {
    const modal = document.getElementById('mobileModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  updateLastUpdateTime() {
    const el = document.getElementById('lastUpdate');
    el.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
  }

  getTimeAgo(isoString) {
    const now = new Date();
    const time = new Date(isoString);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  getStatusDisplay(status) {
    const mapping = {
      'RECEIVED_UNCONFIRMED': 'New',
      'CONFIRMED': 'Confirmed',
      'PREPARING': 'Preparing',
      'READY': 'Ready',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return mapping[status] || status;
  }

  getStatusClass(status) {
    return `status-${status.toLowerCase().replace('_', '')}`;
  }

  getAuthToken() {
    // This should integrate with your existing auth system
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.kitchenDashboard = new KitchenDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.kitchenDashboard) {
    window.kitchenDashboard.stopPolling();
  }
});
