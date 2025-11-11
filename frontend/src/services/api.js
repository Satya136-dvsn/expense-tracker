import errorHandler from '../utils/errorHandler';
import { cache } from '../utils/performance';

const API_BASE_URL = 'http://localhost:8080';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  // Only include Content-Type for requests that send a body to avoid
  // unnecessary CORS preflight on simple GETs which can cause 403s if
  // the backend CORS isn't configured for the header.
  getHeaders(method = 'GET') {
    const headers = {};

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    // Debug logging removed for production
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: this.getHeaders(method)
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(this.baseUrl + endpoint, config);
      const responseText = await response.text();
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/signin';
          throw new Error('Authentication failed. Please login again.');
        }
        
        // Try to parse error response to get meaningful error message
        let errorMessage = responseText;
        try {
          const errorObj = JSON.parse(responseText);
          if (errorObj.message) {
            errorMessage = errorObj.message;
          } else if (typeof errorObj === 'string') {
            errorMessage = errorObj;
          }
        } catch {
          errorMessage = responseText || `HTTP ${response.status} error`;
        }
        
        throw new Error(errorMessage);
      }

      if (!responseText) {
        return {};
      }

      return JSON.parse(responseText);
    } catch (error) {
      if (error.name === 'SyntaxError') {
        const handledError = errorHandler.handleApiError(new Error('Invalid response from server'), {
          endpoint,
          method
        });
        throw new Error(handledError.message);
      }
      
      const handledError = errorHandler.handleApiError(error, {
        endpoint,
        method
      });
      throw new Error(handledError.message);
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.makeRequest('/api/auth/login', 'POST', credentials);
  }

  async register(userData) {
    return this.makeRequest('/api/auth/register', 'POST', userData);
  }

  async logout() {
    return this.makeRequest('/api/auth/logout', 'POST');
  }

  // User profile endpoints
  async getUserProfile() {
    return this.makeRequest('/api/profile', 'GET');
  }

  async updateUserProfile(profileData) {
    return this.makeRequest('/api/profile', 'PUT', profileData);
  }

  async getUserProfileById(userId) {
    return this.makeRequest(`/api/profile/${userId}`, 'GET');
  }

  async updateUserProfileById(userId, profileData) {
    return this.makeRequest(`/api/profile/${userId}`, 'PUT', profileData);
  }

  // Admin endpoints
  async getAllUsers() {
    return this.makeRequest('/api/admin/users', 'GET');
  }

  async getAdminDashboardStats() {
    return this.makeRequest('/api/admin/dashboard/stats', 'GET');
  }

  async getUserByIdAdmin(userId) {
    return this.makeRequest(`/api/admin/users/${userId}`, 'GET');
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health', 'GET');
  }

  // Transactions / Reports endpoints
  async getFinancialSummary() {
    const cacheKey = 'financial-summary';
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const result = await this.makeRequest('/api/transactions/summary', 'GET');
    cache.set(cacheKey, result, 2 * 60 * 1000); // Cache for 2 minutes
    return result;
  }

  // Get monthly breakdown - returns array of monthly summaries
  // eslint-disable-next-line no-unused-vars
  async getMonthlyFinancialSummary(period = '6months') {
    // For now, return the overall summary as we need to implement proper monthly aggregation
    // TODO: Implement backend endpoint that aggregates by month for the given period
    return this.makeRequest('/api/transactions/summary', 'GET');
  }

  async getExpenseBreakdown() {
    return this.makeRequest('/api/transactions/breakdown/expenses', 'GET');
  }

  async getIncomeBreakdown() {
    return this.makeRequest('/api/transactions/breakdown/income', 'GET');
  }

  // ===== NEW ANALYTICS ENDPOINTS FOR MILESTONE 4 =====
  
  async getMonthlyTrends(months = 6) {
    return this.makeRequest(`/api/transactions/analytics/monthly-trends?months=${months}`, 'GET');
  }

  async getCategoryTrends(months = 6) {
    return this.makeRequest(`/api/transactions/analytics/category-trends?months=${months}`, 'GET');
  }

  async getSpendingPatterns() {
    return this.makeRequest('/api/transactions/analytics/spending-patterns', 'GET');
  }

  async getComparativeAnalysis(period = 'month') {
    return this.makeRequest(`/api/transactions/analytics/comparative?period=${period}`, 'GET');
  }

  async getFinancialInsights() {
    return this.makeRequest('/api/transactions/analytics/insights', 'GET');
  }

  async getCategoryBreakdown() {
    // Use expense breakdown for now
    return this.makeRequest('/api/transactions/breakdown/expenses', 'GET');
  }

  // Transaction Management
  // Clear cache when data changes
  clearCache() {
    cache.clear();
  }

  async createTransaction(transactionData) {
    const result = await this.makeRequest('/api/transactions', 'POST', transactionData);
    this.clearCache(); // Clear cache after creating transaction
    return result;
  }

  async getUserTransactions() {
    return this.makeRequest('/api/transactions', 'GET');
  }

  async getTransactionById(id) {
    return this.makeRequest(`/api/transactions/${id}`, 'GET');
  }

  async updateTransaction(id, transactionData) {
    const result = await this.makeRequest(`/api/transactions/${id}`, 'PUT', transactionData);
    this.clearCache(); // Clear cache after updating transaction
    return result;
  }

  async deleteTransaction(id) {
    const result = await this.makeRequest(`/api/transactions/${id}`, 'DELETE');
    this.clearCache(); // Clear cache after deleting transaction
    return result;
  }

  async getTransactionsByType(type) {
    return this.makeRequest(`/api/transactions/type/${type}`, 'GET');
  }

  // Category Management
  async getExpenseCategories() {
    return this.makeRequest('/api/categories/expense', 'GET');
  }

  async getIncomeCategories() {
    return this.makeRequest('/api/categories/income', 'GET');
  }

  async getAllCategories() {
    return this.makeRequest('/api/categories', 'GET');
  }

  // Budget Management (Milestone 3)
  async createBudget(budgetData) {
    return this.makeRequest('/api/budgets', 'POST', budgetData);
  }

  async getAllBudgets() {
    return this.makeRequest('/api/budgets', 'GET');
  }

  async getBudgetsForMonth(month, year) {
    return this.makeRequest(`/api/budgets/month/${month}/year/${year}`, 'GET');
  }

  async getCurrentMonthBudgets() {
    return this.makeRequest('/api/budgets/current-month', 'GET');
  }

  async getBudgetById(id) {
    return this.makeRequest(`/api/budgets/${id}`, 'GET');
  }

  async updateBudget(id, budgetData) {
    return this.makeRequest(`/api/budgets/${id}`, 'PUT', budgetData);
  }

  async deleteBudget(id) {
    return this.makeRequest(`/api/budgets/${id}`, 'DELETE');
  }

  async recalculateAllBudgets() {
    return this.makeRequest('/api/budgets/recalculate', 'POST');
  }

  // Savings Goals Management (Milestone 3)
  async createSavingsGoal(goalData) {
    return this.makeRequest('/api/savings-goals', 'POST', goalData);
  }

  async getAllSavingsGoals() {
    return this.makeRequest('/api/savings-goals', 'GET');
  }

  async getActiveSavingsGoals() {
    return this.makeRequest('/api/savings-goals/active', 'GET');
  }

  async getSavingsGoalsByStatus(status) {
    return this.makeRequest(`/api/savings-goals/status/${status}`, 'GET');
  }

  async getSavingsGoalById(id) {
    return this.makeRequest(`/api/savings-goals/${id}`, 'GET');
  }

  async updateSavingsGoal(id, goalData) {
    return this.makeRequest(`/api/savings-goals/${id}`, 'PUT', goalData);
  }

  async updateSavingsGoalProgress(id, amount) {
    const config = {
      method: 'PATCH',
      headers: this.getHeaders('PATCH'),
      body: JSON.stringify({ amount })
    };
    const response = await fetch(this.baseUrl + `/api/savings-goals/${id}/progress`, config);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update progress');
    }
    return response.json();
  }

  async setSavingsGoalAmount(id, currentAmount) {
    const config = {
      method: 'PATCH',
      headers: this.getHeaders('PATCH'),
      body: JSON.stringify({ currentAmount })
    };
    const response = await fetch(this.baseUrl + `/api/savings-goals/${id}/amount`, config);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to set amount');
    }
    return response.json();
  }

  async completeSavingsGoal(id) {
    const config = {
      method: 'PATCH',
      headers: this.getHeaders('PATCH')
    };
    const response = await fetch(this.baseUrl + `/api/savings-goals/${id}/complete`, config);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to complete goal');
    }
    return response.json();
  }

  async cancelSavingsGoal(id) {
    const config = {
      method: 'PATCH',
      headers: this.getHeaders('PATCH')
    };
    const response = await fetch(this.baseUrl + `/api/savings-goals/${id}/cancel`, config);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to cancel goal');
    }
    return response.json();
  }

  async reopenSavingsGoal(id) {
    const config = {
      method: 'PATCH',
      headers: this.getHeaders('PATCH')
    };
    const response = await fetch(this.baseUrl + `/api/savings-goals/${id}/reopen`, config);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to reopen goal');
    }
    return response.json();
  }

  async deleteSavingsGoal(id) {
    return this.makeRequest(`/api/savings-goals/${id}`, 'DELETE');
  }

  // Export functions
  async exportTransactionsPdf(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const config = {
      method: 'GET',
      headers: this.getHeaders('GET')
    };
    
    const url = `${this.baseUrl}/api/export/transactions/pdf${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }
    
    return response.blob();
  }

  async exportTransactionsCsv(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const config = {
      method: 'GET',
      headers: this.getHeaders('GET')
    };
    
    const url = `${this.baseUrl}/api/export/transactions/csv${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }
    
    return response.blob();
  }

  async exportAnalyticsPdf() {
    const config = {
      method: 'GET',
      headers: this.getHeaders('GET')
    };
    
    const response = await fetch(`${this.baseUrl}/api/export/analytics/pdf`, config);
    
    if (!response.ok) {
      throw new Error('Failed to export analytics PDF');
    }
    
    return response.blob();
  }

  async exportComprehensiveReport(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const config = {
      method: 'GET',
      headers: this.getHeaders('GET')
    };
    
    const url = `${this.baseUrl}/api/export/comprehensive${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error('Failed to export comprehensive report');
    }
    
    return response.blob();
  }

  async exportToExcel(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const config = {
      method: 'GET',
      headers: this.getHeaders('GET')
    };
    
    const url = `${this.baseUrl}/api/export/excel${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error('Failed to export to Excel');
    }
    
    return response.blob();
  }

  async exportBudgetReport(month, year) {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const config = {
      method: 'GET',
      headers: this.getHeaders('GET')
    };
    
    const url = `${this.baseUrl}/api/export/budget${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error('Failed to export budget report');
    }
    
    return response.blob();
  }

  async exportSavingsGoalsReport() {
    const config = {
      method: 'GET',
      headers: this.getHeaders('GET')
    };
    
    const response = await fetch(`${this.baseUrl}/api/export/savings-goals`, config);
    
    if (!response.ok) {
      throw new Error('Failed to export savings goals report');
    }
    
    return response.blob();
  }

  async getExportPreview(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `/api/export/preview${params.toString() ? '?' + params.toString() : ''}`;
    return this.makeRequest(url, 'GET');
  }

  // Currency endpoints
  async getAllCurrencies() {
    return this.makeRequest('/api/currencies', 'GET');
  }

  async getCommonCurrencies() {
    return this.makeRequest('/api/currencies/common', 'GET');
  }

  async getCurrencyByCode(code) {
    return this.makeRequest(`/api/currencies/${code}`, 'GET');
  }

  async searchCurrencies(query) {
    const params = new URLSearchParams();
    params.append('query', query);
    return this.makeRequest(`/api/currencies/search?${params.toString()}`, 'GET');
  }

  async createCurrency(currencyData) {
    return this.makeRequest('/api/currencies', 'POST', currencyData);
  }

  async updateCurrency(id, currencyData) {
    return this.makeRequest(`/api/currencies/${id}`, 'PUT', currencyData);
  }

  async convertCurrency(conversionData) {
    return this.makeRequest('/api/currencies/convert', 'POST', conversionData);
  }

  async getLatestExchangeRates(baseCurrency) {
    return this.makeRequest(`/api/currencies/rates/${baseCurrency}`, 'GET');
  }

  async getExchangeRate(fromCurrency, toCurrency, date = null) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const url = `/api/currencies/rates/${fromCurrency}/${toCurrency}${params.toString() ? '?' + params.toString() : ''}`;
    return this.makeRequest(url, 'GET');
  }

  async getHistoricalExchangeRates(fromCurrency, toCurrency, startDate, endDate) {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    return this.makeRequest(`/api/currencies/rates/${fromCurrency}/${toCurrency}/history?${params.toString()}`, 'GET');
  }

  async updateExchangeRates() {
    return this.makeRequest('/api/currencies/rates/update', 'POST');
  }

  async initializeDefaultCurrencies() {
    return this.makeRequest('/api/currencies/initialize', 'POST');
  }

  // Bank Integration endpoints
  async getBankAccounts() {
    return this.makeRequest('/api/bank-integration/accounts', 'GET');
  }

  async addBankAccount(accountData) {
    return this.makeRequest('/api/bank-integration/accounts', 'POST', accountData);
  }

  async updateAccountBalance(accountId, balance) {
    return this.makeRequest(`/api/bank-integration/accounts/${accountId}/balance`, 'PUT', { balance });
  }

  async syncBankAccount(accountId) {
    return this.makeRequest(`/api/bank-integration/accounts/${accountId}/sync`, 'POST');
  }

  async syncAllBankAccounts() {
    return this.makeRequest('/api/bank-integration/accounts/sync-all', 'POST');
  }

  async disconnectBankAccount(accountId) {
    return this.makeRequest(`/api/bank-integration/accounts/${accountId}`, 'DELETE');
  }

  async getTotalBankBalance() {
    return this.makeRequest('/api/bank-integration/accounts/total-balance', 'GET');
  }

  async getBankAccountTypes() {
    return this.makeRequest('/api/bank-integration/account-types', 'GET');
  }
}

export const apiService = new ApiService();
export const api = apiService; // Alias for convenience
export default apiService;