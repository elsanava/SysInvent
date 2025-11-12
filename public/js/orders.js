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

function updateSalesOrderItemSubtotal(row) {
    const quantity = parseInt(row.querySelector('.quantity-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    const subtotal = quantity * price;
    
    row.querySelector('.subtotal-cell').textContent = `$${subtotal.toFixed(2)}`;
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
