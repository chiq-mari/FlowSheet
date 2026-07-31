/**
 * Componente de negocio del Módulo Hojas de Tiempo - Gestión de Roles.
 * Se invoca exclusivamente por reflexión desde POST /toProcess, después de que
 * la aduana central (Security.getPermissionMethod) valida permission_method.
 *
 * sub_system: "Hojas de Tiempo"
 * object:     "Roles"
 * methods:    getAllForProject | insertRole | updateRole | deleteRoles
 */
class Roles {
    /**
     * Obtiene todos los roles registrados para un proyecto específico.
     */
    async getAllForProject(executionParams, userData) {
        const { projectId } = executionParams;
        if (!projectId) {
            throw new Error('El ID del proyecto es requerido.');
        }

        const sql = global.global_db.getSentence('business', 'getRolesForProject');
        const rows = await global.global_db.exeQuery(sql, [projectId]);
        return { roles: rows };
    }

    /**
     * Inserta un nuevo rol en el proyecto.
     */
    async insertRole(executionParams, userData) {
        const { projectId, name } = executionParams;
        if (!projectId || !name) {
            throw new Error('El proyecto y nombre del rol son campos obligatorios.');
        }

        const sql = global.global_db.getSentence('business', 'insertRole');
        const rows = await global.global_db.exeQuery(sql, [name, projectId]);
        if (rows.length === 0) {
            throw new Error('No se pudo crear el registro del rol.');
        }
        return rows[0];
    }

    /**
     * Modifica el nombre de un rol.
     */
    async updateRole(executionParams, userData) {
        const { roleId, name } = executionParams;
        if (!roleId || !name) {
            throw new Error('El ID del rol y el nuevo nombre son requeridos.');
        }

        const sql = global.global_db.getSentence('business', 'updateRole');
        const rows = await global.global_db.exeQuery(sql, [name, roleId]);
        if (rows.length === 0) {
            throw new Error('Rol no encontrado.');
        }
        return rows[0];
    }

    /**
     * Elimina uno o más roles de forma segura limpiando la cascada en la BD.
     */
    async deleteRoles(executionParams, userData) {
        const { roleIds } = executionParams;
        if (!Array.isArray(roleIds) || roleIds.length === 0) {
            throw new Error('Se debe especificar una lista de IDs de roles a eliminar.');
        }

        const sqlCleanNotifications = global.global_db.getSentence('business', 'deleteNotificationsByRole');
        const sqlCleanUserAssignments = global.global_db.getSentence('business', 'deleteUserAssignmentsByRole');
        const sqlCleanProyectRoleUsers = global.global_db.getSentence('business', 'deleteProyectRoleUsersByRole');
        const sqlDeleteRole = global.global_db.getSentence('business', 'deleteRole');

        for (const roleId of roleIds) {
            await global.global_db.exeQuery(sqlCleanNotifications, [roleId]);
            await global.global_db.exeQuery(sqlCleanUserAssignments, [roleId]);
            await global.global_db.exeQuery(sqlCleanProyectRoleUsers, [roleId]);
            await global.global_db.exeQuery(sqlDeleteRole, [roleId]);
        }

        return { success: true };
    }
}

export default Roles;
