class Security {
    constructor() {
        // Los mapas creados como atributos de la clase
        this.permissionMethodMap = new Map();
        this.permissionMenuMap = new Map(); // El segundo mapa que se ve en la pizarra

        // Mapas de integridad: confirman que el objeto/método invocado por reflexión
        // realmente está dado de alta en la BD (tablas `object` y `method`), independiente
        // de si el perfil tiene o no el permiso (eso lo valida permissionMethodMap).
        this.objectMap = new Map();
        this.methodMap = new Map();

        // Caché perezoso de clases ya resueltas por reflexión: object_de -> Clase.
        // Se llena solo la primera vez que se invoca cada objeto (no al arrancar,
        // para no depender de que todos los objetos de la BD ya tengan su archivo
        // .js escrito). Después de eso, exeMethod ya no vuelve a hacer import(),
        // solo lee de este mapa.
        this.classCache = new Map();

        // En celeste: Se ejecutan los métodos de carga inmediatamente al instanciar
        this.loadPermissionMethod();
        this.loadPermissionMenu();
        this.loadObjectMap();
        this.loadMethodMap();
    }


    /**
     * Carga todos los permisos de métodos desde la BD a la caché en memoria.
     * Estructura de la Llave: sub_system_de + object_de + method_de + profile_id
     */
    async loadPermissionMethod() {
        try {
            const sql = global.global_db.getSentence('security', 'getAllMethodPermissions');
            const rows = await global.global_db.exeQuery(sql);

            // Limpiamos la caché vieja antes de recargar
            this.permissionMethodMap.clear();

            rows.forEach(row => {
                // Creamos el String clave unificado que sugirió el profesor
                const key = `${row.sub_system_de}_`+`${row.object_de}_`+`${row.method_de}_`+`${row.profile_id}`;
                this.permissionMethodMap.set(key, true);
            });

            console.log(`Caché de Métodos cargada: ${this.permissionMethodMap.size} permisos guardados.`);
        } catch (error) {
            console.error('Error cargando los permisos de métodos:', error.message);
            throw error;
        }
    }

    /**
     * Carga todos los permisos de opciones de menú desde la BD a la caché.
     * Estructura de la Llave: sub_system_de + option_de + profile_id
     */
    async loadPermissionMenu() {
        try {
            const sql = global.global_db.getSentence('security', 'getAllMenuPermissions');
            const rows = await global.global_db.exeQuery(sql);

            this.permissionMenuMap.clear();

            rows.forEach(row => {
                const key = `${row.sub_system_de}_`+`${row.option_de}_`+`${row.profile_id}`;
                this.permissionMenuMap.set(key, true);
            });

            console.log(`Caché de Opciones de Menú cargada: ${this.permissionMenuMap.size} permisos guardados.`);
        } catch (error) {
            console.error('Error cargando los permisos de opciones:', error.message);
            throw error;
        }
    }

    /**
     * Carga todos los objetos (clases) registrados en la BD a la caché en memoria.
     * Estructura de la Llave: sub_system_de + object_de | value: object_id
     */
    async loadObjectMap() {
        try {
            const sql = global.global_db.getSentence('security', 'getAllObjects');
            const rows = await global.global_db.exeQuery(sql);

            this.objectMap.clear();

            rows.forEach(row => {
                const key = `${row.sub_system_de}_${row.object_de}`;
                this.objectMap.set(key, row.object_id);
            });

            console.log(`Caché de Objetos cargada: ${this.objectMap.size} objetos guardados.`);
        } catch (error) {
            console.error('Error cargando el mapa de objetos:', error.message);
            throw error;
        }
    }

    /**
     * Carga todos los métodos registrados en la BD a la caché en memoria.
     * Estructura de la Llave: sub_system_de + object_de + method_de
     */
    async loadMethodMap() {
        try {
            const sql = global.global_db.getSentence('security', 'getAllMethods');
            const rows = await global.global_db.exeQuery(sql);

            this.methodMap.clear();

            rows.forEach(row => {
                const key = `${row.sub_system_de}_${row.object_de}_${row.method_de}`;
                this.methodMap.set(key, row.method_id);
            });

            console.log(`Caché de Métodos (integridad) cargada: ${this.methodMap.size} métodos guardados.`);
        } catch (error) {
            console.error('Error cargando el mapa de métodos:', error.message);
            throw error;
        }
    }

    /**
     * Busca en el mapa si existe el permiso solicitado para el perfil activo.
     */
    getPermissionMethod(subSystem, object, method, profileId) {
        const key = `${subSystem}_`+`${object}_`+`${method}_`+`${profileId}`;
        return this.permissionMethodMap.has(key);
    }

    /**
     * Busca en el mapa si existe el permiso de visualización de menú.
     */
    getPermissionMenu(subSystem, menu, profileId) {
        const key = `${subSystem}_`+`${menu}_`+`${profileId}`;
        return this.permissionMenuMap.has(key);
    }

