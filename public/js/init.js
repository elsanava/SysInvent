// ===============================
// INICIALIZACIÓN GENERAL
// ===============================
// init.js - carga datos para selects (almacenes, categorias, unidades, marcas)
async function fetchJson(path, method='GET', body=null) {
  const opts = { method, headers: getAuthHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${path}`, opts);
  if (!res.ok) throw await res.json();
  return res.json();
}

async function loadGlobalSelects() {
  try {
    const [almacenes, categorias, unidades, marcas] = await Promise.all([
      fetchJson('/almacen'),
      fetchJson('/categorias'),
      fetchJson('/unidades'),
      fetchJson('/marcas')
    ]);
    // almacenes
    const selA = document.getElementById('productWarehouse');
    if (selA) {
      selA.innerHTML = `<option value="">Seleccionar almacén</option>` + almacenes.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
    }
    const selC = document.getElementById('productCategory');
    if (selC) {
      selC.innerHTML = `<option value="">Seleccionar categoría</option>` + categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
    const selU = document.getElementById('productUnit');
    if (selU) {
      selU.innerHTML = `<option value="">Seleccionar unidad</option>` + unidades.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
    }
    const selM = document.getElementById('productBrand');
    if (selM) {
      selM.innerHTML = `<option value="">Seleccionar marca</option>` + marcas.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
    }
  } catch (err) {
    console.warn('init selects failed', err);
  }
}

window.loadGlobalSelects = loadGlobalSelects;