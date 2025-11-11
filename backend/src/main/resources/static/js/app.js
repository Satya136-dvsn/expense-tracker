// Budget Tracker Frontend JavaScript

class BudgetTracker {
    constructor() {
        this.apiUrl = 'http://localhost:8080';
        this.token = localStorage.getItem('authToken');
        this.currentUser = null;
        
        this.initializeElements();
        this.bindEvents();
        this.checkAuthStatus();
    }

    initializeElements() {
        // Navigation elements
        this.navBrand = document.getElementById('nav-brand');
        this.loginBtn = document.getElementById('login-btn');
        this.registerBtn = document.getElementById('register-btn');
        this.logoutBtn = document.getElementById('logout-btn');

        // Section elements
        this.welcomeSection = document.getElementById('welcome-section');
        this.loginSection = document.getElementById('login-section');
        this.registerSection = document.getElementById('register-section');
        this.forgotPasswordSection = document.getElementById('forgot-password-section');
        this.dashboardSection = document.getElementById('dashboard-section');

        // Form elements
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.forgotPasswordForm = document.getElementById('forgot-password-form');

        // Switch links
        this.switchToRegister = document.getElementById('switch-to-register');
        this.switchToLogin = document.getElementById('switch-to-login');
        this.forgotPasswordLink = document.getElementById('forgot-password-link');
        this.backToLogin = document.getElementById('back-to-login');

        // Alert elements
        this.alert = document.getElementById('alert');
        this.alertMessage = document.getElementById('alert-message');
        this.alertClose = document.getElementById('alert-close');

        // Dashboard elements
        this.userNameSpan = document.getElementById('user-name');
        this.monthlyIncomeSpan = document.getElementById('monthly-income');
        this.targetExpensesSpan = document.getElementById('target-expenses');
        this.currentSavingsSpan = document.getElementById('current-savings');
        this.profileInfo = document.getElementById('profile-info');
    }

