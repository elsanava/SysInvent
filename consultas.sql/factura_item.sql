CREATE TABLE factura_items (
   id SERIAL PRIMARY KEY,
   factura_id INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
   producto_id INT NOT NULL REFERENCES productos(id),
   cantidad INT NOT NULL,
   precio_unitario NUMERIC(10,2) NOT NULL,
   subtotal NUMERIC(10,2) NOT NULL
);