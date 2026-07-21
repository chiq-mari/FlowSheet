import Calculadora from './calculadora.js'; // Importamos la clase

class Security {
    constructor() {
        // Los mapas creados como atributos de la clase
        this.permissionMethodMap = new Map();
        this.permissionMenuMap = new Map(); // El segundo mapa que se ve en la pizarra

        // En celeste: Se ejecutan los métodos de carga inmediatamente al instanciar
        this.loadPermissionMethod();
        this.loadPermissionMenu();
        // 2. Cargamos las clases en una propiedad del componente de seguridad
        this.componentes = {
            'Calculadora': Calculadora
        };
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
    // 1. Verificamos que la clase/componente exista en el registro
    const ClaseComponente = this.componentes[object];

    if (!ClaseComponente) {
        throw new Error(`El objeto [${object}] no está registrado en el motor de seguridad.`);
    }

    // 2. Instanciamos la clase del componente
    const instanciaClase = new ClaseComponente();
    
    // 3. Invocación reflexiva pasando parámetros de ejecución + datos del usuario
    if (typeof instanciaClase[method] === 'function') {
        return await instanciaClase[method](executionParams, userData );
    } else {
        throw new Error(`Error de sistema: El método [${method}] no existe físicamente en el componente [${object}].`);
    }
}
}
    

export default Security;