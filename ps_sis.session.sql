-- ================================================
-- CREAR BASE DE DATOS
-- ================================================
CREATE DATABASE sisinvent;
\c sisinvent;

-- ================================================
-- TABLA: usuarios
-- ================================================
CREATE TABLE usuarios (
    
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('Administrador', 'Usuario', 'Vendedor', 'Almacenista')) NOT NULL,
    estado VARCHAR(10) CHECK (estado IN ('Activo', 'Inactivo')) DEFAULT 'Activo',
    ultimo_acceso TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: almacenes
-- ================================================
CREATE TABLE almacenes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    capacidad INT NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: categorias
-- ================================================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: productos
-- ================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    subcategoria VARCHAR(100),
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    costo NUMERIC(10,2) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT NOT NULL,
    stock_maximo INT NOT NULL,
    almacen_id INT NOT NULL REFERENCES almacenes(id) ON DELETE CASCADE,
    gestionado BOOLEAN DEFAULT TRUE,
    estado VARCHAR(20) CHECK (estado IN ('Disponible', 'Stock Bajo', 'Agotado')) DEFAULT 'Disponible',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: clientes
-- ================================================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    tipo VARCHAR(20) CHECK (tipo IN ('Minorista', 'Mayorista', 'Corporativo')) NOT NULL,
    direccion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: proveedores
-- ================================================
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    productos_suministra TEXT,
    direccion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: ordenes_compra
-- ================================================
CREATE TABLE ordenes_compra (
    id SERIAL PRIMARY KEY,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id INT NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    impuesto NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Confirmada', 'Recibida', 'Cancelada')) DEFAULT 'Pendiente',
    notas TEXT,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: orden_compra_items
-- ================================================
CREATE TABLE orden_compra_items (
    id SERIAL PRIMARY KEY,
    orden_compra_id INT NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    almacen_id INT NOT NULL REFERENCES almacenes(id)
);

-- ================================================
-- TABLA: ordenes_venta
-- ================================================
CREATE TABLE ordenes_venta (
    id SERIAL PRIMARY KEY,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT NOT NULL REFERENCES clientes(id),
    fecha DATE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    impuesto NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Confirmada', 'Vendida', 'Cancelada')) DEFAULT 'Pendiente',
    notas TEXT,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: orden_venta_items
-- ================================================
CREATE TABLE orden_venta_items (
    id SERIAL PRIMARY KEY,
    orden_venta_id INT NOT NULL REFERENCES ordenes_venta(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id),
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    almacen_id INT NOT NULL REFERENCES almacenes(id)
);

-- ================================================
-- TABLA: facturas
-- ================================================
CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('Compra', 'Venta')) NOT NULL,
    orden_id INT NOT NULL,
    cliente_id INT NULL REFERENCES clientes(id),
    proveedor_id INT NULL REFERENCES proveedores(id),
    fecha DATE NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    impuesto NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('Pendiente', 'Confirmada', 'Recibida', 'Vendida', 'Cancelada')) NOT NULL,
    notas TEXT,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: movimientos_inventario
-- ================================================
CREATE TABLE movimientos_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id),
    tipo VARCHAR(10) CHECK (tipo IN ('entrada', 'salida')) NOT NULL,
    cantidad INT NOT NULL,
    fecha DATE NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    notas TEXT,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    orden_id INT NULL,
    tipo_orden VARCHAR(10) CHECK (tipo_orden IN ('compra', 'venta')),
    stock_anterior INT NOT NULL,
    stock_actual INT NOT NULL,
    costo_unitario NUMERIC(10,2) NOT NULL,
    costo_total NUMERIC(10,2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: ajustes_inventario
-- ================================================
CREATE TABLE ajustes_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id),
    tipo VARCHAR(20) CHECK (tipo IN ('incremento', 'decremento')) NOT NULL,
    cantidad INT NOT NULL,
    fecha DATE NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    notas TEXT,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    stock_anterior INT NOT NULL,
    stock_actual INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: notificaciones
-- ================================================
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('info', 'warning', 'danger', 'success')) NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: configuraciones
-- ================================================
CREATE TABLE configuraciones (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descripcion TEXT,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- TABLA: logs_sistema
-- ================================================
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INT NULL REFERENCES usuarios(id),
    accion VARCHAR(255) NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    detalles TEXT,
    ip_address VARCHAR(45),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================
-- ÍNDICES
-- =============================
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id);
CREATE INDEX idx_ordenes_compra_fecha ON ordenes_compra(fecha);
CREATE INDEX idx_ordenes_venta_fecha ON ordenes_venta(fecha);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_numero ON facturas(numero_factura);

-- =============================
-- TRIGGERS
-- =============================
-- Trigger para actualizar la fecha de modificación en usuarios
CREATE OR REPLACE FUNCTION actualizar_timestamp_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_actualizado
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_usuarios();

-- Trigger para actualizar la fecha de modificación en productos
CREATE OR REPLACE FUNCTION actualizar_timestamp_productos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_productos_actualizado
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_productos();


-- Trigger para actualizar stock de producto desde movimientos de inventario
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
  SET stock_actual = NEW.stock_actual,
      estado = CASE 
          WHEN NEW.stock_actual = 0 THEN 'Agotado'
          WHEN NEW.stock_actual <= stock_minimo THEN 'Stock Bajo'
          ELSE 'Disponible'
      END,
      actualizado_en = NOW()
  WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock_producto
