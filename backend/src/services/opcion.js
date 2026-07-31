// Componente de negocio para el objeto "Opcion" del subsistema "Seguridad".
// CRUD sobre la tabla option (el árbol de menú). Las opciones creadas/editadas
// desde esta pantalla solo tocan option_de/sub_system_id; parent_option_id no
// se expone aquí, igual que en el mockup (quedan como raíces del subsistema).
class Opcion {
    // Admite filtro opcional por subsistema y búsqueda opcional por nombre.
    async getAll({ subSystemId = null, search = '' } = {}) {
        const sql = global.global_db.getSentence('option', 'getAll');
        return await global.global_db.exeQuery(sql, [subSystemId || null, search || null]);
    }

    // Alta de una nueva opción (botón "+"). parentOptionId es opcional (null = raíz).
    async create({ optionDe, subSystemId, parentOptionId = null } = {}) {
        this.validate({ optionDe, subSystemId });

        try {
            const sql = global.global_db.getSentence('option', 'create');
            const rows = await global.global_db.exeQuery(sql, [optionDe.trim(), subSystemId, parentOptionId || null]);
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Edición de una opción existente (icono lápiz).
    async update({ id, optionDe, subSystemId, parentOptionId = null } = {}) {
        if (!id) {
            throw new Error('Falta el identificador de la opción a editar.');
        }
        this.validate({ optionDe, subSystemId });

        if (parentOptionId && parentOptionId === id) {
            throw new Error('Una opción no puede ser su propia opción padre.');
        }

        if (parentOptionId) {
            const childrenSql = global.global_db.getSentence('option', 'countChildren');
            const childrenRows = await global.global_db.exeQuery(childrenSql, [id]);
            if ((childrenRows[0]?.count || 0) > 0) {
                throw new Error('Esta opción tiene sub-opciones propias; no puede asignársele una opción padre.');
            }
        }

        try {
            const sql = global.global_db.getSentence('option', 'update');
            const rows = await global.global_db.exeQuery(sql, [optionDe.trim(), subSystemId, parentOptionId || null, id]);

            if (rows.length === 0) {
                throw new Error('La opción indicada ya no existe.');
            }
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Baja de una o varias opciones (icono papelera, soporta selección múltiple).
    async delete({ optionIds } = {}) {
        const ids = Array.isArray(optionIds) ? optionIds : [optionIds];

        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos una opción válida para eliminar.');
        }

        try {
            const sql = global.global_db.getSentence('option', 'delete');
            await global.global_db.exeQuery(sql, [ids]);
            return { deletedCount: ids.length };
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Validación mínima de campos obligatorios, común a create/update.
    validate({ optionDe, subSystemId }) {
        if (!optionDe || !optionDe.trim()) {
            throw new Error('El nombre de la opción es obligatorio.');
        }
        if (!subSystemId) {
            throw new Error('Debe seleccionar un subsistema.');
        }
    }

    // Traduce errores de restricción de Postgres a mensajes legibles.
    translateDbError(error) {
        if (error.code === '23505') {
            return new Error('Ya existe una opción registrada con ese nombre en ese subsistema.');
        }
        if (error.code === '23503') {
            return new Error('No se puede eliminar: hay sub-opciones o permisos que dependen de esta opción.');
        }
        return error;
    }
}

export default Opcion;
