/**
 * Componente de negocio del Módulo Miembro (Hojas de Tiempo) y Líder.
 * Se invoca exclusivamente por reflexión desde POST /toProcess, después de que
 * la aduana central (Security.getPermissionMethod) valida permission_method.
 *
 * sub_system: "Hojas de Tiempo"
 * object:     "Actividades"
 * methods:    consultarAsignaciones | consultarNotificaciones | registrarAvance |
 *             getAllForProject | insertActivity | updateActivity | deleteActivities |
 *             getTeamMembers | assignMember | unassignMember
 */
class Actividades {
    // =========================================================================
    // MÉTODOS DEL MIEMBRO (Mantenidos sin modificaciones del compañero)
    // =========================================================================

    /**
     * Actividades (assignments) asignadas al usuario autenticado.
     */
    async consultarAsignaciones(executionParams, userData) {
        const sql = global.global_db.getSentence('business', 'getMemberAssignments');
        const rows = await global.global_db.exeQuery(sql, [userData.user_id]);
        return { assignments: rows };
    }

    /**
     * Hoja de tiempo (histórico de notificaciones de avance) del usuario autenticado.
     */
    async consultarNotificaciones(executionParams, userData) {
        const sql = global.global_db.getSentence('business', 'getMemberNotifications');
        const rows = await global.global_db.exeQuery(sql, [userData.user_id]);
        return { notifications: rows };
    }

    /**
     * Registra un nuevo avance (notificación) sobre una actividad asignada al usuario autenticado.
     */
    async registrarAvance(executionParams, userData) {
        const {
            user_assignment_id,
            date,
            notification_time,
            progress_percentage,
            total_hours_spent,
            observation
        } = executionParams;

        if (!user_assignment_id || !date || !notification_time || progress_percentage === undefined || total_hours_spent === undefined) {
            throw new Error('Faltan campos obligatorios para registrar el avance.');
        }

        // 🔍 Verificamos que la asignación pertenezca realmente al usuario autenticado
        // (protege contra IDOR: un miembro no puede notificar avances de otro)
        const ownershipSql = global.global_db.getSentence('business', 'checkAssignmentOwnership');
        const ownershipRows = await global.global_db.exeQuery(ownershipSql, [user_assignment_id, userData.user_id]);

        if (ownershipRows.length === 0) {
            throw new Error('Esta actividad no está asignada a su usuario.');
        }

        const insertSql = global.global_db.getSentence('business', 'insertNotification');
        const inserted = await global.global_db.exeQuery(insertSql, [
            user_assignment_id,
            date,
            progress_percentage,
            observation || null,
            notification_time,
            total_hours_spent
        ]);

        return { notification: inserted[0] };
    }

    // =========================================================================
    // MÉTODOS DEL LÍDER (Añadidos para la gestión de actividades)
    // =========================================================================

    /**
     * Obtiene el listado de actividades y todas sus asignaciones para un proyecto específico.
     */
    async getAllForProject(executionParams, userData) {
        const { projectId } = executionParams;
        if (!projectId) {
            throw new Error('El ID del proyecto es requerido.');
        }

        const sqlActivities = global.global_db.getSentence('business', 'getAllForProject');
        const sqlAssignments = global.global_db.getSentence('business', 'getAllAssignmentsForProject');

        const [activities, assignments] = await Promise.all([
            global.global_db.exeQuery(sqlActivities, [projectId]),
            global.global_db.exeQuery(sqlAssignments, [projectId])
        ]);

        return { activities, assignments };
    }

    /**
     * Inserta una nueva actividad (assignment) en el proyecto.
     * Dado que la BD vincula actividades a proyectos solo a través de user_assignment,
     * asociamos inicialmente la actividad al rol del Líder creador (o el primer miembro disponible) en el proyecto.
     */
    async insertActivity(executionParams, userData) {
        const { projectId, name, statusId } = executionParams;
        if (!projectId || !name || !statusId) {
            throw new Error('El proyecto, nombre de actividad y estado son campos obligatorios.');
        }

        // 1. Insertar actividad en la tabla assignment
        const insertActSql = global.global_db.getSentence('business', 'insertActivity');
        const actRows = await global.global_db.exeQuery(insertActSql, [name, statusId]);
        if (actRows.length === 0) {
            throw new Error('No se pudo crear el registro de la actividad.');
        }
        const newActivity = actRows[0];

        // 2. Buscar el proyect_role_user_id del líder actual para vincularlo al proyecto
        const getLeaderSql = global.global_db.getSentence('business', 'getLeaderRoleUser');
        let roleUserRows = await global.global_db.exeQuery(getLeaderSql, [projectId, userData.user_id]);

        // Si el líder no está explícitamente asignado, tomamos la primera asignación de rol disponible en el proyecto
        if (roleUserRows.length === 0) {
            const getFirstSql = global.global_db.getSentence('business', 'getFirstRoleUser');
            roleUserRows = await global.global_db.exeQuery(getFirstSql, [projectId]);
        }

        if (roleUserRows.length === 0) {
            throw new Error('No se puede crear una actividad en un proyecto que no tiene miembros asignados.');
        }

        const pruId = roleUserRows[0].id;

        // 3. Crear el vínculo en user_assignment
        const insertLinkSql = global.global_db.getSentence('business', 'insertUserAssignment');
        await global.global_db.exeQuery(insertLinkSql, [pruId, newActivity.id]);

        return newActivity;
    }

