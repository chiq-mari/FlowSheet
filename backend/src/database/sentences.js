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
    },
    // Módulo de Negocio (Control de Hojas de Tiempo) - usado por el Miembro de equipo
    business: {
        assignment: 'public.assignment',
        user_assignment: 'public.user_assignment',
        notification: 'public.notification',
        proyect: 'public.proyect',
        proyect_role: 'public.proyect_role',
        proyect_role_user: 'public.proyect_role_user',
        status: 'public.status'
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
        `,
        // --- CONSULTAS DASHBOARD DINÁMICO ---

        // Obtiene los subsistemas permitidos para el perfil seleccionado ($1 = profile_id)
        getSubSystemsByProfile: `
            SELECT DISTINCT 
                s.sub_system_id, 
                s.sub_system_de
            FROM sub_system s
            INNER JOIN option o ON s.sub_system_id = o.sub_system_id
            INNER JOIN permission_option po ON o.option_id = po.option_id
            WHERE po.profile_id = $1
            ORDER BY s.sub_system_de ASC;
        `,

        // Obtiene las opciones y sub-opciones según el perfil ($1 = profile_id) y subsistema ($2 = sub_system_id)
        getOptionsByProfileAndSubSystem: `
            SELECT DISTINCT 
                o.option_id, 
                o.option_de, 
                o.parent_option_id, 
                o.sub_system_id
            FROM option o
            INNER JOIN permission_option po ON o.option_id = po.option_id
            WHERE po.profile_id = $1 
              AND o.sub_system_id = $2
            ORDER BY o.option_id ASC;
        `,

        // Obtiene los perfiles asignados a un usuario ($1 = user_id)
        getUserProfiles: `
            SELECT 
                p.profile_id,
                p.profile_de
            FROM profile p
            INNER JOIN user_profile up ON p.profile_id = up.profile_id
            WHERE up.user_id = $1
            ORDER BY p.profile_de ASC;
        `
    },

    // --- MÓDULO DE NEGOCIO (HOJAS DE TIEMPO) - PERFIL MIEMBRO ---
    business: {
        // Trae las actividades (assignments) asignadas al miembro autenticado ($1 = user_id),
        // junto con su proyecto, rol y el último % de avance notificado (si existe)
        getMemberAssignments: `
            SELECT
                ua.id AS user_assignment_id,
                a.id AS assignment_id,
                a.name AS assignment_name,
                ast.status_de AS assignment_status,
                pr.name AS proyect_role_name,
                p.id AS proyect_id,
                p.name AS proyect_name,
                pst.status_de AS proyect_status,
                COALESCE((
                    SELECT n.progress_percentage
                    FROM notification n
                    WHERE n.user_assignment_id = ua.id
                    ORDER BY n.date DESC, n.notification_time DESC
                    LIMIT 1
                ), 0) AS last_progress
            FROM user_assignment ua
            INNER JOIN assignment a ON ua.assignment_id = a.id
            INNER JOIN status ast ON a.status_id = ast.status_id
            INNER JOIN proyect_role_user pru ON ua.proyect_role_user_id = pru.id
            INNER JOIN proyect_role pr ON pru.proyect_role_id = pr.id
            INNER JOIN proyect p ON pr.proyect_id = p.id
            INNER JOIN status pst ON p.status_id = pst.status_id
            WHERE pru.user_id = $1
            ORDER BY p.name ASC, a.name ASC;
        `,

        // Verifica que una asignación ($1 = user_assignment_id) pertenezca realmente
        // al usuario autenticado ($2 = user_id), para evitar que un miembro reporte
        // avances sobre actividades de otro compañero
        checkAssignmentOwnership: `
            SELECT ua.id
            FROM user_assignment ua
            INNER JOIN proyect_role_user pru ON ua.proyect_role_user_id = pru.id
            WHERE ua.id = $1 AND pru.user_id = $2;
        `,

        // Trae la hoja de tiempo (histórico de notificaciones de avance) del miembro autenticado ($1 = user_id)
        getMemberNotifications: `
            SELECT
                n.id,
                n.date,
                n.notification_time,
                n.progress_percentage,
                n.total_hours_spent,
                n.observation,
                a.name AS assignment_name,
                p.id AS proyect_id,
                p.name AS proyect_name
            FROM notification n
            INNER JOIN user_assignment ua ON n.user_assignment_id = ua.id
            INNER JOIN assignment a ON ua.assignment_id = a.id
            INNER JOIN proyect_role_user pru ON ua.proyect_role_user_id = pru.id
            INNER JOIN proyect_role pr ON pru.proyect_role_id = pr.id
            INNER JOIN proyect p ON pr.proyect_id = p.id
            WHERE pru.user_id = $1
            ORDER BY n.date DESC, n.notification_time DESC;
        `,

        // Inserta un nuevo avance (notificación de hoja de tiempo) sobre una actividad asignada
        // ($1 = user_assignment_id, $2 = date, $3 = progress_percentage, $4 = observation,
        //  $5 = notification_time, $6 = total_hours_spent)
        insertNotification: `
            INSERT INTO notification (
                user_assignment_id, date, progress_percentage, observation, notification_time, total_hours_spent
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_assignment_id, date, notification_time, progress_percentage, total_hours_spent, observation;
        `
    }
};