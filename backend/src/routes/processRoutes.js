import { Router } from 'express';
import { runWithUser } from '../utils/auditContext.js';

const router = Router();

// POST /toProcess
// Punto único de entrada para todas las transacciones protegidas por permisos:
// - targetType 'method' -> ejecuta por reflexión un método de negocio (CRUD, etc.)
// - targetType 'menu'   -> valida únicamente el acceso de visualización a una opción de menú
router.post('/toProcess', async (req, res) => {
    // ¿tiene_sesion?
    if (!global.global_session.sessionExist(req)) {
        return res.status(401).json({
            status: "Error",
            message: "Debe hacer sesión para ejecutar transacciones."
        });
    }

    // 1. Extraemos SOLO el tipo de objetivo primero para decidir el camino
    const { targetType } = req.body; //method or menu
    const userData = global.global_session.getDataSession(req);
    const profileId = req.session.activeProfileId || userData.user_profiles?.[0]?.profile_id;

    try {
        // ================================================================
        // BIFURCACIÓN DE FLUJO: MÉTODOS VS MENÚS
        // ================================================================

        if (targetType === 'method') {
            // 2. Extraemos ÚNICAMENTE lo necesario para ejecutar código por reflexión
            const { subSystem, object, method, executionParams = {} } = req.body;  //pone exeParams default

            // 🔍 1. VALIDACIÓN DEL PERMISO DE MÉTODO EN LA ADUANA CENTRAL
            const tienePermisoMetodo = global.global_security.getPermissionMethod(
                subSystem,
                object,
                method,
                profileId
            );

            if (!tienePermisoMetodo) {
                return res.status(403).json({
                    status: "Acceso Denegado",
                    message: `El perfil [${profileId}] no tiene permisos para ejecutar [${method}] en [${subSystem}/${object}].`
                });
            }

            // 🚀 2. SI TIENE PERMISO, EJECUTAMOS POR REFLEXIÓN
            // InyectamosuserData para dar trazabilidad a la lógica de negocio.
            // runWithUser deja el user_id disponible para DBComponent.exeQuery
            // durante toda esta ejecución, sin tener que reenviarlo a mano por
            // cada clase de servicio -- así toda mutación real queda auditada sola.
            const resultadoEjecucion = await runWithUser(userData.user_id, () =>
                global.global_security.exeMethod(
                    subSystem,
                    object,
                    method,
                    executionParams,
                    userData
                )
            );

            return res.json({
                status: "Éxito",
                type: "method_execution",
                message: `Transacción aprobada y ejecutada en [${subSystem}/${object}].`,
                data: resultadoEjecucion
            });

        } else if (targetType === 'menu') {
            // 3. Extraemos ÚNICAMENTE lo necesario para validar accesos visuales
            const { subSystem, menu } = req.body;

            const tieneAccesoMenu = global.global_security.getPermissionMenu(subSystem, menu, profileId);

            if (!tieneAccesoMenu) {
                return res.status(403).json({
                    status: "Acceso Denegado",
                    message: `El perfil ${profileId} no tiene permisos para visualizar el menú [${menu}].`
                });
            }

            return res.json({
                status: "Éxito",
                type: "menu_render",
                message: `Acceso concedido para la opción de menú: [${menu}].`
            });

        } else {
            return res.status(400).json({ status: "Error", message: "targetType inválido." });
        }

    } catch (error) {
        return res.status(403).json({
            status: "Acceso Denegado",
            message: error.message
        });
    }
});

export default router;
