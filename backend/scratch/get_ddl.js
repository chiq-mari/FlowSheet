import { DBComponent } from '../src/config/dbComponent.js';

const db = new DBComponent();

async function run() {
  // Query to inspect the create table or columns of assignment including any other column that might not have values
  const r = await db.exeQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='assignment'");
  console.log('assignment columns:', r);

  // Check foreign keys of all tables
  const fkeys = await db.exeQuery(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    ORDER BY tc.table_name;
  `);
  console.log('All foreign keys:', fkeys);
  
  // Let's also check all columns of all tables containing 'proyect' or 'assignment' or 'activity' in the name
  const allTables = await db.exeQuery("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  console.log('All public tables:', allTables);

  process.exit(0);
}

run();
