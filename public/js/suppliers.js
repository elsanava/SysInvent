// ===============================
// PROVEEDORES - GESTIÓN FRONTEND
// ===============================

// Variable global (temporal mientras se conecta a backend)
let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];

// Guardar o editar proveedor
function saveSupplier() {
  const supplierId = document.getElementById('supplierId').value;
  const name = document.getElementById('supplierName').value.trim();
  const email = document.getElementById('supplierEmail').value.trim();
  const phone = document.getElementById('supplierPhone').value.trim();
  const products = document.getElementById('supplierProducts').value.trim();
  const address = document.getElementById('supplierAddress').value.trim();

  if (!name || !email || !phone || !products) {
    showAlert('⚠️ Por favor, complete todos los campos obligatorios.', 'warning');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert('⚠️ Por favor, ingrese un email válido.', 'warning');
    return;
  }

  if (supplierId) {
    // Editar proveedor existente
    const index = suppliers.findIndex(s => s.id == supplierId);
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], name, email, phone, products, address };
      showAlert('✅ Proveedor actualizado correctamente.', 'success');
    }
  } else {
    // Validar duplicado por email
    if (suppliers.find(s => s.email === email)) {
      showAlert('⚠️ Ya existe un proveedor con este email.', 'warning');
      return;
    }

    const newSupplier = {
      id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
      name,
      email,
      phone,
      products,
      address
    };
    suppliers.push(newSupplier);
    showAlert('✅ Proveedor creado correctamente.', 'success');
  }

  localStorage.setItem('suppliers', JSON.stringify(suppliers));

  // Cerrar modal y refrescar tabla
  const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
  if (modal) modal.hide();
  loadSuppliersTable();

  document.getElementById('supplierForm').reset();
  document.getElementById('supplierId').value = '';
}

// Cargar tabla de proveedores
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