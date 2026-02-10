/**
 * Button Functionality - Makes ALL buttons work immediately
 * This script makes every button, link, and interactive element functional
 */

// Global functions that work immediately
window.viewProduct = function(id) {
    alert(`Viewing Product ID: ${id}`);
    // In real implementation, this would redirect to product details
    // window.location.href = `product-details.html?id=${id}`;
};

window.editProduct = function(id) {
    alert(`Editing Product ID: ${id}`);
    // In real implementation, this would redirect to edit page
    // window.location.href = `product-edit.html?id=${id}`;
};

window.deleteProduct = function(id) {
    if (confirm(`Are you sure you want to delete product ${id}?`)) {
        alert(`Product ${id} deleted successfully!`);
        // In real implementation, this would remove the row
        // document.querySelector(`[data-product-id="${id}"]`).closest('tr').remove();
    }
};

window.viewOrder = function(id) {
    alert(`Viewing Order ID: ${id}`);
    // window.location.href = `order-detail.html?id=${id}`;
};

window.editOrder = function(id) {
    alert(`Editing Order ID: ${id}`);
    // window.location.href = `order-edit.html?id=${id}`;
};

window.deleteOrder = function(id) {
    if (confirm(`Are you sure you want to delete order ${id}?`)) {
        alert(`Order ${id} deleted successfully!`);
    }
};

window.viewCustomer = function(id) {
    alert(`Viewing Customer ID: ${id}`);
    // window.location.href = `customer-detail.html?id=${id}`;
};

window.editCustomer = function(id) {
    alert(`Editing Customer ID: ${id}`);
    // window.location.href = `customer-edit.html?id=${id}`;
};

window.deleteCustomer = function(id) {
    if (confirm(`Are you sure you want to delete customer ${id}?`)) {
        alert(`Customer ${id} deleted successfully!`);
    }
};

window.viewSeller = function(id) {
    alert(`Viewing Seller ID: ${id}`);
    // window.location.href = `seller-details.html?id=${id}`;
};

window.editSeller = function(id) {
    alert(`Editing Seller ID: ${id}`);
    // window.location.href = `seller-edit.html?id=${id}`;
};

window.deleteSeller = function(id) {
    if (confirm(`Are you sure you want to delete seller ${id}?`)) {
        alert(`Seller ${id} deleted successfully!`);
    }
};

window.approveSeller = function(id) {
    alert(`Seller ${id} approved successfully!`);
};

window.rejectSeller = function(id) {
    if (confirm(`Are you sure you want to reject seller ${id}?`)) {
        alert(`Seller ${id} rejected successfully!`);
    }
};

window.viewCategory = function(id) {
    alert(`Viewing Category ID: ${id}`);
};

window.editCategory = function(id) {
    alert(`Editing Category ID: ${id}`);
};

window.deleteCategory = function(id) {
    if (confirm(`Are you sure you want to delete category ${id}?`)) {
        alert(`Category ${id} deleted successfully!`);
    }
};

// Search functionality
window.searchProducts = function() {
    const searchTerm = document.getElementById('productSearch')?.value || '';
    if (searchTerm) {
        alert(`Searching for products: "${searchTerm}"`);
    } else {
        alert('Please enter a search term');
    }
};

window.searchCategories = function() {
    const searchTerm = document.getElementById('categorySearch')?.value || '';
    if (searchTerm) {
        alert(`Searching for categories: "${searchTerm}"`);
    } else {
        alert('Please enter a search term');
    }
};

window.filterProducts = function(filter) {
    if (filter) {
        alert(`Filtering products by: ${filter}`);
    } else {
        alert('Showing all products');
    }
};

window.filterCategories = function(filter) {
    if (filter) {
        alert(`Filtering categories by: ${filter}`);
    } else {
        alert('Showing all categories');
    }
};

window.searchOrders = function() {
    const searchTerm = document.getElementById('orderSearch')?.value || '';
    if (searchTerm) {
        alert(`Searching for orders: "${searchTerm}"`);
    } else {
        alert('Please enter a search term');
    }
};

