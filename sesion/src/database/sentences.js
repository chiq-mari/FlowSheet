// 1. Mapeo centralizado de los nombres de las tablas
const dbSchema = {
    security: {
        user: 'public."user"',
        status_user: 'public.status_user',
        person: 'public.person', 
        profile: 'public.profile',
        user_profile: 'public.user_profile',
        sub_system: 'public.sub_system',
        object: 'public.object',
        method: 'public.method',
        permission_method: 'public.permission_method',
        option: 'public.option',
        permission_option: 'public.permission_option'
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
            p.person_na,
            p.person_ln,
            p.person_ci,
            su.status_user_id,
            su.status_user_de,
            prof.profile_id,
            prof.profile_de
        FROM "user" u
        INNER JOIN status_user su ON u.status_user_id = su.status_user_id
        INNER JOIN person p ON p.person_id = u.person_id 
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN profile prof ON up.profile_id = prof.profile_id
        WHERE u.user_na = $1`,

        // Trae todos los métodos/acciones asignados a cada perfil
        getAllMethodPermissions: `
            SELECT 
                sub.sub_system_de,
                obj.object_de,
                m.method_de,
                pm.profile_id
            FROM permission_method pm
            INNER JOIN method m ON pm.method_id = m.method_id
            INNER JOIN object obj ON m.object_id = obj.object_id
            INNER JOIN sub_system sub ON obj.sub_system_id = sub.sub_system_id
        `,

        // Trae todas las opciones de menú asignadas a cada perfil
        getAllMenuPermissions: `
            SELECT 
                sub.sub_system_de,
                opt.option_de,
                po.profile_id
            FROM permission_option po
            INNER JOIN option opt ON po.option_id = opt.option_id
            INNER JOIN sub_system sub ON opt.sub_system_id = sub.sub_system_id
        `,
        // Para insertar en 'permission' (necesitamos cruzar con la tabla 'method' y 'object' para hallar el method_id)
        insertMethodPermission: `
            INSERT INTO permission_method (profile_id, method_id)
            SELECT $4, m.method_id
            FROM method m
            INNER JOIN object o ON m.object_id = o.object_id
            INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
            WHERE s.sub_system_de = $1 
            AND o.object_de = $2 
            AND m.method_de = $3
            ON CONFLICT DO NOTHING;
        `,

        // Para insertar en 'permission_menu' (necesitamos cruzar con 'menu' para hallar el menu_id)
        insertMenuPermission: `
            INSERT INTO permission_option (profile_id, option_id)
            SELECT $3, opt.option_id
            FROM option opt
            INNER JOIN sub_system s ON opt.sub_system_id = s.sub_system_id
            WHERE s.sub_system_de = $1 
            AND opt.option_de = $2
            ON CONFLICT DO NOTHING;
        `
        ,
        deleteMethodPermission: `
        DELETE FROM permission_method 
            WHERE profile_id = $4 
            AND method_id = (
                SELECT m.method_id 
                FROM method m
                INNER JOIN object o ON m.object_id = o.object_id
                INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
                WHERE s.sub_system_de = $1 
                    AND o.object_de = $2 
                    AND m.method_de = $3
            );
        `,

        deleteMenuPermission: `
            DELETE FROM permission_option 
            WHERE profile_id = $3 
            AND option_id = (
                SELECT opt.option_id 
                FROM option opt
                INNER JOIN sub_system s ON opt.sub_system_id = s.sub_system_id
                WHERE s.sub_system_de = $1 
                    AND opt.option_de = $2
            );
        `
    }
};
