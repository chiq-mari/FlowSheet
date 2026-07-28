import { DBComponent } from './src/config/dbComponent.js';

global.global_db = new DBComponent();

async function run() {
  try {
    console.log("--- USER CREDENTIALS ---");
    const credentials = await global.global_db.exeQuery('SELECT user_id, user_na, user_pw FROM public."user"');
    console.log(JSON.stringify(credentials, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

run();
