// ========================================
// INVENTORY 
// ========================================

async function loadInventoryData() {
  try {
    
    const [prodRes, whRes, movRes] = await Promise.all([
      fetch(`${API_URL}/productos`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/almacen`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/movimientos-inventario` , { headers: getAuthHeaders() }).catch(() => null) // optional endpoint
    ]);

    if (!prodRes.ok) { showAlert('Error cargando productos', 'danger'); return; }
    inventoryProducts = await prodRes.json();

    warehouses = whRes.ok ? await whRes.json() : [];
    if (movRes && movRes.ok) inventoryMovements = await movRes.json();

    window.inventoryProducts = inventoryProducts;
    window.warehouses = warehouses;
    window.inventoryMovements = inventoryMovements;

    loadInventoryTable();
    loadInventoryMovementsTable && loadInventoryMovementsTable();
  } catch (err) {
    console.error('loadInventoryData error', err);
    showAlert('Error cargando datos del inventario', 'danger');
  }
}

function loadInventoryTable() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!inventoryProducts || inventoryProducts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center">No hay productos</td></tr>`;
    return;
  }

  inventoryProducts.forEach(product => {
    const stockActual = product.stock_actual ?? 0;
    const status = stockActual === 0 ? 'Agotado' : (stockActual <= product.stock_minimo ? 'Stock Bajo' : 'Disponible');
    const badge = status === 'Agotado' ? 'danger' : status === 'Stock Bajo' ? 'warning' : 'success';
    const warehouse = warehouses.find(w => w.id === product.almacen_id);
    const warehouseName = warehouse ? warehouse.nombre : 'Sin asignar';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.codigo}</td>
      <td>${product.nombre}</td>
      <td>${product.categorias?.nombre || 'Sin categoría'}</td>
      <td>${stockActual}</td>
      <td>${product.stock_minimo}</td>
      <td>${product.stock_maximo}</td>
      <td>${warehouseName}</td>
      <td><span class="badge bg-${badge}">${status}</span></td>
      <td class="action-buttons">
        <button class="btn btn-sm btn-outline-primary" onclick="viewProductDetails(${product.id})"><i class="fas fa-eye"></i></button>
        <button class="btn btn-sm btn-outline-secondary" onclick="promptAdjustStock(${product.id})"><i class="fas fa-exchange-alt"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function viewProductDetails(id) {
  const p = inventoryProducts.find(x => x.id == id);
  if (!p) return;
  const modalTitle = document.getElementById('productModalTitle');
  const modalBody = document.querySelector('#productModal .modal-body');
  modalTitle.textContent = `Detalles: ${p.nombre}`;
  modalBody.innerHTML = `
    <p><strong>Código:</strong> ${p.codigo}</p>
    <p><strong>Nombre:</strong> ${p.nombre}</p>
    <p><strong>Precio:</strong> ${formatMoney(p.precio)}</p>
    <p><strong>Costo:</strong> ${formatMoney(p.costo)}</p>
    <p><strong>Stock actual:</strong> ${p.stock_actual ?? 0}</p>
    <p><strong>Almacén:</strong> ${warehouses.find(w => w.id === p.almacen_id)?.nombre || 'Sin asignar'}</p>
    <p><strong>Descripción:</strong> ${p.descripcion || '-'}</p>
  `;
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

function promptAdjustStock(productId) {
  const qty = parseInt(prompt('Ingrese cantidad (positivo para entrada, negativo para salida):', '0'), 10);
  if (isNaN(qty) || qty === 0) return;
  const tipo = qty > 0 ? 'entry' : 'exit';
  const cantidad = Math.abs(qty);
  const motivo = prompt('Motivo del ajuste:', tipo === 'entry' ? 'Ajuste entrada' : 'Ajuste salida') || 'Ajuste manual';
  createInventoryMovement({ producto_id: productId, tipo, cantidad, fecha: new Date().toISOString().slice(0,10), motivo, notas: 'Ajuste manual desde frontend' });
}

async function createInventoryMovement({ producto_id, tipo, cantidad, fecha, motivo, notas = '', orden_id = null, tipo_orden = null, costo_unitario = 0 }) {
  try {
    const payload = { producto_id, tipo, cantidad, fecha, motivo, notas, orden_id, tipo_orden, costo_unitario };
    const res = await fetch(`${API_URL}/inventario/movimiento`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) { showAlert(data.message || 'Error creando movimiento', 'danger'); return; }
    showAlert('Movimiento creado', 'success');
    // recargar inventario y movimientos
    await loadInventoryData();
    loadPurchaseOrders && loadPurchaseOrders();
    loadSalesOrders && loadSalesOrders();
  } catch (err) {
    console.error('createInventoryMovement error', err);
    showAlert('Error al crear movimiento', 'danger');
  }
}


function loadInventoryMovementsTable() {
  const tbody = document.getElementById('inventoryMovementsBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!inventoryMovements || inventoryMovements.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay movimientos</td></tr>';
    return;
  }
  inventoryMovements.slice().reverse().forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.productos?.nombre || (inventoryProducts.find(p => p.id === m.producto_id)?.nombre) || m.producto_id}</td>
      <td>${m.tipo}</td>
      <td>${m.cantidad}</td>
      <td>${formatDate(m.fecha)}</td>
      <td>${formatMoney(m.costo_unitario)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Exports
window.loadInventoryData = loadInventoryData;
window.createInventoryMovement = createInventoryMovement;
window.loadInventoryMovementsTable = loadInventoryMovementsTable;
window.loadInventoryTable = loadInventoryTable;
window.viewProductDetails = viewProductDetails;