    bindEvents() {
        // Navigation events
        this.navBrand.addEventListener('click', () => this.showWelcome());
        this.loginBtn.addEventListener('click', () => this.showLogin());
        this.registerBtn.addEventListener('click', () => this.showRegister());
        this.logoutBtn.addEventListener('click', () => this.logout());

        // Form events
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        this.forgotPasswordForm.addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Switch events
        this.switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });
        this.switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });
        this.forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForgotPassword();
        });
        this.backToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Alert close event
        this.alertClose.addEventListener('click', () => this.hideAlert());
    }

    // Section Navigation
    showLogin() {
        this.hideAllSections();
        this.loginSection.style.display = 'flex';
        this.loginSection.style.visibility = 'visible';
        this.updateNavigation(false);
    }

    showRegister() {
        this.hideAllSections();
        this.registerSection.style.display = 'flex';
        this.registerSection.style.visibility = 'visible';
        this.updateNavigation(false);
    }

    showForgotPassword() {
        this.hideAllSections();
        this.forgotPasswordSection.style.display = 'flex';
        this.forgotPasswordSection.style.visibility = 'visible';
        this.updateNavigation(false);
    }

    showDashboard() {
        this.hideAllSections();
        this.dashboardSection.style.display = 'block';
        this.dashboardSection.style.visibility = 'visible';
        this.updateNavigation(true);
        this.loadUserProfile();
    }

    showWelcome() {
        this.hideAllSections();
        this.welcomeSection.style.display = 'block';
        this.welcomeSection.style.visibility = 'visible';
        this.updateNavigation(false);
    }

    hideAllSections() {
        this.welcomeSection.style.display = 'none';
        this.loginSection.style.display = 'none';
        this.registerSection.style.display = 'none';
        this.forgotPasswordSection.style.display = 'none';
        this.dashboardSection.style.display = 'none';
        
        // Also set visibility for better control
        this.welcomeSection.style.visibility = 'hidden';
        this.loginSection.style.visibility = 'hidden';  
        this.registerSection.style.visibility = 'hidden';
        this.forgotPasswordSection.style.visibility = 'hidden';
        this.dashboardSection.style.visibility = 'hidden';
    }

    updateNavigation(isLoggedIn) {
        if (isLoggedIn) {
            this.loginBtn.style.display = 'none';
            this.registerBtn.style.display = 'none';
            this.logoutBtn.style.display = 'block';
        } else {
            this.loginBtn.style.display = 'block';
            this.registerBtn.style.display = 'block';
            this.logoutBtn.style.display = 'none';
        }
    }

    // Authentication
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(this.loginForm);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await this.makeRequest('/api/auth/login', 'POST', loginData);
            
            if (response.token) {
                this.token = response.token;
                localStorage.setItem('authToken', this.token);
                this.showAlert('Login successful!', 'success');
                this.showDashboard();
            } else {
                this.showAlert('Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            this.showAlert('Login failed: ' + error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(this.registerForm);
        const registerData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role') || 'USER'
        };

        try {
            const response = await this.makeRequest('/api/auth/register', 'POST', registerData);
            
            // Check if registration was successful by looking for token or id
            if (response.token && response.id) {
                this.showAlert('Registration successful! You are now logged in.', 'success');
                // Store the token and show dashboard directly
                this.token = response.token;
                localStorage.setItem('authToken', this.token);
                this.currentUser = response;
                this.showDashboard();
            } else if (response.token) {
                this.showAlert('Registration successful! Please login.', 'success');
                this.showLogin();
            } else {
                this.showAlert('Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            this.showAlert('Registration failed: ' + error.message, 'error');
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const formData = new FormData(this.forgotPasswordForm);
        const email = formData.get('email');

        try {
            // For now, show a success message since we don't have a backend endpoint
            // In a real app, you would call: await this.makeRequest('/api/auth/forgot-password', 'POST', {email});
            
            this.showAlert('Password reset link has been sent to your email address. Please check your inbox.', 'success');
            
            // Reset the form
            this.forgotPasswordForm.reset();
            
            // Optionally redirect back to login after a delay
            setTimeout(() => {
                this.showLogin();
            }, 3000);
            
        } catch (error) {
            this.showAlert('Failed to send reset email: ' + error.message, 'error');
        }
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.showAlert('Logged out successfully!', 'success');
        this.showWelcome();
    }

    checkAuthStatus() {
        if (this.token) {
            this.showDashboard();
        } else {
            this.showWelcome();
        }
        
        // Force show welcome section initially
        if (!this.token && this.welcomeSection) {
            this.welcomeSection.style.display = 'block';
        }
    }

    // API Methods
    async makeRequest(endpoint, method = 'GET', data = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(this.apiUrl + endpoint, config);
            const responseText = await response.text();
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
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
                } catch (e) {
                    // If responseText isn't JSON, use it as is
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
                throw new Error('Invalid response from server');
            }
            throw error;
        }
    }

    async loadUserProfile() {
        try {
            const profile = await this.makeRequest('/api/profile', 'GET');
            this.currentUser = profile;
            this.updateDashboard(profile);
        } catch (error) {
            this.showAlert('Failed to load profile: ' + error.message, 'error');
            if (error.message.includes('Authentication failed')) {
                this.logout();
            }
        }
    }

    updateDashboard(profile) {
        // Update user name
        this.userNameSpan.textContent = profile.username || 'User';

        // Update financial information
        this.monthlyIncomeSpan.textContent = this.formatCurrency(profile.monthlyIncome || 0);
        this.targetExpensesSpan.textContent = this.formatCurrency(profile.targetExpenses || 0);
        this.currentSavingsSpan.textContent = this.formatCurrency(profile.currentSavings || 0);

        // Update profile information
        this.profileInfo.innerHTML = `
            <div class="profile-item">
                <strong>Username:</strong> ${profile.username || 'N/A'}
            </div>
            <div class="profile-item">
                <strong>Email:</strong> ${profile.email || 'N/A'}
            </div>
            <div class="profile-item">
                <strong>Role:</strong> ${profile.role || 'USER'}
            </div>
            <div class="profile-item">
                <strong>Account Status:</strong> ${profile.enabled ? 'Active' : 'Inactive'}
            </div>
            <div class="profile-item">
                <strong>Member Since:</strong> ${profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </div>
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Alert Methods
    showAlert(message, type = 'info') {
        this.alertMessage.textContent = message;
        this.alert.className = `alert ${type}`;
        this.alert.style.display = 'flex';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideAlert();
        }, 5000);
    }

    hideAlert() {
        this.alert.style.display = 'none';
    }
}

// API Testing Functions (for curl command demonstrations)
const ApiTester = {
    // Test functions that can be called from browser console
    async testApiHealth() {
        try {
            const response = await fetch('http://localhost:8080/health');
            const data = await response.json();
            console.log('Health Check:', data);
            return data;
        } catch (error) {
            console.error('Health check failed:', error);
        }
    },

    async testRegister(username, email, password) {
        const userData = { username, email, password };
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            console.log('Register Test:', data);
            return data;
        } catch (error) {
            console.error('Register test failed:', error);
        }
    },

    async testLogin(username, password) {
        const loginData = { username, password };
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();
            console.log('Login Test:', data);
            return data;
        } catch (error) {
            console.error('Login test failed:', error);
        }
    }
};

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.budgetTracker = new BudgetTracker();
    window.apiTester = ApiTester;
    
    console.log('Budget Tracker initialized!');
    console.log('Test API functions available:');
    console.log('- apiTester.testApiHealth()');
    console.log('- apiTester.testRegister("username", "email@example.com", "password")');
    console.log('- apiTester.testLogin("username", "password")');
});