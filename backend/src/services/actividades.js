// backend/src/services/actividades.js

/**
 * Componente de negocio del Módulo Miembro (Hojas de Tiempo).
 * Se invoca exclusivamente por reflexión desde POST /toProcess, después de que
 * la aduana central (Security.getPermissionMethod) valida permission_method.
 *
 * sub_system: "Hojas de Tiempo"
 * object:     "Actividades"
 * methods:    consultarAsignaciones | consultarNotificaciones | registrarAvance
 */
class Actividades {
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
}

export default Actividades;
