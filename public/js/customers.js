// clientes.js - CRUD clientes
async function loadCustomers() {
  try {
    const res = await fetch(`${API_URL}/clientes`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    renderCustomersTable(data);
  } catch (err) {
    console.error('loadCustomers', err);
    showAlert('Error cargando clientes','danger');
  }
}

function renderCustomersTable(list) {
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0 ? '<tr><td colspan="6">No hay clientes</td></tr>' :
    list.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.email}</td>
        <td>${c.telefono || '-'}</td>
        <td>${c.tipo}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editCustomer(${c.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer(${c.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveCustomer() {
  const id = document.getElementById('customerId')?.value || '';
  const nombre = (document.getElementById('customerName')?.value || '').trim();
  const email = (document.getElementById('customerEmail')?.value || '').trim();
  const telefono = (document.getElementById('customerPhone')?.value || '').trim();
  const tipo = (document.getElementById('customerType')?.value || '').trim();
  const direccion = (document.getElementById('customerAddress')?.value || '').trim();

  if (!nombre || !email || !tipo) { showAlert('Completa campos obligatorios','warning'); return; }
  const payload = { nombre, email, telefono, tipo, direccion };

  try {
    let res;
    if (id) {
      res = await fetch(`${API_URL}/clientes/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    } else {
      res = await fetch(`${API_URL}/clientes`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    }
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Cliente guardado','success');
    bootstrap.Modal.getInstance(document.getElementById('customerModal'))?.hide();
    document.getElementById('customerForm')?.reset();
    await loadCustomers();
  } catch (err) {
    console.error('saveCustomer', err);
    showAlert(err.message || 'Error guardando cliente','danger');
  }
}

async function editCustomer(id) {
  try {
    const res = await fetch(`${API_URL}/clientes/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const c = await res.json();
    document.getElementById('customerId').value = c.id;
    document.getElementById('customerName').value = c.nombre;
    document.getElementById('customerEmail').value = c.email;
    document.getElementById('customerPhone').value = c.telefono || '';
    document.getElementById('customerType').value = c.tipo;
    document.getElementById('customerAddress').value = c.direccion || '';
    document.getElementById('customerModalTitle').textContent = 'Editar Cliente';
    new bootstrap.Modal(document.getElementById('customerModal')).show();
  } catch (err) {
    console.error('editCustomer', err);
    showAlert('Error cargando cliente','danger');
  }
}

async function deleteCustomer(id) {
  if (!confirm('Eliminar cliente?')) return;
  try {
    const res = await fetch(`${API_URL}/clientes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Cliente eliminado','success');
    await loadCustomers();
  } catch (err) {
    console.error('deleteCustomer', err);
    showAlert(err.message || 'Error eliminando cliente','danger');
  }
}

window.loadCustomers = loadCustomers;
window.saveCustomer = saveCustomer;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;