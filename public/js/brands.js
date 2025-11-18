// marcas
async function loadBrands() {
  try {
    const res = await fetch(`${API_URL}/marcas`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    renderBrandsTable(data);
  } catch (err) {
    console.error('loadBrands', err);
    showAlert('Error cargando marcas','danger');
  }
}

function renderBrandsTable(list) {
  const tbody = document.getElementById('brandsTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0 ? '<tr><td colspan="4">No hay marcas</td></tr>' :
    list.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${m.nombre}</td>
        <td>${m.descripcion || '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editBrand(${m.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteBrand(${m.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveBrand() {
  const id = document.getElementById('brandId')?.value || '';
  const nombre = (document.getElementById('brandName')?.value || '').trim();
  const descripcion = (document.getElementById('brandDescription')?.value || '').trim();

  if (!nombre) { showAlert('Nombre requerido','warning'); return; }
  const payload = { nombre, descripcion };

  try {
    let res;
    if (id) res = await fetch(`${API_URL}/marcas/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    else res = await fetch(`${API_URL}/marcas`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Marca guardada','success');
    bootstrap.Modal.getInstance(document.getElementById('brandModal'))?.hide();
    document.getElementById('brandForm')?.reset();
    await loadBrands();
  } catch (err) {
    console.error('saveBrand', err);
    showAlert(err.message || 'Error guardando marca','danger');
  }
}

async function editBrand(id) {
  try {
    const res = await fetch(`${API_URL}/marcas/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const m = await res.json();
    document.getElementById('brandId').value = m.id;
    document.getElementById('brandName').value = m.nombre;
    document.getElementById('brandDescription').value = m.descripcion || '';
    document.getElementById('brandModalTitle').textContent = 'Editar Marca';
    new bootstrap.Modal(document.getElementById('brandModal')).show();
  } catch (err) {
    console.error('editBrand', err);
    showAlert('Error cargando marca','danger');
  }
}

async function deleteBrand(id) {
  if (!confirm('Eliminar marca?')) return;
  try {
    const res = await fetch(`${API_URL}/marcas/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Marca eliminada','success');
    await loadBrands();
  } catch (err) {
    console.error('deleteBrand', err);
    showAlert(err.message || 'Error eliminando marca','danger');
  }
}

window.loadBrands = loadBrands;
window.saveBrand = saveBrand;
window.editBrand = editBrand;
window.deleteBrand = deleteBrand;