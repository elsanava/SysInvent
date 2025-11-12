CREATE DATABASE Software_VII

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('Administrador', 'Usuario', 'Vendedor', 'Almacenista')) NOT NULL,
    estado VARCHAR(10) CHECK (estado IN ('Activo', 'Inactivo')) DEFAULT 'Activo',
    ultimo_acceso DATETIME2 NULL,
    creado_en DATETIME2 DEFAULT GETDATE(),
    actualizado_en DATETIME2 DEFAULT GETDATE()
);
go 
use Software_VII

-- Tabla de almacenes
CREATE TABLE almacenes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    capacidad INT NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en DATETIME2 DEFAULT GETDATE(),
    actualizado_en DATETIME2 DEFAULT GETDATE()
);
go 
use Software_VII

-- Tabla de categorías de productos
CREATE TABLE categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en DATETIME2 DEFAULT GETDATE()
);
go 
use Software_VII

-- Tabla de productos
CREATE TABLE productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    categoria_id INT NOT NULL,
    subcategoria VARCHAR(100),
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    costo DECIMAL(10,2) NOT NULsisinventL,
    unidad_medida VARCHAR(50) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT NOT NULL,
    stock_maximo INT NOT NULL,
    almacen_id INT NOT NULL,
    gestionado BIT DEFAULT 1,
    estado VARCHAR(20) CHECK (estado IN ('Disponible', 'Stock Bajo', 'Agotado')) DEFAULT 'Disponible',
    creado_en DATETIME2 DEFAULT GETDATE(),
    actualizado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (almacen_id) REFERENCES almacenes(id)
);
go 
use Software_VII

-- Tabla de clientes
CREATE TABLE clientes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    tipo VARCHAR(20) CHECK (tipo IN ('Minorista', 'Mayorista', 'Corporativo')) NOT NULL,
    direccion TEXT,
    creado_en DATETIME2 DEFAULT GETDATE(),
    actualizado_en DATETIME2 DEFAULT GETDATE()
);
go 
use Software_VII

-- Tabla de proveedores
CREATE TABLE proveedores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    productos_suministra TEXT,
    direccion TEXT,
    creado_en DATETIME2 DEFAULT GETDATE(),
    actualizado_en DATETIME2 DEFAULT GETDATE()
);
go 
use Software_VII

-- Tabla de órdenes de compra
CREATE TABLE ordenes_compra (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id INT NOT NULL,
    fecha DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Confirmada', 'Recibida', 'Cancelada')) DEFAULT 'Pendiente',
    notas TEXT,
    usuario_id INT NOT NULL,
    creado_en DATETIME2 DEFAULT GETDATE(),
    actualizado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
go 
use Software_VII

-- Tabla de items de órdenes de compra
CREATE TABLE orden_compra_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orden_compra_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    almacen_id INT NOT NULL,
    FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (almacen_id) REFERENCES almacenes(id)
);
go 
use Software_VII

-- Tabla de órdenes de venta
CREATE TABLE ordenes_venta (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    fecha DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Confirmada', 'Vendida', 'Cancelada')) DEFAULT 'Pendiente',
    notas TEXT,
    usuario_id INT NOT NULL,
    creado_en DATETIME2 DEFAULT GETDATE(),
    actualizado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
go 
use Software_VII

-- Tabla de items de órdenes de venta
CREATE TABLE orden_venta_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    orden_venta_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    almacen_id INT NOT NULL,
    FOREIGN KEY (orden_venta_id) REFERENCES ordenes_venta(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (almacen_id) REFERENCES almacenes(id)
);
go 
use Software_VII

-- Tabla de facturas
CREATE TABLE facturas (
    id INT IDENTITY(1,1) PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('Compra', 'Venta')) NOT NULL,
    orden_id INT NOT NULL,
    cliente_id INT NULL,
    proveedor_id INT NULL,
    fecha DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Confirmada', 'Recibida', 'Vendida', 'Cancelada')) NOT NULL,
    notas TEXT,
    usuario_id INT NOT NULL,
    creado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
go 
use Software_VII

-- Tabla de movimientos de inventario (Kardex)
CREATE TABLE movimientos_inventario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('entrada', 'salida')) NOT NULL,
    cantidad INT NOT NULL,
    fecha DATE NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    notas TEXT,
    usuario_id INT NOT NULL,
    orden_id INT NULL,
    tipo_orden VARCHAR(10) CHECK (tipo_orden IN ('compra', 'venta')) NULL,
    stock_anterior INT NOT NULL,
    stock_actual INT NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL,
    creado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
