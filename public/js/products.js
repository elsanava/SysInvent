// ===============================
// PRODUCTOS - FRONTEND CRUD
// ===============================

//  Cargar categorías, unidades y almacenes desde el backend
async function loadCategoriasUnidadesAlmacen() {
  try {
    const [catRes, uniRes, almaRes] = await Promise.all([
      fetch("/api/categorias"),
      fetch("/api/unidades"),
      fetch("/api/almacen"),
    ]);

    const categorias = await catRes.json();
    const unidades = await uniRes.json();
    const almacenes = await almaRes.json();

    const categorySelect = document.getElementById("productCategory");
    const unitSelect = document.getElementById("productUnit");
    const warehouseSelect = document.getElementById("productWarehouse");

    // Limpiar selects
    categorySelect.innerHTML = '<option value="">Seleccionar categoría</option>';
    unitSelect.innerHTML = '<option value="">Seleccionar unidad</option>';
    warehouseSelect.innerHTML = '<option value="">Seleccionar almacén</option>';

    // Categorías
    if (Array.isArray(categorias)) {
      categorias.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.nombre;
        categorySelect.appendChild(opt);
      });
    }

    // Unidades
    if (Array.isArray(unidades)) {
      unidades.forEach((u) => {
        const opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.nombre;
        unitSelect.appendChild(opt);
      });
    }

    // Almacenes
    if (Array.isArray(almacenes)) {
      almacenes.forEach((a) => {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.nombre;
        warehouseSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error al cargar categorías, unidades o almacén:", err);
    showAlert("Error al cargar categorías o unidades.", "danger");
  }
}

// ===============================
// GUARDAR / EDITAR PRODUCTO
// ===============================
async function saveProduct() {
  const id = document.getElementById("productId").value;
  const codigo = document.getElementById("productCode").value.trim();
  const nombre = document.getElementById("productName").value.trim();
  const categoria_id = document.getElementById("productCategory").value;
  const subcategoria = document.getElementById("productSubcategory").value.trim();
  const precio = parseFloat(document.getElementById("productPrice").value);
  const costo = parseFloat(document.getElementById("productCost").value);
  const unidad_id = document.getElementById("productUnit").value;
  const stock_minimo = parseInt(document.getElementById("productMinStock").value);
  const stock_maximo = parseInt(document.getElementById("productMaxStock").value);
  const almacen_id = parseInt(document.getElementById("productWarehouse").value);
  const descripcion = document.getElementById("productDescription").value.trim();

  if (!nombre || !categoria_id || !unidad_id || isNaN(precio) || isNaN(costo)) {
    showAlert("⚠️ Completa todos los campos obligatorios.", "warning");
    return;
  }

  if (stock_minimo >= stock_maximo) {
    showAlert("⚠️ El stock mínimo debe ser menor al máximo.", "warning");
    return;
  }

  const producto = {
    codigo,
    nombre,
    categoria_id: parseInt(categoria_id),
    subcategoria,
    descripcion,
    precio,
    costo,
    unidad_id: parseInt(unidad_id),
    stock_minimo,
    stock_maximo,
    almacen_id,
  };

  try {
    let res;

    if (id) {
      // Editar producto
      res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    } else {
      // Crear producto nuevo
      res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });
    }

    const data = await res.json();

    if (res.ok) {
      showAlert(data.message || "✅ Producto guardado correctamente.", "success");

      // Cerrar modal y actualizar interfaz
      const modal = bootstrap.Modal.getInstance(document.getElementById("productModal"));
      if (modal) modal.hide();
      document.getElementById("productForm").reset();

      if (typeof loadProductsTable === "function") loadProductsTable();
      if (typeof updateDashboard === "function") updateDashboard();
    } else {
      showAlert(data.message || "Error al guardar el producto.", "danger");
    }
  } catch (error) {
    console.error("Error al guardar producto:", error);
    showAlert("Error al conectar con el servidor.", "danger");
  }
}

