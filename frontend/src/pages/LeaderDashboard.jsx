// src/pages/LeaderDashboard.jsx
import React, { useState, useEffect } from 'react';
import WelcomeCard from '../componentes/WelcomeCard';
import MetricCard from '../componentes/MetricCard';
import NotificationFilters from '../componentes/NotificationFilters';
import NotificationRow from '../componentes/NotificationRow';
import './LeaderDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function LeaderDashboard({ user }) {
  const [metrics, setMetrics] = useState({
    active_projects: 0,
    total_employees: 0,
    notifications_today: 0,
    total_hours_week: 0
  });
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
    proyectoId: ''
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Get user name
  const userName = user?.person_na
    ? `${user.person_na} ${user.person_ln || ''}`.trim()
    : 'Líder de Proyecto';

  // 1. Fetch metrics & projects once on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Metrics
        const metricsRes = await fetch(`${API_URL}/api/dashboard/leader/metrics`, { credentials: 'include' });
        const metricsData = await metricsRes.json();
        if (metricsData.success) {
          setMetrics(metricsData.metrics);
        }

        // Projects
        const projectsRes = await fetch(`${API_URL}/api/dashboard/leader/projects`, { credentials: 'include' });
        const projectsData = await projectsRes.json();
        if (projectsData.success) {
          setProjects(projectsData.projects);
        }
      } catch (err) {
        console.error("Error loading initial dashboard data:", err);
        setErrorMsg("Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Fetch notifications when filters change
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
        if (filters.fechaFin) queryParams.append('fechaFin', filters.fechaFin);
        if (filters.proyectoId) queryParams.append('proyectoId', filters.proyectoId);

        const url = `${API_URL}/api/dashboard/leader/notifications?${queryParams.toString()}`;
        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    fetchNotifications();
  }, [filters]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>
        Cargando información del dashboard...
      </div>
    );
  }

  return (
    <div className="leader-dashboard-container">
      {errorMsg && <div className="error-alert">{errorMsg}</div>}

      {/* 1. Welcome Card */}
      <WelcomeCard userName={userName} />

      {/* 2. Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          value={metrics.active_projects}
          label="Proyectos Activos"
          iconType="projects"
        />
        <MetricCard
          value={metrics.total_employees}
          label="Total Empleados"
          iconType="employees"
        />
        <MetricCard
          value={metrics.notifications_today}
          label="Notif. Hoy"
          iconType="notifications"
        />
        <MetricCard
          value={`${metrics.total_hours_week}h`}
          label="Horas Registradas"
          iconType="hours"
        />
      </div>

      {/* 3. Filters */}
      <NotificationFilters
        projects={projects}
        filters={filters}
        onChangeFilters={setFilters}
      />

      {/* 4. Notifications List */}
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationRow key={notif.id} notif={notif} />
          ))
        ) : (
          <div className="no-notifications-placeholder">
            <svg className="no-notif-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
            </svg>
            <p>No se encontraron notificaciones en este rango o proyecto.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderDashboard;