go 
use Software_VII

-- Tabla de ajustes de inventario
CREATE TABLE ajustes_inventario (
    id INT IDENTITY(1,1) PRIMARY KEY,
    producto_id INT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('incremento', 'decremento')) NOT NULL,
    cantidad INT NOT NULL,
    fecha DATE NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    notas TEXT,
    usuario_id INT NOT NULL,
    stock_anterior INT NOT NULL,
    stock_actual INT NOT NULL,
    creado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
go 
use Software_VII

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('info', 'warning', 'danger', 'success')) NOT NULL,
    leida BIT DEFAULT 0,
    creado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
go 
use Software_VII

-- Tabla de configuraciones del sistema
CREATE TABLE configuraciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    actualizado_en DATETIME2 DEFAULT GETDATE()
);
go 
use Software_VII

-- Tabla de logs del sistema
CREATE TABLE logs_sistema (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NULL,
    accion VARCHAR(255) NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    detalles TEXT,
    ip_address VARCHAR(45),
    creado_en DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
go 
use Software_VII

-- Insertar datos iniciales

-- Insertar usuario administrador
INSERT INTO usuarios (nombre, email, password, rol, estado) VALUES 
('Administrador', 'admin@sysinvent.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Activo');

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion) VALUES 
('Computadoras', 'Equipos de cómputo y laptops'),
('Teléfonos', 'Smartphones y teléfonos móviles'),
('Monitores', 'Pantallas y monitores'),
('Accesorios', 'Accesorios y periféricos');

-- Insertar almacén principal
INSERT INTO almacenes (nombre, ubicacion, capacidad, responsable, descripcion) VALUES 
('Almacén Principal', 'Sede Central', 1000, 'Administrador', 'Almacén principal del sistema');

-- Insertar configuraciones del sistema
INSERT INTO configuraciones (clave, valor, descripcion) VALUES 
('empresa_nombre', 'SysInvent', 'Nombre de la empresa'),
('empresa_telefono', '+1234567890', 'Teléfono de la empresa'),
('empresa_email', 'info@sysinvent.com', 'Email de la empresa'),
('impuesto_porcentaje', '16', 'Porcentaje de impuesto aplicable'),
('moneda', 'USD', 'Moneda del sistema'),
('stock_bajo_alerta', '5', 'Umbral para alertas de stock bajo');

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id);
CREATE INDEX idx_ordenes_compra_fecha ON ordenes_compra(fecha);
CREATE INDEX idx_ordenes_venta_fecha ON ordenes_venta(fecha);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_numero ON facturas(numero_factura);

-- Crear triggers para actualizar timestamps
CREATE OR ALTER TRIGGER trg_usuarios_actualizado
ON usuarios
AFTER UPDATE
AS
BEGIN
    UPDATE usuarios 
    SET actualizado_en = GETDATE()
    FROM inserted
    WHERE usuarios.id = inserted.id;
END;

CREATE OR ALTER TRIGGER trg_productos_actualizado
ON productos
AFTER UPDATE
AS
BEGIN
    UPDATE productos 
    SET actualizado_en = GETDATE()
    FROM inserted
    WHERE productos.id = inserted.id;
END;

CREATE OR ALTER TRIGGER trg_actualizar_stock_producto
ON movimientos_inventario
AFTER INSERT
AS
BEGIN
    UPDATE p
    SET p.stock_actual = i.stock_actual,
        p.estado = CASE 
            WHEN i.stock_actual = 0 THEN 'Agotado'
            WHEN i.stock_actual <= p.stock_minimo THEN 'Stock Bajo'
            ELSE 'Disponible'
        END,
        p.actualizado_en = GETDATE()
    FROM productos p
    INNER JOIN inserted i ON p.id = i.producto_id;
END;

-- Crear vistas útiles

