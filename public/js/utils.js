// ===============================
// UTILIDADES GLOBALES
// ===============================

// Mostrar alertas flotantes (Bootstrap)
function showAlert(message, type = 'info') {
  // Eliminar alertas anteriores (opcional)
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

  // Auto-cerrar después de 5 segundos
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
    showSection('reports'); // cambia la vista a la sección de reportes
  } else {
    console.warn('⚠️ No se encontró el contenedor de reportes en el DOM.');
  }
}