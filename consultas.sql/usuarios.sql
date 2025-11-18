SELECT * FROM usuarios;

INSERT INTO usuarios(nombre,email, password, rol)
VALUES ('admin', 'admin@gmail.com', 'admin', 'Administrador');

UPDATE usuarios
SET email = 'fguti@gmail.com'
WHERE id = 3;