-- Vista para el dashboard
CREATE VIEW vista_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM productos) as total_productos,
    (SELECT COUNT(*) FROM clientes) as total_clientes,
    (SELECT COUNT(*) FROM proveedores) as total_proveedores,
    (SELECT COUNT(*) FROM ordenes_venta WHERE MONTH(fecha) = MONTH(GETDATE()) AND YEAR(fecha) = YEAR(GETDATE())) as ventas_mes_actual,
    (SELECT SUM(total) FROM facturas WHERE tipo = 'Venta' AND MONTH(fecha) = MONTH(GETDATE()) AND YEAR(fecha) = YEAR(GETDATE())) as ingresos_mes_actual,
    (SELECT COUNT(*) FROM productos WHERE stock_actual <= stock_minimo AND stock_actual > 0) as productos_stock_bajo,
    (SELECT COUNT(*) FROM productos WHERE stock_actual = 0) as productos_agotados;

-- Vista para productos con stock bajo
CREATE VIEW vista_stock_bajo AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    p.stock_actual,
    p.stock_minimo,
    p.stock_maximo,
    c.nombre as categoria,
    a.nombre as almacen
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN almacenes a ON p.almacen_id = a.id
WHERE p.stock_actual <= p.stock_minimo;

-- Vista para movimientos recientes
CREATE VIEW vista_movimientos_recientes AS
SELECT 
    m.id,
    p.nombre as producto,
    m.tipo,
    m.cantidad,
    m.fecha,
    m.motivo,
    u.nombre as usuario
FROM movimientos_inventario m
JOIN productos p ON m.producto_id = p.id
JOIN usuarios u ON m.usuario_id = u.id
ORDER BY m.fecha DESC, m.creado_en DESC;

-- Procedimientos almacenados útiles

-- Procedimiento para registrar movimiento de inventario
CREATE OR ALTER PROCEDURE sp_registrar_movimiento_inventario
    @producto_id INT,
    @tipo VARCHAR(10),
    @cantidad INT,
    @fecha DATE,
    @motivo VARCHAR(255),
    @notas TEXT = NULL,
    @usuario_id INT,
    @orden_id INT = NULL,
    @tipo_orden VARCHAR(10) = NULL
AS
BEGIN
    DECLARE @stock_anterior INT;
    DECLARE @stock_actual INT;
    DECLARE @costo_unitario DECIMAL(10,2);
    
    SELECT @stock_anterior = stock_actual, @costo_unitario = costo 
    FROM productos WHERE id = @producto_id;
    
    IF @tipo = 'entrada'
        SET @stock_actual = @stock_anterior + @cantidad;
    ELSE
        SET @stock_actual = @stock_anterior - @cantidad;
    
    INSERT INTO movimientos_inventario (
        producto_id, tipo, cantidad, fecha, motivo, notas, usuario_id,
        orden_id, tipo_orden, stock_anterior, stock_actual,
        costo_unitario, costo_total
    ) VALUES (
        @producto_id, @tipo, @cantidad, @fecha, @motivo, @notas, @usuario_id,
        @orden_id, @tipo_orden, @stock_anterior, @stock_actual,
        @costo_unitario, @costo_unitario * @cantidad
    );
END;

-- Procedimiento para generar reporte de ventas por período
CREATE OR ALTER PROCEDURE sp_reporte_ventas
    @fecha_inicio DATE,
    @fecha_fin DATE
AS
BEGIN
    SELECT 
        f.numero_factura,
        f.fecha,
        c.nombre as cliente,
        f.subtotal,
        f.impuesto,
        f.total,
        u.nombre as vendedor
    FROM facturas f
    JOIN clientes c ON f.cliente_id = c.id
    JOIN usuarios u ON f.usuario_id = u.id
    WHERE f.tipo = 'Venta' 
    AND f.fecha BETWEEN @fecha_inicio AND @fecha_fin
    ORDER BY f.fecha DESC;
END;

-- Procedimiento para obtener productos populares
CREATE OR ALTER PROCEDURE sp_productos_populares
    @mes INT = NULL,
    @anio INT = NULL
AS
BEGIN
    IF @mes IS NULL SET @mes = MONTH(GETDATE());
    IF @anio IS NULL SET @anio = YEAR(GETDATE());
    
    SELECT 
        p.nombre,
        SUM(ovi.cantidad) as total_vendido,
        SUM(ovi.subtotal) as ingresos_totales
    FROM orden_venta_items ovi
    JOIN productos p ON ovi.producto_id = p.id
    JOIN ordenes_venta ov ON ovi.orden_venta_id = ov.id
    WHERE MONTH(ov.fecha) = @mes AND YEAR(ov.fecha) = @anio
    GROUP BY p.id, p.nombre
    ORDER BY total_vendido DESC;
END;