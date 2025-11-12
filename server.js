const express = require("express");
const cors = require("cors");
const path = require("path");
const prisma = require("./prismaClient");
require("dotenv").config();

const app = express();

// ===============================
// MIDDLEWARES
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Sirve el frontend

// ===============================
// PRUEBA DE CONEXIÓN
// ===============================
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "Conectado a PostgreSQL", time: result.rows[0] });
  } catch (error) {
    console.error("Error en conexión:", error);
    res.status(500).json({ status: "Error al conectar a PostgreSQL" });
  }
});

/// ===============================
// LOGIN DE USUARIO (usando Prisma)
// ===============================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario por su email
    const user = await prisma.usuarios.findUnique({
      where: { email },
    });

    // Si no existe el usuario
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseñas (nota: más adelante puedes usar bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Si el login es correcto, devolver los datos básicos del usuario
    res.json({
      message: "✅ Login exitoso",
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// ===============================
// REGISTRO DE USUARIO (usando Prisma)
// ===============================
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validaciones básicas
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  try {
    // Buscar si ya existe un usuario con el mismo correo (insensible a mayúsculas)
    const existingUser = await prisma.usuarios.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive', // no diferencia mayúsculas/minúsculas
        },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: `El correo "${email}" ya está registrado. Intente con otro.`,
      });
    }

    // Insertar nuevo usuario
    const newUser = await prisma.usuarios.create({
      data: {
        nombre: name,
        email,
        password,
        rol: "Usuario",
        estado: "Activo",
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
      },
    });

    res.status(201).json({
      message: "✅ Usuario registrado correctamente.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
});


// ===============================
// INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// ===============================
// PRODUCTOS - CRUD BÁSICO
// ===============================

//  Obtener todos los productos
app.get("/api/productos", async (req, res) => {
  try {
    const productos = await prisma.productos.findMany({
      include: {
        categorias: true,
        almacenes: true,
        unidades_medida: true,
      },
      orderBy: { id: "asc" },
    });
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener los productos" });
  }
});

//  Crear nuevo producto con código automático
app.post("/api/productos", async (req, res) => {
  try {
    const {
      nombre,
      categoria_id,
      subcategoria,
      descripcion,
      precio,
      costo,
      unidad_id,
      stock_minimo,
      stock_maximo,
      almacen_id,
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !categoria_id || !precio || !costo || !unidad_id) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    // Obtener el último producto (para generar el siguiente código)
    const lastProduct = await prisma.productos.findFirst({
      orderBy: { id: "desc" },
    });

    let newCode = "PRD-0001"; // valor inicial
    if (lastProduct && lastProduct.codigo) {
      const lastNumber = parseInt(lastProduct.codigo.split("-")[1], 10);
      const nextNumber = lastNumber + 1;
      newCode = `PRD-${nextNumber.toString().padStart(4, "0")}`;
    }

    // Crear nuevo producto
    const nuevo = await prisma.productos.create({
      data: {
        codigo: newCode,
        nombre,
        categoria_id: parseInt(categoria_id),
        subcategoria,
        descripcion,
        precio: parseFloat(precio),
        costo: parseFloat(costo),
        unidad_id: parseInt(unidad_id),
        stock_minimo: parseInt(stock_minimo),
        stock_maximo: parseInt(stock_maximo),
        almacen_id: parseInt(almacen_id),
      },
    });

    res.status(201).json({ message: "✅ Producto creado correctamente", producto: nuevo });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ message: "Error al crear el producto" });
  }
});

//  Eliminar producto por ID
app.delete("/api/productos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.productos.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
});

// =====================================
// GENERAR CÓDIGO AUTOMÁTICO DE PRODUCTO
// =====================================
app.get("/api/productos/next-code", async (req, res) => {
  try {
    // Buscar el último producto según el ID (mayor ID = último creado)
    const ultimoProducto = await prisma.productos.findFirst({
      orderBy: { id: "desc" },
      select: { codigo: true },
    });

    let nextCode = "PRD-0001"; // Valor por defecto si no hay productos aún

    if (ultimoProducto && ultimoProducto.codigo) {
      // Extraer la parte numérica del código
      const match = ultimoProducto.codigo.match(/\d+$/);
      if (match) {
        const nextNumber = parseInt(match[0], 10) + 1;
        // Formatear con ceros a la izquierda (mínimo 4 dígitos)
        nextCode = `PRD-${nextNumber.toString().padStart(4, "0")}`;
      }
    }

    res.json({ nextCode });
  } catch (error) {
    console.error("Error al generar código de producto:", error);
    res.status(500).json({ message: "Error al generar el código de producto" });
  }
});

// ===============================
// CATEGORÍAS / UNIDADES / ALMACENES
// ===============================
app.get("/api/categorias", async (req, res) => {
  try {
    const categorias = await prisma.categorias.findMany();
    res.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ message: "Error al obtener categorías" });
  }
});

app.get("/api/unidades", async (req, res) => {
  try {
    const unidades = await prisma.unidades_medida.findMany();
    res.json(unidades);
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    res.status(500).json({ message: "Error al obtener unidades" });
  }
});

app.get("/api/almacen", async (req, res) => {
  try {
    const almacenes = await prisma.almacenes.findMany();
    res.json(almacenes);
  } catch (error) {
    console.error("Error al obtener almacenes:", error);
    res.status(500).json({ message: "Error al obtener almacenes" });
  }
});
