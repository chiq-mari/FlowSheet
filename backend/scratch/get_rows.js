import { DBComponent } from '../src/config/dbComponent.js';

const db = new DBComponent();

async function run() {
  const p = await db.exeQuery("SELECT * FROM public.proyect LIMIT 5");
  const a = await db.exeQuery("SELECT * FROM public.assignment LIMIT 5");
  const ua = await db.exeQuery("SELECT * FROM public.user_assignment LIMIT 5");
  const pr = await db.exeQuery("SELECT * FROM public.proyect_role LIMIT 5");
  const pru = await db.exeQuery("SELECT * FROM public.proyect_role_user LIMIT 5");

  console.log('projects:', p);
  console.log('assignments (activities):', a);
  console.log('user_assignments:', ua);
  console.log('proyect_roles:', pr);
  console.log('proyect_role_users:', pru);

  process.exit(0);
}

run();
