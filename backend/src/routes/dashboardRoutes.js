import { Router } from 'express';

const router = Router();

// GET /api/dashboard/subsystems/:profileId
// Obtiene la lista de subsistemas permitidos para el perfil especificado
router.get('/subsystems/:profileId', async (req, res) => {
  if (!global.global_session.sessionExist(req)) {
    return res.status(401).json({ success: false, message: "Debe hacer sesión para consultar esta información." });
  }

  try {
    const { profileId } = req.params;

    if (!profileId || profileId === 'null' || profileId === 'undefined') {
      return res.status(400).json({ success: false, message: "ID de perfil inválido." });
    }

    const sql = global.global_db.getSentence('security', 'getSubSystemsByProfile');
    const rows = await global.global_db.exeQuery(sql, [profileId]);

    res.json({ success: true, subSystems: rows });
  } catch (error) {
    console.error("Error al obtener subsistemas:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor al obtener subsistemas" });
  }
});

// GET /api/dashboard/options/:profileId/:subSystemId
// Obtiene la lista de opciones (padres e hijas) para el perfil y subsistema especificado
router.get('/options/:profileId/:subSystemId', async (req, res) => {
  if (!global.global_session.sessionExist(req)) {
    return res.status(401).json({ success: false, message: "Debe hacer sesión para consultar esta información." });
  }

  try {
    const { profileId, subSystemId } = req.params;

    if (!profileId || !subSystemId || profileId === 'null' || subSystemId === 'null') {
      return res.status(400).json({ success: false, message: "Parámetros de perfil o subsistema inválidos." });
    }

    const sql = global.global_db.getSentence('security', 'getOptionsByProfileAndSubSystem');
    const rows = await global.global_db.exeQuery(sql, [profileId, subSystemId]);

    res.json({ success: true, options: rows });
  } catch (error) {
    console.error("Error al obtener opciones de menú:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor al obtener opciones" });
  }
});

// GET /api/dashboard/leader/metrics
// Obtiene métricas agregadas del líder (proyectos activos, empleados, notificaciones hoy, horas semanales)
router.get('/leader/metrics', async (req, res) => {
  try {
    if (!global.global_session.sessionExist(req)) {
      return res.status(401).json({ success: false, message: "Sesión expirada o inválida." });
    }
    const userData = global.global_session.getDataSession(req);
    const userId = userData.user_id;

    const sql = global.global_db.getSentence('leader', 'getMetrics');
    const rows = await global.global_db.exeQuery(sql, [userId]);

    // Si no tiene registros o da null, retornar objeto default
    const metrics = rows[0] || {
      active_projects: 0,
      total_employees: 0,
      notifications_today: 0,
      total_hours_week: 0
    };

    res.json({ success: true, metrics });
  } catch (error) {
    console.error("Error al obtener métricas del líder:", error);
    res.status(500).json({ success: false, message: "Error interno al obtener métricas" });
  }
});

// GET /api/dashboard/leader/projects
// Obtiene proyectos administrados por el líder de equipo
router.get('/leader/projects', async (req, res) => {
  try {
    if (!global.global_session.sessionExist(req)) {
      return res.status(401).json({ success: false, message: "Sesión expirada o inválida." });
    }
    const userData = global.global_session.getDataSession(req);
    const userId = userData.user_id;

    const sql = global.global_db.getSentence('leader', 'getProjects');
    const rows = await global.global_db.exeQuery(sql, [userId]);

    res.json({ success: true, projects: rows });
  } catch (error) {
    console.error("Error al obtener proyectos del líder:", error);
    res.status(500).json({ success: false, message: "Error interno al obtener proyectos" });
  }
});

// GET /api/dashboard/leader/notifications
// Obtiene notificaciones filtradas de los proyectos del líder de equipo
router.get('/leader/notifications', async (req, res) => {
  try {
    if (!global.global_session.sessionExist(req)) {
      return res.status(401).json({ success: false, message: "Sesión expirada o inválida." });
    }
    const userData = global.global_session.getDataSession(req);
    const userId = userData.user_id;

    const { fechaInicio, fechaFin, proyectoId } = req.query;

    const sql = global.global_db.getSentence('leader', 'getNotifications');
    const rows = await global.global_db.exeQuery(sql, [
      userId,
      fechaInicio || null,
      fechaFin || null,
      proyectoId || null
    ]);

    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error("Error al obtener notificaciones del líder:", error);
    res.status(500).json({ success: false, message: "Error interno al obtener notificaciones" });
  }
});

// GET /api/dashboard/statuses
// Obtiene el catálogo de estados generales (para dropdowns de proyectos y actividades)
router.get('/statuses', async (req, res) => {
  try {
    if (!global.global_session.sessionExist(req)) {
      return res.status(401).json({ success: false, message: "Sesión expirada o inválida." });
    }
    const sql = global.global_db.getSentence('status', 'getAll');
    const rows = await global.global_db.exeQuery(sql);

    res.json({ success: true, statuses: rows });
  } catch (error) {
    console.error("Error al obtener catálogo de estados:", error);
    res.status(500).json({ success: false, message: "Error interno al obtener estados" });
  }
});

export default router;