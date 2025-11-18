// ===============================
// ORDERS 
// ===============================


function createOrderItemRow(productsList, warehousesList, item = {}) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>
      <select class="form-select product-select">
        <option value="">Seleccionar producto</option>
        ${productsList.map(p => `<option value="${p.id}" data-price="${(p.precio ?? p.price) || 0}" ${p.id === item.producto_id ? 'selected' : ''}>${p.nombre ?? p.name}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" class="form-control quantity-input" min="1" value="${item.cantidad || 1}"></td>
    <td><input type="number" class="form-control price-input" step="0.01" value="${item.precio_unitario || (item.precio || item.price) || ''}" readonly></td>
    <td class="subtotal-cell">${formatMoney((item.cantidad || 0) * (item.precio_unitario || item.precio || 0))}</td>
    <td>
      <select class="form-select warehouse-select">
        ${warehousesList.map(w => `<option value="${w.id}" ${w.id === (item.almacen_id || w.id) ? 'selected' : ''}>${w.nombre || w.name}</option>`).join('')}
      </select>
    </td>
    <td><button type="button" class="btn btn-sm btn-danger remove-item"><i class="fas fa-times"></i></button></td>
  `;
  // attach listeners
  const productSelect = row.querySelector('.product-select');
  const quantityInput = row.querySelector('.quantity-input');
  const priceInput = row.querySelector('.price-input');
  const removeBtn = row.querySelector('.remove-item');

  productSelect.addEventListener('change', function() {
    const opt = this.options[this.selectedIndex];
    const price = opt.getAttribute('data-price') || 0;
    priceInput.value = price;
    updateOrderItemSubtotal(row);
    updateOrderTotals(row.closest('table'));
  });

  quantityInput.addEventListener('input', () => { updateOrderItemSubtotal(row); updateOrderTotals(row.closest('table')); });
  removeBtn.addEventListener('click', () => { row.remove(); updateOrderTotals(row.closest('table')); });

  return row;
}

function updateOrderItemSubtotal(row) {
  const qty = parseInt(row.querySelector('.quantity-input').value) || 0;
  const price = parseFloat(row.querySelector('.price-input').value) || 0;
  const subtotal = qty * price;
  row.querySelector('.subtotal-cell').textContent = formatMoney(subtotal);
}

function updateOrderTotals(table) {
  if (!table) return;
  let subtotal = 0;
  table.querySelectorAll('tbody tr').forEach(row => {
    const qty = parseInt(row.querySelector('.quantity-input').value) || 0;
    const price = parseFloat(row.querySelector('.price-input').value) || 0;
    subtotal += qty * price;
  });
  const tax = +(subtotal * 0.16);
  const total = subtotal + tax;

  
  const subtotalEl = table.closest('.order-card')?.querySelector('.order-subtotal') || table.dataset.subtotalEl && document.querySelector(table.dataset.subtotalEl);
  const taxEl = table.closest('.order-card')?.querySelector('.order-tax') || table.dataset.taxEl && document.querySelector(table.dataset.taxEl);
  const totalEl = table.closest('.order-card')?.querySelector('.order-total') || table.dataset.totalEl && document.querySelector(table.dataset.totalEl);

  if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
  if (taxEl) taxEl.textContent = formatMoney(tax);
  if (totalEl) totalEl.textContent = formatMoney(total);
}


async function savePurchaseOrder() {
  const orderId = document.getElementById('purchaseOrderId')?.value;
  const proveedor_id = parseInt(document.getElementById('purchaseOrderSupplier').value);
  const fecha = document.getElementById('purchaseOrderDate')?.value;
  const estado = document.getElementById('purchaseOrderStatus')?.value;
  const notas = document.getElementById('purchaseOrderNotes')?.value;

  if (!proveedor_id || !fecha) { showAlert('Proveedor y fecha obligatorios', 'warning'); return; }

  const items = [];
  document.querySelectorAll('#purchaseOrderItemsTable tbody tr').forEach(row => {
    const productId = parseInt(row.querySelector('.product-select').value) || null;
    const cantidad = parseInt(row.querySelector('.quantity-input').value) || 0;
    const precio_unitario = parseFloat(row.querySelector('.price-input').value) || 0;
    const almacen_id = parseInt(row.querySelector('.warehouse-select').value) || (warehouses[0] && warehouses[0].id) || 1;
    if (!productId || cantidad <= 0) return;
    items.push({ producto_id: productId, cantidad, precio_unitario, almacen_id });
  });

  if (items.length === 0) { showAlert('Agrega al menos 1 item', 'warning'); return; }

  const payload = { proveedor_id, fecha, estado, notas, usuario_id: currentUser?.id || null, items };

  try {
    const url = orderId ? `${API_URL}/ordenes-compra/${orderId}` : `${API_URL}/ordenes-compra`;
    const method = orderId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) { showAlert(data.message || 'Error guardando orden', 'danger'); return; }
    showAlert(data.message || 'Orden guardada', 'success');
    // refresh data
    await loadInventoryData();
    await loadPurchaseOrders();
    // close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseOrderModal'));
    if (modal) modal.hide();
  } catch (err) {
    console.error('savePurchaseOrder error', err);
    showAlert('Error al conectar', 'danger');
  }
}


