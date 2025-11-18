// categorias.js 
async function loadCategories() {
  try {
    const res = await fetch(`${API_URL}/categorias`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const data = await res.json();
    renderCategoriesTable(data);
  } catch (err) {
    console.error('loadCategories', err);
    showAlert('Error cargando categorías','danger');
  }
}

function renderCategoriesTable(list) {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;
  tbody.innerHTML = list.length === 0 ? '<tr><td colspan="3">No hay categorías</td></tr>' :
    list.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${c.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${c.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveCategory() {
  const id = document.getElementById('categoryId')?.value || '';
  const nombre = (document.getElementById('categoryName')?.value || '').trim();
  const descripcion = (document.getElementById('categoryDescription')?.value || '').trim();
  if (!nombre) { showAlert('Nombre requerido','warning'); return; }
  const payload = { nombre, descripcion };
  try {
    let res;
    if (id) res = await fetch(`${API_URL}/categorias/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    else res = await fetch(`${API_URL}/categorias`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Categoría guardada','success');
    bootstrap.Modal.getInstance(document.getElementById('categoryModal'))?.hide();
    document.getElementById('categoryForm')?.reset();
    await loadCategories();
  } catch (err) {
    console.error('saveCategory', err);
    showAlert(err.message || 'Error guardando categoría','danger');
  }
}

async function editCategory(id) {
  try {
    const res = await fetch(`${API_URL}/categorias/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const c = await res.json();
    document.getElementById('categoryId').value = c.id;
    document.getElementById('categoryName').value = c.nombre;
    document.getElementById('categoryDescription').value = c.descripcion || '';
    document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
  } catch (err) {
    console.error('editCategory', err);
    showAlert('Error cargando categoría','danger');
  }
}

async function deleteCategory(id) {
  if (!confirm('Eliminar categoría?')) return;
  try {
    const res = await fetch(`${API_URL}/categorias/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Categoría eliminada','success');
    await loadCategories();
  } catch (err) {
    console.error('deleteCategory', err);
    showAlert(err.message || 'Error eliminando categoría','danger');
  }
}

window.loadCategories = loadCategories;
window.saveCategory = saveCategory;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;