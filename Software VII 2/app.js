// Variables globales
let currentUser = null;
let products = JSON.parse(localStorage.getItem('products')) || [];
let inventoryProducts = JSON.parse(localStorage.getItem('inventoryProducts')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let inventoryMovements = JSON.parse(localStorage.getItem('inventoryMovements')) || [];
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
let salesOrders = JSON.parse(localStorage.getItem('salesOrders')) || [];
let warehouses = JSON.parse(localStorage.getItem('warehouses')) || [];

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos de ejemplo si no existen
    initializeSampleData();
    
    // Verificar si hay un usuario logueado
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showAppScreen();
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('currentUser');
            showLoginScreen();
        }
    } else {
        showLoginScreen();
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar dashboard si estamos en la app
    if (currentUser) {
        updateDashboard();
    }
});

// Función para inicializar datos de ejemplo
function initializeSampleData() {
    // Solo crear datos de ejemplo si no hay datos existentes
    if (users.length === 0) {
        const adminUser = {
            id: 1,
            name: "Administrador",
            email: "admin@sysinvent.com",
            password: "admin123",
            role: "Administrador",
            status: "Activo",
            lastAccess: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    if (warehouses.length === 0) {
        const defaultWarehouse = {
            id: 1,
            name: "Almacén Principal",
            location: "Sede Central",
            capacity: 1000,
            products: 0,
            manager: "Administrador",
            description: "Almacén principal del sistema"
        };
        warehouses.push(defaultWarehouse);
        localStorage.setItem('warehouses', JSON.stringify(warehouses));
    }
    
    if (products.length === 0) {
        const sampleProducts = [
            {
                id: 1,
                code: "PROD001",
                name: "Laptop Dell XPS 13",
                category: "Computadoras",
                subcategory: "Laptops",
                price: 1500,
                cost: 1200,
                unit: "Pieza",
                stock: 10,
                minStock: 2,
                maxStock: 20,
                warehouseId: 1,
                description: "Laptop Dell XPS 13 con procesador Intel i7, 16GB RAM, 512GB SSD",
                status: "Disponible",
                managed: true
            },
            {
                id: 2,
                code: "PROD002",
                name: "iPhone 14 Pro",
                category: "Teléfonos",
                subcategory: "Smartphones",
                price: 1100,
                cost: 900,
                unit: "Pieza",
                stock: 5,
                minStock: 3,
                maxStock: 15,
                warehouseId: 1,
                description: "iPhone 14 Pro 128GB, color negro espacial",
                status: "Stock Bajo",
                managed: true
            },
            {
                id: 3,
                code: "PROD003",
                name: "Samsung Galaxy S23",
                category: "Teléfonos",
                subcategory: "Smartphones",
                price: 900,
                cost: 700,
                unit: "Pieza",
                stock: 15,
                minStock: 5,
                maxStock: 30,
                warehouseId: 1,
                description: "Samsung Galaxy S23 256GB, color verde",
                status: "Disponible",
                managed: true
            }
        ];
        products = sampleProducts;
        localStorage.setItem('products', JSON.stringify(products));
        
        // Inicializar también inventoryProducts con los mismos productos
        inventoryProducts = [...sampleProducts];
        localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
    }
    
    if (customers.length === 0) {
        const sampleCustomers = [
            {
                id: 1,
                name: "Juan Pérez",
                email: "juan@example.com",
                phone: "123456789",
                type: "Minorista",
                address: "Calle Principal 123"
            },
            {
                id: 2,
                name: "María García",
                email: "maria@example.com",
                phone: "987654321",
                type: "Mayorista",
                address: "Avenida Central 456"
            }
        ];
        customers = sampleCustomers;
        localStorage.setItem('customers', JSON.stringify(customers));
    }
    
    if (suppliers.length === 0) {
        const sampleSuppliers = [
            {
                id: 1,
                name: "TecnoSuministros S.A.",
                email: "ventas@tecnosuministros.com",
                phone: "555-1234",
                products: "Computadoras, Laptops, Accesorios",
                address: "Zona Industrial Norte"
            },
            {
                id: 2,
                name: "Distribuidora de Celulares",
                email: "info@celularesdist.com",
                phone: "555-5678",
                products: "Smartphones, Tablets",
                address: "Centro Comercial Plaza"
            }
        ];
        suppliers = sampleSuppliers;
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    }
    
    if (purchaseOrders.length === 0) {
        const samplePurchaseOrders = [
            {
                id: 1,
                supplierId: 1,
                date: new Date().toISOString().split('T')[0],
                items: [
                    { productId: 1, quantity: 2, price: 1200 },
                    { productId: 3, quantity: 5, price: 700 }
                ],
                subtotal: 5900,
                tax: 944,
                total: 6844,
                status: "Pendiente",
                notes: "Orden de compra de ejemplo",
                invoiceId: null
            }
        ];
        purchaseOrders = samplePurchaseOrders;
        localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
    }
    
    if (salesOrders.length === 0) {
        const sampleSalesOrders = [
            {
                id: 1,
                clientId: 2,
                date: new Date().toISOString().split('T')[0],
                items: [
                    { productId: 2, quantity: 2, price: 1100 },
                    { productId: 3, quantity: 3, price: 900 }
                ],
                subtotal: 4900,
                tax: 784,
                total: 5684,
                status: "Pendiente",
                notes: "Orden de venta de ejemplo",
                invoiceId: null
            }
        ];
        salesOrders = sampleSalesOrders;
        localStorage.setItem('salesOrders', JSON.stringify(salesOrders));
    }
    
    // Generar facturas automáticamente para las órdenes existentes
    generateInvoicesFromOrders();
    
    // Verificar y actualizar Kardex para órdenes existentes
    checkAndUpdateKardexForExistingOrders();
}

// Función para generar facturas automáticamente desde órdenes
function generateInvoicesFromOrders() {
    // Para órdenes de compra
    purchaseOrders.forEach(order => {
        if (!order.invoiceId) {
            const invoice = generateInvoiceFromPurchaseOrder(order);
            if (invoice) {
                order.invoiceId = invoice.id;
            }
        }
    });
    
    // Para órdenes de venta
    salesOrders.forEach(order => {
        if (!order.invoiceId) {
            const invoice = generateInvoiceFromSalesOrder(order);
            if (invoice) {
                order.invoiceId = invoice.id;
            }
        }
    });
    
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
    localStorage.setItem('salesOrders', JSON.stringify(salesOrders));
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

// Función para actualizar el Kardex automáticamente desde órdenes y facturas
function updateKardexAutomatically(order, orderType) {
    const validStatuses = orderType === 'purchase' ? ["Recibida"] : ["Vendida"];
    
    // Solo procesar si el estado es válido
    if (!validStatuses.includes(order.status)) {
        return;
    }
    
    // Verificar si ya existe un registro en el Kardex para esta orden
    const existingKardexEntry = inventoryMovements.find(movement => 
        movement.orderId === order.id && movement.orderType === orderType
    );
    
    if (existingKardexEntry) {
        console.log(`Ya existe un registro en Kardex para la ${orderType} #${order.id}`);
        return;
    }
    
    // Procesar cada item de la orden
    order.items.forEach(item => {
        const product = inventoryProducts.find(p => p.id === item.productId);
        if (!product) {
            console.error(`Producto con ID ${item.productId} no encontrado para la orden ${order.id}`);
            return;
        }
        
        // Determinar el tipo de movimiento basado en el tipo de orden
        const movementType = orderType === 'purchase' ? 'entry' : 'exit';
        const reason = orderType === 'purchase' ? 
            `Compra - Orden #${order.id}` : 
            `Venta - Orden #${order.id}`;
        
        // Registrar el movimiento en el Kardex
        const newMovement = {
            id: inventoryMovements.length > 0 ? Math.max(...inventoryMovements.map(m => m.id)) + 1 : 1,
            productId: item.productId,
            type: movementType,
            quantity: item.quantity,
            date: order.date,
            reason: reason,
            user: currentUser.name,
            orderId: order.id,
            orderType: orderType,
            oldStock: product.stock,
            newStock: movementType === 'entry' ? 
                product.stock + item.quantity : 
                product.stock - item.quantity
        };
        
        inventoryMovements.push(newMovement);
        
        // Actualizar el stock del producto
        if (movementType === 'entry') {
            product.stock += item.quantity;
        } else {
            // Verificar stock suficiente antes de restar
            if (product.stock < item.quantity) {
                console.error(`Stock insuficiente para ${product.name}: ${product.stock} disponible, ${item.quantity} requerido`);
                return;
            }
            product.stock -= item.quantity;
        }
        
        // Actualizar estado del producto
        updateProductStatus(product);
        
        console.log(`Registro agregado al Kardex: ${product.name} - ${movementType} - ${item.quantity}`);
    });
    
    // Guardar cambios
    localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
    localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
    
    // Actualizar vistas
    loadInventoryTable();
    updateDashboard();
}

// Función para actualizar el estado del producto basado en el stock
function updateProductStatus(product) {
    if (product.stock === 0) {
        product.status = 'Agotado';
    } else if (product.stock <= product.minStock) {
        product.status = 'Stock Bajo';
    } else {
        product.status = 'Disponible';
    }
}

// Función para verificar y actualizar Kardex para órdenes existentes
function checkAndUpdateKardexForExistingOrders() {
    // Procesar órdenes de compra
    purchaseOrders.forEach(order => {
        updateKardexAutomatically(order, 'purchase');
    });
    
    // Procesar órdenes de venta
    salesOrders.forEach(order => {
        updateKardexAutomatically(order, 'sales');
    });
}

// Función para configurar event listeners
function setupEventListeners() {
    // Login y registro
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin(e);
    });
    
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister(e);
    });
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('logoutBtnTop').addEventListener('click', handleLogout);
    document.getElementById('quickDemoLogin').addEventListener('click', quickDemoLogin);
    
    // Navegación
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Actualizar navegación activa
            document.querySelectorAll('.sidebar .nav-link').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Acciones rápidas
    document.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
                document.querySelectorAll('.sidebar .nav-link').forEach(item => {
                    item.classList.remove('active');
                });
                document.querySelector(`.sidebar .nav-link[data-section="${section}"]`).classList.add('active');
            }
        });
    });
    
    // Actualizar dashboard
    document.getElementById('refreshDashboard').addEventListener('click', updateDashboard);
    
    // Búsqueda global
    document.getElementById('globalSearch').addEventListener('input', performGlobalSearch);
    
    // Gestión de productos
    document.getElementById('saveProduct').addEventListener('click', saveProduct);
    
    // Gestión de clientes
    document.getElementById('saveCustomer').addEventListener('click', saveCustomer);
    
    // Gestión de proveedores
    document.getElementById('saveSupplier').addEventListener('click', saveSupplier);
    
    // Control de inventario
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('importExcelBtn').addEventListener('click', function() {
        document.getElementById('excelFileInput').click();
    });
    document.getElementById('excelFileInput').addEventListener('change', importFromExcel);
    
    // Órdenes de compra
    document.getElementById('addPurchaseOrderItem').addEventListener('click', addPurchaseOrderItem);
    document.getElementById('savePurchaseOrder').addEventListener('click', savePurchaseOrder);
    
    // Órdenes de venta
    document.getElementById('addSalesOrderItem').addEventListener('click', addSalesOrderItem);
    document.getElementById('saveSalesOrder').addEventListener('click', saveSalesOrder);
    
    // Almacenes
    document.getElementById('saveWarehouse').addEventListener('click', saveWarehouse);
    
    // Usuarios
    document.getElementById('saveUser').addEventListener('click', saveUser);
    
    // Informes
    document.getElementById('salesReportBtn').addEventListener('click', generateSalesReport);
    document.getElementById('purchasesReportBtn').addEventListener('click', generatePurchasesReport);
    document.getElementById('inventoryReportBtn').addEventListener('click', generateInventoryReport);
    document.getElementById('customersReportBtn').addEventListener('click', generateCustomersReport);
    document.getElementById('suppliersReportBtn').addEventListener('click', generateSuppliersReport);
    document.getElementById('financialReportBtn').addEventListener('click', generateFinancialReport);
    document.getElementById('printReport').addEventListener('click', printReport);
    
    // Facturación - impresión
    document.getElementById('printPurchaseInvoices').addEventListener('click', function() {
        printSection('purchaseInvoicesTable', 'Facturas de Compra');
    });
    document.getElementById('printSalesInvoices').addEventListener('click', function() {
        printSection('salesInvoicesTable', 'Facturas de Venta');
    });
    
    // Verificación de consistencia
    document.getElementById('consistencyCheckBtn').addEventListener('click', function() {
        const inconsistencies = verifyDataConsistency();
        if (inconsistencies.length === 0) {
            showAlert('Los datos están perfectamente sincronizados.', 'success');
        } else {
            let message = `Se encontraron ${inconsistencies.length} inconsistencias:<br><ul>`;
            inconsistencies.forEach(inc => {
                message += `<li>${inc.productName}: Stock almacenado (${inc.storedStock}) vs Stock calculado (${inc.calculatedStock})</li>`;
            });
            message += '</ul>';
            
            // Mostrar alerta con opción para corregir
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning alert-dismissible fade show';
            alertDiv.innerHTML = `
                ${message}
                <div class="mt-2">
                    <button type="button" class="btn btn-sm btn-warning" onclick="fixDataInconsistencies()">Corregir Automáticamente</button>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.insertBefore(alertDiv, mainContent.firstChild);
            }
        }
    });
    
    // Configurar event listeners para el análisis de ventas
    setupSalesAnalysisListeners();
}

// Funciones de autenticación
function handleLogin(e) {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validar campos
    if (!email || !password) {
        showAlert('Por favor, complete todos los campos.', 'danger');
        return;
    }
    
    // Buscar usuario
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        if (user.status !== 'Activo') {
            showAlert('Su cuenta está inactiva. Contacte al administrador.', 'warning');
            return;
        }
        
        // Actualizar último acceso
        user.lastAccess = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAppScreen();
        updateDashboard();
        showAlert(`Bienvenido, ${user.name}`, 'success');
    } else {
        showAlert('Credenciales incorrectas. Intente nuevamente.', 'danger');
    }
}

function handleRegister(e) {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
        showAlert('Por favor, complete todos los campos.', 'danger');
        return;
    }
    
    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres.', 'warning');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden.', 'warning');
        return;
    }
    
    // Verificar si el usuario ya existe
    if (users.find(u => u.email === email)) {
        showAlert('Ya existe un usuario con este email.', 'warning');
        return;
    }
    
    // Crear nuevo usuario
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: name,
        email: email,
        password: password,
        role: 'Usuario',
        status: 'Activo',
        lastAccess: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showAlert('Usuario registrado exitosamente. Ahora puede iniciar sesión.', 'success');
    
    // Cambiar a pestaña de login
    const loginTab = document.getElementById('login-tab');
    if (loginTab) {
        loginTab.click();
    }
    
    // Limpiar formulario
    document.getElementById('registerForm').reset();
}

function quickDemoLogin() {
    document.getElementById('loginEmail').value = 'admin@sysinvent.com';
    document.getElementById('loginPassword').value = 'admin123';
    // No llamamos handleLogin directamente, simulamos el envío del formulario
    const loginForm = document.getElementById('loginForm');
    const submitEvent = new Event('submit', { cancelable: true });
    loginForm.dispatchEvent(submitEvent);
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginScreen();
    showAlert('Sesión cerrada correctamente.', 'info');
}

// Funciones de navegación
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
    // Limpiar formularios al mostrar login
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function showAppScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    
    // Actualizar información del usuario
    if (currentUser) {
        document.getElementById('userNameDisplay').textContent = currentUser.name;
        document.getElementById('userInitial').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('profileUserName').textContent = currentUser.name;
        document.getElementById('profileUserInitial').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('profileUserRole').textContent = currentUser.role;
    }
    
    // Actualizar notificaciones
    updateNotifications();
    
    // Cargar datos iniciales
    loadProductsTable();
    loadCustomersTable();
    loadSuppliersTable();
    loadInventoryTable();
    loadPurchaseInvoicesTable();
    loadSalesInvoicesTable();
    loadPurchaseOrdersTable();
    loadSalesOrdersTable();
    loadWarehousesTable();
    loadUsersTable();
    
    // Cargar almacenes en los select
    loadWarehousesSelect();
    
    // Verificar y actualizar Kardex para órdenes existentes
    checkAndUpdateKardexForExistingOrders();
    
    // Mostrar estado de sincronización
    showSyncStatus();
}

function showSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(`${section}-content`).classList.add('active');
    
    // Actualizar datos según la sección
    switch(section) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'products':
            loadProductsTable();
            break;
        case 'customers':
            loadCustomersTable();
            break;
        case 'suppliers':
            loadSuppliersTable();
            break;
        case 'inventory':
            loadInventoryTable();
            break;
        case 'kardex':
            loadKardexTable();
            break;
        case 'billing':
            loadPurchaseInvoicesTable();
            loadSalesInvoicesTable();
            break;
        case 'purchase-orders':
            loadPurchaseOrdersTable();
            break;
        case 'sales-orders':
            loadSalesOrdersTable();
            break;
        case 'warehouses':
            loadWarehousesTable();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'reports':
            loadReports();
            break;
    }
    
    // Mostrar estado de sincronización
    showSyncStatus();
}

// Funciones para el dashboard
function updateDashboard() {
    // Actualizar estadísticas
    document.getElementById('totalProducts').textContent = inventoryProducts.length;
    
    // Calcular ventas del mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear && invoice.status === "Vendida" && invoice.orderType === "sales";
    }).length;
    
    document.getElementById('monthlySales').textContent = monthlySales;
    document.getElementById('purchaseOrders').textContent = purchaseOrders.length;
    
    // Calcular ingresos del mes
    const monthlyIncome = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear && invoice.status === "Vendida" && invoice.orderType === "sales";
    }).reduce((total, invoice) => total + invoice.total, 0);
    
    document.getElementById('monthlyIncome').textContent = `$${monthlyIncome.toLocaleString()}`;
    
    // Calcular productos con stock bajo
    const lowStockProducts = inventoryProducts.filter(p => p.stock <= p.minStock && p.stock > 0);
    document.getElementById('lowStockCount').textContent = lowStockProducts.length;
    
    // Actualizar gráfico de análisis de ventas
    updateSalesAnalysisChart();
    
    // Actualizar notificaciones
    updateNotifications();
    
    // Actualizar alertas
    updateAlerts();
    
    // Mostrar estado de sincronización
    showSyncStatus();
}

// Funciones para el análisis de ventas mejorado
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

// Función centralizada para actualizar stock de productos
function updateProductStock(productId, quantityChange, movementType, reason, notes = '') {
    const productIndex = inventoryProducts.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        console.error(`Producto con ID ${productId} no encontrado`);
        return false;
    }
    
    const product = inventoryProducts[productIndex];
    const oldStock = product.stock;
    
    // Actualizar stock del producto
    if (movementType === 'entry') {
        product.stock += quantityChange;
    } else if (movementType === 'exit') {
        // Validar que haya suficiente stock
        if (product.stock < quantityChange) {
            console.error(`Stock insuficiente para el producto: ${product.name}`);
            return false;
        }
        product.stock -= quantityChange;
    }
    
    // Registrar movimiento de inventario
    const newMovement = {
        id: inventoryMovements.length > 0 ? Math.max(...inventoryMovements.map(m => m.id)) + 1 : 1,
        productId,
        type: movementType,
        quantity: quantityChange,
        date: new Date().toISOString().split('T')[0],
        reason,
        notes,
        user: currentUser.name,
        oldStock,
        newStock: product.stock
    };
    
    inventoryMovements.push(newMovement);
    
    // Actualizar estado del producto basado en el nuevo stock
    updateProductStatus(product);
    
    // Guardar cambios
    localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
    localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
    
    console.log(`Stock actualizado: ${product.name} - ${oldStock} → ${product.stock}`);
    return true;
}

// Funciones para gestión de productos
function loadProductsTable() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Solo mostrar productos gestionados
    const managedProducts = products.filter(p => p.managed === true);
    
    if (managedProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay productos registrados</td></tr>';
        return;
    }
    
    managedProducts.forEach(product => {
        const row = document.createElement('tr');
        let status, badgeClass;
        
        if (product.stock === 0) {
            status = 'Agotado';
            badgeClass = 'danger';
        } else if (product.stock <= product.minStock) {
            status = 'Stock Bajo';
            badgeClass = 'warning';
        } else {
            status = 'Disponible';
            badgeClass = 'success';
        }
        
        // Obtener nombre del almacén
        const warehouse = warehouses.find(w => w.id === product.warehouseId);
        const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
        
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>${warehouseName}</td>
            <td><span class="badge bg-${badgeClass}">${status}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Mostrar estado de sincronización
    showSyncStatus();
}

function loadWarehousesSelect() {
    const warehouseSelect = document.getElementById('productWarehouse');
    if (warehouseSelect) {
        warehouseSelect.innerHTML = '<option value="">Seleccionar almacén</option>';
        warehouses.forEach(warehouse => {
            const option = document.createElement('option');
            option.value = warehouse.id;
            option.textContent = warehouse.name;
            warehouseSelect.appendChild(option);
    });
    }
}

function saveProduct() {
    const productId = document.getElementById('productId').value;
    const code = document.getElementById('productCode').value;
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const subcategory = document.getElementById('productSubcategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const cost = parseFloat(document.getElementById('productCost').value);
    const unit = document.getElementById('productUnit').value;
    const stock = parseInt(document.getElementById('productStock').value);
    const minStock = parseInt(document.getElementById('productMinStock').value);
    const maxStock = parseInt(document.getElementById('productMaxStock').value);
    const warehouseId = parseInt(document.getElementById('productWarehouse').value);
    const description = document.getElementById('productDescription').value;
    
    // Validaciones
    if (!code || !name || !category || !subcategory || !price || !cost || !unit || !stock || !minStock || !maxStock || !warehouseId) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    if (minStock >= maxStock) {
        showAlert('El stock mínimo debe ser menor al stock máximo.', 'warning');
        return;
    }
    
    if (productId) {
        // Editar producto existente
        const index = products.findIndex(p => p.id == productId);
        if (index !== -1) {
            const oldProduct = products[index];
            const stockDifference = stock - oldProduct.stock;
            
            // Actualizar información del producto
            products[index] = {
                ...products[index],
                code, name, category, subcategory, price, cost, unit, stock, minStock, maxStock, warehouseId, description
            };
            
            // Actualizar también en inventario si existe
            const inventoryIndex = inventoryProducts.findIndex(p => p.id == productId);
            if (inventoryIndex !== -1) {
                inventoryProducts[inventoryIndex] = {
                    ...inventoryProducts[inventoryIndex],
                    code, name, category, subcategory, price, cost, unit, stock, minStock, maxStock, warehouseId, description
                };
            } else {
                // Si no existe en inventario, agregarlo
                const newInventoryProduct = {
                    ...products[index],
                    managed: true
                };
                inventoryProducts.push(newInventoryProduct);
            }
            
            // Si el stock cambió, registrar movimiento
            if (stockDifference !== 0) {
                const movementType = stockDifference > 0 ? 'entry' : 'exit';
                const quantityChange = Math.abs(stockDifference);
                const reason = 'Ajuste manual desde gestión de productos';
                
                updateProductStock(
                    parseInt(productId), 
                    quantityChange, 
                    movementType, 
                    reason,
                    `Ajuste de stock: ${oldProduct.stock} → ${stock}`
                );
            }
            
            showAlert('Producto actualizado correctamente.', 'success');
        }
    } else {
        // Verificar si el código ya existe
        if (products.find(p => p.code === code)) {
            showAlert('Ya existe un producto con este código.', 'warning');
            return;
        }
        
        // Crear nuevo producto
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            code, name, category, subcategory, price, cost, unit, stock, minStock, maxStock, warehouseId, description,
            status: stock > 0 ? 'Disponible' : 'Agotado',
            managed: true
        };
        products.push(newProduct);
        
        // Agregar también al inventario
        const newInventoryProduct = {...newProduct};
        inventoryProducts.push(newInventoryProduct);
        
        // Si hay stock inicial, registrar movimiento de entrada
        if (stock > 0) {
            updateProductStock(
                newProduct.id,
                stock,
                'entry',
                'Stock inicial',
                'Stock inicial del producto'
            );
        }
        
        showAlert('Producto creado correctamente.', 'success');
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
    
    // Cerrar modal y actualizar tablas
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    if (modal) modal.hide();
    
    loadProductsTable();
    loadInventoryTable();
    updateDashboard();
    
    // Limpiar formulario
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('productId').value = product.id;
    document.getElementById('productCode').value = product.code;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSubcategory').value = product.subcategory;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCost').value = product.cost;
    document.getElementById('productUnit').value = product.unit;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productMinStock').value = product.minStock;
    document.getElementById('productMaxStock').value = product.maxStock;
    document.getElementById('productWarehouse').value = product.warehouseId || '';
    document.getElementById('productDescription').value = product.description || '';
    
    document.getElementById('productModalTitle').textContent = 'Editar Producto';
    
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function deleteProduct(id) {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) return;
    
    // Verificar si el producto está en uso en facturas
    const productInUse = invoices.some(invoice => 
        invoice.items.some(item => item.productId === id)
    );
    
    if (productInUse) {
        showAlert('No se puede eliminar el producto porque está asociado a facturas.', 'warning');
        return;
    }
    
    // Eliminar de productos gestionados
    products = products.filter(p => p.id !== id);
    
    // Eliminar de inventario también
    inventoryProducts = inventoryProducts.filter(p => p.id !== id);
    
    // Eliminar movimientos de inventario relacionados
    inventoryMovements = inventoryMovements.filter(m => m.productId !== id);
    
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
    localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
    
    loadProductsTable();
    loadInventoryTable();
    updateDashboard();
    showAlert('Producto eliminado correctamente.', 'success');
}

// Funciones para control de inventario
function loadInventoryTable() {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (inventoryProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay productos en inventario</td></tr>';
        return;
    }
    
    inventoryProducts.forEach(product => {
        let status, badgeClass;
        
        if (product.stock === 0) {
            status = 'Agotado';
            badgeClass = 'danger';
        } else if (product.stock <= product.minStock) {
            status = 'Stock Bajo';
            badgeClass = 'warning';
        } else {
            status = 'Disponible';
            badgeClass = 'success';
        }
        
        // Obtener nombre del almacén
        const warehouse = warehouses.find(w => w.id === product.warehouseId);
        const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td>${product.minStock}</td>
            <td>${product.maxStock}</td>
            <td>${warehouseName}</td>
            <td><span class="badge bg-${badgeClass}">${status}</span></td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="viewProductDetails(${product.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary print-btn" onclick="printProduct(${product.id})">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function exportToExcel() {
    // Crear datos para exportar
    const exportData = inventoryProducts.map(product => {
        const warehouse = warehouses.find(w => w.id === product.warehouseId);
        return {
            'Código': product.code,
            'Nombre': product.name,
            'Categoría': product.category,
            'Precio Venta': product.price,
            'Costo': product.cost,
            'Stock Actual': product.stock,
            'Stock Mínimo': product.minStock,
            'Stock Máximo': product.maxStock,
            'Almacén': warehouse ? warehouse.name : 'Sin asignar',
            'Estado': product.status
        };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "Inventario_SysInvent.xlsx");
    showAlert('Datos exportados correctamente.', 'success');
}

function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        processImportedData(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

function processImportedData(data) {
    let importedCount = 0;
    let updatedCount = 0;
    
    data.forEach(item => {
        // Buscar si el producto ya existe por código
        const existingProduct = inventoryProducts.find(p => p.code === item['Código']);
        if (existingProduct) {
            // Actualizar producto existente
            existingProduct.name = item['Nombre'] || existingProduct.name;
            existingProduct.category = item['Categoría'] || existingProduct.category;
            existingProduct.price = item['Precio Venta'] || existingProduct.price;
            existingProduct.cost = item['Costo'] || existingProduct.cost;
            existingProduct.stock = item['Stock Actual'] || existingProduct.stock;
            existingProduct.minStock = item['Stock Mínimo'] || existingProduct.minStock;
            existingProduct.maxStock = item['Stock Máximo'] || existingProduct.maxStock;
            updateProductStatus(existingProduct);
            updatedCount++;
        } else {
            // Crear nuevo producto (solo en inventario, no en gestión)
            const newProduct = {
                id: inventoryProducts.length > 0 ? Math.max(...inventoryProducts.map(p => p.id)) + 1 : 1,
                code: item['Código'],
                name: item['Nombre'],
                category: item['Categoría'],
                price: item['Precio Venta'] || 0,
                cost: item['Costo'] || 0,
                stock: item['Stock Actual'] || 0,
                minStock: item['Stock Mínimo'] || 0,
                maxStock: item['Stock Máximo'] || 0,
                warehouseId: 1,
                unit: 'Pieza',
                subcategory: 'General',
                description: 'Producto importado desde Excel',
                status: 'Disponible',
                managed: false // No es gestionado
            };
            updateProductStatus(newProduct);
            inventoryProducts.push(newProduct);
            importedCount++;
        }
    });
    
    localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
    loadInventoryTable();
    updateDashboard();
    showAlert(`Datos importados correctamente: ${importedCount} nuevos, ${updatedCount} actualizados.`, 'success');
    
    // Limpiar input de archivo
    document.getElementById('excelFileInput').value = '';
}

function viewProductDetails(id) {
    const product = inventoryProducts.find(p => p.id === id);
    if (!product) return;
    
    const warehouse = warehouses.find(w => w.id === product.warehouseId);
    const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
    
    const detailsHtml = `
        <div class="product-details">
            <h5>Detalles del Producto</h5>
            <div class="row mt-3">
                <div class="col-md-6">
                    <p><strong>Código:</strong> ${product.code}</p>
                    <p><strong>Nombre:</strong> ${product.name}</p>
                    <p><strong>Categoría:</strong> ${product.category}</p>
                    <p><strong>Subcategoría:</strong> ${product.subcategory}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Precio:</strong> $${product.price.toFixed(2)}</p>
                    <p><strong>Costo:</strong> $${product.cost.toFixed(2)}</p>
                    <p><strong>Stock:</strong> ${product.stock}</p>
                    <p><strong>Almacén:</strong> ${warehouseName}</p>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-12">
                    <p><strong>Descripción:</strong> ${product.description || 'Sin descripción'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar en un modal
    const modalTitle = document.getElementById('productModalTitle');
    const modalBody = document.querySelector('#productModal .modal-body');
    const modalFooter = document.querySelector('#productModal .modal-footer');
    
    if (modalTitle && modalBody && modalFooter) {
        modalTitle.textContent = `Detalles del Producto: ${product.name}`;
        modalBody.innerHTML = detailsHtml;
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }
}

function printProduct(id) {
    const product = inventoryProducts.find(p => p.id === id);
    if (!product) return;
    
    const warehouse = warehouses.find(w => w.id === product.warehouseId);
    const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
    
    // Crear contenido para imprimir
    const printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; color: #3498db;">SysInvent</h2>
            <h3 style="text-align: center;">Ficha de Producto</h3>
            <hr>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; width: 30%;"><strong>Código:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${product.code}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Nombre:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Categoría:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${product.category}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Stock Actual:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${product.stock}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Stock Mínimo:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${product.minStock}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Stock Máximo:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${product.maxStock}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Almacén:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${warehouseName}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;"><strong>Estado:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${product.status}</td>
                </tr>
            </table>
            <div style="margin-top: 20px;">
                <p><strong>Descripción:</strong></p>
                <p>${product.description || 'Sin descripción'}</p>
            </div>
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
                <title>Ficha de Producto - ${product.name}</title>
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

// Función para verificar consistencia de datos
function verifyDataConsistency() {
    let inconsistencies = [];
    
    // Verificar que todos los productos tengan un stock válido
    inventoryProducts.forEach(product => {
        const movements = inventoryMovements.filter(m => m.productId === product.id);
        const calculatedStock = movements.reduce((total, movement) => {
            return movement.type === 'entry' ? total + movement.quantity : total - movement.quantity;
        }, 0);
        
        if (product.stock !== calculatedStock) {
            inconsistencies.push({
                productId: product.id,
                productName: product.name,
                storedStock: product.stock,
                calculatedStock: calculatedStock,
                difference: product.stock - calculatedStock
            });
        }
    });
    
    return inconsistencies;
}

// Función para corregir inconsistencias
function fixDataInconsistencies() {
    const inconsistencies = verifyDataConsistency();
    
    if (inconsistencies.length === 0) {
        showAlert('No se encontraron inconsistencias en los datos.', 'success');
        return;
    }
    
    if (confirm(`Se encontraron ${inconsistencies.length} inconsistencias. ¿Desea corregirlas automáticamente?`)) {
        inconsistencies.forEach(inc => {
            const productIndex = inventoryProducts.findIndex(p => p.id === inc.productId);
            if (productIndex !== -1) {
                inventoryProducts[productIndex].stock = inc.calculatedStock;
                updateProductStatus(inventoryProducts[productIndex]);
                
                // Registrar movimiento de ajuste
                const adjustmentQuantity = Math.abs(inc.difference);
                const movementType = inc.difference > 0 ? 'exit' : 'entry';
                const reason = 'Ajuste automático por inconsistencia de datos';
                
                const newMovement = {
                    id: inventoryMovements.length > 0 ? Math.max(...inventoryMovements.map(m => m.id)) + 1 : 1,
                    productId: inc.productId,
                    type: movementType,
                    quantity: adjustmentQuantity,
                    date: new Date().toISOString().split('T')[0],
                    reason: reason,
                    user: currentUser.name,
                    oldStock: inc.storedStock,
                    newStock: inc.calculatedStock
                };
                
                inventoryMovements.push(newMovement);
            }
        });
        
        localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
        localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
        
        showAlert(`Se corrigieron ${inconsistencies.length} inconsistencias.`, 'success');
        
        // Actualizar vistas
        loadInventoryTable();
        updateDashboard();
    }
}

// Función para mostrar estado de sincronización
function showSyncStatus() {
    const inconsistencies = verifyDataConsistency();
    const statusElement = document.getElementById('syncStatus');
    
    if (!statusElement) return;
    
    if (inconsistencies.length === 0) {
        statusElement.innerHTML = '<span class="sync-status sync-success"><i class="fas fa-check-circle"></i> Datos sincronizados</span>';
    } else {
        statusElement.innerHTML = `<span class="sync-status sync-warning"><i class="fas fa-exclamation-triangle"></i> ${inconsistencies.length} inconsistencias</span>`;
    }
}

// Funciones para gestión de clientes
function loadCustomersTable() {
    const tableBody = document.getElementById('customersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (customers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay clientes registrados</td></tr>';
        return;
    }
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>${customer.type}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editCustomer(${customer.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer(${customer.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function saveCustomer() {
    const customerId = document.getElementById('customerId').value;
    const name = document.getElementById('customerName').value;
    const email = document.getElementById('customerEmail').value;
    const phone = document.getElementById('customerPhone').value;
    const type = document.getElementById('customerType').value;
    const address = document.getElementById('customerAddress').value;
    
    // Validaciones
    if (!name || !email || !phone || !type) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, ingrese un email válido.', 'warning');
        return;
    }
    
    if (customerId) {
        // Editar cliente existente
        const index = customers.findIndex(c => c.id == customerId);
        if (index !== -1) {
            customers[index] = { ...customers[index], name, email, phone, type, address };
            showAlert('Cliente actualizado correctamente.', 'success');
        }
    } else {
        // Verificar si el email ya existe
        if (customers.find(c => c.email === email)) {
            showAlert('Ya existe un cliente con este email.', 'warning');
            return;
        }
        
        // Crear nuevo cliente
        const newCustomer = {
            id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
            name, email, phone, type, address
        };
        customers.push(newCustomer);
        showAlert('Cliente creado correctamente.', 'success');
    }
    
    localStorage.setItem('customers', JSON.stringify(customers));
    
    // Cerrar modal y actualizar tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
    if (modal) modal.hide();
    
    loadCustomersTable();
    
    // Limpiar formulario
    document.getElementById('customerForm').reset();
    document.getElementById('customerId').value = '';
}

function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    document.getElementById('customerId').value = customer.id;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerEmail').value = customer.email;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerType').value = customer.type;
    document.getElementById('customerAddress').value = customer.address || '';
    
    document.getElementById('customerModalTitle').textContent = 'Editar Cliente';
    
    const modal = new bootstrap.Modal(document.getElementById('customerModal'));
    modal.show();
}

function deleteCustomer(id) {
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) return;
    
    // Verificar si el cliente está en uso en facturas
    const customerInUse = invoices.some(invoice => invoice.clientId === id);
    
    if (customerInUse) {
        showAlert('No se puede eliminar el cliente porque está asociado a facturas.', 'warning');
        return;
    }
    
    customers = customers.filter(c => c.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
    loadCustomersTable();
    showAlert('Cliente eliminado correctamente.', 'success');
}

// Funciones para gestión de proveedores
function loadSuppliersTable() {
    const tableBody = document.getElementById('suppliersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (suppliers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay proveedores registrados</td></tr>';
        return;
    }
    
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.id}</td>
            <td>${supplier.name}</td>
            <td>${supplier.email}</td>
            <td>${supplier.phone}</td>
            <td>${supplier.address}</td>
            <td>${supplier.products}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editSupplier(${supplier.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier(${supplier.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function saveSupplier() {
    const supplierId = document.getElementById('supplierId').value;
    const name = document.getElementById('supplierName').value;
    const email = document.getElementById('supplierEmail').value;
    const phone = document.getElementById('supplierPhone').value;
    const products = document.getElementById('supplierProducts').value;
    const address = document.getElementById('supplierAddress').value;
    
    // Validaciones
    if (!name || !email || !phone || !products) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, ingrese un email válido.', 'warning');
        return;
    }
    
    if (supplierId) {
        // Editar proveedor existente
        const index = suppliers.findIndex(s => s.id == supplierId);
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], name, email, phone, products, address };
            showAlert('Proveedor actualizado correctamente.', 'success');
        }
    } else {
        // Verificar si el email ya existe
        if (suppliers.find(s => s.email === email)) {
            showAlert('Ya existe un proveedor con este email.', 'warning');
            return;
        }
        
        // Crear nuevo proveedor
        const newSupplier = {
            id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
            name, email, phone, products, address
        };
        suppliers.push(newSupplier);
        showAlert('Proveedor creado correctamente.', 'success');
    }
    
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    
    // Cerrar modal y actualizar tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
    if (modal) modal.hide();
    
    loadSuppliersTable();
    
    // Limpiar formulario
    document.getElementById('supplierForm').reset();
    document.getElementById('supplierId').value = '';
}

function editSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    
    document.getElementById('supplierId').value = supplier.id;
    document.getElementById('supplierName').value = supplier.name;
    document.getElementById('supplierEmail').value = supplier.email;
    document.getElementById('supplierPhone').value = supplier.phone;
    document.getElementById('supplierProducts').value = supplier.products;
    document.getElementById('supplierAddress').value = supplier.address || '';
    
    document.getElementById('supplierModalTitle').textContent = 'Editar Proveedor';
    
    const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
    modal.show();
}

function deleteSupplier(id) {
    if (!confirm('¿Está seguro de que desea eliminar este proveedor?')) return;
    
    // Verificar si el proveedor está en uso en órdenes de compra
    const supplierInUse = purchaseOrders.some(order => order.supplierId === id);
    
    if (supplierInUse) {
        showAlert('No se puede eliminar el proveedor porque está asociado a órdenes de compra.', 'warning');
        return;
    }
    
    suppliers = suppliers.filter(s => s.id !== id);
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    loadSuppliersTable();
    showAlert('Proveedor eliminado correctamente.', 'success');
}

// Funciones para facturación
function loadPurchaseInvoicesTable() {
    const tableBody = document.getElementById('purchaseInvoicesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Filtrar facturas de compra
    const purchaseInvoices = invoices.filter(invoice => invoice.orderType === 'purchase');
    
    if (purchaseInvoices.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay facturas de compra</td></tr>';
        return;
    }
    
    // Ordenar facturas por fecha (más reciente primero)
    const sortedInvoices = [...purchaseInvoices].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedInvoices.forEach(invoice => {
        const supplier = suppliers.find(s => s.id === invoice.supplierId);
        const statusClass = getStatusClass(invoice.status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${supplier ? supplier.name : 'Proveedor no encontrado'}</td>
            <td>${new Date(invoice.date).toLocaleDateString()}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>
                <span class="badge bg-${statusClass} status-badge" data-id="${invoice.id}" data-type="invoice">
                    ${invoice.status}
                </span>
            </td>
            <td>${invoice.orderId ? `#${invoice.orderId}` : 'N/A'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editPurchaseInvoice(${invoice.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewInvoiceDetails(${invoice.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary print-btn" onclick="printInvoice(${invoice.id})">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function loadSalesInvoicesTable() {
    const tableBody = document.getElementById('salesInvoicesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Filtrar facturas de venta
    const salesInvoices = invoices.filter(invoice => invoice.orderType === 'sales');
    
    if (salesInvoices.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay facturas de venta</td></tr>';
        return;
    }
    
    // Ordenar facturas por fecha (más reciente primero)
    const sortedInvoices = [...salesInvoices].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedInvoices.forEach(invoice => {
        const customer = customers.find(c => c.id === invoice.clientId);
        const statusClass = getStatusClass(invoice.status);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${customer ? customer.name : 'Cliente no encontrado'}</td>
            <td>${new Date(invoice.date).toLocaleDateString()}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>
                <span class="badge bg-${statusClass} status-badge" data-id="${invoice.id}" data-type="invoice">
                    ${invoice.status}
                </span>
            </td>
            <td>${invoice.orderId ? `#${invoice.orderId}` : 'N/A'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editSalesInvoice(${invoice.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info me-1" onclick="viewInvoiceDetails(${invoice.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary print-btn" onclick="printInvoice(${invoice.id})">
                    <i class="fas fa-print"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Función para obtener la clase CSS según el estado
function getStatusClass(status) {
    switch(status) {
        case 'Pendiente': return 'warning';
        case 'Confirmada': return 'info';
        case 'Recibida': return 'success';
        case 'Vendida': return 'success';
        case 'Cancelada': return 'danger';
        default: return 'secondary';
    }
}

// Función para generar factura desde orden de compra
function generateInvoiceFromPurchaseOrder(purchaseOrder) {
    const supplier = suppliers.find(s => s.id === purchaseOrder.supplierId);
    if (!supplier) return null;
    
    // Crear factura a partir de la orden de compra
    const newInvoice = {
        id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
        clientId: null, // Las órdenes de compra no tienen cliente
        supplierId: purchaseOrder.supplierId,
        orderId: purchaseOrder.id,
        orderType: 'purchase',
        date: new Date().toISOString().split('T')[0],
        items: [...purchaseOrder.items],
        subtotal: purchaseOrder.subtotal,
        tax: purchaseOrder.tax,
        total: purchaseOrder.total,
        status: purchaseOrder.status,
        notes: `Factura generada automáticamente desde orden de compra #${purchaseOrder.id}`
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    return newInvoice;
}

// Función para generar factura desde orden de venta
function generateInvoiceFromSalesOrder(salesOrder) {
    const customer = customers.find(c => c.id === salesOrder.clientId);
    if (!customer) return null;
    
    // Crear factura a partir de la orden de venta
    const newInvoice = {
        id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
        clientId: salesOrder.clientId,
        supplierId: null, // Las órdenes de venta no tienen proveedor
        orderId: salesOrder.id,
        orderType: 'sales',
        date: new Date().toISOString().split('T')[0],
        items: [...salesOrder.items],
        subtotal: salesOrder.subtotal,
        tax: salesOrder.tax,
        total: salesOrder.total,
        status: salesOrder.status,
        notes: `Factura generada automáticamente desde orden de venta #${salesOrder.id}`
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    return newInvoice;
}

function viewInvoiceDetails(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;
    
    const clientOrSupplier = invoice.orderType === 'purchase' 
        ? suppliers.find(s => s.id === invoice.supplierId)
        : customers.find(c => c.id === invoice.clientId);
    
    const clientOrSupplierName = clientOrSupplier ? clientOrSupplier.name : 'No encontrado';
    const clientOrSupplierType = invoice.orderType === 'purchase' ? 'Proveedor' : 'Cliente';
    
    let itemsHtml = '';
    invoice.items.forEach(item => {
        const product = inventoryProducts.find(p => p.id === item.productId);
        itemsHtml += `
            <tr>
                <td>${product ? product.name : 'Producto no encontrado'}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `;
    });
    
    const detailsHtml = `
        <div class="invoice-details">
            <h5>Detalles de Factura #${invoice.id}</h5>
            <div class="row mt-3">
                <div class="col-md-6">
                    <p><strong>${clientOrSupplierType}:</strong> ${clientOrSupplierName}</p>
                    <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                    <p><strong>Tipo:</strong> ${invoice.orderType === 'purchase' ? 'Compra' : 'Venta'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Estado:</strong> 
                        <select class="form-select d-inline w-auto" id="invoiceStatus" onchange="updateInvoiceStatus(${invoice.id}, this.value)">
                            <option value="Pendiente" ${invoice.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="Confirmada" ${invoice.status === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
                            ${invoice.orderType === 'purchase' ? 
                                '<option value="Recibida" ' + (invoice.status === 'Recibida' ? 'selected' : '') + '>Recibida</option>' : 
                                '<option value="Vendida" ' + (invoice.status === 'Vendida' ? 'selected' : '') + '>Vendida</option>'}
                            <option value="Cancelada" ${invoice.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                        </select>
                    </p>
                    <p><strong>Orden Asociada:</strong> ${invoice.orderId ? `#${invoice.orderId}` : 'N/A'}</p>
                </div>
            </div>
            
            <div class="mt-4">
                <h6>Productos</h6>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-6">
                    <p><strong>Notas:</strong> ${invoice.notes || 'Sin notas'}</p>
                </div>
                <div class="col-md-6 text-end">
                    <h5>Subtotal: $${invoice.subtotal.toFixed(2)}</h5>
                    <h5>IVA (16%): $${invoice.tax.toFixed(2)}</h5>
                    <h4>Total: $${invoice.total.toFixed(2)}</h4>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar en un modal
    const modalTitle = document.getElementById('productModalTitle');
    const modalBody = document.querySelector('#productModal .modal-body');
    const modalFooter = document.querySelector('#productModal .modal-footer');
    
    if (modalTitle && modalBody && modalFooter) {
        modalTitle.textContent = `Detalles de Factura #${invoice.id}`;
        modalBody.innerHTML = detailsHtml;
        modalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary" onclick="printInvoice(${invoice.id})">Imprimir</button>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }
}

function updateInvoiceStatus(invoiceId, newStatus) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    
    const oldStatus = invoice.status;
    invoice.status = newStatus;
    
    // Actualizar estado en la orden asociada
    if (invoice.orderType === 'purchase') {
        const purchaseOrder = purchaseOrders.find(o => o.id === invoice.orderId);
        if (purchaseOrder) {
            purchaseOrder.status = newStatus;
            localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
            
            // Si el estado cambió a "Recibida", actualizar Kardex
            if (newStatus === 'Recibida' && oldStatus !== 'Recibida') {
                updateKardexAutomatically(purchaseOrder, 'purchase');
            }
        }
    } else if (invoice.orderType === 'sales') {
        const salesOrder = salesOrders.find(o => o.id === invoice.orderId);
        if (salesOrder) {
            salesOrder.status = newStatus;
            localStorage.setItem('salesOrders', JSON.stringify(salesOrders));
            
            // Si el estado cambió a "Vendida", actualizar Kardex
            if (newStatus === 'Vendida' && oldStatus !== 'Vendida') {
                updateKardexAutomatically(salesOrder, 'sales');
            }
        }
    }
    
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    // Actualizar tablas
    loadPurchaseInvoicesTable();
    loadSalesInvoicesTable();
    loadPurchaseOrdersTable();
    loadSalesOrdersTable();
    
    showAlert(`Estado de la factura actualizado a: ${newStatus}`, 'success');
}

function printInvoice(id) {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;
    
    const clientOrSupplier = invoice.orderType === 'purchase' 
        ? suppliers.find(s => s.id === invoice.supplierId)
        : customers.find(c => c.id === invoice.clientId);
    
    const clientOrSupplierName = clientOrSupplier ? clientOrSupplier.name : 'No encontrado';
    const clientOrSupplierType = invoice.orderType === 'purchase' ? 'Proveedor' : 'Cliente';
    const clientOrSupplierDetails = invoice.orderType === 'purchase' 
        ? `Proveedor: ${clientOrSupplierName}`
        : `Cliente: ${clientOrSupplierName}`;
    
    let itemsHtml = '';
    invoice.items.forEach(item => {
        const product = inventoryProducts.find(p => p.id === item.productId);
        itemsHtml += `
            <tr>
                <td>${product ? product.name : 'Producto no encontrado'}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Crear contenido para imprimir
    const printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; color: #3498db;">SysInvent</h2>
            <h3 style="text-align: center;">Factura #${invoice.id}</h3>
            <hr>
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div>
                    <p><strong>${clientOrSupplierDetails}</strong></p>
                    <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                    <p><strong>Tipo:</strong> ${invoice.orderType === 'purchase' ? 'Compra' : 'Venta'}</p>
                </div>
                <div>
                    <p><strong>Estado:</strong> ${invoice.status}</p>
                    <p><strong>Orden Asociada:</strong> ${invoice.orderId ? `#${invoice.orderId}` : 'N/A'}</p>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Producto</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Cantidad</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Precio Unitario</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div style="display: flex; justify-content: space-between;">
                <div style="width: 50%;">
                    <p><strong>Notas:</strong></p>
                    <p>${invoice.notes || 'Sin notas'}</p>
                </div>
                <div style="width: 40%; text-align: right;">
                    <p><strong>Subtotal:</strong> $${invoice.subtotal.toFixed(2)}</p>
                    <p><strong>IVA (16%):</strong> $${invoice.tax.toFixed(2)}</p>
                    <h4><strong>Total:</strong> $${invoice.total.toFixed(2)}</h4>
                </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px;">
                <p>Generado el: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Factura #${invoice.id} - SysInvent</title>
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

function printSection(tableId, title) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    // Crear contenido para imprimir
    let printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; color: #3498db;">SysInvent</h2>
            <h3 style="text-align: center;">${title}</h3>
            <hr>
    `;
    
    // Agregar la tabla
    printContent += table.outerHTML;
    
    // Cerrar el div
    printContent += `
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
                <title>${title} - SysInvent</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; border: 1px solid #ddd; }
                        th { background-color: #f8f9fa; }
                    }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Funciones para órdenes de compra
function loadPurchaseOrdersTable() {
    const tableBody = document.getElementById('purchaseOrdersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Cargar proveedores en el select de órdenes de compra
    const purchaseOrderSupplierSelect = document.getElementById('purchaseOrderSupplier');
    if (purchaseOrderSupplierSelect) {
        purchaseOrderSupplierSelect.innerHTML = '<option value="">Seleccionar proveedor</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.name;
            purchaseOrderSupplierSelect.appendChild(option);
        });
    }
    
    // Mostrar órdenes de compra
    if (purchaseOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay órdenes de compra registradas</td></tr>';
        return;
    }
    
    // Ordenar órdenes de compra por fecha (más reciente primero)
    const sortedPurchaseOrders = [...purchaseOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedPurchaseOrders.forEach(order => {
        const supplier = suppliers.find(s => s.id === order.supplierId);
        const statusClass = getStatusClass(order.status);
        const invoice = order.invoiceId ? invoices.find(i => i.id === order.invoiceId) : null;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${supplier ? supplier.name : 'Proveedor no encontrado'}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <span class="badge bg-${statusClass} status-badge" data-id="${order.id}" data-type="purchaseOrder">
                    ${order.status}
                </span>
            </td>
            <td>${invoice ? `#${invoice.id}` : 'Pendiente'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editPurchaseOrder(${order.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePurchaseOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addPurchaseOrderItem() {
    const tableBody = document.querySelector('#purchaseOrderItemsTable tbody');
    if (!tableBody) return;
    
    // Crear fila para nuevo item
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="form-select product-select">
                <option value="">Seleccionar producto</option>
                ${inventoryProducts.map(p => `<option value="${p.id}" data-price="${p.cost}" data-warehouse="${p.warehouseId}">${p.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" class="form-control quantity-input" min="1" value="1"></td>
        <td><input type="number" class="form-control price-input" step="0.01" readonly></td>
        <td class="subtotal-cell">$0.00</td>
        <td class="warehouse-cell"></td>
        <td><button type="button" class="btn btn-sm btn-danger remove-item"><i class="fas fa-times"></i></button></td>
    `;
    
    tableBody.appendChild(row);
    
    // Configurar event listeners para el nuevo item
    const productSelect = row.querySelector('.product-select');
    const quantityInput = row.querySelector('.quantity-input');
    const priceInput = row.querySelector('.price-input');
    const removeBtn = row.querySelector('.remove-item');
    
    productSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const price = selectedOption.getAttribute('data-price') || 0;
        const warehouseId = selectedOption.getAttribute('data-warehouse');
        const warehouse = warehouses.find(w => w.id == warehouseId);
        const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
        
        priceInput.value = price;
        row.querySelector('.warehouse-cell').textContent = warehouseName;
        updatePurchaseOrderItemSubtotal(row);
        updatePurchaseOrderTotals();
    });
    
    quantityInput.addEventListener('input', function() {
        updatePurchaseOrderItemSubtotal(row);
        updatePurchaseOrderTotals();
    });
    
    removeBtn.addEventListener('click', function() {
        row.remove();
        updatePurchaseOrderTotals();
    });
}

function updatePurchaseOrderItemSubtotal(row) {
    const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    const subtotal = quantity * price;
    
    row.querySelector('.subtotal-cell').textContent = `$${subtotal.toFixed(2)}`;
}

function updatePurchaseOrderTotals() {
    let subtotal = 0;
    document.querySelectorAll('#purchaseOrderItemsTable tbody tr').forEach(row => {
        const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        subtotal += quantity * price;
    });
    
    const tax = subtotal * 0.16; // IVA del 16%
    const total = subtotal + tax;
    
    document.getElementById('purchaseOrderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('purchaseOrderTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('purchaseOrderTotal').textContent = `$${total.toFixed(2)}`;
}

function savePurchaseOrder() {
    const orderId = document.getElementById('purchaseOrderId').value;
    const supplierId = parseInt(document.getElementById('purchaseOrderSupplier').value);
    const date = document.getElementById('purchaseOrderDate').value;
    const status = document.getElementById('purchaseOrderStatus').value;
    const notes = document.getElementById('purchaseOrderNotes').value;
    
    if (!supplierId || !date) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    // Recolectar items de la orden de compra
    const items = [];
    let hasError = false;
    
    document.querySelectorAll('#purchaseOrderItemsTable tbody tr').forEach(row => {
        const productId = parseInt(row.querySelector('.product-select').value);
        const quantity = parseInt(row.querySelector('.quantity-input').value);
        const price = parseFloat(row.querySelector('.price-input').value);
        
        if (!productId || quantity <= 0) {
            hasError = true;
            return;
        }
        
        items.push({ productId, quantity, price });
    });
    
    if (hasError) {
        showAlert('Por favor, verifique los items de la orden de compra.', 'warning');
        return;
    }
    
    if (items.length === 0) {
        showAlert('La orden de compra debe tener al menos un producto.', 'warning');
        return;
    }
    
    // Calcular totales
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    if (orderId) {
        // Editar orden existente
        const index = purchaseOrders.findIndex(o => o.id == orderId);
        if (index !== -1) {
            purchaseOrders[index] = {
                ...purchaseOrders[index],
                supplierId,
                date,
                items,
                subtotal,
                tax,
                total,
                status,
                notes
            };
            
            // Actualizar Kardex automáticamente si el estado es válido
            updateKardexAutomatically(purchaseOrders[index], 'purchase');
            
            // Actualizar la factura asociada si existe
            if (purchaseOrders[index].invoiceId) {
                const invoiceIndex = invoices.findIndex(i => i.id == purchaseOrders[index].invoiceId);
                if (invoiceIndex !== -1) {
                    invoices[invoiceIndex] = {
                        ...invoices[invoiceIndex],
                        items: [...items],
                        subtotal,
                        tax,
                        total,
                        status
                    };
                    localStorage.setItem('invoices', JSON.stringify(invoices));
                }
            }
            
            showAlert('Orden de compra actualizada correctamente.', 'success');
        }
    } else {
        // Crear nueva orden de compra
        const newPurchaseOrder = {
            id: purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map(o => o.id)) + 1 : 1,
            supplierId,
            date,
            items,
            subtotal,
            tax,
            total,
            status: status,
            notes,
            invoiceId: null
        };
        
        purchaseOrders.push(newPurchaseOrder);
        
        // Actualizar Kardex automáticamente si el estado es válido
        updateKardexAutomatically(newPurchaseOrder, 'purchase');
        
        // Generar factura automáticamente
        const invoice = generateInvoiceFromPurchaseOrder(newPurchaseOrder);
        if (invoice) {
            newPurchaseOrder.invoiceId = invoice.id;
        }
        
        showAlert('Orden de compra creada correctamente.', 'success');
    }
    
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseOrderModal'));
    if (modal) modal.hide();
    
    // Limpiar formulario
    document.getElementById('purchaseOrderForm').reset();
    document.querySelector('#purchaseOrderItemsTable tbody').innerHTML = '';
    updatePurchaseOrderTotals();
    
    // Actualizar tablas
    loadPurchaseOrdersTable();
    loadPurchaseInvoicesTable();
}

function editPurchaseOrder(id) {
    const order = purchaseOrders.find(o => o.id === id);
    if (!order) return;
    
    document.getElementById('purchaseOrderId').value = order.id;
    document.getElementById('purchaseOrderSupplier').value = order.supplierId;
    document.getElementById('purchaseOrderDate').value = order.date;
    document.getElementById('purchaseOrderStatus').value = order.status;
    document.getElementById('purchaseOrderNotes').value = order.notes || '';
    
    // Cargar items de la orden
    const itemsTableBody = document.querySelector('#purchaseOrderItemsTable tbody');
    itemsTableBody.innerHTML = '';
    
    order.items.forEach(item => {
        const product = inventoryProducts.find(p => p.id === item.productId);
        const warehouse = warehouses.find(w => w.id === product.warehouseId);
        const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="form-select product-select">
                    <option value="">Seleccionar producto</option>
                    ${inventoryProducts.map(p => `<option value="${p.id}" data-price="${p.cost}" data-warehouse="${p.warehouseId}" ${p.id === item.productId ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
            </td>
            <td><input type="number" class="form-control quantity-input" min="1" value="${item.quantity}"></td>
            <td><input type="number" class="form-control price-input" step="0.01" value="${item.price}" readonly></td>
            <td class="subtotal-cell">$${(item.quantity * item.price).toFixed(2)}</td>
            <td class="warehouse-cell">${warehouseName}</td>
            <td><button type="button" class="btn btn-sm btn-danger remove-item"><i class="fas fa-times"></i></button></td>
        `;
        
        itemsTableBody.appendChild(row);
        
        // Configurar event listeners para el item
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity-input');
        const removeBtn = row.querySelector('.remove-item');
        
        productSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price') || 0;
            const warehouseId = selectedOption.getAttribute('data-warehouse');
            const warehouse = warehouses.find(w => w.id == warehouseId);
            const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
            
            row.querySelector('.price-input').value = price;
            row.querySelector('.warehouse-cell').textContent = warehouseName;
            updatePurchaseOrderItemSubtotal(row);
            updatePurchaseOrderTotals();
        });
        
        quantityInput.addEventListener('input', function() {
            updatePurchaseOrderItemSubtotal(row);
            updatePurchaseOrderTotals();
        });
        
        removeBtn.addEventListener('click', function() {
            row.remove();
            updatePurchaseOrderTotals();
        });
    });
    
    updatePurchaseOrderTotals();
    
    document.getElementById('purchaseOrderModalTitle').textContent = 'Editar Orden de Compra';
    
    const modal = new bootstrap.Modal(document.getElementById('purchaseOrderModal'));
    modal.show();
}

function deletePurchaseOrder(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta orden de compra?')) return;
    
    const orderIndex = purchaseOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) return;
    
    // Eliminar la factura asociada si existe
    const order = purchaseOrders[orderIndex];
    if (order.invoiceId) {
        const invoiceIndex = invoices.findIndex(i => i.id === order.invoiceId);
        if (invoiceIndex !== -1) {
            invoices.splice(invoiceIndex, 1);
        }
    }
    
    purchaseOrders.splice(orderIndex, 1);
    localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    loadPurchaseOrdersTable();
    loadPurchaseInvoicesTable();
    updateDashboard();
    showAlert('Orden de compra eliminada correctamente.', 'success');
}

// Funciones para órdenes de venta
function loadSalesOrdersTable() {
    const tableBody = document.getElementById('salesOrdersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Cargar clientes en el select de órdenes de venta
    const salesOrderClientSelect = document.getElementById('salesOrderClient');
    if (salesOrderClientSelect) {
        salesOrderClientSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            salesOrderClientSelect.appendChild(option);
        });
    }
    
    // Mostrar órdenes de venta
    if (salesOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay órdenes de venta registradas</td></tr>';
        return;
    }
    
    // Ordenar órdenes de venta por fecha (más reciente primero)
    const sortedSalesOrders = [...salesOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedSalesOrders.forEach(order => {
        const customer = customers.find(c => c.id === order.clientId);
        const statusClass = getStatusClass(order.status);
        const invoice = order.invoiceId ? invoices.find(i => i.id === order.invoiceId) : null;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${customer ? customer.name : 'Cliente no encontrado'}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>
                <span class="badge bg-${statusClass} status-badge" data-id="${order.id}" data-type="salesOrder">
                    ${order.status}
                </span>
            </td>
            <td>${invoice ? `#${invoice.id}` : 'Pendiente'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editSalesOrder(${order.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteSalesOrder(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addSalesOrderItem() {
    const tableBody = document.querySelector('#salesOrderItemsTable tbody');
    if (!tableBody) return;
    
    // Crear fila para nuevo item
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <select class="form-select product-select">
                <option value="">Seleccionar producto</option>
                ${inventoryProducts.map(p => `<option value="${p.id}" data-price="${p.price}" data-warehouse="${p.warehouseId}">${p.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" class="form-control quantity-input" min="1" value="1"></td>
        <td><input type="number" class="form-control price-input" step="0.01" readonly></td>
        <td class="subtotal-cell">$0.00</td>
        <td class="warehouse-cell"></td>
        <td><button type="button" class="btn btn-sm btn-danger remove-item"><i class="fas fa-times"></i></button></td>
    `;
    
    tableBody.appendChild(row);
    
    // Configurar event listeners para el nuevo item
    const productSelect = row.querySelector('.product-select');
    const quantityInput = row.querySelector('.quantity-input');
    const priceInput = row.querySelector('.price-input');
    const removeBtn = row.querySelector('.remove-item');
    
    productSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const price = selectedOption.getAttribute('data-price') || 0;
        const warehouseId = selectedOption.getAttribute('data-warehouse');
        const warehouse = warehouses.find(w => w.id == warehouseId);
        const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
        
        priceInput.value = price;
        row.querySelector('.warehouse-cell').textContent = warehouseName;
        updateSalesOrderItemSubtotal(row);
        updateSalesOrderTotals();
    });
    
    quantityInput.addEventListener('input', function() {
        updateSalesOrderItemSubtotal(row);
        updateSalesOrderTotals();
    });
    
    removeBtn.addEventListener('click', function() {
        row.remove();
        updateSalesOrderTotals();
    });
}

function updateSalesOrderItemSubtotal(row) {
    const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    const subtotal = quantity * price;
    
    row.querySelector('.subtotal-cell').textContent = `$${subtotal.toFixed(2)}`;
}

function updateSalesOrderTotals() {
    let subtotal = 0;
    document.querySelectorAll('#salesOrderItemsTable tbody tr').forEach(row => {
        const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        subtotal += quantity * price;
    });
    
    const tax = subtotal * 0.16; // IVA del 16%
    const total = subtotal + tax;
    
    document.getElementById('salesOrderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('salesOrderTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('salesOrderTotal').textContent = `$${total.toFixed(2)}`;
}

function saveSalesOrder() {
    const orderId = document.getElementById('salesOrderId').value;
    const clientId = parseInt(document.getElementById('salesOrderClient').value);
    const date = document.getElementById('salesOrderDate').value;
    const status = document.getElementById('salesOrderStatus').value;
    const notes = document.getElementById('salesOrderNotes').value;
    
    if (!clientId || !date) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    // Recolectar items de la orden de venta
    const items = [];
    let hasError = false;
    
    document.querySelectorAll('#salesOrderItemsTable tbody tr').forEach(row => {
        const productId = parseInt(row.querySelector('.product-select').value);
        const quantity = parseInt(row.querySelector('.quantity-input').value);
        const price = parseFloat(row.querySelector('.price-input').value);
        
        if (!productId || quantity <= 0) {
            hasError = true;
            return;
        }
        
        // Verificar stock disponible
        const product = inventoryProducts.find(p => p.id === productId);
        if (!product || product.stock < quantity) {
            showAlert(`Stock insuficiente para el producto: ${product ? product.name : 'ID ' + productId}`, 'warning');
            hasError = true;
            return;
        }
        
        items.push({ productId, quantity, price });
    });
    
    if (hasError) {
        showAlert('Por favor, verifique los items de la orden de venta.', 'warning');
        return;
    }
    
    if (items.length === 0) {
        showAlert('La orden de venta debe tener al menos un producto.', 'warning');
        return;
    }
    
    // Calcular totales
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    if (orderId) {
        // Editar orden existente
        const index = salesOrders.findIndex(o => o.id == orderId);
        if (index !== -1) {
            salesOrders[index] = {
                ...salesOrders[index],
                clientId,
                date,
                items,
                subtotal,
                tax,
                total,
                status,
                notes
            };
            
            // Actualizar Kardex automáticamente si el estado es válido
            updateKardexAutomatically(salesOrders[index], 'sales');
            
            // Actualizar la factura asociada si existe
            if (salesOrders[index].invoiceId) {
                const invoiceIndex = invoices.findIndex(i => i.id == salesOrders[index].invoiceId);
                if (invoiceIndex !== -1) {
                    invoices[invoiceIndex] = {
                        ...invoices[invoiceIndex],
                        items: [...items],
                        subtotal,
                        tax,
                        total,
                        status
                    };
                    localStorage.setItem('invoices', JSON.stringify(invoices));
                }
            }
            
            showAlert('Orden de venta actualizada correctamente.', 'success');
        }
    } else {
        // Crear nueva orden de venta
        const newSalesOrder = {
            id: salesOrders.length > 0 ? Math.max(...salesOrders.map(o => o.id)) + 1 : 1,
            clientId,
            date,
            items,
            subtotal,
            tax,
            total,
            status: status,
            notes,
            invoiceId: null
        };
        
        salesOrders.push(newSalesOrder);
        
        // Actualizar Kardex automáticamente si el estado es válido
        updateKardexAutomatically(newSalesOrder, 'sales');
        
        // Generar factura automáticamente
        const invoice = generateInvoiceFromSalesOrder(newSalesOrder);
        if (invoice) {
            newSalesOrder.invoiceId = invoice.id;
        }
        
        showAlert('Orden de venta creada correctamente.', 'success');
    }
    
    localStorage.setItem('salesOrders', JSON.stringify(salesOrders));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('salesOrderModal'));
    if (modal) modal.hide();
    
    // Limpiar formulario
    document.getElementById('salesOrderForm').reset();
    document.querySelector('#salesOrderItemsTable tbody').innerHTML = '';
    updateSalesOrderTotals();
    
    // Actualizar tablas
    loadSalesOrdersTable();
    loadSalesInvoicesTable();
}

function editSalesOrder(id) {
    const order = salesOrders.find(o => o.id === id);
    if (!order) return;
    
    document.getElementById('salesOrderId').value = order.id;
    document.getElementById('salesOrderClient').value = order.clientId;
    document.getElementById('salesOrderDate').value = order.date;
    document.getElementById('salesOrderStatus').value = order.status;
    document.getElementById('salesOrderNotes').value = order.notes || '';
    
    // Cargar items de la orden
    const itemsTableBody = document.querySelector('#salesOrderItemsTable tbody');
    itemsTableBody.innerHTML = '';
    
    order.items.forEach(item => {
        const product = inventoryProducts.find(p => p.id === item.productId);
        const warehouse = warehouses.find(w => w.id === product.warehouseId);
        const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="form-select product-select">
                    <option value="">Seleccionar producto</option>
                    ${inventoryProducts.map(p => `<option value="${p.id}" data-price="${p.price}" data-warehouse="${p.warehouseId}" ${p.id === item.productId ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
            </td>
            <td><input type="number" class="form-control quantity-input" min="1" value="${item.quantity}"></td>
            <td><input type="number" class="form-control price-input" step="0.01" value="${item.price}" readonly></td>
            <td class="subtotal-cell">$${(item.quantity * item.price).toFixed(2)}</td>
            <td class="warehouse-cell">${warehouseName}</td>
            <td><button type="button" class="btn btn-sm btn-danger remove-item"><i class="fas fa-times"></i></button></td>
        `;
        
        itemsTableBody.appendChild(row);
        
        // Configurar event listeners para el item
        const productSelect = row.querySelector('.product-select');
        const quantityInput = row.querySelector('.quantity-input');
        const removeBtn = row.querySelector('.remove-item');
        
        productSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const price = selectedOption.getAttribute('data-price') || 0;
            const warehouseId = selectedOption.getAttribute('data-warehouse');
            const warehouse = warehouses.find(w => w.id == warehouseId);
            const warehouseName = warehouse ? warehouse.name : 'Sin asignar';
            
            row.querySelector('.price-input').value = price;
            row.querySelector('.warehouse-cell').textContent = warehouseName;
            updateSalesOrderItemSubtotal(row);
            updateSalesOrderTotals();
        });
        
        quantityInput.addEventListener('input', function() {
            updateSalesOrderItemSubtotal(row);
            updateSalesOrderTotals();
        });
        
        removeBtn.addEventListener('click', function() {
            row.remove();
            updateSalesOrderTotals();
        });
    });
    
    updateSalesOrderTotals();
    
    document.getElementById('salesOrderModalTitle').textContent = 'Editar Orden de Venta';
    
    const modal = new bootstrap.Modal(document.getElementById('salesOrderModal'));
    modal.show();
}

function deleteSalesOrder(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta orden de venta?')) return;
    
    const orderIndex = salesOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) return;
    
    // Eliminar la factura asociada si existe
    const order = salesOrders[orderIndex];
    if (order.invoiceId) {
        const invoiceIndex = invoices.findIndex(i => i.id === order.invoiceId);
        if (invoiceIndex !== -1) {
            invoices.splice(invoiceIndex, 1);
        }
    }
    
    salesOrders.splice(orderIndex, 1);
    localStorage.setItem('salesOrders', JSON.stringify(salesOrders));
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    loadSalesOrdersTable();
    loadSalesInvoicesTable();
    updateDashboard();
    showAlert('Orden de venta eliminada correctamente.', 'success');
}

// Funciones para almacenes
function loadWarehousesTable() {
    const tableBody = document.getElementById('warehousesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (warehouses.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay almacenes registrados</td></tr>';
        return;
    }
    
    warehouses.forEach(warehouse => {
        // Calcular cantidad de productos en el almacén
        const productsInWarehouse = inventoryProducts.filter(p => p.warehouseId === warehouse.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${warehouse.id}</td>
            <td>${warehouse.name}</td>
            <td>${warehouse.location}</td>
            <td>${warehouse.capacity}</td>
            <td>${productsInWarehouse}</td>
            <td>${warehouse.manager}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editWarehouse(${warehouse.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteWarehouse(${warehouse.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function saveWarehouse() {
    const warehouseId = document.getElementById('warehouseId').value;
    const name = document.getElementById('warehouseName').value;
    const location = document.getElementById('warehouseLocation').value;
    const capacity = parseInt(document.getElementById('warehouseCapacity').value);
    const manager = document.getElementById('warehouseManager').value;
    const description = document.getElementById('warehouseDescription').value;
    
    // Validaciones
    if (!name || !location || !capacity || !manager) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    if (capacity <= 0) {
        showAlert('La capacidad debe ser mayor a cero.', 'warning');
        return;
    }
    
    if (warehouseId) {
        // Editar almacén existente
        const index = warehouses.findIndex(w => w.id == warehouseId);
        if (index !== -1) {
            warehouses[index] = {
                ...warehouses[index],
                name, location, capacity, manager, description
            };
            showAlert('Almacén actualizado correctamente.', 'success');
        }
    } else {
        // Crear nuevo almacén
        const newWarehouse = {
            id: warehouses.length > 0 ? Math.max(...warehouses.map(w => w.id)) + 1 : 1,
            name,
            location,
            capacity,
            products: 0, // Inicialmente sin productos
            manager,
            description
        };
        warehouses.push(newWarehouse);
        showAlert('Almacén creado correctamente.', 'success');
    }
    
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    
    // Cerrar modal y actualizar tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseModal'));
    if (modal) modal.hide();
    
    loadWarehousesTable();
    
    // Limpiar formulario
    document.getElementById('warehouseForm').reset();
    document.getElementById('warehouseId').value = '';
}

function editWarehouse(id) {
    const warehouse = warehouses.find(w => w.id === id);
    if (!warehouse) return;
    
    document.getElementById('warehouseId').value = warehouse.id;
    document.getElementById('warehouseName').value = warehouse.name;
    document.getElementById('warehouseLocation').value = warehouse.location;
    document.getElementById('warehouseCapacity').value = warehouse.capacity;
    document.getElementById('warehouseManager').value = warehouse.manager;
    document.getElementById('warehouseDescription').value = warehouse.description || '';
    
    document.getElementById('warehouseModalTitle').textContent = 'Editar Almacén';
    
    const modal = new bootstrap.Modal(document.getElementById('warehouseModal'));
    modal.show();
}

function deleteWarehouse(id) {
    if (!confirm('¿Está seguro de que desea eliminar este almacén?')) return;
    
    // Verificar si el almacén tiene productos
    const warehouse = warehouses.find(w => w.id === id);
    if (warehouse && inventoryProducts.some(p => p.warehouseId === id)) {
        showAlert('No se puede eliminar el almacén porque tiene productos asignados.', 'warning');
        return;
    }
    
    warehouses = warehouses.filter(w => w.id !== id);
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    loadWarehousesTable();
    showAlert('Almacén eliminado correctamente.', 'success');
}

// Funciones para gestión de usuarios
function loadUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const statusClass = user.status === 'Activo' ? 'success' : 'secondary';
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="badge bg-${statusClass}">${user.status}</span></td>
            <td>${new Date(user.lastAccess).toLocaleDateString()}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function saveUser() {
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;
    
    // Validaciones
    if (!name || !email || !role || !status) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, ingrese un email válido.', 'warning');
        return;
    }
    
    if (userId) {
        // Editar usuario existente
        const index = users.findIndex(u => u.id == userId);
        if (index !== -1) {
            const updatedUser = {
                ...users[index],
                name, email, role, status
            };
            
            // Actualizar contraseña solo si se proporcionó una nueva
            if (password) {
                updatedUser.password = password;
            }
            
            users[index] = updatedUser;
            showAlert('Usuario actualizado correctamente.', 'success');
        }
    } else {
        // Verificar si el email ya existe
        if (users.find(u => u.email === email)) {
            showAlert('Ya existe un usuario con este email.', 'warning');
            return;
        }
        
        if (!password) {
            showAlert('La contraseña es obligatoria para nuevos usuarios.', 'warning');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password,
            role,
            status,
            lastAccess: new Date().toISOString()
        };
        users.push(newUser);
        showAlert('Usuario creado correctamente.', 'success');
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Cerrar modal y actualizar tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    if (modal) modal.hide();
    
    loadUsersTable();
    
    // Limpiar formulario
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    // No mostrar la contraseña por seguridad
    document.getElementById('userPassword').value = '';
    
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

function deleteUser(id) {
    if (id === currentUser.id) {
        showAlert('No puede eliminar su propio usuario.', 'warning');
        return;
    }
    
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;
    
    users = users.filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsersTable();
    showAlert('Usuario eliminado correctamente.', 'success');
}

// Funciones para el sistema Kardex
function loadKardexTable() {
    const tableBody = document.getElementById('kardexTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Cargar productos en el select
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.innerHTML = '<option value="all">Todos los productos</option>';
        inventoryProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
    }
    
    // Configurar event listeners para filtros
    if (productSelect) {
        productSelect.addEventListener('change', updateKardexTable);
    }
    
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (dateFrom) dateFrom.addEventListener('change', updateKardexTable);
    if (dateTo) dateTo.addEventListener('change', updateKardexTable);
    
    // Mostrar datos iniciales
    updateKardexTable();
}

function updateKardexTable() {
    const tableBody = document.getElementById('kardexTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const productId = document.getElementById('productSelect').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    // Filtrar movimientos
    let filteredMovements = inventoryMovements;
    
    if (productId !== 'all') {
        filteredMovements = filteredMovements.filter(m => m.productId == productId);
    }
    
    if (dateFrom) {
        filteredMovements = filteredMovements.filter(m => m.date >= dateFrom);
    }
    
    if (dateTo) {
        filteredMovements = filteredMovements.filter(m => m.date <= dateTo);
    }
    
    // Ordenar por fecha
    filteredMovements.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredMovements.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay movimientos para los filtros seleccionados</td></tr>';
        return;
    }
    
    // Calcular saldos
    let balance = 0;
    let totalCost = 0;
    
    filteredMovements.forEach(movement => {
        const product = inventoryProducts.find(p => p.id === movement.productId);
        if (!product) return;
        
        const entry = movement.type === 'entry' ? movement.quantity : 0;
        const exit = movement.type === 'exit' ? movement.quantity : 0;
        
        balance += entry - exit;
        totalCost = balance * product.cost;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(movement.date).toLocaleDateString()}</td>
            <td>${product.name}</td>
            <td>${movement.reason}</td>
            <td>${entry}</td>
            <td>${exit}</td>
            <td>${balance}</td>
            <td>$${product.cost.toFixed(2)}</td>
            <td>$${totalCost.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Funciones para informes y KPIs
function loadReports() {
    // Actualizar KPIs basados en datos reales
    updateKPIs();
    
    // Actualizar gráficos
    updateCategoryChart();
    updateInventoryTurnoverChart();
}

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

// Funciones para generar informes
function generateSalesReport() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlySales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear && invoice.status === "Vendida" && invoice.orderType === "sales";
    });
    
    const monthlyIncome = monthlySales.reduce((total, invoice) => total + invoice.total, 0);
    
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const previousMonthlySales = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate.getMonth() === previousMonth && invoiceDate.getFullYear() === previousYear && invoice.status === "Vendida" && invoice.orderType === "sales";
    });
    
    const previousMonthlyIncome = previousMonthlySales.reduce((total, invoice) => total + invoice.total, 0);
    
    const growth = previousMonthlyIncome > 0 ? 
        ((monthlyIncome - previousMonthlyIncome) / previousMonthlyIncome * 100).toFixed(1) : 0;
    
    showReport('Informe de Ventas', `
        <h5>Resumen de Ventas</h5>
        <p>Total de ventas este mes: $${monthlyIncome.toLocaleString()}</p>
        <p>Ventas del mes anterior: $${previousMonthlyIncome.toLocaleString()}</p>
        <p>Crecimiento: ${growth}%</p>
        
        <h5 class="mt-4">Productos Más Vendidos</h5>
        <ul>
            ${getTopProductsList()}
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

function getTopSuppliersList() {
    const supplierPurchases = {};
    
    invoices.filter(invoice => invoice.orderType === "purchase").forEach(invoice => {
        if (!supplierPurchases[invoice.supplierId]) {
            supplierPurchases[invoice.supplierId] = 0;
        }
        supplierPurchases[invoice.supplierId] += invoice.total;
    });
    
    const topSuppliers = Object.keys(supplierPurchases)
        .map(supplierId => {
            const supplier = suppliers.find(s => s.id == supplierId);
            return {
                name: supplier ? supplier.name : 'Proveedor no encontrado',
                amount: supplierPurchases[supplierId]
            };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    
    if (topSuppliers.length === 0) {
        return '<li>No hay datos de compras</li>';
    }
    
    return topSuppliers.map(supplier => 
        `<li>${supplier.name} - $${supplier.amount.toLocaleString()}</li>`
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

// Búsqueda global
function performGlobalSearch() {
    const searchTerm = document.getElementById('globalSearch').value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchTerm.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    // Buscar en diferentes categorías
    const productResults = inventoryProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.code.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm)
    ).slice(0, 3);
    
    const customerResults = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.email.toLowerCase().includes(searchTerm)
    ).slice(0, 2);
    
    // Mostrar resultados
    let resultsHTML = '';
    
    if (productResults.length > 0) {
        resultsHTML += '<div class="search-category">Productos</div>';
        productResults.forEach(product => {
            resultsHTML += `
                <div class="search-item" onclick="showSection('inventory')">
                    <i class="fas fa-box me-2"></i>
                    ${product.name} (${product.code})
                </div>
            `;
        });
    }
    
    if (customerResults.length > 0) {
        resultsHTML += '<div class="search-category">Clientes</div>';
        customerResults.forEach(customer => {
            resultsHTML += `
                <div class="search-item" onclick="showSection('customers')">
                    <i class="fas fa-user me-2"></i>
                    ${customer.name}
                </div>
            `;
        });
    }
    
    if (resultsHTML === '') {
        resultsHTML = '<div class="search-item text-muted">No se encontraron resultados</div>';
    }
    
    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.style.display = 'block';
}

// Funciones auxiliares
function showAlert(message, type) {
    // Crear alerta Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insertar en el body
    document.body.appendChild(alertDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Inicializar gráficos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar medidor de inventario (simulado)
    const gaugeContainer = document.getElementById('inventoryGauge');
    if (gaugeContainer) {
        gaugeContainer.innerHTML = `
            <div class="text-center p-4">
                <h5>Salud del Inventario</h5>
                <div class="display-4 text-success">75%</div>
                <p>Estado: Excelente</p>
            </div>
        `;
    }
});

// Funciones globales para botones
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;
window.viewProductDetails = viewProductDetails;
window.printProduct = printProduct;
window.editPurchaseInvoice = function(id) {
    // Para simplificar, reutilizamos la función viewInvoiceDetails
    viewInvoiceDetails(id);
};
window.editSalesInvoice = function(id) {
    // Para simplificar, reutilizamos la función viewInvoiceDetails
    viewInvoiceDetails(id);
};
window.viewInvoiceDetails = viewInvoiceDetails;
window.printInvoice = printInvoice;
window.updateInvoiceStatus = updateInvoiceStatus;
window.editPurchaseOrder = editPurchaseOrder;
window.deletePurchaseOrder = deletePurchaseOrder;
window.editSalesOrder = editSalesOrder;
window.deleteSalesOrder = deleteSalesOrder;
window.editWarehouse = editWarehouse;
window.deleteWarehouse = deleteWarehouse;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.fixDataInconsistencies = fixDataInconsistencies;