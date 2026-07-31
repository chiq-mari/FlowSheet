// Componente de negocio para el objeto "Subsistema" del subsistema "Seguridad".
// CRUD sobre la tabla sub_system, que agrupa los Objetos/Opciones del árbol de permisos.
class Subsistema {
    // Admite búsqueda opcional por nombre.
    async getAll({ search = '' } = {}) {
        const sql = global.global_db.getSentence('subSystem', 'getAll');
        return await global.global_db.exeQuery(sql, [search || null]);
    }

    // Alta de un nuevo subsistema (botón "+").
    async create({ name } = {}) {
        this.validate({ name });

        try {
            const sql = global.global_db.getSentence('subSystem', 'create');
            const rows = await global.global_db.exeQuery(sql, [name.trim()]);
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Edición de un subsistema existente (icono lápiz).
    async update({ id, name } = {}) {
        if (!id) {
            throw new Error('Falta el identificador del subsistema a editar.');
        }
        this.validate({ name });

        try {
            const sql = global.global_db.getSentence('subSystem', 'update');
            const rows = await global.global_db.exeQuery(sql, [name.trim(), id]);

            if (rows.length === 0) {
                throw new Error('El subsistema indicado ya no existe.');
            }
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Baja de uno o varios subsistemas (icono papelera, soporta selección múltiple).
    async delete({ subSystemIds } = {}) {
        const ids = Array.isArray(subSystemIds) ? subSystemIds : [subSystemIds];

        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos un subsistema válido para eliminar.');
        }

        try {
            const sql = global.global_db.getSentence('subSystem', 'delete');
            await global.global_db.exeQuery(sql, [ids]);
            return { deletedCount: ids.length };
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Validación mínima de campos obligatorios, común a create/update.
    validate({ name }) {
        if (!name || !name.trim()) {
            throw new Error('El nombre del subsistema es obligatorio.');
        }
    }

    // Traduce errores de restricción de Postgres a mensajes legibles.
    translateDbError(error) {
        if (error.code === '23505') {
            return new Error('Ya existe un subsistema registrado con ese nombre.');
        }
        if (error.code === '23503') {
            return new Error('No se puede eliminar: hay objetos u opciones de menú que dependen de este subsistema.');
        }
        return error;
    }
}

export default Subsistema;
