import { DBComponent } from '../src/config/dbComponent.js';

const db = new DBComponent();

async function run() {
  const cols = async (t) => db.exeQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='" + t + "'");
  console.log('--- assignment ---');
  console.log(await cols('assignment'));
  console.log('--- user_assignment ---');
  console.log(await cols('user_assignment'));
  console.log('--- notification ---');
  console.log(await cols('notification'));
  process.exit(0);
}

run();
