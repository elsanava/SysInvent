CREATE TABLE orden_venta_items (
   id SERIAL PRIMARY KEY,
   orden_venta_id INT NOT NULL REFERENCES ordenes_venta(id) ON DELETE CASCADE,
   producto_id INT NOT NULL REFERENCES productos(id),
   cantidad INT NOT NULL,
   precio_unitario NUMERIC(10,2) NOT NULL,
   subtotal NUMERIC(10,2) NOT NULL
);
