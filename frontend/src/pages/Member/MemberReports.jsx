// src/pages/Member/MemberReports.jsx
import { useEffect, useMemo, useState } from 'react';
import { StatusBadge } from '../../componentes/StatusBadge';
import { ProgressBar } from '../../componentes/ProgressBar';
import { ProjectIcon } from './ProjectIcon';
import { ActivityBarChart } from './ActivityBarChart';
import { ProgressLineChart } from './ProgressLineChart';
import { getReportStateLabel, formatReportDateTime } from './projectVisuals';
import { callMethod } from '../../services/toProcess';
import './Member.css';
import './MemberReports.css';

const REPORT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PRINT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V4a1 1 0 011-1h10a1 1 0 011 1v5M6 18H4a1 1 0 01-1-1v-6a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-1 1h-2m-12 0v3a1 1 0 001 1h8a1 1 0 001-1v-3m-10 0h10" />
  </svg>
);

const DOC_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CLOCK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
  </svg>
);

const TREND_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const STATS_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CHART_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const LINE_TREND_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l5-5 4 4 7-9" />
  </svg>
);

const MemberReports = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedProyectId, setSelectedProyectId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const data = await callMethod('Hojas de Tiempo', 'Actividades', 'consultarNotificaciones');
        setNotifications(data.notifications);
      } catch (err) {
        console.error('Error al cargar la hoja de tiempo:', err);
        setErrorMsg(err.message || 'Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Lista de proyectos únicos (para el selector "Mis Proyectos")
  const proyectOptions = useMemo(() => {
    const map = new Map();
    notifications.forEach((n) => {
      if (!map.has(n.proyect_id)) {
        map.set(n.proyect_id, { proyect_id: n.proyect_id, proyect_name: n.proyect_name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.proyect_name.localeCompare(b.proyect_name));
  }, [notifications]);

  useEffect(() => {
    if (!selectedProyectId && proyectOptions.length > 0) {
      setSelectedProyectId(proyectOptions[0].proyect_id);
    }
  }, [selectedProyectId, proyectOptions]);

  const proyectNotifications = notifications.filter((n) => n.proyect_id === selectedProyectId);

  const totalRegistros = proyectNotifications.length;
  const totalHoras = proyectNotifications.reduce((sum, n) => sum + Number(n.total_hours_spent || 0), 0);
  const avgAvance = totalRegistros > 0
    ? Math.round(proyectNotifications.reduce((sum, n) => sum + Number(n.progress_percentage || 0), 0) / totalRegistros)
    : 0;

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="member-view-loading">Cargando tu hoja de tiempo...</div>;
  }

  return (
    <div className="member-reports">
      <div className="member-panel">
        <div className="member-panel-header">
          <span className="member-panel-header-icon">{REPORT_ICON}</span>
          <h2>Mis Reportes</h2>
        </div>

        <div className="member-panel-body">
          {errorMsg && <div className="member-error-badge">{errorMsg}</div>}

          {notifications.length === 0 ? (
            <p className="member-empty-text">Todavía no has registrado ningún avance.</p>
          ) : (
            <>
              {/* Hero: Reporte de Actividades */}
              <div className="reports-hero">
                <div className="reports-hero-top">
                  <div className="reports-hero-title">
                    <span className="reports-hero-icon">{STATS_ICON}</span>
                    <div>
                      <h3>Reporte de Actividades</h3>
                      <span className="reports-hero-subtitle">
                        {totalRegistros} registro{totalRegistros !== 1 ? 's' : ''} · {totalHoras.toFixed(1)}h totales · {avgAvance}% avance promedio
                      </span>
                    </div>
                  </div>
                  <button className="reports-print-btn" onClick={handlePrint}>
                    {PRINT_ICON}
                    Imprimir
                  </button>
                </div>

                <div className="reports-proyect-select">
                  <label>Mis Proyectos</label>
                  <select value={selectedProyectId || ''} onChange={(e) => setSelectedProyectId(e.target.value)}>
                    {proyectOptions.map((p) => (
                      <option key={p.proyect_id} value={p.proyect_id}>{p.proyect_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stat cards */}
              <div className="reports-stats-row">
                <div className="reports-stat-card">
                  <div className="reports-stat-icon">{DOC_ICON}</div>
                  <div>
                    <span className="reports-stat-label">Registros</span>
                    <span className="reports-stat-value">{totalRegistros}</span>
                  </div>
                </div>
                <div className="reports-stat-card">
                  <div className="reports-stat-icon">{CLOCK_ICON}</div>
                  <div>
                    <span className="reports-stat-label">Horas Totales</span>
                    <span className="reports-stat-value">{totalHoras.toFixed(1)}h</span>
                  </div>
                </div>
                <div className="reports-stat-card">
                  <div className="reports-stat-icon">{TREND_ICON}</div>
                  <div>
                    <span className="reports-stat-label">Avance Promedio</span>
                    <span className="reports-stat-value">{avgAvance}%</span>
                  </div>
                </div>
              </div>

              {/* Tabla */}
              <div className="reports-table-wrapper">
                <div className="reports-table-columns">
                  <span>PROYECTO</span>
                  <span>ACTIVIDAD</span>
                  <span>% COMPLETADO</span>
                  <span>HR DE TRABAJO</span>
                  <span>ESTADO</span>
                </div>
                {proyectNotifications.map((n) => (
                  <div key={n.id} className="reports-table-row">
                    <span className="reports-table-proyect">
                      <ProjectIcon proyectId={selectedProyectId} size={22} />
                      {n.proyect_name}
                    </span>
                    <div className="reports-table-activity">
                      <span className="reports-table-activity-name">{n.assignment_name}</span>
                      <span className="reports-table-activity-date">{formatReportDateTime(n.date, n.notification_time)}</span>
                    </div>
                    <div className="reports-table-progress">
                      <ProgressBar value={n.progress_percentage} hideLabel />
                      <span>{n.progress_percentage}%</span>
                    </div>
                    <span className="reports-table-hours">{n.total_hours_spent}h</span>
                    <StatusBadge status={getReportStateLabel(n.progress_percentage)} />
                  </div>
                ))}
              </div>

              {/* Estadísticas */}
              <div className="reports-stats-header">
                <span className="reports-stats-header-icon">{CHART_ICON}</span>
                <h3>Estadísticas</h3>
              </div>

              <div className="reports-chart-card">
                <div className="reports-chart-title">
                  <span className="reports-chart-icon">{CHART_ICON}</span>
                  <div>
                    <h4>Avance por Actividad</h4>
                    <span>% completado · horas trabajadas por actividad</span>
                  </div>
                </div>
                <ActivityBarChart notifications={proyectNotifications} />
              </div>

              <div className="reports-chart-card">
                <div className="reports-chart-title">
                  <span className="reports-chart-icon reports-chart-icon--green">{LINE_TREND_ICON}</span>
                  <div>
                    <h4>Evolución de Avance Temporal</h4>
                    <span>Eje X — Tiempo (fechas) · Eje Y — % completado</span>
                  </div>
                </div>
                <ProgressLineChart notifications={proyectNotifications} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberReports;
