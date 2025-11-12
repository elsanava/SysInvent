// ===============================
// CLIENTES - GESTIÓN FRONTEND
// ===============================

let customers = JSON.parse(localStorage.getItem('customers')) || [];

// Guardar o editar cliente
function saveCustomer() {
  const customerId = document.getElementById('customerId').value;
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const type = document.getElementById('customerType').value;
  const address = document.getElementById('customerAddress').value.trim();

  if (!name || !email || !phone || !type) {
    showAlert('⚠️ Por favor, complete todos los campos obligatorios.', 'warning');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert('⚠️ Por favor, ingrese un email válido.', 'warning');
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
    // Validar duplicado
    if (customers.find(c => c.email === email)) {
      showAlert('⚠️ Ya existe un cliente con este email.', 'warning');
      return;
    }

    const newCustomer = {
      id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
      name,
      email,
      phone,
      type,
      address,
    };

    customers.push(newCustomer);
    showAlert('Cliente creado correctamente.', 'success');
  }

  localStorage.setItem('customers', JSON.stringify(customers));

  // Cerrar modal y actualizar tabla
  const modal = bootstrap.Modal.getInstance(document.getElementById('customerModal'));
  if (modal) modal.hide();

  loadCustomersTable();
  document.getElementById('customerForm').reset();
  document.getElementById('customerId').value = '';
}

// Cargar tabla de clientes
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