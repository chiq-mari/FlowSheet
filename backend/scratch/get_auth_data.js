import { DBComponent } from '../src/config/dbComponent.js';

const db = new DBComponent();

async function run() {
  const objects = await db.exeQuery("SELECT * FROM public.object");
  const methods = await db.exeQuery("SELECT * FROM public.method");
  const subs = await db.exeQuery("SELECT * FROM public.sub_system");
  console.log('--- sub_system ---');
  console.log(subs);
  console.log('--- object ---');
  console.log(objects);
  console.log('--- method ---');
  console.log(methods);
  process.exit(0);
}

run();
