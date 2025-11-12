// ===============================
// REPORTES - ANÁLISIS DE DATOS
// ===============================

function generateSalesReport() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySales = invoices.filter(invoice => {
    const date = new Date(invoice.date);
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear &&
      invoice.status === "Vendida" &&
      invoice.orderType === "sales"
    );
  });

  const monthlyIncome = monthlySales.reduce((t, inv) => t + inv.total, 0);

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const previousMonthlySales = invoices.filter(invoice => {
    const date = new Date(invoice.date);
    return (
      date.getMonth() === previousMonth &&
      date.getFullYear() === previousYear &&
      invoice.status === "Vendida" &&
      invoice.orderType === "sales"
    );
  });

  const previousMonthlyIncome = previousMonthlySales.reduce((t, inv) => t + inv.total, 0);

  const growth =
    previousMonthlyIncome > 0
      ? ((monthlyIncome - previousMonthlyIncome) / previousMonthlyIncome * 100).toFixed(1)
      : 0;

  showReport('Informe de Ventas', `
    <h5>Resumen de Ventas</h5>
    <p>Total de ventas este mes: <b>$${monthlyIncome.toLocaleString()}</b></p>
    <p>Ventas del mes anterior: <b>$${previousMonthlyIncome.toLocaleString()}</b></p>
    <p>Crecimiento: <b>${growth}%</b></p>

    <h5 class="mt-4">Productos Más Vendidos</h5>
    <ul>${getTopProductsList()}</ul>
  `);
}

function getSalesDataByMonth() {
    const months = [];
    const quantities = [];
    const revenues = [];
    
    // Obtener el período seleccionado
    const period = parseInt(document.querySelector('#salesPeriodDropdown').textContent.match(/\d+/)[0]) || 6;
    
    // Generar meses para el período seleccionado
    const currentDate = new Date();
    for (let i = period - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        months.push(monthName);
        
        // Calcular ventas para este mes (simulación con datos reales si están disponibles)
        const monthSales = calculateSalesForMonth(date);
        quantities.push(monthSales.quantity);
        revenues.push(monthSales.revenue);
    }
    
    return { months, quantities, revenues };
}

function calculateSalesForMonth(date) {
    // Filtrar facturas de venta para el mes y año específicos
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthlyInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === month && 
               invoiceDate.getFullYear() === year && 
               invoice.orderType === 'sales' && 
               invoice.status === 'Vendida';
    });
    
    // Calcular cantidad total y ingresos
    let totalQuantity = 0;
    let totalRevenue = 0;
    
    monthlyInvoices.forEach(invoice => {
        invoice.items.forEach(item => {
            totalQuantity += item.quantity;
            totalRevenue += item.quantity * item.price;
        });
    });
    
    // Si no hay datos reales, generar datos simulados basados en tendencias
    if (totalQuantity === 0) {
        // Simular datos con una tendencia creciente y estacionalidad
        const baseQuantity = 100;
        const growthFactor = 1.1; // 10% de crecimiento mensual
        const seasonalFactor = 1 + 0.2 * Math.sin(month * Math.PI / 6); // Variación estacional
        
        // Calcular el índice del mes en el período
        const currentDate = new Date();
        const monthIndex = (month + 12 - currentDate.getMonth()) % 12;
        
        totalQuantity = Math.round(baseQuantity * Math.pow(growthFactor, monthIndex) * seasonalFactor);
        totalRevenue = totalQuantity * 150; // Precio promedio estimado
    }
    
    return { quantity: totalQuantity, revenue: totalRevenue };
}


// Productos más vendidos (dummy)
function getTopProductsList() {
  const topProducts = [
    { name: "Martillo", qty: 120 },
    { name: "Cemento Gris", qty: 95 },
    { name: "Tubo PVC 3''", qty: 82 },
  ];
  return topProducts.map(p => `<li>${p.name} — ${p.qty} unidades</li>`).join('');
}

function generatePurchasesReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPurchases = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear && invoice.orderType === "purchase";
    });
    
    const monthlyExpenses = monthlyPurchases.reduce((total, invoice) => total + invoice.total, 0);
    
    showReport('Informe de Compras', `
        <h5>Resumen de Compras</h5>
        <p>Total de compras este mes: $${monthlyExpenses.toLocaleString()}</p>
        <p>Número de facturas de compra: ${monthlyPurchases.length}</p>
        
        <h5 class="mt-4">Principales Proveedores</h5>
        <ul>
            ${getTopSuppliersList()}
        </ul>
    `);
}

function generatePurchasesReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPurchases = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear && invoice.orderType === "purchase";
    });
    
    const monthlyExpenses = monthlyPurchases.reduce((total, invoice) => total + invoice.total, 0);
    
    showReport('Informe de Compras', `
        <h5>Resumen de Compras</h5>
        <p>Total de compras este mes: $${monthlyExpenses.toLocaleString()}</p>
        <p>Número de facturas de compra: ${monthlyPurchases.length}</p>
        
        <h5 class="mt-4">Principales Proveedores</h5>
        <ul>
            ${getTopSuppliersList()}
        </ul>
    `);
}

function getTopProductsList() {
    const productSales = {};
    
    invoices.filter(invoice => invoice.status === "Vendida" && invoice.orderType === "sales").forEach(invoice => {
        invoice.items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = 0;
            }
            productSales[item.productId] += item.quantity;
        });
    });
    
    const topProducts = Object.keys(productSales)
        .map(productId => {
            const product = inventoryProducts.find(p => p.id == productId);
            return {
                name: product ? product.name : 'Producto no encontrado',
                quantity: productSales[productId]
            };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    if (topProducts.length === 0) {
        return '<li>No hay datos de ventas</li>';
    }
    
    return topProducts.map(product => 
        `<li>${product.name} - ${product.quantity} unidades</li>`
    ).join('');
}

function generateInventoryReport() {
    const lowStockProducts = inventoryProducts.filter(p => p.stock <= p.minStock && p.stock > 0);
    const outOfStockProducts = inventoryProducts.filter(p => p.stock === 0);
    
    const totalInventoryValue = inventoryProducts.reduce((total, product) => total + (product.stock * product.cost), 0);
    
    showReport('Informe de Inventario', `
        <h5>Estado del Inventario</h5>
        <p>Valor total del inventario: $${totalInventoryValue.toLocaleString()}</p>
        <p>Productos con stock bajo: ${lowStockProducts.length}</p>
        <p>Productos sin stock: ${outOfStockProducts.length}</p>
        
        <h5 class="mt-4">Productos con Stock Bajo</h5>
        <ul>
            ${lowStockProducts.map(product => 
                `<li>${product.name} - Stock: ${product.stock} (Mínimo: ${product.minStock})</li>`
            ).join('') || '<li>No hay productos con stock bajo</li>'}
        </ul>
        
        <h5 class="mt-4">Productos Agotados</h5>
        <ul>
            ${outOfStockProducts.map(product => 
                `<li>${product.name} - Stock: ${product.stock}</li>`
            ).join('') || '<li>No hay productos agotados</li>'}
        </ul>
    `);
}

function generateCustomersReport() {
    const customerTypes = {};
    customers.forEach(customer => {
        if (!customerTypes[customer.type]) {
            customerTypes[customer.type] = 0;
        }
        customerTypes[customer.type]++;
    });
    
    // Calcular clientes nuevos este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newCustomers = customers.filter(customer => {
        const customerDate = new Date(customer.createdAt || new Date());
        return customerDate.getMonth() === currentMonth && customerDate.getFullYear() === currentYear;
    });
    
    showReport('Informe de Clientes', `
        <h5>Resumen de Clientes</h5>
        <p>Total de clientes: ${customers.length}</p>
        <p>Clientes nuevos este mes: ${newCustomers.length}</p>
        
        <h5 class="mt-4">Tipos de Clientes</h5>
        <ul>
            ${Object.entries(customerTypes).map(([type, count]) => 
                `<li>${type}: ${count} clientes</li>`
            ).join('')}
        </ul>
    `);
}

function generateSuppliersReport() {
    showReport('Informe de Proveedores', `
        <h5>Resumen de Proveedores</h5>
        <p>Total de proveedores: ${suppliers.length}</p>
        <p>Proveedores activos: ${suppliers.length}</p>
        <p>Proveedores con pedidos pendientes: ${purchaseOrders.filter(order => order.status === 'Pendiente').length}</p>
        
        <h5 class="mt-4">Evaluación de Proveedores</h5>
        <ul>
            ${suppliers.map(supplier => 
                `<li>${supplier.name} - Pedidos: ${purchaseOrders.filter(order => order.supplierId === supplier.id).length}</li>`
            ).join('') || '<li>No hay proveedores registrados</li>'}
        </ul>
    `);
}

function generateFinancialReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear && invoice.status === "Vendida" && invoice.orderType === "sales";
    }).reduce((total, invoice) => total + invoice.total, 0);
    
    const monthlyExpenses = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear && invoice.orderType === "purchase";
    }).reduce((total, invoice) => total + invoice.total, 0);
    
    const grossProfit = monthlyIncome - monthlyExpenses;
    const profitMargin = monthlyIncome > 0 ? (grossProfit / monthlyIncome * 100).toFixed(1) : 0;
    
    showReport('Informe Financiero', `
        <h5>Estado Financiero</h5>
        <p>Ingresos este mes: $${monthlyIncome.toLocaleString()}</p>
        <p>Gastos este mes: $${monthlyExpenses.toLocaleString()}</p>
        <p>Utilidad bruta: $${grossProfit.toLocaleString()}</p>
        <p>Margen de utilidad: ${profitMargin}%</p>
        
        <h5 class="mt-4">Proyección</h5>
        <p>Proyección de ingresos para el próximo mes: $${(monthlyIncome * 1.1).toLocaleString()}</p>
        <p>Proyección de gastos para el próximo mes: $${(monthlyExpenses * 1.05).toLocaleString()}</p>
        <p>Utilidad proyectada: $${(monthlyIncome * 1.1 - monthlyExpenses * 1.05).toLocaleString()}</p>
    `);
}

function showReport(title, content) {
    document.getElementById('reportTitle').textContent = title;
    document.getElementById('reportContent').innerHTML = content;
    document.getElementById('reportResults').style.display = 'block';
    
    // Scroll hacia el informe
    document.getElementById('reportResults').scrollIntoView({ behavior: 'smooth' });
}

function printReport() {
    const reportTitle = document.getElementById('reportTitle').textContent;
    const reportContent = document.getElementById('reportContent').innerHTML;
    
    // Crear contenido para imprimir
    const printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; color: #3498db;">SysInvent</h2>
            <h3 style="text-align: center;">${reportTitle}</h3>
            <hr>
            <div>${reportContent}</div>
            <div style="margin-top: 30px; text-align: right; font-size: 12px;">
                <p>Generado el: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${reportTitle} - SysInvent</title>
                <style>
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function loadReports() {
    // Actualizar KPIs basados en datos reales
    updateKPIs();
    
    // Actualizar gráficos
    updateCategoryChart();
    updateInventoryTurnoverChart();
}

function updateSalesMetrics(salesData) {
    // Calcular métricas
    const currentMonthSales = salesData.quantities[salesData.quantities.length - 1];
    const previousMonthSales = salesData.quantities[salesData.quantities.length - 2];
    
    // Calcular crecimiento del mes actual
    const currentMonthGrowth = previousMonthSales > 0 
        ? ((currentMonthSales - previousMonthSales) / previousMonthSales * 100).toFixed(1)
        : 0;
    
    // Calcular crecimiento general
    const firstMonthSales = salesData.quantities[0];
    const lastMonthSales = salesData.quantities[salesData.quantities.length - 1];
    const overallGrowth = firstMonthSales > 0 
        ? ((lastMonthSales - firstMonthSales) / firstMonthSales * 100).toFixed(1)
        : 0;
    
    // Calcular promedio diario (asumiendo 30 días por mes)
    const dailyAverage = (currentMonthSales / 30).toFixed(1);
    
    // Encontrar el producto más vendido
    const topProductInfo = getTopSellingProduct();
    
    // Determinar tendencias
    const seasonality = calculateSeasonality(salesData.quantities);
    const forecast = calculateSalesForecast(salesData.quantities);
    
    // Actualizar elementos HTML
    document.getElementById('currentMonthSales').textContent = currentMonthSales.toLocaleString();
    document.getElementById('currentMonthGrowth').textContent = `${currentMonthGrowth >= 0 ? '+' : ''}${currentMonthGrowth}%`;
    document.getElementById('currentMonthGrowth').className = `badge bg-${currentMonthGrowth >= 0 ? 'success' : 'danger'}`;
    
    document.getElementById('salesGrowth').textContent = `Crecimiento: ${overallGrowth >= 0 ? '+' : ''}${overallGrowth}%`;
    
    document.getElementById('topProduct').textContent = topProductInfo.name || '-';
    document.getElementById('topProductSales').textContent = topProductInfo.quantity ? `${topProductInfo.quantity} unidades` : '0 unidades';
    
    document.getElementById('dailyAverage').textContent = `${dailyAverage} unidades/día`;
    
    document.getElementById('seasonalityTrend').textContent = seasonality;
    document.getElementById('seasonalityTrend').className = getTrendClass(seasonality);
    
    document.getElementById('salesForecast').textContent = forecast;
    document.getElementById('salesForecast').className = getForecastClass(forecast);
}

function getTopSellingProduct() {
    // Calcular el producto más vendido en el último mes
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear && 
               invoice.orderType === 'sales' && 
               invoice.status === 'Vendida';
    });
    
    const productSales = {};
    
    monthlyInvoices.forEach(invoice => {
        invoice.items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = 0;
            }
            productSales[item.productId] += item.quantity;
        });
    });
    
    // Encontrar el producto con más ventas
    let topProductId = null;
    let maxQuantity = 0;
    
    Object.keys(productSales).forEach(productId => {
        if (productSales[productId] > maxQuantity) {
            maxQuantity = productSales[productId];
            topProductId = productId;
        }
    });
    
    if (topProductId) {
        const product = inventoryProducts.find(p => p.id == topProductId);
        return {
            name: product ? product.name : 'Producto no encontrado',
            quantity: maxQuantity
        };
    }
    
    return { name: '-', quantity: 0 };
}

