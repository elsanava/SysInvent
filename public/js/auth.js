// ===============================
// UTILIDADES GLOBALES
// ===============================

// Mostrar alertas flotantes (Bootstrap)
function showAlert(message, type = 'info') {
  const existingAlert = document.querySelector('.alert.position-fixed');
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed shadow-lg`;
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '320px';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(alertDiv);

  setTimeout(() => {
    if (alertDiv.parentNode) alertDiv.remove();
  }, 5000);
}

// Mostrar contenido de reportes 
function showReport(title, htmlContent) {
  const reportTitle = document.getElementById('reportTitle');
  const reportContent = document.getElementById('reportContent');

  if (reportTitle && reportContent) {
    reportTitle.textContent = title;
    reportContent.innerHTML = htmlContent;
    if (typeof showSection === 'function') showSection('reports');
  } else {
    console.warn('⚠️ No se encontró el contenedor de reportes en el DOM.');
  }
}

// Obtener clase CSS para badges
function getStatusClass(status) {
  switch (status) {
    case 'Pendiente': return 'warning';
    case 'Confirmada': return 'info';
    case 'Recibida': return 'success';
    case 'Vendida': return 'success';
    case 'Completada': return 'success';
    case 'Cancelada': return 'danger';
    default: return 'secondary';
  }
}

// Formatear dinero a córdobas (C$)
function formatMoney(amount) {
  return new Intl.NumberFormat('es-NI', {
    style: 'currency',
    currency: 'NIO',
    minimumFractionDigits: 2
  }).format(Number(amount || 0));
}

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  return d.toLocaleDateString();
}

// export
window.showAlert = showAlert;
window.showReport = showReport;
window.getStatusClass = getStatusClass;
window.formatMoney = formatMoney;
window.formatDate = formatDate;
