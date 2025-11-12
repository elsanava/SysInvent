// ===============================
// INICIALIZACIÓN GENERAL
// ===============================
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🚀 Iniciando aplicación...");

  // 1️⃣ Inicializar medidor del inventario (simulado)
  const gaugeContainer = document.getElementById("inventoryGauge");
  if (gaugeContainer) {
    gaugeContainer.innerHTML = `
      <div class="text-center p-4">
        <h5>Salud del Inventario</h5>
        <div class="display-4 text-success">75%</div>
        <p>Estado: Excelente</p>
      </div>
    `;
  }

  // 2️⃣ Verificar si hay usuario guardado
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      showAppScreen();
    } catch (e) {
      console.error("Error al cargar usuario guardado:", e);
      localStorage.removeItem("currentUser");
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }

  // 3️⃣ Configurar event listeners globales
  if (typeof setupEventListeners === "function") {
    setupEventListeners();
  } else {
    console.error("❌ setupEventListeners no está definida.");
  }

  // 4️⃣ Cargar catálogos iniciales (categorías, unidades, almacenes)
  try {
    await loadCategoriasUnidadesAlmacen();
  } catch (err) {
    console.error("Error al cargar catálogos base:", err);
  }

  // 5️⃣ Cargar datos iniciales si el usuario está logueado
  if (currentUser) {
    try {
      updateDashboard();

      // Cargar tablas principales
      if (typeof loadProductsTable === "function") await loadProductsTable();
      if (typeof loadCustomersTable === "function") await loadCustomersTable();
      if (typeof loadSuppliersTable === "function") await loadSuppliersTable();
      if (typeof loadWarehousesTable === "function") await loadWarehousesTable();
      if (typeof loadUsersTable === "function") await loadUsersTable();

      console.log("📊 Datos iniciales cargados correctamente.");
    } catch (e) {
      console.error("❌ Error al cargar datos iniciales:", e);
    }
  }

  console.log("✅ Aplicación lista.");
});