async function saveSalesOrder() {
  const orderId = document.getElementById('salesOrderId')?.value;
  const cliente_id = parseInt(document.getElementById('salesOrderClient').value);
  const fecha = document.getElementById('salesOrderDate')?.value;
  const estado = document.getElementById('salesOrderStatus')?.value;
  const notas = document.getElementById('salesOrderNotes')?.value;

  if (!cliente_id || !fecha) { showAlert('Cliente y fecha obligatorios', 'warning'); return; }

  const items = [];
  let invalid = false;
  document.querySelectorAll('#salesOrderItemsTable tbody tr').forEach(row => {
    const productId = parseInt(row.querySelector('.product-select').value) || null;
    const cantidad = parseInt(row.querySelector('.quantity-input').value) || 0;
    const precio_unitario = parseFloat(row.querySelector('.price-input').value) || 0;
    if (!productId || cantidad <= 0) invalid = true;
    items.push({ producto_id: productId, cantidad, precio_unitario });
  });

  if (invalid || items.length === 0) { showAlert('Verifique los items de la orden', 'warning'); return; }

  
  if (estado === 'Completada') {
    for (const it of items) {
      const prod = inventoryProducts.find(p => p.id === it.producto_id);
      if (!prod || (prod.stock_actual ?? 0) < it.cantidad) {
        showAlert(`Stock insuficiente para ${prod ? prod.nombre : 'producto ' + it.producto_id}`, 'warning');
        return;
      }
    }
  }

  const payload = { cliente_id, fecha, estado, notas, usuario_id: currentUser?.id || null, items };

  try {
    const url = orderId ? `${API_URL}/ordenes-venta/${orderId}` : `${API_URL}/ordenes-venta`;
    const method = orderId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) { showAlert(data.message || 'Error guardando orden', 'danger'); return; }
    showAlert(data.message || 'Orden guardada', 'success');
    await loadInventoryData();
    await loadSalesOrders();
    const modal = bootstrap.Modal.getInstance(document.getElementById('salesOrderModal'));
    if (modal) modal.hide();
  } catch (err) {
    console.error('saveSalesOrder error', err);
    showAlert('Error al conectar', 'danger');
  }
}

