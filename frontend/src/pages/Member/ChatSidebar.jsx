// src/pages/Member/ChatSidebar.jsx
import { ProjectIcon } from './ProjectIcon';
import { formatLastMessagePreview } from './chatVisuals';

/**
 * Lista de chats (uno por proyecto) del miembro, con preview del último mensaje.
 */
const ChatSidebar = ({ chats, selectedProyectId, onSelect, currentUserId }) => {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h2>Mis Chats</h2>
        <span>Chats por proyecto</span>
      </div>

      <div className="chat-sidebar-list">
        {chats.length === 0 ? (
          <p className="member-empty-text chat-sidebar-empty">No tienes chats de proyecto todavía.</p>
        ) : (
          chats.map((chat) => {
            const isActive = chat.proyect_id === selectedProyectId;
            const isOwnLastMessage = chat.last_message_user_id === currentUserId;

            return (
              <button
                key={chat.proyect_id}
                className={`chat-sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelect(chat.proyect_id)}
              >
                <ProjectIcon proyectId={chat.proyect_id} size={40} />
                <div className="chat-sidebar-item-main">
                  <span className="chat-sidebar-item-name">{chat.proyect_name}</span>
                  <span className="chat-sidebar-item-preview">
                    {formatLastMessagePreview(chat.last_message_text, isOwnLastMessage, chat.last_message_person_na)}
                  </span>
                </div>
                {isActive && <span className="chat-sidebar-item-dot" />}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
