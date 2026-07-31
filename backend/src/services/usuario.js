// Componente de negocio para el objeto "Usuario" del subsistema "Seguridad".
// Cada método público corresponde a un registro en la tabla `method` (ligado
// al `object` "Usuario") e invocable únicamente por reflexión desde
// Security.exeMethod si el perfil activo tiene el permiso correspondiente.
class Usuario {
    // Lista de usuarios para la tabla principal, con los datos de su Persona vinculada.
    // Admite búsqueda opcional por username o por nombre/apellido/CI de la persona.
    async getAll({ search = '' } = {}) {
        const sql = global.global_db.getSentence('usuario', 'getAll');
        return await global.global_db.exeQuery(sql, [search || null]);
    }

    // Catálogo de estados (Activo/Inactivo) para el <select> del formulario.
    async getEstados() {
        const sql = global.global_db.getSentence('usuario', 'getEstados');
        return await global.global_db.exeQuery(sql);
    }

    // Alta de un nuevo usuario (botón "+").
    async create({ userNa, userPw, userEmail, statusUserId, personId } = {}) {
        this.validate({ userNa, userPw, userEmail, statusUserId, personId });

        try {
            const sql = global.global_db.getSentence('usuario', 'create');
            const rows = await global.global_db.exeQuery(sql, [userNa, userPw, userEmail, statusUserId, personId]);
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Edición de un usuario existente (icono lápiz).
    async update({ userId, userNa, userPw, userEmail, statusUserId, personId } = {}) {
        if (!userId) {
            throw new Error('Falta el identificador del usuario a editar.');
        }
        this.validate({ userNa, userPw, userEmail, statusUserId, personId });

        try {
            const sql = global.global_db.getSentence('usuario', 'update');
            const rows = await global.global_db.exeQuery(sql, [userNa, userPw, userEmail, statusUserId, personId, userId]);

            if (rows.length === 0) {
                throw new Error('El usuario indicado ya no existe.');
            }
            return rows[0];
        } catch (error) {
            throw this.translateDbError(error);
        }
    }

    // Baja de uno o varios usuarios (icono papelera, soporta selección múltiple).
    async delete({ userIds } = {}) {
        const ids = Array.isArray(userIds) ? userIds : [userIds];

        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos un usuario válido para eliminar.');
        }

        const sql = global.global_db.getSentence('usuario', 'delete');
        await global.global_db.exeQuery(sql, [ids]);
        return { deletedCount: ids.length };
    }

    // Validación mínima de campos obligatorios y formato de correo, común a create/update.
    validate({ userNa, userPw, userEmail, statusUserId, personId }) {
        if (!userNa || !userPw || !userEmail || !statusUserId || !personId) {
            throw new Error('Todos los campos (Username, Password, Correo, Status y Persona) son obligatorios.');
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(userEmail)) {
            throw new Error('El correo electrónico no tiene un formato válido.');
        }
    }

    // Traduce errores de restricción de Postgres (ej. username/correo duplicados) a mensajes legibles.
    translateDbError(error) {
        if (error.code === '23505') {
            return new Error('Ya existe un usuario registrado con ese username o ese correo.');
        }
        return error;
    }
}

export default Usuario;