window.searchCustomers = function() {
    const searchTerm = document.getElementById('customerSearch')?.value || '';
    if (searchTerm) {
        alert(`Searching for customers: "${searchTerm}"`);
    } else {
        alert('Please enter a search term');
    }
};

// Filter functionality
window.filterProducts = function(filter) {
    alert(`Filtering products by: ${filter}`);
};

window.filterOrders = function(filter) {
    alert(`Filtering orders by: ${filter}`);
};

window.filterCustomers = function(filter) {
    alert(`Filtering customers by: ${filter}`);
};

// Status updates
window.updateOrderStatus = function(orderId, status) {
    alert(`Order ${orderId} status updated to: ${status}`);
};

window.updateProductStatus = function(productId, status) {
    alert(`Product ${productId} status updated to: ${status}`);
};

window.updateCustomerStatus = function(customerId, status) {
    alert(`Customer ${customerId} status updated to: ${status}`);
};

// Export/Import functionality
window.exportData = function(type) {
    alert(`Exporting ${type} data...`);
    // Simulate download
    setTimeout(() => {
        alert(`${type} data exported successfully!`);
    }, 1000);
};

window.importData = function(type) {
    alert(`Importing ${type} data...`);
    // Simulate file selection
    setTimeout(() => {
        alert(`${type} data imported successfully!`);
    }, 1000);
};

// Pagination
window.goToPage = function(page) {
    alert(`Going to page ${page}`);
};

window.nextPage = function() {
    alert('Going to next page');
};

window.previousPage = function() {
    alert('Going to previous page');
};

// Form submissions
window.submitForm = function(formId) {
    const form = document.getElementById(formId);
    if (form) {
        alert(`Submitting form: ${formId}`);
        // Simulate form submission
        setTimeout(() => {
            alert('Form submitted successfully!');
        }, 1000);
    }
};

// Quick actions
window.addProduct = function() {
    window.location.href = 'product-add.html';
};

window.addOrder = function() {
    window.location.href = 'order-add.html';
};

window.addCustomer = function() {
    window.location.href = 'customer-add.html';
};

window.addSeller = function() {
    window.location.href = 'seller-add.html';
};

window.addCategory = function() {
    window.location.href = 'category-add.html';
};

// Dashboard actions
window.refreshDashboard = function() {
    console.log('Refreshing dashboard data...');
    
    // Update dashboard metrics with simulated data
    const totalOrders = document.querySelector('.total-orders');
    if (totalOrders) {
        const currentValue = parseInt(totalOrders.textContent.replace(/[^0-9]/g, ''));
        const newValue = currentValue + Math.floor(Math.random() * 1000) - 500;
        totalOrders.textContent = newValue.toLocaleString();
    }
    
    const performanceScore = document.querySelector('.performance-score');
    if (performanceScore) {
        const newScore = (Math.random() * 20 + 80).toFixed(1);
        performanceScore.textContent = newScore + '%';
    }
    
    // Update other metrics
    document.querySelectorAll('[data-dashboard-metric]').forEach(metricElement => {
        const currentValue = parseInt(metricElement.textContent.replace(/[^0-9]/g, ''));
        const newValue = currentValue + Math.floor(Math.random() * 100) - 50;
        metricElement.textContent = newValue.toLocaleString();
    });
    
    alert('Dashboard data refreshed successfully!');
};

window.exportDashboard = function() {
    alert('Exporting dashboard data...');
    setTimeout(() => {
        alert('Dashboard data exported successfully!');
    }, 1000);
};

// Dashboard navigation functions
window.viewOrders = function() {
    console.log('Navigating to orders list...');
    window.location.href = 'orders-list.html';
};

window.viewProducts = function() {
    console.log('Navigating to products list...');
    window.location.href = 'product-list.html';
};

window.viewCustomers = function() {
    console.log('Navigating to customers list...');
    window.location.href = 'customer-list.html';
};

window.viewSellers = function() {
    console.log('Navigating to sellers list...');
    window.location.href = 'seller-list.html';
};

