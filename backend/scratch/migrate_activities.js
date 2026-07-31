import { DBComponent } from '../src/config/dbComponent.js';

const db = new DBComponent();

async function run() {
  console.log('⚡ Starting database migration for Actividades...');
  
  // 1. Check/Insert Object 'Actividades'
  const objId = '6cb95b06-44c1-4045-8121-6a2c2069f104';
  const subSystemId = '42b455b6-5037-4124-b4a8-f81ce6e9e413'; // Hojas de Tiempo
  
  await db.exeQuery(`
    INSERT INTO public.object (object_id, object_de, sub_system_id)
    VALUES ($1, 'Actividades', $2)
    ON CONFLICT (object_id) DO NOTHING;
  `, [objId, subSystemId]);
  
  // 2. Define methods to register
  const methods = [
    // Member methods
    { id: '281b37b4-1065-4f40-84eb-beea4e7c7a31', name: 'consultarAsignaciones', profiles: ['Miembro', 'Lider'] },
    { id: '282b37b4-2065-4f40-84eb-beea4e7c7a32', name: 'consultarNotificaciones', profiles: ['Miembro', 'Lider'] },
    { id: '283b37b4-3065-4f40-84eb-beea4e7c7a33', name: 'registrarAvance', profiles: ['Miembro', 'Lider'] },
    
    // Leader methods
    { id: '284b37b4-4065-4f40-84eb-beea4e7c7a34', name: 'getAllForProject', profiles: ['Lider'] },
    { id: '285b37b4-5065-4f40-84eb-beea4e7c7a35', name: 'insertActivity', profiles: ['Lider'] },
    { id: '286b37b4-6065-4f40-84eb-beea4e7c7a36', name: 'updateActivity', profiles: ['Lider'] },
    { id: '287b37b4-7065-4f40-84eb-beea4e7c7a37', name: 'deleteActivities', profiles: ['Lider'] },
    { id: '288b37b4-8065-4f40-84eb-beea4e7c7a38', name: 'getTeamMembers', profiles: ['Lider'] },
    { id: '289b37b4-9065-4f40-84eb-beea4e7c7a39', name: 'assignMember', profiles: ['Lider'] },
    { id: '28ab37b4-a065-4f40-84eb-beea4e7c7a3a', name: 'unassignMember', profiles: ['Lider'] }
  ];

  // Profile Map IDs
  const profileMap = {
    'Miembro': '4881c0e4-796e-4cba-b7f0-16c0b5043070',
    'Lider': 'd0fdf0e7-8d6a-4d5d-8f5b-61144987c38c'
  };

  for (const m of methods) {
    // Insert method
    await db.exeQuery(`
      INSERT INTO public.method (method_id, method_de, object_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (method_id) DO NOTHING;
    `, [m.id, m.name, objId]);

    // Insert permissions
    for (const pName of m.profiles) {
      const pId = profileMap[pName];
      await db.exeQuery(`
        INSERT INTO public.permission_method (profile_id, method_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
      `, [pId, m.id]);
    }
  }

  console.log('⚡ Migration complete. Actividades metadata registered successfully!');
  process.exit(0);
}

run();
