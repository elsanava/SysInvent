 function updateKPIs() {
    // Calcular margen bruto
    const totalCost = inventoryProducts.reduce((sum, product) => sum + (product.stock * product.cost), 0);
    const totalValue = inventoryProducts.reduce((sum, product) => sum + (product.stock * product.price), 0);
    const grossMargin = totalValue > 0 ? ((totalValue - totalCost) / totalValue * 100).toFixed(1) : 0;
    
    document.getElementById('grossMargin').textContent = `${grossMargin}%`;
    
    // Calcular rotación de inventario (simplificado)
    const totalSales = invoices.filter(invoice => invoice.status === "Vendida" && invoice.orderType === "sales").reduce((sum, invoice) => sum + invoice.total, 0);
    const avgInventory = totalValue / 2; // Simplificación
    const inventoryTurnover = avgInventory > 0 ? (totalSales / avgInventory).toFixed(1) : 0;
    
    document.getElementById('inventoryTurnover').textContent = inventoryTurnover;
    
    // Calcular tasa de venta
    const totalStock = inventoryProducts.reduce((sum, product) => sum + product.stock, 0);
    const totalSold = invoices.filter(invoice => invoice.status === "Vendida" && invoice.orderType === "sales").reduce((sum, invoice) => {
        return sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    const sellThrough = totalStock > 0 ? (totalSold / (totalStock + totalSold) * 100).toFixed(1) : 0;
    
    document.getElementById('sellThrough').textContent = `${sellThrough}%`;
    
    // Calcular tasa de ruptura de stock
    const outOfStockProducts = inventoryProducts.filter(p => p.stock === 0).length;
    const stockoutRate = inventoryProducts.length > 0 ? (outOfStockProducts / inventoryProducts.length * 100).toFixed(1) : 0;
    
    document.getElementById('stockoutRate').textContent = `${stockoutRate}%`;
}

 function updateDashboard() {
  // Obtener referencias a los elementos del dashboard
  const totalProducts = document.getElementById('totalProducts');
  const monthlySales = document.getElementById('monthlySales');
  const purchaseOrdersEl = document.getElementById('purchaseOrders');
  const monthlyIncome = document.getElementById('monthlyIncome');
  const lowStockCount = document.getElementById('lowStockCount');

  // Si alguno no existe, salimos (evita error de textContent = null)
  if (!totalProducts || !monthlySales || !purchaseOrdersEl || !monthlyIncome || !lowStockCount) {
    console.warn("⏳ Dashboard aún no cargado, se omite actualización.");
    return;
  }

  // Actualizar estadísticas
  totalProducts.textContent = inventoryProducts.length;

  // Calcular ventas del mes
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySalesCount = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.date);
    return (
      invoiceDate.getMonth() === currentMonth &&
      invoiceDate.getFullYear() === currentYear &&
      invoice.status === "Vendida" &&
      invoice.orderType === "sales"
    );
  }).length;

  monthlySales.textContent = monthlySalesCount;
  purchaseOrdersEl.textContent = purchaseOrders.length;

  // Calcular ingresos del mes
  const monthlyIncomeValue = invoices
    .filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return (
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear &&
        invoice.status === "Vendida" &&
        invoice.orderType === "sales"
      );
    })
    .reduce((total, invoice) => total + (invoice.total || 0), 0);

  monthlyIncome.textContent = `$${monthlyIncomeValue.toLocaleString()}`;

  // Calcular productos con stock bajo
  const lowStockProducts = inventoryProducts.filter(
    p => p.stock <= p.minStock && p.stock > 0
  );
  lowStockCount.textContent = lowStockProducts.length;

  // Actualizar otros componentes (solo si existen)
  if (typeof updateSalesAnalysisChart === "function") updateSalesAnalysisChart();
  if (typeof updateNotifications === "function") updateNotifications();
  if (typeof updateAlerts === "function") updateAlerts();
  if (typeof showSyncStatus === "function") showSyncStatus();
}

