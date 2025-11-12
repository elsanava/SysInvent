function saveUser() {
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;
    
    // Validaciones
    if (!name || !email || !role || !status) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, ingrese un email válido.', 'warning');
        return;
    }
    
    if (userId) {
        // Editar usuario existente
        const index = users.findIndex(u => u.id == userId);
        if (index !== -1) {
            const updatedUser = {
                ...users[index],
                name, email, role, status
            };
            
            // Actualizar contraseña solo si se proporcionó una nueva
            if (password) {
                updatedUser.password = password;
            }
            
            users[index] = updatedUser;
            showAlert('Usuario actualizado correctamente.', 'success');
        }
    } else {
        // Verificar si el email ya existe
        if (users.find(u => u.email === email)) {
            showAlert('Ya existe un usuario con este email.', 'warning');
            return;
        }
        
        if (!password) {
            showAlert('La contraseña es obligatoria para nuevos usuarios.', 'warning');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password,
            role,
            status,
            lastAccess: new Date().toISOString()
        };
        users.push(newUser);
        showAlert('Usuario creado correctamente.', 'success');
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Cerrar modal y actualizar tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    if (modal) modal.hide();
    
    loadUsersTable();
    
    // Limpiar formulario
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    
    // No mostrar la contraseña por seguridad
    document.getElementById('userPassword').value = '';
    
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

function deleteUser(id) {
    if (id === currentUser.id) {
        showAlert('No puede eliminar su propio usuario.', 'warning');
        return;
    }
    
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;
    
    users = users.filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsersTable();
    showAlert('Usuario eliminado correctamente.', 'success');
}

function loadUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        const statusClass = user.status === 'Activo' ? 'success' : 'secondary';
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="badge bg-${statusClass}">${user.status}</span></td>
            <td>${new Date(user.lastAccess).toLocaleDateString()}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}