    /**
     * Permite añadir dinámicamente un permiso de método en caliente (BD + Mapa)
     */
    async setPermissionMethod(subSystem, object, method, profileId) {
        const key = `${subSystem}_`+`${object}_`+`${method}_`+`${profileId}`;
        
        try {
            // Evaluamos si el mapa ya contiene la llave (Caché en memoria)
            if (this.permissionMethodMap.has(key)) {
                // SI EXISTE: Lo eliminamos de la base de datos
                const sql = global.global_db.getSentence('security', 'deleteMethodPermission');
                await global.global_db.exeQuery(sql, [subSystem, object, method, profileId]);

                // Lo removemos del mapa en memoria
                this.permissionMethodMap.delete(key);
                console.log(`Permiso de método ELIMINADO en BD y Caché: ${key}`);
            } else {
                // NO EXISTE: Lo insertamos en la base de datos
                const sql = global.global_db.getSentence('security', 'insertMethodPermission');
                await global.global_db.exeQuery(sql, [subSystem, object, method, profileId]);

                // Lo agregamos al mapa en memoria
                this.permissionMethodMap.set(key, true);
                console.log(`Permiso de método AÑADIDO en BD y Caché: ${key}`);
            }
        } catch (error) {
            console.error('Error al conmutar el permiso de método en caliente:', error.message);
            throw error;
        }
    }

    /**
     * Permite añadir dinámicamente un permiso de menú en caliente (BD + Mapa)
     */
    async setPermissionMenu(subSystem, menu, profileId) {
        const key = `${subSystem}_`+`${menu}_`+`${profileId}`;
        
        try {
            // Evaluamos si el mapa del menú ya contiene la llave
            if (this.permissionMenuMap.has(key)) {
                // SI EXISTE: Lo eliminamos de la base de datos
                const sql = global.global_db.getSentence('security', 'deleteMenuPermission');
                await global.global_db.exeQuery(sql, [subSystem, menu, profileId]);

                // Lo removemos del mapa en memoria
                this.permissionMenuMap.delete(key);
                console.log(`Permiso de menú ELIMINADO en BD y Caché: ${key}`);
            } else {
                // NO EXISTE: Lo insertamos en la base de datos
                const sql = global.global_db.getSentence('security', 'insertMenuPermission');
                await global.global_db.exeQuery(sql, [subSystem, menu, profileId]);

                // Lo agregamos al mapa en memoria
                this.permissionMenuMap.set(key, true);
                console.log(`Permiso de menú AÑADIDO en BD y Caché: ${key}`);
            }
        } catch (error) {
            console.error('Error al conmutar el permiso de menú en caliente:', error.message);
            throw error;
        }
    }




    /**
 * Invocador por reflexión (asume que la autorización previa fue aprobada en la aduana)
 */
async exeMethod(subSystem, object, method, executionParams = {}, userData = {}) {
    // 1. Verificamos que el objeto exista dado de alta en la BD (tabla `object`)
    const objectKey = `${subSystem}_${object}`;
    if (!this.objectMap.has(objectKey)) {
        throw new Error(`El objeto [${object}] no está registrado en la BD para el subsistema [${subSystem}].`);
    }

    // 2. Verificamos que el método exista dado de alta en la BD (tabla `method`)
    const methodKey = `${subSystem}_${object}_${method}`;
    if (!this.methodMap.has(methodKey)) {
        throw new Error(`El método [${method}] no está registrado en la BD para el objeto [${object}].`);
    }

    // 3. Cargamos la clase por convención: el objeto "Persona" vive en services/persona.js
    // como export default.
    // Se resuelve una sola vez por (subsistema + objeto): las siguientes llamadas leen de
    // classCache. Usamos la misma llave que objectMap/methodMap por si el mismo object_de
    // llegara a existir en dos subsistemas distintos (serían clases distintas, no una sola).
    let ClaseComponente = this.classCache.get(objectKey);

    if (!ClaseComponente) {
        try {
            const modulo = await import(`./${object.toLowerCase()}.js`);
            ClaseComponente = modulo.default;
            this.classCache.set(objectKey, ClaseComponente);
        } catch (error) {
            throw new Error(`El objeto [${object}] está dado de alta en la BD pero no existe su clase en el código (se esperaba services/${object.toLowerCase()}.js).`);
        }
    }

    // 4. Instanciamos la clase del componente
    const instanciaClase = new ClaseComponente();

    // 5. Invocación reflexiva pasando parámetros de ejecución + datos del usuario
    if (typeof instanciaClase[method] === 'function') {
        return await instanciaClase[method](executionParams, userData );
    } else {
        throw new Error(`Error de sistema: El método [${method}] no existe físicamente en el componente [${object}].`);
    }
}
}
    

export default Security;