function calculateSeasonality(quantities) {
    if (quantities.length < 3) return 'Baja';
    
    // Calcular la desviación estándar de las cantidades
    const mean = quantities.reduce((a, b) => a + b, 0) / quantities.length;
    const squareDiffs = quantities.map(value => Math.pow(value - mean, 2));
    const variance = squareDiffs.reduce((a, b) => a + b, 0) / quantities.length;
    const stdDev = Math.sqrt(variance);
    
    // Calcular coeficiente de variación
    const cv = stdDev / mean;
    
    if (cv < 0.1) return 'Baja';
    if (cv < 0.25) return 'Media';
    return 'Alta';
}

function calculateSalesForecast(quantities) {
    if (quantities.length < 2) return 'Estable';
    
    // Calcular tendencia basada en los últimos meses
    const recentMonths = quantities.slice(-3);
    const growthRates = [];
    
    for (let i = 1; i < recentMonths.length; i++) {
        const growth = (recentMonths[i] - recentMonths[i-1]) / recentMonths[i-1];
        growthRates.push(growth);
    }
    
    const avgGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    
    if (avgGrowth > 0.1) return 'Alcista';
    if (avgGrowth > 0.02) return 'Moderada';
    if (avgGrowth > -0.02) return 'Estable';
    if (avgGrowth > -0.1) return 'Moderada a la baja';
    return 'Bajista';
}

function getTrendClass(trend) {
    switch(trend) {
        case 'Baja': return 'text-success';
        case 'Media': return 'text-warning';
        case 'Alta': return 'text-danger';
        default: return 'text-secondary';
    }
}

function getForecastClass(forecast) {
    switch(forecast) {
        case 'Alcista': return 'text-success';
        case 'Moderada': return 'text-info';
        case 'Estable': return 'text-secondary';
        case 'Moderada a la baja': return 'text-warning';
        case 'Bajista': return 'text-danger';
        default: return 'text-secondary';
    }
}

// Configurar event listeners para el análisis de ventas
function setupSalesAnalysisListeners() {
    // Cambiar tipo de gráfico (cantidad/ingresos)
    document.getElementById('salesChartTypeQuantity').addEventListener('click', function() {
        document.getElementById('salesChartTypeQuantity').classList.add('active');
        document.getElementById('salesChartTypeRevenue').classList.remove('active');
        updateSalesAnalysisChart();
    });
    
    document.getElementById('salesChartTypeRevenue').addEventListener('click', function() {
        document.getElementById('salesChartTypeRevenue').classList.add('active');
        document.getElementById('salesChartTypeQuantity').classList.remove('active');
        updateSalesAnalysisChart();
    });
    
    // Cambiar período
    document.querySelectorAll('#salesPeriodDropdown + .dropdown-menu .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const period = this.getAttribute('data-period');
            document.getElementById('salesPeriodDropdown').textContent = `Últimos ${period} meses`;
            document.getElementById('salesPeriod').textContent = `Últimos ${period} meses`;
            updateSalesAnalysisChart();
        });
    });
}