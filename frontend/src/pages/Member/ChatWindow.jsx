// src/pages/Member/ChatWindow.jsx
import { useEffect, useRef, useState } from 'react';
import { ejecutarMetodo } from '../../services/toProcess';
import { ProjectIcon } from './ProjectIcon';
import { getUserColor, getInitials, formatChatTime } from './chatVisuals';

const SEND_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// Cada cuántos ms se refresca el chat en segundo plano para simular "tiempo real"
const POLL_INTERVAL_MS = 4000;

const ChatWindow = ({ proyectId, proyectName, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await ejecutarMetodo('Hojas de Tiempo', 'Chats', 'consultarMensajes', { proyect_id: proyectId });
      setMessages(data.messages);
      setMembers(data.members);
      setErrorMsg('');
    } catch (err) {
      if (!silent) setErrorMsg(err.message || 'No se pudo cargar el chat.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!proyectId) return undefined;
    loadMessages();
    const interval = setInterval(() => loadMessages(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;

    setSending(true);
    const text = draft;
    setDraft('');
    try {
      await ejecutarMetodo('Hojas de Tiempo', 'Chats', 'enviarMensaje', {
        proyect_id: proyectId,
        message_text: text,
      });
      await loadMessages(true);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo enviar el mensaje.');
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  if (!proyectId) {
    return <div className="chat-window chat-window-empty">Selecciona un chat para comenzar.</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <ProjectIcon proyectId={proyectId} size={38} />
        <div className="chat-window-header-main">
          <span className="chat-window-header-name">{proyectName}</span>
          <span className="chat-window-header-members">
            {members.map((m) => m.user_na).join(', ')}
          </span>
        </div>
        <div className="chat-window-header-avatars">
          {members.slice(0, 3).map((m) => {
            const c = getUserColor(m.user_id);
            return (
              <span
                key={m.user_id}
                className="chat-avatar-mini"
                style={{ backgroundColor: c.bg, color: c.color }}
                title={`${m.person_na} ${m.person_ln}`}
              >
                {getInitials(m.person_na, m.person_ln)}
              </span>
            );
          })}
          <span className="chat-window-header-count">{members.length} miembros</span>
        </div>
      </div>

      <div className="chat-window-body">
        {errorMsg && <div className="member-error-badge chat-window-error">{errorMsg}</div>}

        {loading ? (
          <div className="member-view-loading">Cargando chat...</div>
        ) : messages.length === 0 ? (
          <p className="member-empty-text chat-window-empty-msg">
            Todavía no hay mensajes en este chat. ¡Sé el primero en escribir!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            const c = getUserColor(msg.user_id);

            return (
              <div key={msg.id} className={`chat-message-row ${isOwn ? 'own' : ''}`}>
                {!isOwn && (
                  <span
                    className="chat-avatar-mini chat-message-avatar"
                    style={{ backgroundColor: c.bg, color: c.color }}
                  >
                    {getInitials(msg.person_na, msg.person_ln)}
                  </span>
                )}
                <div className="chat-message-content">
                  {!isOwn && (
                    <span className="chat-message-sender" style={{ color: c.color }}>
                      {msg.user_na}
                    </span>
                  )}
                  <div className={`chat-bubble ${isOwn ? 'own' : ''}`}>{msg.message_text}</div>
                  <span className="chat-message-time">{formatChatTime(msg.sent_at)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-window-input-row" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={sending}
        />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Enviar">
          {SEND_ICON}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
