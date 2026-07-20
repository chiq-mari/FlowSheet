// 1. Mapeo centralizado de los nombres de las tablas
const dbSchema = {
    security: {
        user: 'public."user"', // Uso de comillas dobles internas porque "user" es palabra reservada en Postgres
        status: 'public.status',
        person: 'public.person', 
        profile:'public.profile',
        user_profile:'public.user_profile'
    }
};

// 2. Diccionario de consultas con los placeholders fijos ($1, $2...) que entiende Postgres
export const sentences = {
    security: {
        // Busca al usuario por su username para validar la contraseña y el estatus en el servicio
        getUser: `SELECT 
            u.user_id,
            u.user_na,
            u.user_pw,
            p.person_id,
            p.person_first_na,
            p.person_last_na,
            p.person_ci,
            s.status_id,
            s.status_na,
            prof.profile_id,
            prof.profile_na
        FROM "user" u
        INNER JOIN status s ON u.status_id = s.status_id
        INNER JOIN person p ON p.person_id = u."person_id" 
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN profile prof ON up.profile_id = prof.profile_id
        WHERE u.user_na = $1`,

        // Trae todos los métodos/acciones asignados a cada perfil
        getAllMethodPermissions: `
            SELECT 
                sub.sub_system_na,
                obj.object_na,
                m.method_na,
                p.profile_id
            FROM permission p
            INNER JOIN method m ON p.method_id = m.method_id
            INNER JOIN object obj ON m.object_id = obj.object_id
            INNER JOIN sub_system sub ON obj.sub_system_id = sub.sub_system_id
        `,

        // Trae todas las opciones de menú asignadas a cada perfil
        getAllMenuPermissions: `
            SELECT 
                sub.sub_system_na,
                m.menu_na,
                pm.profile_id
            FROM permission_menu pm
            INNER JOIN menu m ON pm.menu_id = m.menu_id
            INNER JOIN sub_system sub ON m.sub_system_id = sub.sub_system_id
        `,
        // Para insertar en 'permission' (necesitamos cruzar con la tabla 'method' y 'object' para hallar el method_id)
        insertMethodPermission: `
            INSERT INTO permission (profile_id, method_id)
            SELECT $4, m.method_id
            FROM method m
            INNER JOIN object o ON m.object_id = o.object_id
            INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
            WHERE s.sub_system_na = $1 
            AND o.object_na = $2 
            AND m.method_na = $3
            ON CONFLICT DO NOTHING;
        `,

        // Para insertar en 'permission_menu' (necesitamos cruzar con 'menu' para hallar el menu_id)
        insertMenuPermission: `
            INSERT INTO permission_menu (profile_id, menu_id)
            SELECT $3, m.menu_id
            FROM menu m
            INNER JOIN sub_system s ON m.sub_system_id = s.sub_system_id
            WHERE s.sub_system_na = $1 
            AND m.menu_na = $2
            ON CONFLICT DO NOTHING;
            `
        ,
        deleteMethodPermission: `
        DELETE FROM permission 
        WHERE profile_id = $4 
        AND method_id = (
            SELECT m.method_id 
            FROM method m
            INNER JOIN object o ON m.object_id = o.object_id
            INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
            WHERE s.sub_system_na = $1 
                AND o.object_na = $2 
                AND m.method_na = $3
        );
        `,

        deleteMenuPermission: `
            DELETE FROM permission_menu 
            WHERE profile_id = $3 
            AND menu_id = (
                SELECT m.menu_id 
                FROM menu m
                INNER JOIN sub_system s ON m.sub_system_id = s.sub_system_id
                WHERE s.sub_system_na = $1 
                    AND m.menu_na = $2
            );
        `
    }
};
