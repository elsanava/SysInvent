// almacenes.js - CRUD almacenes
async function loadWarehouses() {
  try {
    const res = await fetch(`${API_URL}/almacen`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    renderWarehousesTable(data);
  } catch (err) {
    console.error('loadWarehouses', err);
    showAlert('Error cargando almacenes','danger');
  }
}

function renderWarehousesTable(list) {
  const tbody = document.getElementById('warehousesTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0 ? '<tr><td colspan="6">No hay almacenes</td></tr>' :
    list.map(a => `
      <tr>
        <td>${a.id}</td>
        <td>${a.nombre}</td>
        <td>${a.ubicacion}</td>
        <td>${a.capacidad}</td>
        <td>${a.responsable}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editWarehouse(${a.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteWarehouse(${a.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveWarehouse() {
  const id = document.getElementById('warehouseId')?.value || '';
  const nombre = (document.getElementById('warehouseName')?.value || '').trim();
  const ubicacion = (document.getElementById('warehouseLocation')?.value || '').trim();
  const capacidad = parseInt(document.getElementById('warehouseCapacity')?.value || 0) || 0;
  const responsable = (document.getElementById('warehouseManager')?.value || '').trim();
  const descripcion = (document.getElementById('warehouseDescription')?.value || '').trim();

  if (!nombre || !ubicacion || !responsable) { showAlert('Completa campos obligatorios','warning'); return; }
  const payload = { nombre, ubicacion, capacidad, responsable, descripcion };
  try {
    let res;
    if (id) res = await fetch(`${API_URL}/almacen/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    else res = await fetch(`${API_URL}/almacen`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Almacén guardado','success');
    bootstrap.Modal.getInstance(document.getElementById('warehouseModal'))?.hide();
    document.getElementById('warehouseForm')?.reset();
    await loadWarehouses();
  } catch (err) {
    console.error('saveWarehouse', err);
    showAlert(err.message || 'Error guardando almacén','danger');
  }
}

async function editWarehouse(id) {
  try {
    const res = await fetch(`${API_URL}/almacen/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const w = await res.json();
    document.getElementById('warehouseId').value = w.id;
    document.getElementById('warehouseName').value = w.nombre;
    document.getElementById('warehouseLocation').value = w.ubicacion;
    document.getElementById('warehouseCapacity').value = w.capacidad;
    document.getElementById('warehouseManager').value = w.responsable;
    document.getElementById('warehouseDescription').value = w.descripcion || '';
    document.getElementById('warehouseModalTitle').textContent = 'Editar Almacén';
    new bootstrap.Modal(document.getElementById('warehouseModal')).show();
  } catch (err) {
    console.error('editWarehouse', err);
    showAlert('Error cargando almacén','danger');
  }
}

async function deleteWarehouse(id) {
  if (!confirm('Eliminar almacén?')) return;
  try {
    const res = await fetch(`${API_URL}/almacen/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Almacén eliminado','success');
    await loadWarehouses();
  } catch (err) {
    console.error('deleteWarehouse', err);
    showAlert(err.message || 'Error eliminando almacén','danger');
  }
}

window.loadWarehouses = loadWarehouses;
window.saveWarehouse = saveWarehouse;
window.editWarehouse = editWarehouse;
window.deleteWarehouse = deleteWarehouse;