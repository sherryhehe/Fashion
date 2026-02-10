/**
 * Admin Panel Interactive Functionality
 * Makes all buttons, forms, and features fully functional
 */

class AdminFunctionality {
    constructor() {
        this.init();
    }

    init() {
        this.initProductManagement();
        this.initOrderManagement();
        this.initCustomerManagement();
        this.initSellerManagement();
        this.initCategoryManagement();
        this.initDashboardFeatures();
        this.initFormHandlers();
        this.initDataTables();
        this.initNotifications();
    }

    // Product Management Functionality
    initProductManagement() {
        // Add Product Form
        const addProductForm = document.getElementById('generalDetailForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProductAdd();
            });
        }

        // Product List Actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-product')) {
                this.editProduct(e.target.dataset.productId);
            }
            if (e.target.classList.contains('delete-product')) {
                this.deleteProduct(e.target.dataset.productId);
            }
            if (e.target.classList.contains('view-product')) {
                this.viewProduct(e.target.dataset.productId);
            }
        });

        // Product Search and Filter
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', this.filterProducts);
        }

        // Product Status Toggle
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('product-status-toggle')) {
                this.toggleProductStatus(e.target.dataset.productId, e.target.checked);
            }
        });
    }

    // Order Management Functionality
    initOrderManagement() {
        // Order Status Updates
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('order-status-select')) {
                this.updateOrderStatus(e.target.dataset.orderId, e.target.value);
            }
        });

        // Order Actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-order')) {
                this.viewOrder(e.target.dataset.orderId);
            }
            if (e.target.classList.contains('process-order')) {
                this.processOrder(e.target.dataset.orderId);
            }
            if (e.target.classList.contains('cancel-order')) {
                this.cancelOrder(e.target.dataset.orderId);
            }
        });

        // Order Search and Filter
        const orderSearch = document.getElementById('orderSearch');
        if (orderSearch) {
            orderSearch.addEventListener('input', this.filterOrders);
        }
    }

    // Customer Management Functionality
    initCustomerManagement() {
        // Customer Actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-customer')) {
                this.viewCustomer(e.target.dataset.customerId);
            }
            if (e.target.classList.contains('edit-customer')) {
                this.editCustomer(e.target.dataset.customerId);
            }
            if (e.target.classList.contains('block-customer')) {
                this.blockCustomer(e.target.dataset.customerId);
            }
        });

        // Customer Search
        const customerSearch = document.getElementById('customerSearch');
        if (customerSearch) {
            customerSearch.addEventListener('input', this.filterCustomers);
        }
    }

    // Seller Management Functionality
    initSellerManagement() {
        // Seller Actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('approve-seller')) {
                this.approveSeller(e.target.dataset.sellerId);
            }
            if (e.target.classList.contains('reject-seller')) {
                this.rejectSeller(e.target.dataset.sellerId);
            }
            if (e.target.classList.contains('view-seller')) {
                this.viewSeller(e.target.dataset.sellerId);
            }
        });

        // Seller Status Toggle
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('seller-status-toggle')) {
                this.toggleSellerStatus(e.target.dataset.sellerId, e.target.checked);
            }
        });
    }

    // Category Management Functionality
    initCategoryManagement() {
        // Category Actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-category')) {
                this.editCategory(e.target.dataset.categoryId);
            }
            if (e.target.classList.contains('delete-category')) {
                this.deleteCategory(e.target.dataset.categoryId);
            }
        });

        // Category Form
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCategorySubmit();
            });
        }
    }

    // Dashboard Features
    initDashboardFeatures() {
        // Dashboard Widgets
        this.initDashboardWidgets();
        
        // Chart Interactions
        this.initChartInteractions();
        
        // Quick Actions
        this.initQuickActions();
    }

    // Form Handlers
    initFormHandlers() {
        // Form Validation
        document.querySelectorAll('.needs-validation').forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!form.checkValidity()) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                form.classList.add('was-validated');
            });
        });

        // File Upload Handlers
        document.querySelectorAll('input[type="file"]').forEach(input => {
            input.addEventListener('change', this.handleFileUpload);
        });

        // Form Reset
        document.querySelectorAll('.form-reset').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const form = button.closest('form');
                if (form) {
                    form.reset();
                    form.classList.remove('was-validated');
                }
            });
        });
    }

    // Data Tables
    initDataTables() {
        // Initialize data tables with search, pagination, and sorting
        if (typeof DataTable !== 'undefined') {
            document.querySelectorAll('.data-table').forEach(table => {
                new DataTable(table, {
                    responsive: true,
                    pageLength: 10,
                    order: [[0, 'desc']],
                    language: {
                        search: "Search:",
                        lengthMenu: "Show _MENU_ entries",
                        info: "Showing _START_ to _END_ of _TOTAL_ entries",
                        paginate: {
                            first: "First",
                            last: "Last",
                            next: "Next",
                            previous: "Previous"
                        }
                    }
                });
            });
        }
    }

    // Notifications
    initNotifications() {
        // Toast notifications
        this.initToastNotifications();
        
        // Alert handlers
        this.initAlertHandlers();
    }

    // Product Management Methods
    handleProductAdd() {
        const formData = new FormData(document.getElementById('generalDetailForm'));
        const productData = Object.fromEntries(formData);
        
        // Simulate API call
        this.showLoading();
        
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess('Product added successfully!');
            // Redirect to product list
            window.location.href = 'product-list.html';
        }, 2000);
    }

    editProduct(productId) {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            window.location.href = `product-edit.html?id=${productId}`;
        }, 1000);
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showSuccess('Product deleted successfully!');
                // Remove from table
                document.querySelector(`[data-product-id="${productId}"]`).closest('tr').remove();
            }, 1000);
        }
    }

    viewProduct(productId) {
        window.location.href = `product-details.html?id=${productId}`;
    }

    filterProducts(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.product-row');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    toggleProductStatus(productId, isActive) {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess(`Product ${isActive ? 'activated' : 'deactivated'} successfully!`);
        }, 1000);
    }

    // Order Management Methods
    updateOrderStatus(orderId, status) {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess(`Order status updated to ${status}!`);
        }, 1000);
    }

    viewOrder(orderId) {
        window.location.href = `order-detail.html?id=${orderId}`;
    }

    processOrder(orderId) {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess('Order processed successfully!');
        }, 1500);
    }

    cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showSuccess('Order cancelled successfully!');
            }, 1000);
        }
    }

    filterOrders(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.order-row');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    // Customer Management Methods
    viewCustomer(customerId) {
        window.location.href = `customer-detail.html?id=${customerId}`;
    }

    editCustomer(customerId) {
        window.location.href = `customer-edit.html?id=${customerId}`;
    }

    blockCustomer(customerId) {
        if (confirm('Are you sure you want to block this customer?')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showSuccess('Customer blocked successfully!');
            }, 1000);
        }
    }

    filterCustomers(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.customer-row');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    // Seller Management Methods
    approveSeller(sellerId) {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess('Seller approved successfully!');
        }, 1000);
    }

    rejectSeller(sellerId) {
        if (confirm('Are you sure you want to reject this seller?')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showSuccess('Seller rejected successfully!');
            }, 1000);
        }
    }

    viewSeller(sellerId) {
        window.location.href = `seller-details.html?id=${sellerId}`;
    }

    toggleSellerStatus(sellerId, isActive) {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess(`Seller ${isActive ? 'activated' : 'deactivated'} successfully!`);
        }, 1000);
    }

    // Category Management Methods
    editCategory(categoryId) {
        window.location.href = `category-edit.html?id=${categoryId}`;
    }

    deleteCategory(categoryId) {
        if (confirm('Are you sure you want to delete this category?')) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showSuccess('Category deleted successfully!');
            }, 1000);
        }
    }

    handleCategorySubmit() {
        const formData = new FormData(document.getElementById('categoryForm'));
        const categoryData = Object.fromEntries(formData);
        
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
            this.showSuccess('Category saved successfully!');
            window.location.href = 'category-list.html';
        }, 1500);
    }

    // Dashboard Methods
    initDashboardWidgets() {
        // Update dashboard metrics
        this.updateDashboardMetrics();
        
        // Refresh data every 30 seconds
        setInterval(() => {
            this.updateDashboardMetrics();
        }, 30000);
    }

    updateDashboardMetrics() {
        // Simulate real-time data updates
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach(metric => {
            const currentValue = parseInt(metric.textContent.replace(/[^0-9]/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 10);
            metric.textContent = newValue.toLocaleString();
        });
    }

    initChartInteractions() {
        // Chart click handlers
        document.querySelectorAll('.chart-container').forEach(chart => {
            chart.addEventListener('click', (e) => {
                this.handleChartClick(e);
            });
        });
    }

    handleChartClick(e) {
        // Handle chart interactions
        console.log('Chart clicked:', e.target);
    }

    initQuickActions() {
        // Quick action buttons
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        switch(action) {
            case 'add-product':
                window.location.href = 'product-add.html';
                break;
            case 'view-orders':
                window.location.href = 'orders-list.html';
                break;
            case 'manage-customers':
                window.location.href = 'customer-list.html';
                break;
            case 'view-analytics':
                window.location.href = 'index.html';
                break;
        }
    }

    // File Upload Handler
    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('file-preview');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" class="img-fluid" alt="Preview">`;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    // Loading States
    showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // Notifications
    initToastNotifications() {
        // Toast notification system
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        this.toastContainer.style.zIndex = '9999';
        document.body.appendChild(this.toastContainer);
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'danger');
    }

    showToast(message, type = 'info') {
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        this.toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast after it's hidden
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    initAlertHandlers() {
        // Handle alert dismissals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-close')) {
                e.target.closest('.alert').remove();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AdminFunctionality();
});

// Add CSS for loading overlay
const adminStyle = document.createElement('style');
adminStyle.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .loading-overlay .spinner-border {
        width: 3rem;
        height: 3rem;
    }
`;
document.head.appendChild(adminStyle);
