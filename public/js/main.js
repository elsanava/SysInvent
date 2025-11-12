function showLoginScreen() {
  const loginScreen = document.getElementById('loginScreen');
  const appScreen = document.getElementById('appScreen');

  if (loginScreen && appScreen) {
    loginScreen.style.display = 'flex';
    appScreen.style.display = 'none';
  }

  // Limpiar formularios (por si el usuario vuelve a login)
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (loginForm) loginForm.reset();
  if (registerForm) registerForm.reset();
}


function showAppScreen() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'block';

  // Actualizar información del usuario
  if (currentUser) {
    // El backend devuelve 'nombre' y 'rol', no 'name' ni 'role'
    const nombre = currentUser.nombre || currentUser.name;
    const rol = currentUser.rol || currentUser.role;

    document.getElementById('userNameDisplay').textContent = nombre;
    document.getElementById('userInitial').textContent = nombre.charAt(0).toUpperCase();
    document.getElementById('profileUserName').textContent = nombre;
    document.getElementById('profileUserInitial').textContent = nombre.charAt(0).toUpperCase();
    document.getElementById('profileUserRole').textContent = rol;
  }
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
}
// Exponer función globalmente
window.setupEventListeners = setupEventListeners;
