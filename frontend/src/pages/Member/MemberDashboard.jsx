// src/pages/Member/MemberDashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import { UserAvatar } from '../../componentes/UserAvatar';
import { ProgressBar } from '../../componentes/ProgressBar';
import { ejecutarMetodo } from '../../services/toProcess';
import './Member.css';
import './MemberDashboard.css';

const formatLongDate = (date) =>
  date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const formatShortDateTime = (dateValue, timeValue) => {
  if (!dateValue) return '-';
  const d = new Date(dateValue);
  const dateStr = isNaN(d) ? dateValue : d.toISOString().slice(0, 10);
  const timeStr = timeValue ? String(timeValue).slice(0, 5) : '';
  return timeStr ? `${dateStr} ${timeStr}` : dateStr;
};

// Lunes de la semana actual (inicio de semana en ISO: lunes-domingo)
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo, 1 = lunes ... 6 = sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const MemberDashboard = ({ user }) => {
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros del panel "Mis Notificaciones"
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [proyectFilter, setProyectFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const [assignData, notifData] = await Promise.all([
          ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'consultarAsignaciones'),
          ejecutarMetodo('Hojas de Tiempo', 'Actividades', 'consultarNotificaciones'),
        ]);

        setAssignments(assignData.assignments);
        setNotifications(notifData.notifications);
      } catch (err) {
        console.error('Error al cargar el dashboard del miembro:', err);
        setErrorMsg('No se pudo cargar la información del dashboard.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // --- Métricas de las 2 tarjetas superiores ---
  const totalProjects = useMemo(
    () => new Set(assignments.map((a) => a.proyect_id)).size,
    [assignments]
  );

  const hoursThisWeek = useMemo(() => {
    const monday = getStartOfWeek();
    return notifications
      .filter((n) => new Date(n.date) >= monday)
      .reduce((sum, n) => sum + Number(n.total_hours_spent || 0), 0);
  }, [notifications]);

  // --- Opciones del filtro de proyecto (derivadas de las notificaciones reales) ---
  const proyectOptions = useMemo(
    () => [...new Set(notifications.map((n) => n.proyect_name))].sort(),
    [notifications]
  );

  // --- Notificaciones filtradas según fecha inicio/fin y proyecto ---
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const nDate = n.date ? new Date(n.date).toISOString().slice(0, 10) : null;
      if (dateFrom && nDate && nDate < dateFrom) return false;
      if (dateTo && nDate && nDate > dateTo) return false;
      if (proyectFilter && n.proyect_name !== proyectFilter) return false;
      return true;
    });
  }, [notifications, dateFrom, dateTo, proyectFilter]);

  const welcomeName = user?.person_na || 'Miembro';

  if (loading) {
    return <div className="member-view-loading">Cargando dashboard...</div>;
  }

  return (
    <div className="member-dashboard">
      {errorMsg && <div className="member-error-badge">{errorMsg}</div>}

      {/* Banner de bienvenida */}
      <div className="member-welcome-banner">
        <span className="member-welcome-greeting">Bienvenido de nuevo,</span>
        <h2 className="member-welcome-name">{welcomeName}</h2>
        <span className="member-welcome-date">{formatLongDate(new Date())}</span>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="member-stats-row">
        <div className="member-stat-card-h">
          <div className="member-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <span className="member-stat-h-value">{totalProjects}</span>
            <span className="member-stat-h-label">Mis Proyectos</span>
          </div>
        </div>

        <div className="member-stat-card-h">
          <div className="member-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
            </svg>
          </div>
          <div>
            <span className="member-stat-h-value">{hoursThisWeek}h</span>
            <span className="member-stat-h-label">Mis Horas esta Semana</span>
          </div>
        </div>
      </div>

      {/* Panel "Mis Notificaciones" */}
      <div className="member-notif-panel">
        <div className="member-notif-header">
          <div className="member-notif-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3>Mis Notificaciones</h3>
            <span className="member-notif-count">{filteredNotifications.length} registros</span>
          </div>
        </div>

        <div className="member-notif-filters">
          <div className="member-filter-group">
            <label>Fecha inicio</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="member-filter-group">
            <label>Fecha fin</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="member-filter-group">
            <label>Proyecto</label>
            <select value={proyectFilter} onChange={(e) => setProyectFilter(e.target.value)}>
              <option value="">Todos los proyectos</option>
              {proyectOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="member-notif-list">
          {filteredNotifications.length === 0 ? (
            <p className="member-empty-text member-notif-empty">
              No hay notificaciones que coincidan con estos filtros.
            </p>
          ) : (
            filteredNotifications.map((n) => (
              <div key={n.id} className="member-notif-row">
                <UserAvatar name={welcomeName} size={40} />
                <div className="member-notif-row-main">
                  <div className="member-notif-row-top">
                    <span className="member-notif-row-title">{n.assignment_name}</span>
                    <span className="member-notif-row-project">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      {n.proyect_name}
                    </span>
                  </div>
                  <span className="member-notif-row-meta">{formatShortDateTime(n.date, n.notification_time)}</span>
                  <ProgressBar percentage={n.progress_percentage} hours={n.total_hours_spent} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
