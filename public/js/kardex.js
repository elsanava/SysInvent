function loadKardexTable() {
    const tableBody = document.getElementById('kardexTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Cargar productos en el select
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.innerHTML = '<option value="all">Todos los productos</option>';
        inventoryProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });
    }
    
    // Configurar event listeners para filtros
    if (productSelect) {
        productSelect.addEventListener('change', updateKardexTable);
    }
    
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    if (dateFrom) dateFrom.addEventListener('change', updateKardexTable);
    if (dateTo) dateTo.addEventListener('change', updateKardexTable);
    
    // Mostrar datos iniciales
    updateKardexTable();
}

function updateKardexTable() {
    const tableBody = document.getElementById('kardexTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const productId = document.getElementById('productSelect').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    // Filtrar movimientos
    let filteredMovements = inventoryMovements;
    
    if (productId !== 'all') {
        filteredMovements = filteredMovements.filter(m => m.productId == productId);
    }
    
    if (dateFrom) {
        filteredMovements = filteredMovements.filter(m => m.date >= dateFrom);
    }
    
    if (dateTo) {
        filteredMovements = filteredMovements.filter(m => m.date <= dateTo);
    }
    
    // Ordenar por fecha
    filteredMovements.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredMovements.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay movimientos para los filtros seleccionados</td></tr>';
        return;
    }
    
    // Calcular saldos
    let balance = 0;
    let totalCost = 0;
    
    filteredMovements.forEach(movement => {
        const product = inventoryProducts.find(p => p.id === movement.productId);
        if (!product) return;
        
        const entry = movement.type === 'entry' ? movement.quantity : 0;
        const exit = movement.type === 'exit' ? movement.quantity : 0;
        
        balance += entry - exit;
        totalCost = balance * product.cost;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(movement.date).toLocaleDateString()}</td>
            <td>${product.name}</td>
            <td>${movement.reason}</td>
            <td>${entry}</td>
            <td>${exit}</td>
            <td>${balance}</td>
            <td>$${product.cost.toFixed(2)}</td>
            <td>$${totalCost.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    });
}

window.loadKardexTable = loadKardexTable;
window.updateKardexTable = updateKardexTable;