const API_URL = typeof API_URL !== 'undefined' ? API_URL : (window.API_URL || '/api');

let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
let inventoryProducts = JSON.parse(localStorage.getItem('inventoryProducts')) || [];
let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
let salesOrders = JSON.parse(localStorage.getItem('salesOrders')) || [];

/* ---------- Utilities ---------- */
async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en la petición');
    return { ok: true, data };
  } catch (err) {
    console.warn('safeFetch fallo:', url, err.message);
    return { ok: false, error: err };
  }
}

function formatMoney(n) {
  return Number(n).toFixed(2);
}

/* ---------- Loaders ---------- */
async function fetchInvoicesFromServer() {
  const r = await safeFetch(`${API_URL}/facturas`);
  if (r.ok) {
    invoices = Array.isArray(r.data) ? r.data : [];
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }
  return r.ok;
}

async function loadPurchaseInvoicesTable() {
  // Obtener tabla
  const tableBody = document.getElementById('purchaseInvoicesTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  // Intentar cargar desde server; si falla, usar localStorage
  await fetchInvoicesFromServer();

  // Filtrar facturas de compra (tipo = purchase o facturas.tipo == 'purchase')
  const purchaseInvoices = invoices.filter(inv =>
    inv.tipo === 'purchase' || inv.tipo === 'compra' || inv.orderType === 'purchase' || inv.orderType === 'sales' ? false : false
  );

  // Fallback: algunos backends usan campo 'tipo' con 'COMPRA'/'VENTA' o 'purchase'/'sales'
  const purchaseInvoicesFallback = invoices.filter(inv =>
    (inv.tipo && String(inv.tipo).toLowerCase().includes('compra')) ||
    (inv.tipo && String(inv.tipo).toLowerCase().includes('purchase')) ||
    (inv.orderType && String(inv.orderType).toLowerCase() === 'purchase') ||
    (inv.orderType && String(inv.orderType).toLowerCase() === 'compra')
  );

  const finalPurchaseInvoices = purchaseInvoices.length ? purchaseInvoices : purchaseInvoicesFallback;

  if (finalPurchaseInvoices.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay facturas de compra</td></tr>';
    return;
  }

  const sorted = [...finalPurchaseInvoices].sort((a, b) => new Date(b.fecha || b.date) - new Date(a.fecha || a.date));

  sorted.forEach(invoice => {
    const supplier = suppliers.find(s => s.id === (invoice.proveedor_id || invoice.proveedorId || invoice.supplierId)) || {};
    const estado = invoice.estado || invoice.status || 'N/A';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${invoice.id}</td>
      <td>${supplier.nombre || supplier.name || 'Proveedor no encontrado'}</td>
      <td>${new Date(invoice.fecha || invoice.date).toLocaleDateString()}</td>
      <td>$${formatMoney(invoice.total ?? invoice.total_amount ?? invoice.total_amount)}</td>
      <td><span class="badge bg-secondary">${estado}</span></td>
      <td>${invoice.orden_id ? `#${invoice.orden_id}` : (invoice.orderId ? `#${invoice.orderId}` : 'N/A')}</td>
      <td class="action-buttons">
        <button class="btn btn-sm btn-outline-info me-1" onclick="viewInvoiceDetails(${invoice.id})"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-outline-secondary print-btn" onclick="printInvoice(${invoice.id})"><i class="fas fa-print"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function loadSalesInvoicesTable() {
  const tableBody = document.getElementById('salesInvoicesTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  await fetchInvoicesFromServer();

  const salesInvoices = invoices.filter(inv =>
    (inv.tipo && String(inv.tipo).toLowerCase().includes('venta')) ||
    (inv.tipo && String(inv.tipo).toLowerCase().includes('sales')) ||
    (inv.orderType && String(inv.orderType).toLowerCase() === 'sales') ||
    (inv.orderType && String(inv.orderType).toLowerCase() === 'venta')
  );

  if (salesInvoices.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay facturas de venta</td></tr>';
    return;
  }

  const sorted = [...salesInvoices].sort((a, b) => new Date(b.fecha || b.date) - new Date(a.fecha || a.date));

  sorted.forEach(invoice => {
    const customer = customers.find(c => c.id === (invoice.cliente_id || invoice.clienteId || invoice.clientId)) || {};
    const estado = invoice.estado || invoice.status || 'N/A';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${invoice.id}</td>
      <td>${customer.nombre || customer.name || 'Cliente no encontrado'}</td>
      <td>${new Date(invoice.fecha || invoice.date).toLocaleDateString()}</td>
      <td>$${formatMoney(invoice.total ?? invoice.total_amount)}</td>
      <td><span class="badge bg-secondary">${estado}</span></td>
      <td>${invoice.orden_id ? `#${invoice.orden_id}` : (invoice.orderId ? `#${invoice.orderId}` : 'N/A')}</td>
      <td class="action-buttons">
        <button class="btn btn-sm btn-outline-info me-1" onclick="viewInvoiceDetails(${invoice.id})"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-outline-secondary print-btn" onclick="printInvoice(${invoice.id})"><i class="fas fa-print"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/* ---------- Detalles de factura ---------- */
async function viewInvoiceDetails(id) {
  // Preferimos pedir al servidor el detalle (incluye items)
  const r = await safeFetch(`${API_URL}/facturas/${id}`);
  let invoice;
  if (r.ok) {
    invoice = r.data;
    // Actualizamos cache local
    const idx = invoices.findIndex(i => i.id === invoice.id);
    if (idx === -1) invoices.push(invoice); else invoices[idx] = invoice;
    localStorage.setItem('invoices', JSON.stringify(invoices));
  } else {
    invoice = invoices.find(i => i.id === id);
  }
  if (!invoice) return showAlert('Factura no encontrada', 'warning');

  // Obtener cliente/proveedor
  const esCompra = (invoice.tipo && String(invoice.tipo).toLowerCase().includes('compra')) ||
                   (invoice.orderType && String(invoice.orderType).toLowerCase() === 'purchase');

  let clientOrSupplier = null;
  if (esCompra) {
    clientOrSupplier = suppliers.find(s => s.id === (invoice.proveedor_id || invoice.proveedorId || invoice.supplierId));
  } else {
    clientOrSupplier = customers.find(c => c.id === (invoice.cliente_id || invoice.clienteId || invoice.clientId));
  }
  const name = clientOrSupplier ? (clientOrSupplier.nombre || clientOrSupplier.name) : 'No encontrado';
  const tipoTexto = esCompra ? 'Proveedor' : 'Cliente';

  // Items: si el servidor devolvió invoice.items usarlos; si no, intentar fetch de factura_items
  let items = invoice.items;
  if (!Array.isArray(items)) {
    const ri = await safeFetch(`${API_URL}/factura_items?factura_id=${id}`);
    if (ri.ok && Array.isArray(ri.data)) items = ri.data;
    else items = [];
  }

  let itemsHtml = '';
  items.forEach(item => {
    const producto = inventoryProducts.find(p => p.id === (item.producto_id || item.productId || item.productoId));
    const qty = item.cantidad || item.quantity || 0;
    const price = item.precio_unitario || item.price || 0;
    itemsHtml += `
      <tr>
        <td>${producto ? producto.nombre || producto.name : 'Producto no encontrado'}</td>
        <td>${qty}</td>
        <td>$${formatMoney(price)}</td>
        <td>$${formatMoney(qty * price)}</td>
      </tr>
    `;
  });

  const modalTitle = document.getElementById('productModalTitle');
  const modalBody = document.querySelector('#productModal .modal-body');
  const modalFooter = document.querySelector('#productModal .modal-footer');

  const detailsHtml = `
    <div class="invoice-details">
      <h5>Detalles de Factura #${invoice.id}</h5>
      <div class="row mt-3">
        <div class="col-md-6">
          <p><strong>${tipoTexto}:</strong> ${name}</p>
          <p><strong>Fecha:</strong> ${new Date(invoice.fecha || invoice.date).toLocaleDateString()}</p>
          <p><strong>Tipo:</strong> ${(invoice.tipo || invoice.orderType) || 'N/A'}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Estado:</strong> 
            <select class="form-select d-inline w-auto" id="invoiceStatusSelect" onchange="updateInvoiceStatus(${invoice.id}, this.value)">
              <option value="Pendiente" ${invoice.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="Confirmada" ${invoice.estado === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
              <option value="Recibida" ${invoice.estado === 'Recibida' ? 'selected' : ''}>Recibida</option>
              <option value="Vendida" ${invoice.estado === 'Vendida' ? 'selected' : ''}>Vendida</option>
              <option value="Cancelada" ${invoice.estado === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
            </select>
          </p>
          <p><strong>Orden Asociada:</strong> ${invoice.orden_id ? `#${invoice.orden_id}` : (invoice.orderId ? `#${invoice.orderId}` : 'N/A')}</p>
        </div>
      </div>

      <div class="mt-4">
        <h6>Productos</h6>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div class="row mt-4">
        <div class="col-md-6">
          <p><strong>Notas:</strong> ${invoice.notas || invoice.notes || 'Sin notas'}</p>
        </div>
        <div class="col-md-6 text-end">
          <h5>Subtotal: $${formatMoney(invoice.subtotal || invoice.subtotal_amount || 0)}</h5>
          <h5>IVA: $${formatMoney(invoice.impuesto || invoice.tax || 0)}</h5>
          <h4>Total: $${formatMoney(invoice.total || 0)}</h4>
        </div>
      </div>
    </div>
  `;

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

/* ---------- Actualizar estado ---------- */
async function updateInvoiceStatus(id, newStatus) {
  // Enviar al servidor
  const r = await safeFetch(`${API_URL}/facturas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: newStatus })
  });

  if (r.ok) {
    // Actualizar cache local si existe
    const idx = invoices.findIndex(i => i.id === id);
    if (idx !== -1) {
      invoices[idx].estado = newStatus;
      localStorage.setItem('invoices', JSON.stringify(invoices));
    }
    showAlert('Estado actualizado', 'success');
    loadPurchaseInvoicesTable();
    loadSalesInvoicesTable();
  } else {
    showAlert('Error al actualizar estado', 'danger');
  }
}

/* ---------- Generar factura desde orden ---------- */
async function generateInvoiceFromPurchaseOrder(purchaseOrder) {
  // purchaseOrder debe tener: id, proveedor_id (provider), items[], subtotal, impuesto, total, estado
  const payload = {
    numero_factura: `F-${Date.now()}`,
    tipo: 'purchase',
    orden_id: purchaseOrder.id,
    proveedor_id: purchaseOrder.proveedor_id || purchaseOrder.supplierId || purchaseOrder.supplier_id || purchaseOrder.supplierId,
    fecha: new Date().toISOString().split('T')[0],
    subtotal: purchaseOrder.subtotal,
    impuesto: purchaseOrder.tax ?? purchaseOrder.impuesto,
    total: purchaseOrder.total,
    estado: purchaseOrder.estado || 'Pendiente',
    notas: purchaseOrder.notes || `Factura generada desde orden #${purchaseOrder.id}`,
    usuario_id: (window.currentUser && window.currentUser.id) || null,
    items: (purchaseOrder.items || []).map(it => ({
      producto_id: it.productId || it.producto_id,
      cantidad: it.quantity || it.cantidad,
      precio_unitario: it.price || it.precio_unitario,
      subtotal: (it.quantity || it.cantidad) * (it.price || it.precio_unitario)
    }))
  };

  const r = await safeFetch(`${API_URL}/facturas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (r.ok) {
    // Actualizar caches locales
    const newInvoice = r.data;
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    showAlert('Factura creada a partir de la orden de compra', 'success');
    return newInvoice;
  } else {
    showAlert('Error al generar factura desde orden de compra', 'danger');
    return null;
  }
}

async function generateInvoiceFromSalesOrder(salesOrder) {
  const payload = {
    numero_factura: `F-${Date.now()}`,
    tipo: 'sales',
    orden_id: salesOrder.id,
    cliente_id: salesOrder.clientId || salesOrder.cliente_id,
    fecha: new Date().toISOString().split('T')[0],
    subtotal: salesOrder.subtotal,
    impuesto: salesOrder.tax ?? salesOrder.impuesto,
    total: salesOrder.total,
    estado: salesOrder.estado || 'Pendiente',
    notas: salesOrder.notes || `Factura generada desde orden #${salesOrder.id}`,
    usuario_id: (window.currentUser && window.currentUser.id) || null,
    items: (salesOrder.items || []).map(it => ({
      producto_id: it.productId || it.producto_id,
      cantidad: it.quantity || it.cantidad,
      precio_unitario: it.price || it.precio_unitario,
      subtotal: (it.quantity || it.cantidad) * (it.price || it.precio_unitario)
    }))
  };

  const r = await safeFetch(`${API_URL}/facturas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (r.ok) {
    const newInvoice = r.data;
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    showAlert('Factura creada a partir de la orden de venta', 'success');
    return newInvoice;
  } else {
    showAlert('Error al generar factura desde orden de venta', 'danger');
    return null;
  }
}

/* ---------- Impresión ---------- */
function printInvoice(id) {
  const invoice = invoices.find(i => i.id === id);
  if (!invoice) {
    showAlert('Factura no encontrada para imprimir', 'warning');
    return;
  }

  // Try to get items
  const items = invoice.items || [];

  let itemsHtml = '';
  items.forEach(item => {
    const producto = inventoryProducts.find(p => p.id === (item.producto_id || item.productId));
    const qty = item.cantidad || item.quantity || 0;
    const price = item.precio_unitario || item.price || 0;
    itemsHtml += `
      <tr>
        <td>${producto ? (producto.nombre || producto.name) : 'Producto no encontrado'}</td>
        <td style="text-align:center">${qty}</td>
        <td style="text-align:right">$${formatMoney(price)}</td>
        <td style="text-align:right">$${formatMoney(qty * price)}</td>
      </tr>
    `;
  });

  const esCompra = (invoice.tipo && String(invoice.tipo).toLowerCase().includes('compra')) ||
                   (invoice.orderType && String(invoice.orderType).toLowerCase() === 'purchase');

  const clientOrSupplier = esCompra
    ? suppliers.find(s => s.id === (invoice.proveedor_id || invoice.proveedorId))
    : customers.find(c => c.id === (invoice.cliente_id || invoice.clienteId));

  const clientOrSupplierName = clientOrSupplier ? (clientOrSupplier.nombre || clientOrSupplier.name) : 'No encontrado';
  const detailsLeft = esCompra ? `Proveedor: ${clientOrSupplierName}` : `Cliente: ${clientOrSupplierName}`;

  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="text-align: center; color: #3498db;">SysInvent</h2>
      <h3 style="text-align: center;">Factura #${invoice.id}</h3>
      <hr>
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <p><strong>${detailsLeft}</strong></p>
          <p><strong>Fecha:</strong> ${new Date(invoice.fecha || invoice.date).toLocaleDateString()}</p>
          <p><strong>Tipo:</strong> ${invoice.tipo || invoice.orderType || 'N/A'}</p>
        </div>
        <div>
          <p><strong>Estado:</strong> ${invoice.estado || invoice.status}</p>
          <p><strong>Orden Asociada:</strong> ${invoice.orden_id ? `#${invoice.orden_id}` : (invoice.orderId ? `#${invoice.orderId}` : 'N/A')}</p>
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
          <p>${invoice.notas || invoice.notes || 'Sin notas'}</p>
        </div>
        <div style="width: 40%; text-align: right;">
          <p><strong>Subtotal:</strong> $${formatMoney(invoice.subtotal || 0)}</p>
          <p><strong>IVA:</strong> $${formatMoney(invoice.impuesto || invoice.tax || 0)}</p>
          <h4><strong>Total:</strong> $${formatMoney(invoice.total || 0)}</h4>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; font-size: 12px;">
        <p>Generado el: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Factura #${invoice.id} - SysInvent</title>
        <style>
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}


window.loadPurchaseInvoicesTable = loadPurchaseInvoicesTable;
window.loadSalesInvoicesTable = loadSalesInvoicesTable;
window.viewInvoiceDetails = viewInvoiceDetails;
window.updateInvoiceStatus = updateInvoiceStatus;
window.printInvoice = printInvoice;
window.generateInvoiceFromPurchaseOrder = generateInvoiceFromPurchaseOrder;
window.generateInvoiceFromSalesOrder = generateInvoiceFromSalesOrder;

// Auto-init: intentar poblar caches si están vacías
(async function initBillingCache() {
  if (!invoices || invoices.length === 0) await fetchInvoicesFromServer();
  // customers/suppliers/inventory suelen cargarse desde init.js; si no, intentamos fetch opcional
  if ((!customers || customers.length === 0) && typeof fetch === 'function') {
    const rc = await safeFetch(`${API_URL}/clientes`);
    if (rc.ok) { customers = rc.data; localStorage.setItem('customers', JSON.stringify(customers)); }
  }
  if ((!suppliers || suppliers.length === 0) && typeof fetch === 'function') {
    const rp = await safeFetch(`${API_URL}/proveedores`);
    if (rp.ok) { suppliers = rp.data; localStorage.setItem('suppliers', JSON.stringify(suppliers)); }
  }
})();
