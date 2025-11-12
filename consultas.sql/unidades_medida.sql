CREATE TABLE unidades_medida (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO unidades_medida (nombre)
VALUES
('Unidad'),
('Caja'),
('Paquete'),
('Pieza'),
('Metro'),
('Centímetro'),
('Milímetro'),
('Litro'),
('Mililitro'),
('Galón'),
('Kilogramo'),
('Gramo'),
('Libra'),
('Onza'),
('Par'),
('Docena'),
('Bolsa'),
('Rollo'),
('Balde'),
('Tubo');


SELECT * FROM unidades_medida