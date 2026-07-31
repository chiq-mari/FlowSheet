import { DBComponent } from '../src/config/dbComponent.js';

const db = new DBComponent();

async function run() {
  const q = `
    SELECT 
        p.id AS proyect_id,
        p.name AS proyect_name,
        a.id AS assignment_id,
        a.name AS assignment_name,
        ua.id AS user_assignment_id,
        pr.name AS role_name,
        u.user_na AS username
    FROM public.proyect p
    INNER JOIN public.proyect_role pr ON p.id = pr.proyect_id
    INNER JOIN public.proyect_role_user pru ON pr.id = pru.proyect_role_id
    INNER JOIN public.user u ON pru.user_id = u.user_id
    INNER JOIN public.user_assignment ua ON pru.id = ua.proyect_role_user_id
    INNER JOIN public.assignment a ON ua.assignment_id = a.id
  `;
  const rows = await db.exeQuery(q);
  console.log('Project -> Assignment links in DB:', rows);
  process.exit(0);
}

run();