    /**
     * Modifica el nombre y estado de una actividad.
     */
    async updateActivity(executionParams, userData) {
        const { activityId, name, statusId } = executionParams;
        if (!activityId || !name) {
            throw new Error('El ID de actividad y nombre son campos obligatorios.');
        }

        let finalStatusId = statusId;
        if (!finalStatusId) {
            const currentAct = await global.global_db.exeQuery('SELECT status_id FROM public.assignment WHERE id = $1', [activityId]);
            if (currentAct.length > 0) {
                finalStatusId = currentAct[0].status_id;
            } else {
                finalStatusId = 'a666746d-1ebe-491c-acfc-e8fdcabaf958'; // default fallback
            }
        }

        const sql = global.global_db.getSentence('business', 'updateActivity');
        const rows = await global.global_db.exeQuery(sql, [name, finalStatusId, activityId]);
        if (rows.length === 0) {
            throw new Error('Actividad no encontrada.');
        }
        return rows[0];
    }

    /**
     * Elimina una o más actividades y limpia en cascada las tablas asociadas.
     */
    async deleteActivities(executionParams, userData) {
        const { activityIds } = executionParams;
        if (!Array.isArray(activityIds) || activityIds.length === 0) {
            throw new Error('Se debe especificar una lista de IDs de actividades a eliminar.');
        }

        const sqlDeleteNotifications = global.global_db.getSentence('business', 'deleteNotificationsByActivity');
        const sqlDeleteUserAssignments = global.global_db.getSentence('business', 'deleteUserAssignmentsByActivity');
        const sqlDeleteActivity = global.global_db.getSentence('business', 'deleteActivity');

        for (const activityId of activityIds) {
            await global.global_db.exeQuery(sqlDeleteNotifications, [activityId]);
            await global.global_db.exeQuery(sqlDeleteUserAssignments, [activityId]);
            await global.global_db.exeQuery(sqlDeleteActivity, [activityId]);
        }

        return { success: true };
    }

    /**
     * Lista los miembros de equipo disponibles en el proyecto para ser asignados.
     */
    async getTeamMembers(executionParams, userData) {
        const { projectId } = executionParams;
        if (!projectId) {
            throw new Error('El ID del proyecto es requerido.');
        }

        const sql = global.global_db.getSentence('business', 'getTeamMembers');
        const rows = await global.global_db.exeQuery(sql, [projectId]);
        return { members: rows };
    }

    /**
     * Asigna un miembro (proyect_role_user) a una actividad (assignment).
     */
    async assignMember(executionParams, userData) {
        const { activityId, proyectRoleUserId } = executionParams;
        if (!activityId || !proyectRoleUserId) {
            throw new Error('El ID de actividad y de rol de usuario en proyecto son requeridos.');
        }

        // Verificamos si ya existe la asignación para evitar duplicados
        const checkSql = global.global_db.getSentence('business', 'checkUserAssignmentExists');
        const checkRows = await global.global_db.exeQuery(checkSql, [proyectRoleUserId, activityId]);
        if (checkRows.length > 0) {
            throw new Error('Este miembro ya se encuentra asignado a esta actividad.');
        }

        const sql = global.global_db.getSentence('business', 'insertUserAssignment');
        const rows = await global.global_db.exeQuery(sql, [proyectRoleUserId, activityId]);
        return { success: true, userAssignmentId: rows[0]?.id };
    }

    /**
     * Remueve la asignación de un miembro en una actividad.
     */
    async unassignMember(executionParams, userData) {
        const { userAssignmentId } = executionParams;
        if (!userAssignmentId) {
            throw new Error('El ID de asignación (user_assignment_id) es requerido.');
        }

        // 1. Limpiar notificaciones de avance para esta asignación específica
        const cleanNotifSql = global.global_db.getSentence('business', 'deleteNotificationsByUserAssignment');
        await global.global_db.exeQuery(cleanNotifSql, [userAssignmentId]);

        // 2. Eliminar la asignación de usuario
        const sql = global.global_db.getSentence('business', 'deleteUserAssignment');
        await global.global_db.exeQuery(sql, [userAssignmentId]);

        return { success: true };
    }
}

export default Actividades;
