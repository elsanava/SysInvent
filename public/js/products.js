// productos.js - CRUD productos
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/productos`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const products = await res.json();
    renderProductsTable(products);
  } catch (err) {
    console.error('loadProducts', err);
    showAlert('Error cargando productos','danger');
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = products.length === 0 ? '<tr><td colspan="10">No hay productos</td></tr>' :
    products.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.codigo}</td>
        <td>${p.nombre}</td>
        <td>${p.categorias?.nombre || '-'}</td>
        <td>${p.marcas?.nombre || '-'}</td>
        <td>${p.stock_actual ?? 0}</td>
        <td>${formatMoney(p.precio)}</td>
        <td>${formatMoney(p.costo)}</td>
        <td><span class="badge bg-${getStatusClass(p.estado)}">${p.estado}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${p.id})">Editar</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">Eliminar</button>
        </td>
      </tr>`).join('');
}

async function saveProduct() {
  // campos esperados en DOM: productId, productCode, productName, productCategory, productSubcategory,
  // productDescription, productPrice, productCost, productUnit, productBrand, productStockMin, productStockMax, productWarehouse, productManaged, productState
  const id = document.getElementById('productId')?.value || '';
  const codigo = (document.getElementById('productCode')?.value || '').trim();
  const nombre = (document.getElementById('productName')?.value || '').trim();
  const categoria_id = parseInt(document.getElementById('productCategory')?.value || 0) || null;
  const subcategoria = (document.getElementById('productSubcategory')?.value || '').trim();
  const descripcion = (document.getElementById('productDescription')?.value || '').trim();
  const precio = parseFloat(document.getElementById('productPrice')?.value || 0);
  const costo = parseFloat(document.getElementById('productCost')?.value || 0);
  const unidad_id = parseInt(document.getElementById('productUnit')?.value || 0) || null;
  const marcas_id = parseInt(document.getElementById('productBrand')?.value || 0) || null;
  const stock_minimo = parseInt(document.getElementById('productStockMin')?.value || 0) || 0;
  const stock_maximo = parseInt(document.getElementById('productStockMax')?.value || 0) || 0;
  const almacen_id = parseInt(document.getElementById('productWarehouse')?.value || 0) || null;
  const gestionado = !!document.getElementById('productManaged')?.checked;
  const estado = document.getElementById('productState')?.value || 'Disponible';

  if (!codigo || !nombre || !categoria_id || !unidad_id || !marcas_id || !almacen_id) {
    showAlert('Completa los campos obligatorios (código,nombre,categoría,unidad,marca,almacén)','warning');
    return;
  }

  const payload = {
    codigo, nombre, categoria_id, subcategoria, descripcion,
    precio, costo, unidad_id, marcas_id, stock_minimo, stock_maximo,
    almacen_id, gestionado, estado
  };

  try {
    let res;
    if (id) {
      res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    }
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Producto guardado','success');
    bootstrap.Modal.getInstance(document.getElementById('productModal'))?.hide();
    document.getElementById('productForm')?.reset();
    await loadProducts();
  } catch (err) {
    console.error('saveProduct', err);
    showAlert(err.message || 'Error guardando producto','danger');
  }
}

async function editProduct(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw await res.json();
    const p = await res.json();
    document.getElementById('productId').value = p.id;
    document.getElementById('productCode').value = p.codigo;
    document.getElementById('productName').value = p.nombre;
    document.getElementById('productCategory').value = p.categoria_id;
    document.getElementById('productSubcategory').value = p.subcategoria || '';
    document.getElementById('productDescription').value = p.descripcion || '';
    document.getElementById('productPrice').value = p.precio;
    document.getElementById('productCost').value = p.costo;
    document.getElementById('productUnit').value = p.unidad_id;
    document.getElementById('productBrand').value = p.marcas_id;
    document.getElementById('productStockMin').value = p.stock_minimo;
    document.getElementById('productStockMax').value = p.stock_maximo;
    document.getElementById('productWarehouse').value = p.almacen_id;
    document.getElementById('productManaged').checked = !!p.gestionado;
    document.getElementById('productState').value = p.estado || 'Disponible';
    document.getElementById('productModalTitle').textContent = 'Editar Producto';
    new bootstrap.Modal(document.getElementById('productModal')).show();
  } catch (err) {
    console.error('editProduct', err);
    showAlert('Error cargando producto','danger');
  }
}

async function deleteProduct(id) {
  if (!confirm('Eliminar producto?')) return;
  try {
    const res = await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) throw data;
    showAlert(data.message || 'Producto eliminado','success');
    await loadProducts();
  } catch (err) {
    console.error('deleteProduct', err);
    showAlert(err.message || 'Error eliminando producto','danger');
  }
}

window.loadProducts = loadProducts;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;