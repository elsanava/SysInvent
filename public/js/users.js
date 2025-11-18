async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/usuarios`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const list = await res.json();
    renderUsersTable(list);
  } catch (err) {
    console.error('loadUsers', err);
    showAlert('Error cargando usuarios','danger');
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  tbody.innerHTML = users.length === 0 ? '<tr><td colspan="7">No hay usuarios</td></tr>' :
    users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
        <td>${u.rol}</td>
        <td><span class="badge bg-${getStatusClass(u.estado)}">${u.estado}</span></td>
        <td>${u.creado_en ? new Date(u.creado_en).toLocaleString() : '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editUserFrontend(${u.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveUser() {
  // lee campos con ids: userId,userName,userEmail,userPassword,userRole,userStatus
  const id = document.getElementById('userId')?.value || '';
  const nombre = (document.getElementById('userName')?.value || '').trim();
  const email = (document.getElementById('userEmail')?.value || '').trim();
  const password = (document.getElementById('userPassword')?.value || '').trim();
  const rol = (document.getElementById('userRole')?.value || 'Usuario');
  const estado = (document.getElementById('userStatus')?.value || 'Activo');

  if (!nombre || !email || !rol) { showAlert('Completa los campos obligatorios','warning'); return; }

  const payload = { nombre, email, rol, estado };
  if (password) payload.password = password;

  try {
    let res;
    if (id) {
      res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    } else {
      if (!password) { showAlert('Contraseña obligatoria para nuevo usuario','warning'); return; }
      payload.password = password;
      res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    }
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Operación exitosa','success');
    // cerrar modal
    bootstrap.Modal.getInstance(document.getElementById('userModal'))?.hide();
    document.getElementById('userForm')?.reset();
    await loadUsers();
  } catch (err) {
    console.error('saveUser', err);
    showAlert(err.message || 'Error guardando usuario','danger');
  }
}

async function editUserFrontend(id) {
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const u = await res.json();
    document.getElementById('userId').value = u.id;
    document.getElementById('userName').value = u.nombre;
    document.getElementById('userEmail').value = u.email;
    document.getElementById('userRole').value = u.rol;
    document.getElementById('userStatus').value = u.estado;
    document.getElementById('userPassword').value = '';
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    new bootstrap.Modal(document.getElementById('userModal')).show();
  } catch (err) {
    console.error('editUserFrontend', err);
    showAlert('Error cargando usuario','danger');
  }
}

async function deleteUser(id) {
  if (!confirm('Eliminar usuario?')) return;
  if (window.currentUser?.id === id) { showAlert('No puede eliminar su propio usuario','warning'); return; }
  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Usuario eliminado','success');
    await loadUsers();
  } catch (err) {
    console.error('deleteUser', err);
    showAlert(err.message || 'Error eliminando usuario','danger');
  }
}

window.loadUsers = loadUsers;
window.saveUser = saveUser;
window.editUserFrontend = editUserFrontend;
window.deleteUser = deleteUser;