// Loading tables (purchase & sales)
async function loadPurchaseOrders() {
  const tbody = document.getElementById('purchaseOrdersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';
  try {
    const res = await fetch(`${API_URL}/ordenes-compra`, { headers: getAuthHeaders() });
    if (!res.ok) { tbody.innerHTML = '<tr><td colspan="7">Error al cargar</td></tr>'; return; }
    purchaseOrders = await res.json();
    window.purchaseOrders = purchaseOrders;
    if (purchaseOrders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay órdenes de compra</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    purchaseOrders.forEach(order => {
      const proveedor = order.proveedores?.nombre || '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.id}</td>
        <td>${proveedor}</td>
        <td>${formatDate(order.fecha)}</td>
        <td>${formatMoney(order.total)}</td>
        <td><span class="badge bg-${getStatusClass(order.estado)}">${order.estado}</span></td>
        <td>${order.numero_orden || ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editPurchaseOrder(${order.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deletePurchaseOrder(${order.id})"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('loadPurchaseOrders error', err);
    tbody.innerHTML = '<tr><td colspan="7">Error al cargar</td></tr>';
  }
}

async function loadSalesOrders() {
  const tbody = document.getElementById('salesOrdersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7">Cargando...</td></tr>';
  try {
    const res = await fetch(`${API_URL}/ordenes-venta`, { headers: getAuthHeaders() });
    if (!res.ok) { tbody.innerHTML = '<tr><td colspan="7">Error al cargar</td></tr>'; return; }
    salesOrders = await res.json();
    window.salesOrders = salesOrders;
    if (salesOrders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay órdenes de venta</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    salesOrders.forEach(order => {
      const cliente = order.clientes?.nombre || '—';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.id}</td>
        <td>${cliente}</td>
        <td>${formatDate(order.fecha)}</td>
        <td>${formatMoney(order.total)}</td>
        <td><span class="badge bg-${getStatusClass(order.estado)}">${order.estado}</span></td>
        <td>${order.numero_orden || ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editSalesOrder(${order.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteSalesOrder(${order.id})"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('loadSalesOrders error', err);
    tbody.innerHTML = '<tr><td colspan="7">Error al cargar</td></tr>';
  }
}

// Edit / Delete functions (edits open modal and fill items)
async function editPurchaseOrder(id) {
  try {
    const res = await fetch(`${API_URL}/ordenes-compra/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) { showAlert('No se pudo cargar orden', 'danger'); return; }
    const order = await res.json();
    document.getElementById('purchaseOrderId').value = order.id;
    document.getElementById('purchaseOrderSupplier').value = order.proveedor_id;
    document.getElementById('purchaseOrderDate').value = order.fecha;
    document.getElementById('purchaseOrderStatus').value = order.estado;
    document.getElementById('purchaseOrderNotes').value = order.notas || '';

    // llenar items
    const tbody = document.querySelector('#purchaseOrderItemsTable tbody');
    tbody.innerHTML = '';
    (order.orden_compra_items || []).forEach(it => {
      const row = createOrderItemRow(inventoryProducts, warehouses, {
        producto_id: it.producto_id,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario,
        almacen_id: it.almacen_id
      });
      tbody.appendChild(row);
      updateOrderItemSubtotal(row);
    });
    updateOrderTotals(document.getElementById('purchaseOrderItemsTable'));
    document.getElementById('purchaseOrderModalTitle').textContent = 'Editar Orden de Compra';
    new bootstrap.Modal(document.getElementById('purchaseOrderModal')).show();
  } catch (err) {
    console.error('editPurchaseOrder error', err);
    showAlert('Error al cargar orden', 'danger');
  }
}

async function deletePurchaseOrder(id) {
  if (!confirm('¿Seguro que desea eliminar esta orden de compra?')) return;
  try {
    const res = await fetch(`${API_URL}/ordenes-compra/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) { showAlert(data.message || 'No se pudo eliminar', 'danger'); return; }
    showAlert('Orden eliminada', 'success');
    await loadPurchaseOrders();
    await loadInventoryData();
  } catch (err) {
    console.error('deletePurchaseOrder err', err);
    showAlert('Error al conectar', 'danger');
  }
}

async function editSalesOrder(id) {
  try {
    const res = await fetch(`${API_URL}/ordenes-venta/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) { showAlert('No se pudo cargar orden', 'danger'); return; }
    const order = await res.json();
    document.getElementById('salesOrderId').value = order.id;
    document.getElementById('salesOrderClient').value = order.cliente_id;
    document.getElementById('salesOrderDate').value = order.fecha;
    document.getElementById('salesOrderStatus').value = order.estado;
    document.getElementById('salesOrderNotes').value = order.notas || '';

    const tbody = document.querySelector('#salesOrderItemsTable tbody');
    tbody.innerHTML = '';
    (order.orden_venta_items || []).forEach(it => {
      const row = createOrderItemRow(inventoryProducts, warehouses, {
        producto_id: it.producto_id,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario
      });
      tbody.appendChild(row);
      updateOrderItemSubtotal(row);
    });
    updateOrderTotals(document.getElementById('salesOrderItemsTable'));
    document.getElementById('salesOrderModalTitle').textContent = 'Editar Orden de Venta';
    new bootstrap.Modal(document.getElementById('salesOrderModal')).show();
  } catch (err) {
    console.error('editSalesOrder err', err);
    showAlert('Error al cargar orden', 'danger');
  }
}

async function deleteSalesOrder(id) {
  if (!confirm('¿Seguro que desea eliminar esta orden de venta?')) return;
  try {
    const res = await fetch(`${API_URL}/ordenes-venta/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) { showAlert(data.message || 'No se pudo eliminar', 'danger'); return; }
    showAlert('Orden eliminada', 'success');
    await loadSalesOrders();
    await loadInventoryData();
  } catch (err) {
    console.error('deleteSalesOrder err', err);
    showAlert('Error al conectar', 'danger');
  }
}


function addPurchaseOrderItem() {
  const tbody = document.querySelector('#purchaseOrderItemsTable tbody');
  tbody.appendChild(createOrderItemRow(inventoryProducts, warehouses));
  updateOrderTotals(document.getElementById('purchaseOrderItemsTable'));
}
function addSalesOrderItem() {
  const tbody = document.querySelector('#salesOrderItemsTable tbody');
  tbody.appendChild(createOrderItemRow(inventoryProducts, warehouses));
  updateOrderTotals(document.getElementById('salesOrderItemsTable'));
}

// exports
window.savePurchaseOrder = savePurchaseOrder;
window.saveSalesOrder = saveSalesOrder;
window.loadPurchaseOrders = loadPurchaseOrders;
window.loadSalesOrders = loadSalesOrders;
window.editPurchaseOrder = editPurchaseOrder;
window.deletePurchaseOrder = deletePurchaseOrder;
window.editSalesOrder = editSalesOrder;
window.deleteSalesOrder = deleteSalesOrder;
window.addPurchaseOrderItem = addPurchaseOrderItem;
window.addSalesOrderItem = addSalesOrderItem;