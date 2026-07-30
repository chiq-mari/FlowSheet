import { DBComponent } from './src/config/dbComponent.js';

const db = new DBComponent();

async function run() {
  try {
    // Clean all dates first
    const allNotifs = await db.exeQuery('SELECT id FROM public.notification ORDER BY id');
    if (allNotifs.length >= 4) {
      // Set the first 4 notifications to today
      const todayIds = allNotifs.slice(0, 4).map(n => `'${n.id}'`).join(',');
      await db.exeQuery(`UPDATE public.notification SET date = CURRENT_DATE WHERE id IN (${todayIds})`);
      
      // Set the rest to 2 days ago
      const restIds = allNotifs.slice(4).map(n => `'${n.id}'`).join(',');
      if (restIds) {
        await db.exeQuery(`UPDATE public.notification SET date = CURRENT_DATE - INTERVAL '2 days' WHERE id IN (${restIds})`);
      }
    } else {
      await db.exeQuery('UPDATE public.notification SET date = CURRENT_DATE');
    }
    console.log("Successfully updated notification dates relative to CURRENT_DATE.");
  } catch (error) {
    console.error("Error updating notification dates:", error);
  } finally {
    process.exit();
  }
}

run();