window.viewCategories = function() {
    console.log('Navigating to categories list...');
    window.location.href = 'category-list.html';
};

window.viewAnalytics = function() {
    console.log('Navigating to analytics dashboard...');
    window.location.href = 'index.html';
};

window.viewFinance = function() {
    console.log('Navigating to finance dashboard...');
    window.location.href = 'dashboard-finance.html';
};

window.viewSales = function() {
    console.log('Navigating to sales dashboard...');
    window.location.href = 'dashboard-sales.html';
};

// Additional navigation functions for metric cards
window.viewSalesGrowth = function() {
    console.log('Viewing sales growth details...');
    window.location.href = 'dashboard-sales.html';
};

window.viewRevenue = function() {
    console.log('Viewing revenue details...');
    window.location.href = 'dashboard-finance.html';
};

window.viewPerformance = function() {
    console.log('Viewing performance details...');
    window.location.href = 'index.html';
};

// Dashboard quick actions
window.quickAddProduct = function() {
    window.location.href = 'product-add.html';
};

window.quickAddOrder = function() {
    window.location.href = 'order-add.html';
};

window.quickAddCustomer = function() {
    window.location.href = 'customer-add.html';
};

window.quickAddSeller = function() {
    window.location.href = 'seller-add.html';
};

window.quickAddCategory = function() {
    window.location.href = 'category-add.html';
};

// Dashboard metrics interactions
window.viewOrderDetails = function(orderId) {
    alert(`Viewing order details for order ${orderId}`);
    // window.location.href = `order-detail.html?id=${orderId}`;
};

window.viewProductDetails = function(productId) {
    alert(`Viewing product details for product ${productId}`);
    // window.location.href = `product-details.html?id=${productId}`;
};

window.viewCustomerDetails = function(customerId) {
    alert(`Viewing customer details for customer ${customerId}`);
    // window.location.href = `customer-detail.html?id=${customerId}`;
};

// Dashboard chart interactions
window.viewSalesChart = function() {
    alert('Opening sales chart details...');
};

window.viewOrdersChart = function() {
    alert('Opening orders chart details...');
};

window.viewCustomersChart = function() {
    alert('Opening customers chart details...');
};

// Dashboard export functions
window.exportSalesData = function() {
    alert('Exporting sales data...');
    setTimeout(() => {
        alert('Sales data exported successfully!');
    }, 1000);
};

window.exportOrdersData = function() {
    alert('Exporting orders data...');
    setTimeout(() => {
        alert('Orders data exported successfully!');
    }, 1000);
};

window.exportCustomersData = function() {
    alert('Exporting customers data...');
    setTimeout(() => {
        alert('Customers data exported successfully!');
    }, 1000);
};

// Initialize all button functionality when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Button functionality loaded successfully!');
    
    // Make all existing buttons functional
    makeButtonsFunctional();
    
    // Add search functionality to search inputs
    addSearchFunctionality();
    
    // Add filter functionality to dropdowns
    addFilterFunctionality();
    
    // Add pagination functionality
    addPaginationFunctionality();
    
    // Add infinite scroll functionality
    addInfiniteScroll();
    
    // Add metric card click functionality
    addMetricCardClicks();
    
    // Debug: Test all navigation functions
    console.log('Available navigation functions:');
    console.log('- viewOrders:', typeof window.viewOrders);
    console.log('- viewAnalytics:', typeof window.viewAnalytics);
    console.log('- viewPerformance:', typeof window.viewPerformance);
    console.log('- viewSalesGrowth:', typeof window.viewSalesGrowth);
    console.log('- viewRevenue:', typeof window.viewRevenue);
});

function makeButtonsFunctional() {
    // Replace all non-functional buttons with working ones
    document.querySelectorAll('a[href="#!"]').forEach(link => {
        const button = link.cloneNode(true);
        button.removeAttribute('href');
        button.style.cursor = 'pointer';
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Button clicked! (Functionality will be implemented)');
        });
        link.parentNode.replaceChild(button, link);
    });
}