AFTER INSERT ON movimientos_inventario
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_producto();

-- =============================
-- VISTAS
-- =============================
CREATE OR REPLACE VIEW vista_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM productos) AS total_productos,
    (SELECT COUNT(*) FROM clientes) AS total_clientes,
    (SELECT COUNT(*) FROM proveedores) AS total_proveedores,
    (SELECT COUNT(*) FROM ordenes_venta WHERE DATE_PART('month', fecha) = DATE_PART('month', CURRENT_DATE)
     AND DATE_PART('year', fecha) = DATE_PART('year', CURRENT_DATE)) AS ventas_mes_actual,
    (SELECT SUM(total) FROM facturas WHERE tipo = 'Venta' AND DATE_PART('month', fecha) = DATE_PART('month', CURRENT_DATE)
     AND DATE_PART('year', fecha) = DATE_PART('year', CURRENT_DATE)) AS ingresos_mes_actual,
    (SELECT COUNT(*) FROM productos WHERE stock_actual <= stock_minimo AND stock_actual > 0) AS productos_stock_bajo,
    (SELECT COUNT(*) FROM productos WHERE stock_actual = 0) AS productos_agotados;

CREATE OR REPLACE VIEW vista_stock_bajo AS
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    p.stock_actual,
    p.stock_minimo,
    p.stock_maximo,
    c.nombre AS categoria,
    a.nombre AS almacen
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN almacenes a ON p.almacen_id = a.id
WHERE p.stock_actual <= p.stock_minimo;

-- Vista para movimientos recientes
CREATE OR REPLACE VIEW vista_movimientos_recientes AS
SELECT 
    m.id,
    p.nombre AS producto,
    m.tipo,
    m.cantidad,
    m.fecha,
    m.motivo,
    u.nombre AS usuario
FROM movimientos_inventario m
JOIN productos p ON m.producto_id = p.id
JOIN usuarios u ON m.usuario_id = u.id
ORDER BY m.fecha DESC, m.creado_en DESC;

-- Registrar movimiento de inventario
-- ======================================
-- FUNCIÓN: Registrar movimiento de inventario
-- ======================================

CREATE OR REPLACE FUNCTION sp_registrar_movimiento_inventario(
    p_producto_id INT,
    p_tipo VARCHAR(10),
    p_cantidad INT,
    p_fecha DATE,
    p_motivo VARCHAR(255),
    p_usuario_id INT,
    p_orden_id INT DEFAULT NULL,
    p_tipo_orden VARCHAR(10) DEFAULT NULL,
    p_notas TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_stock_anterior INT;
    v_stock_actual INT;
    v_costo_unitario DECIMAL(10,2);
BEGIN
    -- Obtener stock y costo actual del producto
    SELECT stock_actual, costo
    INTO v_stock_anterior, v_costo_unitario
    FROM productos
    WHERE id = p_producto_id;

    -- Calcular nuevo stock
    IF p_tipo = 'entrada' THEN
        v_stock_actual := v_stock_anterior + p_cantidad;
    ELSE
        v_stock_actual := v_stock_anterior - p_cantidad;
    END IF;

    -- Registrar el movimiento
    INSERT INTO movimientos_inventario (
        producto_id, tipo, cantidad, fecha, motivo, notas, usuario_id,
        orden_id, tipo_orden, stock_anterior, stock_actual,
        costo_unitario, costo_total
    ) VALUES (
        p_producto_id, p_tipo, p_cantidad, p_fecha, p_motivo, p_notas, p_usuario_id,
        p_orden_id, p_tipo_orden, v_stock_anterior, v_stock_actual,
        v_costo_unitario, v_costo_unitario * p_cantidad
    );
END;
$$ LANGUAGE plpgsql;

-- Reporte de ventas por periodo

CREATE OR REPLACE FUNCTION sp_reporte_ventas(
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS TABLE (
    numero_factura VARCHAR,
    fecha DATE,
    cliente VARCHAR,
    subtotal DECIMAL,
    impuesto DECIMAL,
    total DECIMAL,
    vendedor VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.numero_factura,
        f.fecha,
        c.nombre AS cliente,
        f.subtotal,
        f.impuesto,
        f.total,
        u.nombre AS vendedor
    FROM facturas f
    JOIN clientes c ON f.cliente_id = c.id
    JOIN usuarios u ON f.usuario_id = u.id
    WHERE f.tipo = 'Venta'
      AND f.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY f.fecha DESC;
END;
$$ LANGUAGE plpgsql;

-- Productos populares por mes/año
CREATE OR REPLACE FUNCTION sp_productos_populares(
    p_mes INT DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
    p_anio INT DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    nombre VARCHAR,
    total_vendido BIGINT,
    ingresos_totales DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.nombre,
        SUM(ovi.cantidad) AS total_vendido,
        SUM(ovi.subtotal) AS ingresos_totales
    FROM orden_venta_items ovi
    JOIN productos p ON ovi.producto_id = p.id
    JOIN ordenes_venta ov ON ovi.orden_venta_id = ov.id
    WHERE EXTRACT(MONTH FROM ov.fecha) = p_mes
      AND EXTRACT(YEAR FROM ov.fecha) = p_anio
    GROUP BY p.id, p.nombre
    ORDER BY total_vendido DESC;
END;
$$ LANGUAGE plpgsql;