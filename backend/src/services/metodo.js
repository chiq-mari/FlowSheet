// Componente de negocio para el objeto "Metodo" del subsistema "Seguridad".
// CRUD sobre la tabla method: cada fila es una acción concreta de un Objeto,
// invocada por reflexión desde Security.exeMethod (instanciaClase[method](...)).
class Metodo {
    // Admite filtro opcional por subsistema, por objeto y búsqueda opcional por nombre.
    async getAll({ subSystemId = null, objectId = null, search = '' } = {}) {
        const sql = global.global_db.getSentence('method', 'getAll');
        return await global.global_db.exeQuery(sql, [subSystemId || null, objectId || null, search || null]);
    }

    // Alta de un nuevo método (botón "+").
    async create({ methodDe, objectId } = {}) {
        this.validate({ methodDe, objectId });

        try {
            const sql = global.global_db.getSentence('method', 'create');
            const rows = await global.global_db.exeQuery(sql, [methodDe.trim(), objectId]);
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Edición de un método existente (icono lápiz).
    async update({ id, methodDe, objectId } = {}) {
        if (!id) {
            throw new Error('Falta el identificador del método a editar.');
        }
        this.validate({ methodDe, objectId });

        try {
            const sql = global.global_db.getSentence('method', 'update');
            const rows = await global.global_db.exeQuery(sql, [methodDe.trim(), objectId, id]);

            if (rows.length === 0) {
                throw new Error('El método indicado ya no existe.');
            }
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Baja de uno o varios métodos (icono papelera, soporta selección múltiple).
    async delete({ methodIds } = {}) {
        const ids = Array.isArray(methodIds) ? methodIds : [methodIds];

        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos un método válido para eliminar.');
        }

        try {
            const sql = global.global_db.getSentence('method', 'delete');
            await global.global_db.exeQuery(sql, [ids]);
            return { deletedCount: ids.length };
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Validación mínima de campos obligatorios, común a create/update.
    validate({ methodDe, objectId }) {
        if (!methodDe || !methodDe.trim()) {
            throw new Error('El nombre del método es obligatorio.');
        }
        if (!objectId) {
            throw new Error('Debe seleccionar un objeto.');
        }
    }

    // Traduce errores de restricción de Postgres a mensajes legibles.
    translateDbError(error) {
        if (error.code === '23505') {
            return new Error('Ya existe un método registrado con ese nombre para ese objeto.');
        }
        if (error.code === '23503') {
            return new Error('No se puede eliminar: hay permisos que dependen de este método.');
        }
        return error;
    }
}

export default Metodo;
