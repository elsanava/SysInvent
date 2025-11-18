// ===============================
// REPORTS - usa datos cargados en memoria (invoices, purchaseOrders, salesOrders)
// ===============================

function generateSalesReport() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // fallback: si tienes facturas en BD, úsalas, si no usa salesOrders
  const source = invoices && invoices.length ? invoices : salesOrders && salesOrders.length ? salesOrders : [];

  const monthlySales = source.filter(inv => {
    const date = new Date(inv.fecha || inv.date || inv.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && (inv.estado === 'Vendida' || inv.estado === 'Completada' || inv.estado === 'Vendido' || inv.status === 'Vendida');
  });

  const monthlyIncome = monthlySales.reduce((t, inv) => t + Number(inv.total || inv.total || 0), 0);
  showReport('Informe de Ventas', `
    <h5>Resumen de Ventas</h5>
    <p>Total de ventas este mes: <b>${formatMoney(monthlyIncome)}</b></p>
    <p>Número de ventas: <b>${monthlySales.length}</b></p>
    <h5 class="mt-4">Productos Más Vendidos</h5>
    <ul>${getTopProductsList()}</ul>
  `);
}

function getTopProductsList() {
  // calcular desde salesOrders si no hay invoices
  const src = salesOrders && salesOrders.length ? salesOrders : invoices && invoices.length ? invoices : [];
  const productCounts = {};
  src.forEach(order => {
    const items = order.orden_venta_items || order.items || [];
    items.forEach(it => {
      const id = it.producto_id || it.productId || it.product_id;
      const qty = Number(it.cantidad || it.quantity || 0);
      if (!productCounts[id]) productCounts[id] = 0;
      productCounts[id] += qty;
    });
  });
  const arr = Object.keys(productCounts).map(id => {
    const prod = inventoryProducts.find(p => p.id == id);
    return { id, name: prod ? (prod.nombre || prod.name) : `ID ${id}`, qty: productCounts[id] };
  }).sort((a,b) => b.qty - a.qty).slice(0,5);
  if (arr.length === 0) return '<li>No hay datos de ventas</li>';
  return arr.map(x => `<li>${x.name} — ${x.qty} unidades</li>`).join('');
}

// utility to load reports page (update KPIs)
function loadReports() {
  // basic KPI updates
  const totalProducts = inventoryProducts.length || 0;
  const totalSuppliers = suppliers.length || 0;
  const totalCustomers = customers.length || 0;
  const totalUsers = users.length || 0;
  document.getElementById('kpiProducts') && (document.getElementById('kpiProducts').textContent = totalProducts);
  document.getElementById('kpiSuppliers') && (document.getElementById('kpiSuppliers').textContent = totalSuppliers);
  document.getElementById('kpiCustomers') && (document.getElementById('kpiCustomers').textContent = totalCustomers);
  document.getElementById('kpiUsers') && (document.getElementById('kpiUsers').textContent = totalUsers);
}

// exports
window.generateSalesReport = generateSalesReport;
window.getTopProductsList = getTopProductsList;
window.loadReports = loadReports;