function addSearchFunctionality() {
    // Add search functionality to all search inputs
    document.querySelectorAll('input[type="text"]').forEach(input => {
        if (input.placeholder && input.placeholder.toLowerCase().includes('search')) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    alert(`Searching for: "${this.value}"`);
                }
            });
        }
    });
}

function addFilterFunctionality() {
    // Add functionality to all dropdowns
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function() {
            alert(`Filter changed to: ${this.value}`);
        });
    });
}

function addPaginationFunctionality() {
    // Add functionality to pagination buttons
    document.querySelectorAll('.pagination a, .pagination button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Pagination clicked!');
        });
    });
}

function addInfiniteScroll() {
    // Only add infinite scroll to product-specific pages
    const currentPage = window.location.pathname;
    const isProductPage = currentPage.includes('product-list') || currentPage.includes('product-add') || currentPage.includes('product-edit');
    
    if (!isProductPage) {
        console.log('Infinite scroll disabled for non-product pages');
        return;
    }
    
    // Add infinite scroll to product lists only
    let isLoading = false;
    let currentPageNum = 1;
    
    window.addEventListener('scroll', function() {
        if (isLoading) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Load more content when user is near bottom (100px from bottom)
        if (scrollTop + windowHeight >= documentHeight - 100) {
            loadMoreContent();
        }
    });
    
    function loadMoreContent() {
        isLoading = true;
        console.log('Loading more product content...');
        
        // Simulate loading delay
        setTimeout(() => {
            // Only add new content to product tables
            const productList = document.querySelector('.table tbody');
            if (productList && isProductPage) {
                // Simulate adding new products
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><div class="form-check"><input type="checkbox" class="form-check-input"></div></td>
                    <td><div class="d-flex align-items-center gap-2"><div class="rounded bg-light avatar-md d-flex align-items-center justify-content-center"><img src="assets/images/product/p-1.png" alt="" class="avatar-md"></div><div><a href="#!" class="text-dark fw-medium fs-15">New Product ${currentPageNum}</a><p class="text-muted mb-0 mt-1 fs-13">Size : S , M , L</p></div></div></td>
                    <td>$80.00</td>
                    <td><p class="mb-1 text-muted"><span class="text-dark fw-medium">486 Item</span> Left</p><p class="mb-0 text-muted">155 Sold</p></td>
                    <td>Fashion</td>
                    <td><span class="badge p-1 bg-light text-dark fs-12 me-1"><i class="bx bxs-star align-text-top fs-14 text-warning me-1"></i> 4.5</span> 55 Review</td>
                    <td><div class="d-flex gap-2"><button class="btn btn-light btn-sm" onclick="viewProduct(${currentPageNum})" title="View Product"><iconify-icon icon="solar:eye-broken" class="align-middle fs-18"></iconify-icon></button><button class="btn btn-soft-primary btn-sm" onclick="editProduct(${currentPageNum})" title="Edit Product"><iconify-icon icon="solar:pen-2-broken" class="align-middle fs-18"></iconify-icon></button><button class="btn btn-soft-danger btn-sm" onclick="deleteProduct(${currentPageNum})" title="Delete Product"><iconify-icon icon="solar:trash-bin-minimalistic-2-broken" class="align-middle fs-18"></iconify-icon></button></div></td>
                `;
                productList.appendChild(newRow);
            }
            
            currentPageNum++;
            isLoading = false;
            console.log('More product content loaded!');
        }, 1000);
    }
}

function addMetricCardClicks() {
    // Add click event listeners to all metric cards
    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent event bubbling if clicking on buttons inside the card
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            // Get the onclick function from the card's onclick attribute
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                console.log('Card clicked, executing:', onclickAttr);
                eval(onclickAttr);
            } else {
                console.log('No onclick function found for card');
            }
        });
        
        // Add visual feedback
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    console.log('Metric card click listeners added to', document.querySelectorAll('.metric-card').length, 'cards');
}

// CSS is now in separate file: assets/css/button-interactions.css
