import session from 'express-session'; // Importamos el manejador de sesiones

class Session {
    // Recibe el objeto 'request' (req) de Express para poder manipular la sesión de ese usuario específico
    constructor() {
        
    }

    // Verifica si la sesión ya existe en el servidor para este usuario
    sessionExist(req) {
        //'ObjectSession'. Si esa propiedad existe en la sesión, es que está logueado.
        if (req.session && req.session.ObjectSession) {
            return true;
        }
        return false;
    }

    ///////////////////////////////////////////////////////
    transformUserData(rows) {
        if (!rows || rows.length === 0) return null;

        // 1. Tomamos la primera fila como base para los datos generales del usuario
        const firstRow = rows[0];

        // 2. Creamos la estructura base omitiendo profile_id y profile_de de la raíz
        const formattedUser = {
            user_id: firstRow.user_id,
            user_na: firstRow.user_na,
            user_pw: firstRow.user_pw,
            person_id: firstRow.person_id,
            person_na: firstRow.person_na,
            person_ln: firstRow.person_ln,
            person_ci: firstRow.person_ci,
            status_user_id: firstRow.status_user_id,
            status_user_de: firstRow.status_user_de,
            user_profiles: [] // Aquí meteremos la lista de sus perfiles como objetos
        };

        // 3. Recorremos todas las filas para extraer únicamente los perfiles asignados
        rows.forEach(row => {
            if (row.profile_id && row.profile_de) {
                formattedUser.user_profiles.push({
                    profile_id: row.profile_id,
                    profile_de: row.profile_de
                });
            }
        });

        return formattedUser;
    }
    //////////////////////////////////



    // Inicia formalmente la sesión guardando los datos del usuario en la memoria del servidor
    createSession(req, userData) {
        // Guardamos los datos del usuario dentro de la sesión
        req.session.ObjectSession = userData;
    }

    // Borra la sesión cuando el usuario decide salir
    destroySession(req) {
        return new Promise((resolve, reject) => {
            if (!req.session) return resolve(true);
            
            req.session.destroy((err) => {
                if (err) return reject(err);
                resolve(true);
            });
        });
    }

    // Retorna los datos guardados en la sesión actual
    getDataSession(req) {
        return (req.session && req.session.ObjectSession) ? req.session.ObjectSession : null;
    }

    /**
     * @returns {object} -- con lso datos e=necesarios para la sesion
     */
    async authenticate(username, password) {
        try {
            // 1. String de la consulta usando el método dinámico en dbComponent
            const sqlQuery = global.global_db.getSentence('security', 'getUser');

            // 2. Ejecutamos la consulta en Postgres pasando el username como parámetro ($1)
            const rows = await global.global_db.exeQuery(sqlQuery, [username]);

            // Si el array de filas viene vacío, el usuario no existe en la BD
            if (rows.length === 0) return null;

            // Llamamos a nuestro transformador antes de validar
            const user = this.transformUserData(rows);

            // 3. Comparamos la contraseña enviada con la de la BD (user_pw)
            if (user.user_pw === password) {
                // Si la clave coincide, mapeamos los datos para 'createSession'
                return user;
            }

            return null; // Contraseña incorrecta
            
        } catch (error) {
            console.error('Error crítico dentro del método authenticate de Session:', error.message);
            throw error; // Propagamos el error para controlarlo en el servidor
        }
    }
}

export default Session;