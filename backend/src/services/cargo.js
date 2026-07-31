// Componente de negocio para el objeto "Cargo" del subsistema "Seguridad".
// Sirve como catálogo de lectura para el <select> de Cargo en los modales de
// Persona (getAll sin término de búsqueda), y también como CRUD completo
// para su propia pantalla de Mantenimiento de Cargos.
class Cargo {
    // Admite búsqueda opcional; sin término, devuelve todo el catálogo (uso del combobox).
    async getAll({ search = '' } = {}) {
        const sql = global.global_db.getSentence('charge', 'getAll');
        return await global.global_db.exeQuery(sql, [search || null]);
    }

    // Alta de un nuevo cargo (botón "+").
    async create({ name } = {}) {
        this.validate({ name });

        try {
            const sql = global.global_db.getSentence('charge', 'create');
            const rows = await global.global_db.exeQuery(sql, [name.trim()]);
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Edición de un cargo existente (icono lápiz).
    async update({ id, name } = {}) {
        if (!id) {
            throw new Error('Falta el identificador del cargo a editar.');
        }
        this.validate({ name });

        try {
            const sql = global.global_db.getSentence('charge', 'update');
            const rows = await global.global_db.exeQuery(sql, [name.trim(), id]);

            if (rows.length === 0) {
                throw new Error('El cargo indicado ya no existe.');
            }
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Baja de uno o varios cargos (icono papelera, soporta selección múltiple).
    async delete({ chargeIds } = {}) {
        const ids = Array.isArray(chargeIds) ? chargeIds : [chargeIds];

        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos un cargo válido para eliminar.');
        }

        const sql = global.global_db.getSentence('charge', 'delete');
        await global.global_db.exeQuery(sql, [ids]);
        return { deletedCount: ids.length };
    }

    // Validación mínima de campos obligatorios, común a create/update.
    validate({ name }) {
        if (!name || !name.trim()) {
            throw new Error('El nombre del cargo es obligatorio.');
        }
    }

    // Traduce errores de restricción de Postgres (ej. nombre duplicado) a mensajes legibles.
    translateDbError(error) {
        if (error.code === '23505') {
            return new Error('Ya existe un cargo registrado con ese nombre.');
        }
        return error;
    }
}

export default Cargo;
