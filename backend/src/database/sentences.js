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
        `,

        // --- INTEGRIDAD DE OBJETOS Y MÉTODOS (usados por Security.loadObjectMap / loadMethodMap) ---

        // Trae todos los objetos (clases) registrados en la BD, con su subsistema dueño
        getAllObjects: `
            SELECT
                obj.object_id,
                obj.object_de,
                sub.sub_system_de
            FROM object obj
            INNER JOIN sub_system sub ON obj.sub_system_id = sub.sub_system_id
        `,

        // Trae todos los métodos registrados en la BD, con su objeto y subsistema dueño
        getAllMethods: `
            SELECT
                m.method_id,
                m.method_de,
                obj.object_de,
                sub.sub_system_de
            FROM method m
            INNER JOIN object obj ON m.object_id = obj.object_id
            INNER JOIN sub_system sub ON obj.sub_system_id = sub.sub_system_id
        `
    },
    leader: {
        getMetrics: `
            SELECT 
              -- Metric 1: Active Projects
              (SELECT COUNT(DISTINCT p.id)::int
               FROM public.proyect p
               INNER JOIN public.proyect_role pr ON p.id = pr.proyect_id
               INNER JOIN public.proyect_role_user pru ON pr.id = pru.proyect_role_id
               INNER JOIN public.status s ON p.status_id = s.status_id
               WHERE pru.user_id = $1 
                 AND pr.name = 'Lider' 
                 AND s.status_de = 'En desarrollo'
              ) as active_projects,

              -- Metric 2: Total Employees
              (SELECT COUNT(DISTINCT pru_member.user_id)::int
               FROM public.proyect_role_user pru_leader
               INNER JOIN public.proyect_role pr_leader ON pru_leader.proyect_role_id = pr_leader.id
               INNER JOIN public.proyect_role pr_member ON pr_leader.proyect_id = pr_member.proyect_id
               INNER JOIN public.proyect_role_user pru_member ON pr_member.id = pru_member.proyect_role_id
               WHERE pru_leader.user_id = $1 
                 AND pr_leader.name = 'Lider'
                 AND pru_member.user_id <> $1
              ) as total_employees,

              -- Metric 3: Notifications Today
              (SELECT COUNT(n.id)::int
               FROM public.notification n
               INNER JOIN public.user_assignment ua ON n.user_assignment_id = ua.id
               INNER JOIN public.proyect_role_user pru_member ON ua.proyect_role_user_id = pru_member.id
               INNER JOIN public.proyect_role pr_member ON pru_member.proyect_role_id = pr_member.id
               INNER JOIN public.proyect_role pr_leader ON pr_member.proyect_id = pr_leader.proyect_id
               INNER JOIN public.proyect_role_user pru_leader ON pr_leader.id = pru_leader.proyect_role_id
               WHERE pru_leader.user_id = $1 
                 AND pr_leader.name = 'Lider'
                 AND pru_member.user_id <> $1
                 AND n.date = CURRENT_DATE
              ) as notifications_today,

              -- Metric 4: Total Hours Spent This Week
              (SELECT COALESCE(SUM(n.total_hours_spent), 0)::float
               FROM public.notification n
               INNER JOIN public.user_assignment ua ON n.user_assignment_id = ua.id
               INNER JOIN public.proyect_role_user pru_member ON ua.proyect_role_user_id = pru_member.id
               INNER JOIN public.proyect_role pr_member ON pru_member.proyect_role_id = pr_member.id
               INNER JOIN public.proyect_role pr_leader ON pr_member.proyect_id = pr_leader.proyect_id
               INNER JOIN public.proyect_role_user pru_leader ON pr_leader.id = pru_leader.proyect_role_id
               WHERE pru_leader.user_id = $1 
                 AND pr_leader.name = 'Lider'
                 AND n.date >= date_trunc('week', CURRENT_DATE)
                 AND n.date < date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
              ) as total_hours_week;
        `,
        getProjects: `
            SELECT DISTINCT p.id, p.name
            FROM public.proyect p
            INNER JOIN public.proyect_role pr ON p.id = pr.proyect_id
            INNER JOIN public.proyect_role_user pru ON pr.id = pru.proyect_role_id
            WHERE pru.user_id = $1 AND pr.name = 'Lider'
            ORDER BY p.name ASC;
        `,
        getNotifications: `
            SELECT 
              n.id, 
              n.date, 
              n.progress_percentage, 
              n.total_hours_spent, 
              n.observation, 
              n.notification_time,
              pe.person_na, 
              pe.person_ln, 
              u.user_na,
              proj.id as project_id, 
              proj.name as project_name,
              assign.name as assignment_name
            FROM public.notification n
            INNER JOIN public.user_assignment ua ON n.user_assignment_id = ua.id
            INNER JOIN public.assignment assign ON ua.assignment_id = assign.id
            INNER JOIN public.proyect_role_user pru_member ON ua.proyect_role_user_id = pru_member.id
            INNER JOIN public.proyect_role pr_member ON pru_member.proyect_role_id = pr_member.id
            INNER JOIN public.proyect proj ON pr_member.proyect_id = proj.id
            INNER JOIN public.proyect_role pr_leader ON proj.id = pr_leader.proyect_id
            INNER JOIN public.proyect_role_user pru_leader ON pr_leader.id = pru_leader.proyect_role_id
            INNER JOIN public."user" u ON pru_member.user_id = u.user_id
            INNER JOIN public.person pe ON u.person_id = pe.person_id
            WHERE pru_leader.user_id = $1 
              AND pr_leader.name = 'Lider'
              AND ($2::date IS NULL OR n.date >= $2)
              AND ($3::date IS NULL OR n.date <= $3)
              AND ($4::varchar IS NULL OR $4 = '' OR proj.id::varchar = $4)
            ORDER BY n.date DESC, n.notification_time DESC;
        `
    }
    ,
    person: {
    // 1. Obtener todas las personas con su Cargo (para la tabla principal)
    // Permite filtrar opcionalmente por nombre/apellido/CI/correo desde Node.js si se manda un término de búsqueda
    getAll: `
      SELECT 
        p.person_id,
        p.person_ci,
        p.person_na,
        p.person_ln,
        p.person_email,
        p.charge_id,
        c.name AS charge_name
      FROM person p
      LEFT JOIN charge c ON p.charge_id = c.id
      WHERE 
        ($1::text IS NULL OR $1 = '' OR 
         LOWER(p.person_na) LIKE LOWER('%' || $1 || '%') OR 
         LOWER(p.person_ln) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_ci) LIKE LOWER('%' || $1 || '%'))
      ORDER BY p.person_id DESC;
    `,

    // 2. Obtener una persona por ID (para cargar en modal de edición)
    getById: `
      SELECT 
        p.person_id,
        p.person_ci,
        p.person_na,
        p.person_ln,
        p.person_email,
        p.charge_id,
        c.name AS charge_name
      FROM person p
      LEFT JOIN charge c ON p.charge_id = c.id
      WHERE p.person_id = $1;
    `,

    // 3. Crear persona (+)
    create: `
      INSERT INTO person (
        person_ci,
        person_na,
        person_ln,
        person_email,
        charge_id
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING person_id, person_ci, person_na, person_ln, person_email, charge_id;
    `,

    // 4. Actualizar persona (icono lápiz)
    update: `
      UPDATE person
      SET 
        person_ci = $1,
        person_na = $2,
        person_ln = $3,
        person_email = $4,
        charge_id = $5
      WHERE person_id = $6
      RETURNING person_id, person_ci, person_na, person_ln, person_email, charge_id;
    `,

    // 5. Eliminar persona (icono papelera - soporta ID único o array vía ANY)
    delete: `
      DELETE FROM person
      WHERE person_id = ANY($1::uuid[]);
    `
  },

  // Cargo: usado tanto por el <select> de Persona como por su propia pantalla de mantenimiento
  charge: {
    // Admite búsqueda opcional por nombre; si no se manda término, devuelve todos (uso del combobox).
    getAll: `
      SELECT
        id,
        name
      FROM charge
      WHERE ($1::text IS NULL OR $1 = '' OR LOWER(name) LIKE LOWER('%' || $1 || '%'))
      ORDER BY name ASC;
    `,

    create: `
      INSERT INTO charge (name)
      VALUES ($1)
      RETURNING id, name;
    `,

    update: `
      UPDATE charge
      SET name = $1
      WHERE id = $2
      RETURNING id, name;
    `,

    delete: `
      DELETE FROM charge
      WHERE id = ANY($1::uuid[]);
    `
  },

  usuario: {
    // 1. Obtener todos los usuarios con los datos de su Persona vinculada (para la tabla principal)
    // Permite filtrar opcionalmente por username o por nombre/apellido/CI de la persona
    getAll: `
      SELECT
        u.user_id,
        u.user_na,
        u.user_pw,
        u.user_email,
        u.status_user_id,
        su.status_user_de,
        u.person_id,
        p.person_ci,
        p.person_na,
        p.person_ln
      FROM "user" u
      INNER JOIN status_user su ON u.status_user_id = su.status_user_id
      LEFT JOIN person p ON u.person_id = p.person_id
      WHERE
        ($1::text IS NULL OR $1 = '' OR
         LOWER(u.user_na) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_ci) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_na) LIKE LOWER('%' || $1 || '%') OR
         LOWER(p.person_ln) LIKE LOWER('%' || $1 || '%'))
      ORDER BY u.user_id DESC;
    `,

    // 2. Crear usuario (+)
    create: `
      INSERT INTO "user" (
        user_na,
        user_pw,
        user_email,
        status_user_id,
        person_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, user_na, user_pw, user_email, status_user_id, person_id;
    `,

    // 3. Actualizar usuario (icono lápiz)
    update: `
      UPDATE "user"
      SET
        user_na = $1,
        user_pw = $2,
        user_email = $3,
        status_user_id = $4,
        person_id = $5
      WHERE user_id = $6
      RETURNING user_id, user_na, user_pw, user_email, status_user_id, person_id;
    `,

    // 4. Eliminar usuario (icono papelera - soporta ID único o array vía ANY)
    delete: `
      DELETE FROM "user"
      WHERE user_id = ANY($1::uuid[]);
    `,

    // 5. Catálogo de estados para el <select> de Status en el formulario
    getEstados: `
      SELECT status_user_id, status_user_de
      FROM status_user
      ORDER BY status_user_id ASC;
    `
  },

  // Subsistema: agrupa Objetos/Opciones del árbol de permisos (ver sub_system en el ERD).
  // Se alias sub_system_id/sub_system_de a id/name para reusar la misma forma que Cargo.
  subSystem: {
    getAll: `
      SELECT
        sub_system_id AS id,
        sub_system_de AS name
      FROM sub_system
      WHERE ($1::text IS NULL OR $1 = '' OR LOWER(sub_system_de) LIKE LOWER('%' || $1 || '%'))
      ORDER BY sub_system_de ASC;
    `,

    create: `
      INSERT INTO sub_system (sub_system_de)
      VALUES ($1)
      RETURNING sub_system_id AS id, sub_system_de AS name;
    `,

    update: `
      UPDATE sub_system
      SET sub_system_de = $1
      WHERE sub_system_id = $2
      RETURNING sub_system_id AS id, sub_system_de AS name;
    `,

    delete: `
      DELETE FROM sub_system
      WHERE sub_system_id = ANY($1::uuid[]);
    `
  },

  // Opción: fila del árbol de menú (option), mostrada junto al nombre de su Subsistema.
  // parent_option_id sí es editable: permite anidar una opción bajo otra (ej. "Subsistemas"
  // bajo "Mantenimiento"). Queda NULL cuando la opción es raíz.
  option: {
    getAll: `
      SELECT
        o.option_id,
        o.option_de,
        o.sub_system_id,
        s.sub_system_de,
        o.parent_option_id
      FROM option o
      INNER JOIN sub_system s ON o.sub_system_id = s.sub_system_id
      WHERE
        ($1::uuid IS NULL OR o.sub_system_id = $1)
        AND ($2::text IS NULL OR $2 = '' OR LOWER(o.option_de) LIKE LOWER('%' || $2 || '%'))
      ORDER BY s.sub_system_de ASC, o.option_de ASC;
    `,

    create: `
      INSERT INTO option (option_de, sub_system_id, parent_option_id)
      VALUES ($1, $2, $3)
      RETURNING option_id, option_de, sub_system_id, parent_option_id;
    `,

    update: `
      UPDATE option
      SET option_de = $1, sub_system_id = $2, parent_option_id = $3
      WHERE option_id = $4
      RETURNING option_id, option_de, sub_system_id, parent_option_id;
    `,

    // Cuenta las opciones que cuelgan de $1 (usado para bloquear que una opción
    // que ya es padre reciba a su vez un padre, lo que crearía un 3er nivel).
    countChildren: `
      SELECT COUNT(*)::int AS count
      FROM option
      WHERE parent_option_id = $1;
    `,

    delete: `
      DELETE FROM option
      WHERE option_id = ANY($1::uuid[]);
    `
  }
};