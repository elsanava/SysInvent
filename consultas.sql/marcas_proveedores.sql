CREATE TABLE marcas_proveedores (
    id SERIAL PRIMARY KEY,
    marcas_id INT NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
    proveedores_id INT NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);