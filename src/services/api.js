/**
 * API service for backend communication
 * Improved with better error handling and token management
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Get auth headers with token
   */
  getAuthHeaders() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    }
    return { 'Content-Type': 'application/json' };
  }

  /**
   * Generic request method with improved error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const isAuthPage = currentPath === '/auth/login' || currentPath === '/auth/signup';
          
          if (!isAuthPage && typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            // Don't redirect automatically, let the component handle it
          }
        }

        // Handle FastAPI validation errors (422)
        if (response.status === 422 && data.detail) {
          // Format validation errors
          if (Array.isArray(data.detail)) {
            const errors = data.detail.map(err => {
              const field = err.loc ? err.loc.join('.') : 'field';
              return `${field}: ${err.msg}`;
            }).join(', ');
            throw new Error(errors);
          }
          throw new Error(data.detail);
        }
        // Handle other errors
        const errorMessage = data.detail || data.message || JSON.stringify(data) || 'Request failed';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      // If it's already an Error object, throw it as is
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise, wrap it
      throw new Error(error.message || String(error) || 'Request failed');
    }
  }

  // Auth endpoints
  async requestOTP(identifier, purpose) {
    // identifier can be email or mobile
    const body = { purpose };
    if (identifier.includes('@')) {
      body.email = identifier;
    } else {
      body.mobile = identifier;
    }
    return this.request('/api/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async verifyOTP(email, mobile, otp, purpose) {
    const body = { otp, purpose };
    if (email) body.email = email;
    if (mobile) body.mobile = mobile;
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async resendOTP(email) {
    return this.request('/api/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async signup(userData) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(loginData) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async refreshToken(refreshToken) {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Helper method to handle token refresh on 401
  async requestWithRefresh(endpoint, options = {}) {
    try {
      return await this.request(endpoint, options);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const tokens = await this.refreshToken(refreshToken);
            localStorage.setItem('access_token', tokens.access_token);
            localStorage.setItem('refresh_token', tokens.refresh_token);
            // Retry original request
            return await this.request(endpoint, options);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            throw refreshError;
          }
        }
      }
      throw error;
    }
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async updateUser(userData) {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Provider/Company endpoints
  async registerProvider(providerData) {
    return this.request('/api/companies/register', {
      method: 'POST',
      body: JSON.stringify(providerData),
    });
  }

  async getMyProvider() {
    return this.request('/api/companies/me');
  }

  async updateProvider(providerData) {
    return this.request('/api/companies/me', {
      method: 'PUT',
      body: JSON.stringify(providerData),
    });
  }

  async getMyWorkers() {
    return this.request('/api/companies/workers');
  }

  async suspendWorker(workerId) {
    return this.request(`/api/companies/workers/${workerId}/suspend`, {
      method: 'POST',
    });
  }

  // Worker endpoints
  async onboardWorker(workerData) {
    return this.request('/api/workers/onboard', {
      method: 'POST',
      body: JSON.stringify(workerData),
    });
  }

  async getMyWorker() {
    return this.request('/api/workers/me');
  }

  async updateWorker(workerData) {
    return this.request('/api/workers/me', {
      method: 'PUT',
      body: JSON.stringify(workerData),
    });
  }

  // Verification endpoints
  async verifyAgent(verificationData) {
    return this.request('/api/verify/worker', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async verifyAePSIntent(transactionType, amount, agentId) {
    return this.request('/api/verify/aeps/intent', {
      method: 'POST',
      body: JSON.stringify({
        transaction_type: transactionType,
        amount,
        agent_id: agentId,
      }),
    });
  }

  async confirmAePSTransaction(intentKey, actualTransactionType, actualAmount) {
    return this.request('/api/verify/aeps/confirm', {
      method: 'POST',
      body: JSON.stringify({
        intent_key: intentKey,
        actual_transaction_type: actualTransactionType,
        actual_amount: actualAmount,
      }),
    });
  }

  // Police endpoints
  async searchAgent(query) {
    return this.request(`/api/police/workers/search?q=${encodeURIComponent(query)}`);
  }

  async getAgentDetails(workerId) {
    return this.request(`/api/police/workers/${workerId}`);
  }

  async createPoliceVerification(verificationData) {
    return this.request('/api/police/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  async suspendAgent(workerId, reason, temporary = true) {
    return this.request('/api/police/suspend', {
      method: 'POST',
      body: JSON.stringify({
        worker_id: workerId,
        reason,
        temporary,
      }),
    });
  }

  async logIncident(workerId, title, description, incidentType, severity) {
    return this.request('/api/police/incident', {
      method: 'POST',
      body: JSON.stringify({
        worker_id: workerId,
        title,
        description,
        incident_type: incidentType,
        severity,
      }),
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/api/admin/dashboard');
  }

  async listUsers(skip = 0, limit = 100, role = null) {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (role) params.append('role', role);
    return this.request(`/api/admin/users?${params.toString()}`);
  }

  async suspendUser(userId, reason) {
    return this.request(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async activateUser(userId) {
    return this.request(`/api/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  async updateWorkerStatus(workerId, status, reason) {
    return this.request('/api/admin/workers/status', {
      method: 'POST',
      body: JSON.stringify({
        worker_id: workerId,
        status,
        reason,
      }),
    });
  }

  async getAuditLogs(skip = 0, limit = 100) {
    return this.request(`/api/admin/audit-logs?skip=${skip}&limit=${limit}`);
  }

  // Helper method for generic GET requests
  async get(endpoint) {
    return this.request(`/api${endpoint}`);
  }

  // Helper method for generic POST requests
  async post(endpoint, data) {
    return this.request(`/api${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();

