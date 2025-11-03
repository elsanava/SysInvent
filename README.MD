Estructura de Datos

El sistema utiliza localStorage para persistir los datos. A continuación se describen las estructuras principales:

Usuarios

javascript
{
  id: number,
  name: string,
  email: string,
  password: string,
  role: string,
  status: string,
  lastAccess: string,
  createdAt: string
}
Productos

javascript
{
  id: number,
  code: string,
  name: string,
  category: string,
  subcategory: string,
  price: number,
  cost: number,
  unit: string,
  stock: number,
  minStock: number,
  maxStock: number,
  warehouseId: number,
  description: string,
  status: string,
  managed: boolean
}
Clientes

javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  type: string,
  address: string
}
Proveedores

javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  products: string,
  address: string
}
Órdenes de Compra

javascript
{
  id: number,
  supplierId: number,
  date: string,
  items: Array<{
    productId: number,
    quantity: number,
    price: number
  }>,
  subtotal: number,
  tax: number,
  total: number,
  status: string,
  notes: string,
  invoiceId: number | null
}
Facturas

javascript
{
  id: number,
  clientId: number | null,
  supplierId: number | null,
  orderId: number,
  orderType: string, // 'purchase' o 'sales'
  date: string,
  items: Array<{
    productId: number,
    quantity: number,
    price: number
  }>,
  subtotal: number,
  tax: number,
  total: number,
  status: string,
  notes: string
}
Funcionalidades Principales

Autenticación y Autorización

Login/Logout
Registro de usuarios
Gestión de roles
Gestión de Inventario

CRUD de productos
Control de stock
Sistema Kardex
Importación/Exportación Excel
Gestión Comercial

Órdenes de compra y venta
Facturación
Gestión de clientes y proveedores
Análisis y Reportes

Dashboard con KPIs
Gráficos de ventas
Reportes financieros
Análisis de inventario
API para Backend

Para integrar con un backend, se deben implementar las siguientes APIs:

Autenticación

text
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
Productos

text
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
Inventario

text
GET    /api/inventory
POST   /api/inventory/movements
GET    /api/inventory/kardex
Órdenes

text
GET    /api/orders/purchase
POST   /api/orders/purchase
PUT    /api/orders/purchase/:id
DELETE /api/orders/purchase/:id

GET    /api/orders/sales
POST   /api/orders/sales
PUT    /api/orders/sales/:id
DELETE /api/orders/sales/:id
Facturas

text
GET    /api/invoices
POST   /api/invoices
PUT    /api/invoices/:id
Consideraciones para el Backend

Seguridad

Validación de datos
Autenticación JWT
Autorización por roles
Sanitización de inputs
Performance

Paginación para listas largas
Cache de datos frecuentes
Optimización de consultas
Escalabilidad

Base de datos relacional
Arquitectura modular
Logs y monitoreo
Migración a Backend

Para migrar del localStorage a un backend:

Reemplazar todas las llamadas a localStorage por llamadas API
Implementar manejo de errores y loading states
Actualizar la lógica de sincronización
Implementar autenticación real
Este sistema está diseñado para ser fácilmente migrable a una arquitectura cliente-servidor manteniendo toda la funcionalidad actual.