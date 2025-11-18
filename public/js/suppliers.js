// proveedores.js - CRUD proveedores
async function loadSuppliers() {
  try {
    const res = await fetch(`${API_URL}/proveedores`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    renderSuppliersTable(data);
  } catch (err) {
    console.error('loadSuppliers', err);
    showAlert('Error cargando proveedores','danger');
  }
}

function renderSuppliersTable(list) {
  const tbody = document.getElementById('suppliersTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0 ? '<tr><td colspan="6">No hay proveedores</td></tr>' :
    list.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.email}</td>
        <td>${p.telefono || '-'}</td>
        <td>${(p.productos_suministra || '-').slice(0,40)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editSupplier(${p.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier(${p.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveSupplier() {
  const id = document.getElementById('supplierId')?.value || '';
  const nombre = (document.getElementById('supplierName')?.value || '').trim();
  const email = (document.getElementById('supplierEmail')?.value || '').trim();
  const telefono = (document.getElementById('supplierPhone')?.value || '').trim();
  const productos_suministra = (document.getElementById('supplierProducts')?.value || '').trim();
  const direccion = (document.getElementById('supplierAddress')?.value || '').trim();

  if (!nombre || !email) { showAlert('Completa nombre y email','warning'); return; }
  const payload = { nombre, email, telefono, productos_suministra, direccion };
  try {
    let res;
    if (id) {
      res = await fetch(`${API_URL}/proveedores/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    } else {
      res = await fetch(`${API_URL}/proveedores`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    }
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Proveedor guardado','success');
    bootstrap.Modal.getInstance(document.getElementById('supplierModal'))?.hide();
    document.getElementById('supplierForm')?.reset();
    await loadSuppliers();
  } catch (err) {
    console.error('saveSupplier', err);
    showAlert(err.message || 'Error guardando proveedor','danger');
  }
}

async function editSupplier(id) {
  try {
    const res = await fetch(`${API_URL}/proveedores/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const p = await res.json();
    document.getElementById('supplierId').value = p.id;
    document.getElementById('supplierName').value = p.nombre;
    document.getElementById('supplierEmail').value = p.email;
    document.getElementById('supplierPhone').value = p.telefono || '';
    document.getElementById('supplierProducts').value = p.productos_suministra || '';
    document.getElementById('supplierAddress').value = p.direccion || '';
    document.getElementById('supplierModalTitle').textContent = 'Editar Proveedor';
    new bootstrap.Modal(document.getElementById('supplierModal')).show();
  } catch (err) {
    console.error('editSupplier', err);
    showAlert('Error cargando proveedor','danger');
  }
}

async function deleteSupplier(id) {
  if (!confirm('Eliminar proveedor?')) return;
  try {
    const res = await fetch(`${API_URL}/proveedores/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Proveedor eliminado','success');
    await loadSuppliers();
  } catch (err) {
    console.error('deleteSupplier', err);
    showAlert(err.message || 'Error eliminando proveedor','danger');
  }
}

window.loadSuppliers = loadSuppliers;
window.saveSupplier = saveSupplier;
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;