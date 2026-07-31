// Componente de negocio para el objeto "Perfil" del subsistema "Seguridad".
// No es un CRUD sobre la tabla profile (los 3 perfiles son fijos); administra
// la relación N:M user_profile: resumen de conteos, la grilla usuario+perfiles,
// y asignar/quitar un perfil puntual a un usuario.
class Perfil {
    // Tarjetas de la pestaña "Ver Perfiles".
    async getResumen() {
        const sql = global.global_db.getSentence('perfil', 'getResumen');
        return await global.global_db.exeQuery(sql);
    }

    // Grilla de la pestaña "Ver Perfiles": usuarios con sus perfiles asignados.
    async getUsuarios() {
        const sql = global.global_db.getSentence('perfil', 'getUsuarios');
        return await global.global_db.exeQuery(sql);
    }

    // Pestaña "Asignar": perfiles ya asignados al usuario elegido en el buscador.
    async getPerfilesPorUsuario({ userId } = {}) {
        if (!userId) {
            throw new Error('Debe indicar un usuario.');
        }
        const sql = global.global_db.getSentence('perfil', 'getPerfilesPorUsuario');
        return await global.global_db.exeQuery(sql, [userId]);
    }

    // Agrega un perfil al usuario (botón "+" de la pestaña Asignar).
    async asignarPerfil({ userId, profileId } = {}) {
        if (!userId || !profileId) {
            throw new Error('Debe indicar un usuario y un perfil.');
        }

        const sql = global.global_db.getSentence('perfil', 'asignarPerfil');
        await global.global_db.exeQuery(sql, [userId, profileId]);
        return { userId, profileId };
    }

    // Quita un perfil del usuario (botón "Quitar" de la pestaña Asignar).
    async quitarPerfil({ userId, profileId } = {}) {
        if (!userId || !profileId) {
            throw new Error('Debe indicar un usuario y un perfil.');
        }

        const sql = global.global_db.getSentence('perfil', 'quitarPerfil');
        await global.global_db.exeQuery(sql, [userId, profileId]);
        return { userId, profileId };
    }
}

export default Perfil;
