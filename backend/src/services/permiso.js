// Componente de negocio para el objeto "Permiso" del subsistema "Seguridad".
// No administra Perfiles/Opciones/Métodos (cada uno ya tiene su propia pantalla);
// administra permission_option y permission_method: qué perfil puede ver qué
// opción de menú o ejecutar qué método.
class Permiso {
    // Tarjetas resumen (conteo de ambos tipos de permiso, por perfil).
    async getResumen() {
        const sql = global.global_db.getSentence('permiso', 'getResumen');
        return await global.global_db.exeQuery(sql);
    }

    // Grilla de la pestaña "Opciones". Admite filtro opcional por perfil.
    async getOpciones({ profileId = null } = {}) {
        const sql = global.global_db.getSentence('permiso', 'getOpciones');
        return await global.global_db.exeQuery(sql, [profileId || null]);
    }

    // Grilla de la pestaña "Métodos". Admite filtro opcional por perfil.
    async getMetodos({ profileId = null } = {}) {
        const sql = global.global_db.getSentence('permiso', 'getMetodos');
        return await global.global_db.exeQuery(sql, [profileId || null]);
    }

    // Otorga a un perfil el permiso de ver una opción de menú.
    // profileDe/optionDe son opcionales: el frontend ya los muestra en el picker
    // antes de enviar el alta, así que se aprovechan acá solo para armar una
    // descripción de auditoría legible, sin tener que hacer un join extra.
    async asignarOpcion({ profileId, optionId, profileDe, optionDe } = {}) {
        if (!profileId || !optionId) {
            throw new Error('Debe indicar un perfil y una opción.');
        }
        const sql = global.global_db.getSentence('permiso', 'asignarOpcion');
        const descripcion = profileDe && optionDe
            ? `Se otorgó permiso de menú "${optionDe}" al perfil "${profileDe}"`
            : undefined;
        const rows = await global.global_db.exeQuery(sql, [profileId, optionId], { description: descripcion });

        // La "aduana" (Security.getPermissionMenu, usada por /toProcess) valida contra un
        // mapa en memoria que solo se cargó una vez al arrancar el servidor. Sin este
        // reload, otorgar/quitar un permiso aquí cambia la BD pero no tiene ningún efecto
        // real en la aplicación hasta reiniciar el servidor.
        await global.global_security.loadPermissionMenu();

        return rows[0] || { profileId, optionId };
    }

    // Quita uno o varios permisos de opción (selección múltiple, icono papelera).
    async quitarOpciones({ permissionOptionIds } = {}) {
        const ids = Array.isArray(permissionOptionIds) ? permissionOptionIds : [permissionOptionIds];
        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos un permiso válido para eliminar.');
        }
        const sql = global.global_db.getSentence('permiso', 'quitarOpciones');
        const descripcion = `Se ${ids.length === 1 ? 'eliminó' : 'eliminaron'} ${ids.length} permiso(s) de opción de menú`;
        await global.global_db.exeQuery(sql, [ids], { description: descripcion });

        await global.global_security.loadPermissionMenu();

        return { deletedCount: ids.length };
    }

    // Otorga a un perfil el permiso de ejecutar un método.
    async asignarMetodo({ profileId, methodId, profileDe, methodDe } = {}) {
        if (!profileId || !methodId) {
            throw new Error('Debe indicar un perfil y un método.');
        }
        const sql = global.global_db.getSentence('permiso', 'asignarMetodo');
        const descripcion = profileDe && methodDe
            ? `Se otorgó permiso de método "${methodDe}" al perfil "${profileDe}"`
            : undefined;
        const rows = await global.global_db.exeQuery(sql, [profileId, methodId], { description: descripcion });

        await global.global_security.loadPermissionMethod();

        return rows[0] || { profileId, methodId };
    }

    // Quita uno o varios permisos de método (selección múltiple, icono papelera).
    async quitarMetodos({ permissionMethodIds } = {}) {
        const ids = Array.isArray(permissionMethodIds) ? permissionMethodIds : [permissionMethodIds];
        if (ids.length === 0 || ids.some((id) => !id)) {
            throw new Error('Debe indicar al menos un permiso válido para eliminar.');
        }
        const sql = global.global_db.getSentence('permiso', 'quitarMetodos');
        const descripcion = `Se ${ids.length === 1 ? 'eliminó' : 'eliminaron'} ${ids.length} permiso(s) de método`;
        await global.global_db.exeQuery(sql, [ids], { description: descripcion });

        await global.global_security.loadPermissionMethod();

        return { deletedCount: ids.length };
    }
}

export default Permiso;
