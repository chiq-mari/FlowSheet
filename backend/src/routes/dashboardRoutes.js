import { Router } from 'express';

const router = Router();

// GET /api/dashboard/subsystems/:profileId
// Obtiene la lista de subsistemas permitidos para el perfil especificado
router.get('/subsystems/:profileId', async (req, res) => {
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

export default router;