function updateNotifications() {
    const notificationCount = document.getElementById('notificationCount');
    const notificationsList = document.getElementById('notificationsList');
    
    if (!notificationCount || !notificationsList) return;
    
    // Limpiar notificaciones existentes (excepto el encabezado)
    while (notificationsList.children.length > 1) {
        notificationsList.removeChild(notificationsList.lastChild);
    }
    
    // Contar productos con stock bajo o agotado
    const lowStockCount = inventoryProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    const outOfStockCount = inventoryProducts.filter(p => p.stock === 0).length;
    const totalNotifications = lowStockCount + outOfStockCount;
    
    notificationCount.textContent = totalNotifications;
    
    // Agregar notificaciones a la lista
    if (totalNotifications === 0) {
        const noNotificationsItem = document.createElement('li');
        noNotificationsItem.innerHTML = '<a class="dropdown-item text-muted">No hay notificaciones</a>';
        notificationsList.appendChild(noNotificationsItem);
    } else {
        // Notificaciones de stock bajo
        if (lowStockCount > 0) {
            const notificationItem = document.createElement('li');
            notificationItem.innerHTML = `
                <a class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                        <div>
                            <small>${lowStockCount} producto(s) con stock bajo</small>
                        </div>
                    </div>
                </a>
            `;
            notificationsList.appendChild(notificationItem);
        }
        
        // Notificaciones de stock agotado
        if (outOfStockCount > 0) {
            const notificationItem = document.createElement('li');
            notificationItem.innerHTML = `
                <a class="dropdown-item">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-times-circle text-danger me-2"></i>
                        <div>
                            <small>${outOfStockCount} producto(s) agotados</small>
                        </div>
                    </div>
                </a>
            `;
            notificationsList.appendChild(notificationItem);
        }
    }
}

function updateAlerts() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;
    
    // Alertas simuladas basadas en datos
    const lowStockProducts = inventoryProducts.filter(p => p.stock <= p.minStock && p.stock > 0);
    
    let alertsHTML = '';
    
    if (lowStockProducts.length > 0) {
        alertsHTML += `
            <div class="col-md-6">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Stock Bajo:</strong> ${lowStockProducts.length} productos necesitan reabastecimiento
                </div>
            </div>
        `;
    }
    
    // Alerta de ventas
    alertsHTML += `
        <div class="col-md-6">
            <div class="alert alert-info">
                <i class="fas fa-chart-line me-2"></i>
                <strong>Ventas:</strong> Proyección positiva para el próximo mes
            </div>
        </div>
    `;
    
    container.innerHTML = alertsHTML;
}


function updateInventoryTurnoverChart() {
    const ctx = document.getElementById('inventoryTurnoverChart');
    if (!ctx) return;
    
    // Calcular rotación mensual
    const monthlyTurnover = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    
    invoices.filter(invoice => invoice.status === "Vendida" && invoice.orderType === "sales").forEach(invoice => {
        const invoiceDate = new Date(invoice.date);
        const month = invoiceDate.getMonth();
        
        // Calcular valor de inventario promedio para el mes (simplificado)
        const avgInventory = inventoryProducts.reduce((sum, product) => sum + (product.stock * product.cost), 0) / 2;
        
        if (avgInventory > 0) {
            monthlyTurnover[month] += invoice.total / avgInventory;
        }
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Rotación de Inventario',
                data: monthlyTurnover,
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Agrupar productos por categoría
    const categories = {};
    inventoryProducts.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = 0;
        }
        categories[product.category] += product.stock * product.price;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e74c3c', '#1abc9c']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateSalesAnalysisChart() {
    const ctx = document.getElementById('salesAnalysisChart');
    if (!ctx) return;
    
    // Obtener datos de ventas por mes
    const salesData = getSalesDataByMonth();
    
    // Verificar si ya existe un gráfico y destruirlo
    if (window.salesChartInstance) {
        window.salesChartInstance.destroy();
    }
    
    // Obtener el tipo de gráfico seleccionado
    const chartType = document.querySelector('#salesChartTypeQuantity.active') ? 'quantity' : 'revenue';
    
    // Configurar datos según el tipo seleccionado
    const labels = salesData.months;
    const data = chartType === 'quantity' ? salesData.quantities : salesData.revenues;
    const label = chartType === 'quantity' ? 'Cantidad Vendida' : 'Ingresos ($)';
    const borderColor = chartType === 'quantity' ? '#3498db' : '#2ecc71';
    const backgroundColor = chartType === 'quantity' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(46, 204, 113, 0.1)';
    
    // Crear gráfico
    window.salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: borderColor,
                backgroundColor: backgroundColor,
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (chartType === 'quantity') {
                                label += context.parsed.y + ' unidades';
                            } else {
                                label += '$' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: chartType === 'quantity' ? 'Unidades Vendidas' : 'Ingresos ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Meses'
                    }
                }
            }
        }
    });
    
    // Actualizar métricas
    updateSalesMetrics(salesData);
}
