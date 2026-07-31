// Componente de negocio del objeto "Auditoria" del subsistema "Seguridad".
// Pantalla de solo lectura: nunca inserta filas en `audit` directamente --
// esas las genera DBComponent.exeQuery automáticamente en cada mutación real
// del sistema (ver backend/src/config/dbComponent.js). Este servicio solo
// consulta esa bitácora y da el catálogo de proyectos para el buscador.
const MAX_RANGE_DAYS = 31;

class Auditoria {
  // Grilla de auditoría. scope='proyecto' filtra por un proyecto puntual
  // (proyectId obligatorio); scope='global' muestra las acciones que no
  // pertenecen a ningún proyecto (Administrador: Permisos, Personas, Cargos...
  // -- filas con proyect_id NULL). El rango de fechas es opcional, pero si
  // vienen ambas, no puede superar 1 mes -- se valida acá además del frontend
  // porque /toProcess es un límite de confianza en sí mismo.
  async getAll({ scope, proyectId = null, fechaInicio = null, fechaFin = null } = {}) {
    if (scope === 'proyecto' && !proyectId) {
      throw new Error('Debe seleccionar un proyecto para ver su registro de auditoría.');
    }
    if (scope !== 'proyecto' && scope !== 'global') {
      throw new Error('Debe indicar un proyecto o elegir ver las acciones generales.');
    }

    if (fechaInicio && fechaFin) {
      const desde = new Date(fechaInicio);
      const hasta = new Date(fechaFin);
      const diffDays = (hasta - desde) / (1000 * 60 * 60 * 24);
      if (diffDays > MAX_RANGE_DAYS) {
        throw new Error('El rango de fechas no puede superar un mes.');
      }
      if (diffDays < 0) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha fin.');
      }
    }

    const effectiveProyectId = scope === 'global' ? null : proyectId;
    const sql = global.global_db.getSentence('auditoria', 'getAll');
    return await global.global_db.exeQuery(sql, [effectiveProyectId, fechaInicio || null, fechaFin || null]);
  }

  // Buscador dinámico de proyectos (searchbar del filtro).
  async buscarProyectos({ search = '' } = {}) {
    const sql = global.global_db.getSentence('auditoria', 'buscarProyectos');
    return await global.global_db.exeQuery(sql, [search || null]);
  }
}

export default Auditoria;
