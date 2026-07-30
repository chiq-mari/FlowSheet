// src/pages/Member/MemberChatsPlaceholder.jsx
import './Member.css';
import './MemberChatsPlaceholder.css';

// El subsistema de Chat por equipos aún no tiene tablas en la base de datos
// (flowsheet_db2.sql no define 'chat' ni 'message'). Se deja este placeholder
// para no romper la navegación del Miembro mientras se define el modelo de datos.
const MemberChatsPlaceholder = () => {
  return (
    <div className="member-chats-placeholder">
      <div className="member-view-header">
        <h2>Mis Chats</h2>
        <p>Chat por equipos</p>
      </div>

      <div className="member-card member-chats-empty">
        <span className="member-chats-icon">💬</span>
        <h3>Próximamente</h3>
        <p className="member-empty-text">
          Esta sección está pendiente de definición en el modelo de datos (aún no existen tablas
          de chat/mensajes en la base de datos). Se habilitará cuando el equipo defina ese esquema.
        </p>
      </div>
    </div>
  );
};

export default MemberChatsPlaceholder;
