// Componente de negocio para el objeto "Cargo" del subsistema "Seguridad".
// Sirve exclusivamente como catálogo de lectura para llenar el <select> de Cargo
// dentro de los modales de Persona (Crear/Editar).
class Cargo {
    async getAll() {
        const sql = global.global_db.getSentence('charge', 'getAll');
        return await global.global_db.exeQuery(sql);
    }
}

export default Cargo;
