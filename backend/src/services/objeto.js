// Componente de negocio para el objeto "Objeto" del subsistema "Seguridad".
// CRUD sobre la tabla object: cada fila es una clase registrada para reflexión
// (Security.exeMethod la resuelve importando ./${object_de.toLowerCase()}.js).
class Objeto {
    // Admite filtro opcional por subsistema y búsqueda opcional por nombre.
    async getAll({ subSystemId = null, search = '' } = {}) {
        const sql = global.global_db.getSentence('object', 'getAll');
        return await global.global_db.exeQuery(sql, [subSystemId || null, search || null]);
    }

    // Alta de un nuevo objeto (botón "+").
    async create({ objectDe, subSystemId } = {}) {
        this.validate({ objectDe, subSystemId });

        try {
            const sql = global.global_db.getSentence('object', 'create');
            const rows = await global.global_db.exeQuery(sql, [objectDe.trim(), subSystemId]);
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Edición de un objeto existente (icono lápiz).
    async update({ id, objectDe, subSystemId } = {}) {
        if (!id) {
            throw new Error('Falta el identificador del objeto a editar.');
        }
        this.validate({ objectDe, subSystemId });

        try {
            const sql = global.global_db.getSentence('object', 'update');
            const rows = await global.global_db.exeQuery(sql, [objectDe.trim(), subSystemId, id]);

            if (rows.length === 0) {
                throw new Error('El objeto indicado ya no existe.');
            }
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Baja de uno o varios objetos (icono papelera, soporta selección múltiple).
    async delete({ objectIds } = {}) {
        const ids = Array.isArray(objectIds) ? objectIds : [objectIds];

        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos un objeto válido para eliminar.');
        }

        try {
            const sql = global.global_db.getSentence('object', 'delete');
            await global.global_db.exeQuery(sql, [ids]);
            return { deletedCount: ids.length };
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Validación mínima de campos obligatorios, común a create/update.
    validate({ objectDe, subSystemId }) {
        if (!objectDe || !objectDe.trim()) {
            throw new Error('El nombre del objeto es obligatorio.');
        }
        if (!subSystemId) {
            throw new Error('Debe seleccionar un subsistema.');
        }
    }

    // Traduce errores de restricción de Postgres a mensajes legibles.
    translateDbError(error) {
        if (error.code === '23505') {
            return new Error('Ya existe un objeto registrado con ese nombre en ese subsistema.');
        }
        if (error.code === '23503') {
            return new Error('No se puede eliminar: hay métodos o permisos que dependen de este objeto.');
        }
        return error;
    }
}

export default Objeto;
