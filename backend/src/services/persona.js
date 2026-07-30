// Componente de negocio para el objeto "Persona" del subsistema "Seguridad".
// Cada método público de esta clase corresponde a un registro en la tabla `method`
// (ligado a un `object` "Persona") y puede ser invocado únicamente por reflexión
// desde Security.exeMethod si el perfil activo tiene el permiso correspondiente.
class Persona {
    // Lista de personas para la tabla principal. Admite búsqueda opcional por nombre/apellido/CI.
    async getAll({ search = '' } = {}) {
        const sql = global.global_db.getSentence('person', 'getAll');
        return await global.global_db.exeQuery(sql, [search || null]);
    }

    // Recupera una persona puntual (útil para precargar el modal de edición).
    async getById({ personId } = {}) {
        if (!personId) {
            throw new Error('Falta el identificador de la persona a consultar.');
        }
        const sql = global.global_db.getSentence('person', 'getById');
        const rows = await global.global_db.exeQuery(sql, [personId]);
        return rows[0] || null;
    }

    // Alta de una nueva persona (botón "+").
    async create({ personCi, personNa, personLn, personEmail, chargeId } = {}) {
        this.validate({ personCi, personNa, personLn, personEmail, chargeId });

        try {
            const sql = global.global_db.getSentence('person', 'create');
            const rows = await global.global_db.exeQuery(sql, [personCi, personNa, personLn, personEmail, chargeId]);
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Edición de una persona existente (icono lápiz).
    async update({ personId, personCi, personNa, personLn, personEmail, chargeId } = {}) {
        if (!personId) {
            throw new Error('Falta el identificador de la persona a editar.');
        }
        this.validate({ personCi, personNa, personLn, personEmail, chargeId });

        try {
            const sql = global.global_db.getSentence('person', 'update');
            const rows = await global.global_db.exeQuery(sql, [personCi, personNa, personLn, personEmail, chargeId, personId]);

            if (rows.length === 0) {
                throw new Error('La persona indicada ya no existe.');
            }
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Baja de una o varias personas (icono papelera, soporta selección múltiple).
    async delete({ personIds } = {}) {
        const ids = Array.isArray(personIds) ? personIds : [personIds];

        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos una persona válida para eliminar.');
        }

        const sql = global.global_db.getSentence('person', 'delete');
        await global.global_db.exeQuery(sql, [ids]);
        return { deletedCount: ids.length };
    }

    // Validación mínima de campos obligatorios y formato de correo, común a create/update.
    validate({ personCi, personNa, personLn, personEmail, chargeId }) {
        if (!personCi || !personNa || !personLn || !personEmail || !chargeId) {
            throw new Error('Todos los campos (Cédula, Nombre, Apellido, Correo y Cargo) son obligatorios.');
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(personEmail)) {
            throw new Error('El correo electrónico no tiene un formato válido.');
        }
    }

    // Traduce errores de restricción de Postgres (ej. cédula/correo duplicados) a mensajes legibles.
    translateDbError(error) {
        if (error.code === '23505') {
            return new Error('Ya existe una persona registrada con esa cédula o ese correo.');
        }
        return error;
    }
}

export default Persona;
