// ===============================
// AUTENTICACIÓN
// ===============================
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    showAlert('Por favor, complete todos los campos.', 'danger');
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      showAppScreen();
      // updateDashboard();
      setTimeout(() => {
    updateDashboard();
  }, 500);

      showAlert(`Bienvenido, ${currentUser.nombre}`, "success");
    } else {
      showAlert(data.message || "Credenciales incorrectas.", "danger");
    }
  } catch (error) {
    console.error("Error en login:", error);
    showAlert("Error al conectar con el servidor.", "danger");
  }
}

// REGISTRO - conexión con el backend
// ===============================
async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();

  // Validaciones básicas
  if (!name || !email || !password || !confirmPassword) {
    showAlert('Por favor, complete todos los campos.', 'danger');
    return;
  }

  if (password.length < 6) {
    showAlert('La contraseña debe tener al menos 6 caracteres.', 'warning');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Las contraseñas no coinciden.', 'warning');
    return;
  }

  try {
    // Enviar los datos al backend
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("Usuario registrado exitosamente. Ahora puede iniciar sesión.", "success");

      // 🔄 Cambiar automáticamente a la pestaña de login
      const loginTab = document.getElementById("login-tab");
      if (loginTab) loginTab.click();

      // 🧹 Limpiar formulario
      document.getElementById("registerForm").reset();
    } else {
      showAlert(data.message || "Error al registrar el usuario.", "danger");
    }
  } catch (error) {
    console.error("Error en registro:", error);
    showAlert("Error al conectar con el servidor.", "danger");
  }
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showLoginScreen();
  showAlert('Sesión cerrada correctamente.', 'info');
}

window.handleLogin = handleLogin;
