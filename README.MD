# 🚀 SysInvent - Sistema de Gestión de Inventarios

Sistema completo de gestión de inventarios con backend robusto en Node.js + Express + Prisma + PostgreSQL.

## ✨ Características Principales

### 📦 Módulos del Sistema
- **🔐 Autenticación JWT** - Login y registro seguro
- **📦 Gestión de Productos** - CRUD completo con códigos automáticos
- **👥 Clientes y Proveedores** - Gestión de contactos
- **🏷️ Categorías y Marcas** - Organización de productos
- **📊 Inventario** - Control de stock y movimientos
- **📋 Órdenes de Compra/Venta** - Gestión completa de transacciones
- **🧮 Kardex** - Seguimiento detallado de inventario
- **📈 Reportes** - Análisis y estadísticas
- **🏪 Almacenes** - Gestión multi-almacén

### 🛡️ Seguridad y Robustez
- Autenticación JWT con middleware
- Validación de datos con Prisma
- Manejo centralizado de errores
- CORS configurado
- Variables de entorno seguras

## 🏗️ Arquitectura del Proyecto

```
SysInvent/
├── 📁 backend/                 # API Principal
│   ├── 📁 prisma/             # Esquema de Base de Datos
│   ├── 📁 routes/             # 12 Rutas Organizadas
│   ├── 📁 controllers/        # Lógica de Negocio
│   ├── 📁 middlewares/        # Autenticación y Validaciones
│   ├── 📁 utils/              # Utilidades
│   ├── 🚀 server.js           # Servidor Principal
│   └── 📄 package.json        # Dependencias
├── 📁 public/                 # Frontend (si aplica)
└── 📄 README.md              # Documentación
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - Base de datos y migraciones
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **CORS** - Seguridad entre dominios

### Base de Datos
- **PostgreSQL** con 20+ tablas relacionadas
- **Esquema normalizado** con relaciones complejas
- **Migraciones automáticas** con Prisma
- **Índices optimizados** para performance

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/elsanava/SysInvent.git
cd SysInvent/backend
```

### 2. Configurar Variables de Entorno
```bash
# Crear archivo .env en backend/
DB_HOST=localhost
DB_USER=postgres
DB_PASS=tu_password
DB_NAME=sisinvent
DB_PORT=5432
JWT_SECRET=tu_jwt_secret
PORT=4000
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/sisinvent?schema=public"
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Configurar Base de Datos
```bash
# Ejecutar migraciones
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate
```

### 5. Ejecutar el Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Documentación de la API

### Endpoints Principales

| Módulo | Endpoint | Métodos | Descripción |
|--------|----------|---------|-------------|
| **Auth** | `/api/auth` | POST | Login y registro |
| **Usuarios** | `/api/usuarios` | GET, POST, PUT, DELETE | Gestión de usuarios |
| **Productos** | `/api/productos` | GET, POST, PUT, DELETE | CRUD de productos |
| **Clientes** | `/api/clientes` | GET, POST, PUT, DELETE | Gestión de clientes |
| **Proveedores** | `/api/proveedores` | GET, POST, PUT, DELETE | Gestión de proveedores |
| **Inventario** | `/api/inventario` | GET, POST | Movimientos y ajustes |
| **Órdenes** | `/api/ordenes-*` | GET, POST, PUT, DELETE | Compra/venta |

### Health Check
```http
GET /api/health
```
**Respuesta:**
```json
{
  "message": "SysInvent API funcionando correctamente",
  "database": "Conectado",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🗃️ Estructura de la Base de Datos

### Tablas Principales
- **usuarios** - Usuarios del sistema
- **productos** - Catálogo de productos
- **clientes** - Información de clientes
- **proveedores** - Información de proveedores
- **categorias** - Categorías de productos
- **marcas** - Marcas de productos
- **almacenes** - Gestión de almacenes
- **ordenes_compra/venta** - Transacciones
- **movimientos_inventario** - Historial de stock

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Ejecutar con auto-reload
npm run dev

# Abrir Prisma Studio (visor de BD)
npx prisma studio

# Ver estado de migraciones
npx prisma migrate status
```

### Base de Datos
```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Resetear base de datos (desarrollo)
npx prisma migrate reset

# Sincronizar schema
npx prisma db push
```

### Producción
```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: Conexión a PostgreSQL
- Verificar que PostgreSQL esté ejecutándose
- Confirmar credenciales en `.env`
- Verificar que la base de datos exista

### Error: Prisma Schema
```bash
# Regenerar cliente
npx prisma generate --force

# Validar schema
npx prisma validate
```

## 📈 Características Avanzadas

### 🔄 Códigos Automáticos
- Productos: `PRD-0001`, `PRD-0002`, ...
- Órdenes: `OC-20240101-001`, `OV-20240101-001`

### 📊 Validaciones
- Stock mínimo/máximo
- Precios y costos
- Unidades de medida
- Estados de órdenes

### 🔐 Seguridad
- Contraseñas encriptadas con bcrypt
- Tokens JWT con expiración
- Middleware de autenticación
- Validación de roles

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request
