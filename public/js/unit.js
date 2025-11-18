// unidades.js
async function loadUnits() {
  try {
    const res = await fetch(`${API_URL}/unidades`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    renderUnitsTable(data);
  } catch (err) {
    console.error('loadUnits', err);
    showAlert('Error cargando unidades','danger');
  }
}

function renderUnitsTable(list) {
  const tbody = document.getElementById('unitsTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0 ? '<tr><td colspan="3">No hay unidades</td></tr>' :
    list.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editUnit(${u.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteUnit(${u.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveUnit() {
  const id = document.getElementById('unitId')?.value || '';
  const nombre = (document.getElementById('unitName')?.value || '').trim();
  if (!nombre) { showAlert('Nombre requerido','warning'); return; }
  try {
    let res;
    if (id) res = await fetch(`${API_URL}/unidades/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ nombre }) });
    else res = await fetch(`${API_URL}/unidades`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ nombre }) });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Unidad guardada','success');
    bootstrap.Modal.getInstance(document.getElementById('unitModal'))?.hide();
    document.getElementById('unitForm')?.reset();
    await loadUnits();
  } catch (err) {
    console.error('saveUnit', err);
    showAlert(err.message || 'Error guardando unidad','danger');
  }
}

async function editUnit(id) {
  try {
    const res = await fetch(`${API_URL}/unidades/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const u = await res.json();
    document.getElementById('unitId').value = u.id;
    document.getElementById('unitName').value = u.nombre;
    document.getElementById('unitModalTitle').textContent = 'Editar Unidad';
    new bootstrap.Modal(document.getElementById('unitModal')).show();
  } catch (err) {
    console.error('editUnit', err);
    showAlert('Error cargando unidad','danger');
  }
}

async function deleteUnit(id) {
  if (!confirm('Eliminar unidad?')) return;
  try {
    const res = await fetch(`${API_URL}/unidades/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Unidad eliminada','success');
    await loadUnits();
  } catch (err) {
    console.error('deleteUnit', err);
    showAlert(err.message || 'Error eliminando unidad','danger');
  }
}

window.loadUnits = loadUnits;
window.saveUnit = saveUnit;
window.editUnit = editUnit;
window.deleteUnit = deleteUnit;