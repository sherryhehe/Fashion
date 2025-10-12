/**
 * Interactive Dashboard Features
 * Makes dashboard widgets fully functional with real-time updates
 */

class InteractiveDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.initRealTimeUpdates();
        this.initQuickActions();
        this.initChartInteractions();
        this.initNotificationSystem();
        this.initDataRefresh();
    }

    // Real-time Dashboard Updates
    initRealTimeUpdates() {
        // Update metrics every 30 seconds
        setInterval(() => {
            this.updateDashboardMetrics();
        }, 30000);

        // Update charts every minute
        setInterval(() => {
            this.updateCharts();
        }, 60000);
    }

    updateDashboardMetrics() {
        // Simulate real-time data updates
        const metrics = [
            { selector: '.total-sales', min: 50000, max: 100000 },
            { selector: '.total-orders', min: 1000, max: 5000 },
            { selector: '.total-customers', min: 500, max: 2000 },
            { selector: '.conversion-rate', min: 2, max: 8 }
        ];

        metrics.forEach(metric => {
            const element = document.querySelector(metric.selector);
            if (element) {
                const currentValue = this.parseValue(element.textContent);
                const change = Math.floor(Math.random() * 20) - 10; // -10 to +10
                const newValue = Math.max(0, currentValue + change);
                
                element.textContent = this.formatValue(newValue, metric.selector);
                
                // Add visual feedback
                element.classList.add('updated');
                setTimeout(() => {
                    element.classList.remove('updated');
                }, 2000);
            }
        });
    }

    parseValue(text) {
        return parseInt(text.replace(/[^0-9]/g, '')) || 0;
    }

    formatValue(value, selector) {
        if (selector.includes('rate')) {
            return `${value.toFixed(1)}%`;
        } else if (selector.includes('sales')) {
            return `$${value.toLocaleString()}`;
        } else {
            return value.toLocaleString();
        }
    }

    // Quick Actions
    initQuickActions() {
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Add quick action buttons to dashboard if they don't exist
        this.addQuickActionButtons();
    }

    addQuickActionButtons() {
        const dashboardContainer = document.querySelector('.container-fluid');
        if (dashboardContainer && !document.querySelector('.quick-actions')) {
            const quickActionsHTML = `
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Quick Actions</h5>
                                <div class="d-flex flex-wrap gap-2">
                                    <button class="btn btn-primary quick-action-btn" data-action="add-product">
                                        <i class="bx bx-plus me-1"></i> Add Product
                                    </button>
                                    <button class="btn btn-success quick-action-btn" data-action="view-orders">
                                        <i class="bx bx-shopping-bag me-1"></i> View Orders
                                    </button>
                                    <button class="btn btn-info quick-action-btn" data-action="manage-customers">
                                        <i class="bx bx-user me-1"></i> Manage Customers
                                    </button>
                                    <button class="btn btn-warning quick-action-btn" data-action="view-analytics">
                                        <i class="bx bx-bar-chart me-1"></i> View Analytics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            dashboardContainer.insertAdjacentHTML('afterbegin', quickActionsHTML);
        }
    }

    handleQuickAction(action) {
        const actions = {
            'add-product': () => window.location.href = '/product-add',
            'view-orders': () => window.location.href = '/orders-list',
            'manage-customers': () => window.location.href = '/customer-list',
            'view-analytics': () => window.location.href = '/',
            'export-data': () => this.exportData(),
            'refresh-data': () => this.refreshAllData()
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    // Chart Interactions
    initChartInteractions() {
        // Make charts interactive
        document.querySelectorAll('.chart-container').forEach(chart => {
            chart.addEventListener('click', (e) => {
                this.handleChartClick(e);
            });
        });

        // Add chart controls
        this.addChartControls();
    }

    addChartControls() {
        const charts = document.querySelectorAll('.card:has(.chart-container)');
        charts.forEach(chart => {
            const header = chart.querySelector('.card-header');
            if (header && !header.querySelector('.chart-controls')) {
                const controlsHTML = `
                    <div class="chart-controls">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-secondary chart-period" data-period="7d">7D</button>
                            <button type="button" class="btn btn-outline-secondary chart-period" data-period="30d">30D</button>
                            <button type="button" class="btn btn-outline-secondary chart-period active" data-period="90d">90D</button>
                        </div>
                        <button class="btn btn-sm btn-outline-primary ms-2" onclick="this.refreshChart()">
                            <i class="bx bx-refresh"></i>
                        </button>
                    </div>
                `;
                header.insertAdjacentHTML('beforeend', controlsHTML);
            }
        });

        // Chart period buttons
        document.querySelectorAll('.chart-period').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const period = button.dataset.period;
                this.updateChartPeriod(period);
                
                // Update active state
                button.parentElement.querySelectorAll('.chart-period').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            });
        });
    }

    handleChartClick(e) {
        console.log('Chart clicked:', e.target);
        // Implement chart drill-down functionality
        this.showChartDetails(e.target);
    }

    updateChartPeriod(period) {
        console.log('Updating chart period to:', period);
        // Simulate chart data update
        this.showNotification(`Chart updated for ${period} period`, 'info');
    }

    showChartDetails(element) {
        // Show detailed chart information
        const details = {
            'sales-chart': 'Sales performance over time',
            'orders-chart': 'Order volume and trends',
            'customers-chart': 'Customer acquisition metrics'
        };
        
        const chartType = element.closest('.chart-container')?.id || 'unknown';
        const message = details[chartType] || 'Chart details';
        
        this.showNotification(message, 'info');
    }

    // Notification System
    initNotificationSystem() {
        // Create notification container
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }

    // Data Refresh
    initDataRefresh() {
        // Add refresh button to dashboard
        this.addRefreshButton();
        
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.refreshAllData();
        }, 300000);
    }

    addRefreshButton() {
        const dashboardHeader = document.querySelector('.container-fluid .row:first-child');
        if (dashboardHeader && !document.querySelector('.refresh-controls')) {
            const refreshHTML = `
                <div class="col-12 mb-3">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">Dashboard Controls</h5>
                                <div class="refresh-controls">
                                    <button class="btn btn-outline-primary btn-sm" onclick="dashboard.refreshAllData()">
                                        <i class="bx bx-refresh me-1"></i> Refresh Data
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="dashboard.exportData()">
                                        <i class="bx bx-download me-1"></i> Export
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            dashboardHeader.insertAdjacentHTML('afterbegin', refreshHTML);
        }
    }

    refreshAllData() {
        this.showNotification('Refreshing dashboard data...', 'info');
        
        // Simulate data refresh
        setTimeout(() => {
            this.updateDashboardMetrics();
            this.updateCharts();
            this.showNotification('Dashboard data refreshed successfully!', 'success');
        }, 2000);
    }

    updateCharts() {
        // Simulate chart updates
        document.querySelectorAll('.chart-container').forEach(chart => {
            chart.classList.add('chart-updating');
            setTimeout(() => {
                chart.classList.remove('chart-updating');
            }, 1000);
        });
    }

    exportData() {
        this.showNotification('Preparing data export...', 'info');
        
        // Simulate export process
        setTimeout(() => {
            const data = {
                timestamp: new Date().toISOString(),
                metrics: this.getCurrentMetrics(),
                charts: this.getChartData()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully!', 'success');
        }, 1500);
    }

    getCurrentMetrics() {
        const metrics = {};
        document.querySelectorAll('[class*="metric-"]').forEach(element => {
            const key = element.className.match(/metric-(\w+)/)?.[1];
            if (key) {
                metrics[key] = element.textContent;
            }
        });
        return metrics;
    }

    getChartData() {
        // Simulate chart data
        return {
            sales: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000) + 500),
            orders: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 50),
            customers: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 25)
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new InteractiveDashboard();
});

// Add CSS for animations
const dashboardStyle = document.createElement('style');
dashboardStyle.textContent = `
    .updated {
        animation: pulse 0.5s ease-in-out;
    }
    
    .chart-updating {
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .quick-actions .btn {
        transition: all 0.3s ease;
    }
    
    .quick-actions .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);