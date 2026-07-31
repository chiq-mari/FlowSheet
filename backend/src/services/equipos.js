/**
 * Componente de negocio del Módulo Hojas de Tiempo - Gestión de Equipos de Trabajo (Integrantes).
 * Se invoca exclusivamente por reflexión desde POST /toProcess, después de que
 * la aduana central (Security.getPermissionMethod) valida permission_method.
 *
 * sub_system: "Hojas de Tiempo"
 * object:     "Equipos"
 * methods:    getAllForProject | getAvailableUsers | insertMember | updateMember | deleteMembers
 */
class Equipos {
    /**
     * Obtiene todos los integrantes actuales de un proyecto.
     */
    async getAllForProject(executionParams, userData) {
        const { projectId } = executionParams;
        if (!projectId) {
            throw new Error('El ID del proyecto es requerido.');
        }

        const sql = global.global_db.getSentence('business', 'getTeamMembers');
        const rows = await global.global_db.exeQuery(sql, [projectId]);
        return { members: rows };
    }

    /**
     * Obtiene los usuarios del sistema que NO pertenecen a este proyecto.
     */
    async getAvailableUsers(executionParams, userData) {
        const { projectId } = executionParams;
        if (!projectId) {
            throw new Error('El ID del proyecto es requerido.');
        }

        const sql = global.global_db.getSentence('business', 'getAvailableUsers');
        const rows = await global.global_db.exeQuery(sql, [projectId]);
        return { users: rows };
    }

    /**
     * Añade un nuevo miembro al proyecto vinculándolo a un rol.
     */
    async insertMember(executionParams, userData) {
        const { proyectRoleId, userId } = executionParams;
        if (!proyectRoleId || !userId) {
            throw new Error('El rol de proyecto y usuario son obligatorios.');
        }

        const sql = global.global_db.getSentence('business', 'insertTeamMember');
        const rows = await global.global_db.exeQuery(sql, [proyectRoleId, userId]);
        if (rows.length === 0) {
            throw new Error('No se pudo añadir al miembro del equipo.');
        }
        return rows[0];
    }

    /**
     * Modifica el rol de un miembro del equipo.
     */
    async updateMember(executionParams, userData) {
        const { proyectRoleUserId, proyectRoleId } = executionParams;
        if (!proyectRoleUserId || !proyectRoleId) {
            throw new Error('ID de integrante y nuevo rol de proyecto son campos obligatorios.');
        }

        const sql = global.global_db.getSentence('business', 'updateTeamMember');
        const rows = await global.global_db.exeQuery(sql, [proyectRoleId, proyectRoleUserId]);
        if (rows.length === 0) {
            throw new Error('Integrante no encontrado.');
        }
        return rows[0];
    }

    /**
     * Elimina a uno o más integrantes del proyecto con su limpieza transaccional.
     */
    async deleteMembers(executionParams, userData) {
        const { memberIds } = executionParams;
        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            throw new Error('Se debe especificar una lista de integrantes a remover.');
        }

        const sqlCleanNotif = global.global_db.getSentence('business', 'deleteNotificationsByTeamMember');
        const sqlCleanAssign = global.global_db.getSentence('business', 'deleteUserAssignmentsByTeamMember');
        const sqlDeleteMember = global.global_db.getSentence('business', 'deleteTeamMember');

        for (const memberId of memberIds) {
            await global.global_db.exeQuery(sqlCleanNotif, [memberId]);
            await global.global_db.exeQuery(sqlCleanAssign, [memberId]);
            await global.global_db.exeQuery(sqlDeleteMember, [memberId]);
        }

        return { success: true };
    }
}

export default Equipos;
