/**
 * Frontend API Service for  Arambh
 * Handles API calls, authentication, and offline sync queue.
 */
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('mh_token') || null;
    this.userId = localStorage.getItem('mh_user_id') || null;
    this.syncQueue = JSON.parse(localStorage.getItem('mh_sync_queue') || '[]');
    this.isOnline = navigator.onLine;
    this.socket = null;
    
    // Listen for connection changes
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
    
    this.initSocket();
  }

  initSocket() {
    if (typeof io !== 'undefined') {
      this.socket = io('http://localhost:5000');
      
      this.socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket Server');
        if (this.userId) {
          this.socket.emit('register', this.userId);
        }
      });
      
      this.socket.on('notification', (data) => {
        console.log('🔔 Notification Received:', data);
        this.showToastNotification(data.title, data.body);
      });
    }
  }
  
  showToastNotification(title, body) {
    // Ensure window.showToast is available (defined in app.js usually)
    if (window.showToast) {
      window.showToast(`${title} - ${body}`, 'info');
    } else {
      // Fallback
      alert(`${title}\n${body}`);
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('mh_token', token);
    } else {
      localStorage.removeItem('mh_token');
    }
  }

  handleConnectionChange(isOnline) {
    this.isOnline = isOnline;
    this.updateSyncIndicator();
    if (isOnline) {
      this.processSyncQueue();
    }
  }

  updateSyncIndicator() {
    const indicator = document.getElementById('sync-indicator');
    if (!indicator) return;
    
    if (!this.isOnline) {
      indicator.innerHTML = '🔴 Offline';
      indicator.style.color = 'var(--danger)';
    } else if (this.syncQueue.length > 0) {
      indicator.innerHTML = '🟡 Syncing';
      indicator.style.color = 'var(--warning)';
    } else {
      indicator.innerHTML = '🟢 Synced';
      indicator.style.color = 'var(--success)';
    }
  }

  async fetchWithAuth(endpoint, options = {}) {
    if (!options.headers) options.headers = {};
    if (this.token) {
      options.headers['Authorization'] = `Bearer ${this.token}`;
    }
    options.headers['Content-Type'] = 'application/json';

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Call failed: ${endpoint}`, error);
      throw error; // Re-throw to handle fallback logic
    }
  }

  // Generic Save Logic with Offline Fallback
  async saveRecord(endpoint, data, localStorageKey, localStateRef) {
    // 1. Always update local state & localStorage first (optimistic UI)
    if (localStateRef && Array.isArray(localStateRef)) {
      // It's a new item or update to array
      const existingIdx = localStateRef.findIndex(x => x.id === data.id || x._id === data._id);
      if (existingIdx >= 0) {
        localStateRef[existingIdx] = data;
      } else {
        localStateRef.push(data);
      }
      localStorage.setItem(localStorageKey, JSON.stringify(localStateRef));
    } else if (localStateRef) {
      // Object update (e.g. womens wellness)
      Object.assign(localStateRef, data);
      localStorage.setItem(localStorageKey, JSON.stringify(localStateRef));
    } else {
      // Just push to local array directly
      let arr = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
      arr.push(data);
      localStorage.setItem(localStorageKey, JSON.stringify(arr));
    }

    // 2. Try to sync to backend
    if (this.isOnline) {
      try {
        const response = await this.fetchWithAuth(endpoint, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        return response;
      } catch (err) {
        this.addToQueue(endpoint, 'POST', data);
      }
    } else {
      this.addToQueue(endpoint, 'POST', data);
    }
  }

  addToQueue(endpoint, method, data) {
    this.syncQueue.push({ endpoint, method, data, timestamp: Date.now() });
    localStorage.setItem('mh_sync_queue', JSON.stringify(this.syncQueue));
    this.updateSyncIndicator();
  }

  async processSyncQueue() {
    if (this.syncQueue.length === 0 || !this.isOnline) return;
    
    this.updateSyncIndicator(); // Show yellow syncing
    
    const queueCopy = [...this.syncQueue];
    this.syncQueue = [];
    localStorage.setItem('mh_sync_queue', JSON.stringify([]));

    for (const item of queueCopy) {
      try {
        await this.fetchWithAuth(item.endpoint, {
          method: item.method,
          body: JSON.stringify(item.data)
        });
      } catch (e) {
        // If it fails again, put it back in the queue
        this.syncQueue.push(item);
      }
    }
    
    localStorage.setItem('mh_sync_queue', JSON.stringify(this.syncQueue));
    this.updateSyncIndicator(); // Update status again
  }
}

window.API = new ApiService();

document.addEventListener("DOMContentLoaded", () => {
  window.API.updateSyncIndicator();
  window.API.processSyncQueue();
});