// ===============================
// EDITAR PRODUCTO (CARGAR EN MODAL)
// ===============================
async function editProduct(id) {
  try {
    const res = await fetch(`/api/productos/${id}`);
    const product = await res.json();

    document.getElementById("productId").value = product.id;
    document.getElementById("productCode").value = product.codigo;
    document.getElementById("productName").value = product.nombre;
    document.getElementById("productCategory").value = product.categoria_id;
    document.getElementById("productSubcategory").value = product.subcategoria || "";
    document.getElementById("productPrice").value = product.precio;
    document.getElementById("productCost").value = product.costo;
    document.getElementById("productUnit").value = product.unidad_id;
    document.getElementById("productMinStock").value = product.stock_minimo;
    document.getElementById("productMaxStock").value = product.stock_maximo;
    document.getElementById("productWarehouse").value = product.almacen_id;
    document.getElementById("productDescription").value = product.descripcion || "";

    document.getElementById("productModalTitle").textContent = "Editar Producto";
    new bootstrap.Modal(document.getElementById("productModal")).show();
  } catch (error) {
    console.error("Error al cargar producto:", error);
    showAlert("Error al cargar producto para editar.", "danger");
  }
}

// ===============================
// ELIMINAR PRODUCTO
// ===============================
function deleteProduct(id) {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) return;
    
    // Verificar si el producto está en uso en facturas
    const productInUse = invoices.some(invoice => 
        invoice.items.some(item => item.productId === id)
    );
    
    if (productInUse) {
        showAlert('No se puede eliminar el producto porque está asociado a facturas.', 'warning');
        return;
    }
    
    // Eliminar de productos gestionados
    products = products.filter(p => p.id !== id);
    
    // Eliminar de inventario también
    inventoryProducts = inventoryProducts.filter(p => p.id !== id);
    
    // Eliminar movimientos de inventario relacionados
    inventoryMovements = inventoryMovements.filter(m => m.productId !== id);
    
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
    localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
    
    loadProductsTable();
    loadInventoryTable();
    updateDashboard();
    showAlert('Producto eliminado correctamente.', 'success');
}

// ===============================
// CARGAR PRODUCTOS EN LA TABLA
// ===============================
async function loadProductsTable() {
  try {
    const res = await fetch("/api/productos");
    const productos = await res.json();

    const tbody = document.getElementById("productsTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    // Si no hay productos
    if (!Array.isArray(productos) || productos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted py-3">
            No hay productos registrados.
          </td>
        </tr>
      `;
      return;
    }

    // Recorrer y mostrar productos
    productos.forEach((p) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${p.codigo}</td>
        <td>${p.nombre}</td>
        <td>${p.categorias?.nombre || "—"}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td>${p.stock_actual ?? 0}</td>
        <td>${p.almacenes?.nombre || "—"}</td>
        <td>
          <span class="badge ${p.estado === "Disponible" ? "bg-success" : p.estado === "Stock Bajo" ? "bg-warning" : "bg-danger"}">
            ${p.estado}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct(${p.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error al cargar productos:", error);
    showAlert("Error al cargar los productos desde el servidor.", "danger");
  }
}

// ===============================
// GENERAR CÓDIGO DE PRODUCTO AUTOMÁTICO Y LIMPIAR FORMULARIO
// ===============================
const productModal = document.getElementById('productModal');
if (productModal) {
  productModal.addEventListener('show.bs.modal', async () => {
    const form = document.getElementById('productForm');
    const codeInput = document.getElementById('productCode');
    const subcategoryInput = document.getElementById('productSubcategory');

    // Limpiar formulario
    if (form) form.reset();
    document.getElementById('productId').value = '';
    
    // Limpiar subcategoría
    if (subcategoryInput) subcategoryInput.value = '';

    // Resetear selects a opción por defecto
    ['productCategory', 'productUnit', 'productWarehouse'].forEach(id => {
      const select = document.getElementById(id);
      if (select) select.selectedIndex = 0;
    });

    // Generar código automático
    try {
      const res = await fetch('/api/productos/next-code');
      const data = await res.json();
      codeInput.value = data.nextCode || '';
    } catch (err) {
      console.error('Error al obtener código:', err);
      codeInput.value = 'Error';
    }

    // Cargar categorías, unidades y almacén
    await loadCategoriasUnidadesAlmacen();
  });
}

// Exponer las funciones que el HTML u otros archivos llaman
window.loadCategoriasUnidadesAlmacen = loadCategoriasUnidadesAlmacen;
window.loadProductsTable = loadProductsTable;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;