// Componente de negocio para el objeto "Proyecto" del subsistema "Hojas de Tiempo".
// Los nombres de los métodos coinciden exactamente con los de la tabla `method`
// para ser resueltos por reflexión.

class Proyecto {
  // Obtener todos los proyectos liderados por el usuario actual con agregación de conteos
  async getAllForLeader({ search = '' } = {}, userData) {
    if (!userData || !userData.user_id) {
      throw new Error('No se encontró información del usuario en sesión.');
    }
    const sql = global.global_db.getSentence('proyecto', 'getAllForLeader');
    return await global.global_db.exeQuery(sql, [userData.user_id, search || null]);
  }

  // Alta de nuevo proyecto. Asocia al creador automáticamente como Líder.
  async insertProyect({ name, statusId } = {}, userData) {
    if (!name || !statusId) {
      throw new Error('El nombre del proyecto y el estado son obligatorios.');
    }
    if (!userData || !userData.user_id) {
      throw new Error('Sesión de usuario no válida para crear proyectos.');
    }

    try {
      // 1. Insertamos el proyecto
      const sqlInsertProyect = global.global_db.getSentence('proyecto', 'insertProyect');
      const proyectRows = await global.global_db.exeQuery(sqlInsertProyect, [name, statusId]);
      const newProyect = proyectRows[0];
      const projectId = newProyect.id;

      // 2. Creamos el rol 'Lider' del proyecto para el creador
      const sqlInsertRole = global.global_db.getSentence('proyecto', 'insertDefaultRole');
      
      const liderRoleRows = await global.global_db.exeQuery(sqlInsertRole, [projectId, 'Lider']);
      const liderRoleId = liderRoleRows[0].id;

      // 3. Vinculamos al usuario actual con el rol 'Lider'
      const sqlInsertRoleUser = global.global_db.getSentence('proyecto', 'insertProyectRoleUser');
      await global.global_db.exeQuery(sqlInsertRoleUser, [liderRoleId, userData.user_id]);

      return newProyect;
    } catch (error) {
      throw this.translateDbError(error);
    }
  }

  // Edición del nombre y estado del proyecto
  async updateProyect({ projectId, name, statusId } = {}, userData) {
    if (!projectId || !name || !statusId) {
      throw new Error('ID de proyecto, nombre y estado son obligatorios.');
    }

    try {
      const sql = global.global_db.getSentence('proyecto', 'updateProyect');
      const rows = await global.global_db.exeQuery(sql, [name, statusId, projectId]);
      if (rows.length === 0) {
        throw new Error('El proyecto indicado ya no existe.');
      }
      return rows[0];
    } catch (error) {
      throw this.translateDbError(error);
    }
  }

  // Baja de un proyecto con limpieza en cascada controlada por código
  async deleteProyect({ projectId } = {}, userData) {
    if (!projectId) {
      throw new Error('Debe indicar el ID del proyecto a eliminar.');
    }

    try {
      // 1. Eliminar notificaciones asociadas
      const sqlDelNotifications = global.global_db.getSentence('proyecto', 'deleteNotificationsByProyect');
      await global.global_db.exeQuery(sqlDelNotifications, [projectId]);

      // 2. Eliminar asignaciones de tareas
      const sqlDelUserAssignments = global.global_db.getSentence('proyecto', 'deleteUserAssignmentsByProyect');
      await global.global_db.exeQuery(sqlDelUserAssignments, [projectId]);

      // 3. Eliminar vinculaciones de usuarios a roles de proyecto
      const sqlDelRoleUsers = global.global_db.getSentence('proyecto', 'deleteProyectRoleUsersByProyect');
      await global.global_db.exeQuery(sqlDelRoleUsers, [projectId]);

      // 4. Eliminar roles de proyecto
      const sqlDelRoles = global.global_db.getSentence('proyecto', 'deleteProyectRolesByProyect');
      await global.global_db.exeQuery(sqlDelRoles, [projectId]);

      // 5. Finalmente eliminar el proyecto
      const sqlDelProyect = global.global_db.getSentence('proyecto', 'deleteProyect');
      await global.global_db.exeQuery(sqlDelProyect, [projectId]);

      return { success: true, projectId };
    } catch (error) {
      throw this.translateDbError(error);
    }
  }

  // Traduce errores comunes de constraint de BD
  translateDbError(error) {
    if (error.code === '23505') {
      return new Error('Ya existe un proyecto registrado con ese nombre.');
    }
    return error;
  }
}

export default Proyecto;
