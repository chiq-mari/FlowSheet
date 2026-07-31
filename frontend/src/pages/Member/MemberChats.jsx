// src/pages/Member/MemberChats.jsx
import { useEffect, useState } from 'react';
import { ejecutarMetodo } from '../../services/toProcess';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import './MemberChats.css';

/**
 * "Mis Chats": un chat por proyecto, con todos los miembros que tienen un rol en ese proyecto.
 */
const MemberChats = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedProyectId, setSelectedProyectId] = useState(null);

  const loadChats = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await ejecutarMetodo('Hojas de Tiempo', 'Chats', 'consultarChats');
      setChats(data.chats);
      if (!selectedProyectId && data.chats.length > 0) {
        setSelectedProyectId(data.chats[0].proyect_id);
      }
    } catch (err) {
      console.error('Error al cargar los chats:', err);
      setErrorMsg(err.message || 'No se pudieron cargar tus chats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentChat = chats.find((c) => c.proyect_id === selectedProyectId);

  if (loading) {
    return <div className="member-view-loading">Cargando tus chats...</div>;
  }

  if (errorMsg) {
    return <div className="member-error-badge">{errorMsg}</div>;
  }

  return (
    <div className="member-chats">
      <ChatSidebar
        chats={chats}
        selectedProyectId={selectedProyectId}
        onSelect={setSelectedProyectId}
        currentUserId={user?.user_id}
      />
      <ChatWindow
        proyectId={selectedProyectId}
        proyectName={currentChat?.proyect_name}
        currentUserId={user?.user_id}
      />
    </div>
  );
};

export default MemberChats;
