const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "Conectado a PostgreSQL", time: result.rows[0] });
  } catch (error) {
    console.error("Error en la conexión:", error);
    res.status(500).json({ status: "Error al conectar a PostgreSQL" });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
