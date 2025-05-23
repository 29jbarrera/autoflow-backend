const pool = require("../db");

const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsuarios = await pool.query("SELECT COUNT(*) FROM usuarios");
    const totalGastos = await pool.query("SELECT COUNT(*) FROM gastos");
    const totalFacturas = await pool.query("SELECT COUNT(*) FROM facturas");
    const totalClientes = await pool.query("SELECT COUNT(*) FROM clientes");

    res.status(200).json({
      totalUsuarios: parseInt(totalUsuarios.rows[0].count),
      totalGastos: parseInt(totalGastos.rows[0].count),
      totalFacturas: parseInt(totalFacturas.rows[0].count),
      totalClientes: parseInt(totalClientes.rows[0].count),
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de admin:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const getUsersWithStats = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const users = await pool.query(
      "SELECT id, nombre, apellidos, email, rol FROM usuarios ORDER BY nombre ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    if (users.rows.length === 0) {
      return res
        .status(200)
        .json({ message: "No hay usuarios registrados", users: [] });
    }

    const usersWithStats = await Promise.all(
      users.rows.map(async (user) => {
        const userId = user.id;

        const totalFacturas = await pool.query(
          "SELECT COUNT(*) FROM facturas WHERE usuario_id = $1",
          [userId]
        );
        const totalGastos = await pool.query(
          "SELECT COUNT(*) FROM gastos WHERE usuario_id = $1",
          [userId]
        );
        const totalIngresos = await pool.query(
          "SELECT COUNT(*) FROM ingresos WHERE usuario_id = $1",
          [userId]
        );
        const totalClientes = await pool.query(
          "SELECT COUNT(*) FROM clientes WHERE usuario_id = $1",
          [userId]
        );

        return {
          id: user.id,
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          rol: user.rol,
          totalFacturas: parseInt(totalFacturas.rows[0].count),
          totalGastos: parseInt(totalGastos.rows[0].count),
          totalIngresos: parseInt(totalIngresos.rows[0].count),
          totalClientes: parseInt(totalClientes.rows[0].count),
        };
      })
    );

    const totalCountResult = await pool.query("SELECT COUNT(*) FROM usuarios");
    const totalCount = totalCountResult.rows[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      users: usersWithStats,
      total: totalCount,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error("❌ Error obteniendo usuarios con estadísticas:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const getTotalUsuarios = async (req, res) => {
  try {
    // Obtener el total de usuarios
    const result = await pool.query(
      "SELECT COUNT(*) AS totalUsuarios FROM usuarios"
    );
    const totalUsuarios = result.rows[0].totalusuarios; // El nombre puede variar según tu consulta

    res.status(200).json({ totalUsuarios });
  } catch (error) {
    console.error("Error al obtener total de usuarios:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  getAdminDashboardStats,
  getUsersWithStats,
  getTotalUsuarios,
};
