function saveWarehouse() {
    const warehouseId = document.getElementById('warehouseId').value;
    const name = document.getElementById('warehouseName').value;
    const location = document.getElementById('warehouseLocation').value;
    const capacity = parseInt(document.getElementById('warehouseCapacity').value);
    const manager = document.getElementById('warehouseManager').value;
    const description = document.getElementById('warehouseDescription').value;
    
    // Validaciones
    if (!name || !location || !capacity || !manager) {
        showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
        return;
    }
    
    if (capacity <= 0) {
        showAlert('La capacidad debe ser mayor a cero.', 'warning');
        return;
    }
    
    if (warehouseId) {
        // Editar almacén existente
        const index = warehouses.findIndex(w => w.id == warehouseId);
        if (index !== -1) {
            warehouses[index] = {
                ...warehouses[index],
                name, location, capacity, manager, description
            };
            showAlert('Almacén actualizado correctamente.', 'success');
        }
    } else {
        // Crear nuevo almacén
        const newWarehouse = {
            id: warehouses.length > 0 ? Math.max(...warehouses.map(w => w.id)) + 1 : 1,
            name,
            location,
            capacity,
            products: 0, // Inicialmente sin productos
            manager,
            description
        };
        warehouses.push(newWarehouse);
        showAlert('Almacén creado correctamente.', 'success');
    }
    
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    
    // Cerrar modal y actualizar tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseModal'));
    if (modal) modal.hide();
    
    loadWarehousesTable();
    
    // Limpiar formulario
    document.getElementById('warehouseForm').reset();
    document.getElementById('warehouseId').value = '';
}

function loadWarehousesTable() {
    const tableBody = document.getElementById('warehousesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (warehouses.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay almacenes registrados</td></tr>';
        return;
    }
    
    warehouses.forEach(warehouse => {
        // Calcular cantidad de productos en el almacén
        const productsInWarehouse = inventoryProducts.filter(p => p.warehouseId === warehouse.id).length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${warehouse.id}</td>
            <td>${warehouse.name}</td>
            <td>${warehouse.location}</td>
            <td>${warehouse.capacity}</td>
            <td>${productsInWarehouse}</td>
            <td>${warehouse.manager}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editWarehouse(${warehouse.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteWarehouse(${warehouse.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function editWarehouse(id) {
    const warehouse = warehouses.find(w => w.id === id);
    if (!warehouse) return;
    
    document.getElementById('warehouseId').value = warehouse.id;
    document.getElementById('warehouseName').value = warehouse.name;
    document.getElementById('warehouseLocation').value = warehouse.location;
    document.getElementById('warehouseCapacity').value = warehouse.capacity;
    document.getElementById('warehouseManager').value = warehouse.manager;
    document.getElementById('warehouseDescription').value = warehouse.description || '';
    
    document.getElementById('warehouseModalTitle').textContent = 'Editar Almacén';
    
    const modal = new bootstrap.Modal(document.getElementById('warehouseModal'));
    modal.show();
}

function deleteWarehouse(id) {
    if (!confirm('¿Está seguro de que desea eliminar este almacén?')) return;
    
    // Verificar si el almacén tiene productos
    const warehouse = warehouses.find(w => w.id === id);
    if (warehouse && inventoryProducts.some(p => p.warehouseId === id)) {
        showAlert('No se puede eliminar el almacén porque tiene productos asignados.', 'warning');
        return;
    }
    
    warehouses = warehouses.filter(w => w.id !== id);
    localStorage.setItem('warehouses', JSON.stringify(warehouses));
    loadWarehousesTable();
    showAlert('Almacén eliminado correctamente.', 'success');
}