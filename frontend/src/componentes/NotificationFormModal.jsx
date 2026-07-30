// src/componentes/NotificationFormModal.jsx
import { useState } from 'react';
import { callMethod } from '../services/toProcess';
import './buttons.css';
import './NotificationFormModal.css';

/**
 * Modal para que un Miembro registre un avance (notificación) sobre una actividad asignada.
 * Fecha y hora se capturan automáticamente al enviar (no se piden en el formulario).
 * @param {object} assignment - Asignación preseleccionada { user_assignment_id, assignment_name, last_progress }
 * @param {function} onClose - Cierra el modal sin guardar
 * @param {function} onSaved - Se dispara con la notificación creada tras un guardado exitoso
 */
export function NotificationFormModal({ assignment, onClose, onSaved }) {
  const [progress, setProgress] = useState(assignment?.last_progress ?? 0);
  const [hours, setHours] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = hours !== '' && Number(hours) > 0 && progress !== '' && Number(progress) >= 0 && Number(progress) <= 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || saving) return;

    setErrorMsg('');
    setSaving(true);

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

    try {
      const data = await callMethod('Hojas de Tiempo', 'Actividades', 'registrarAvance', {
        user_assignment_id: assignment.user_assignment_id,
        date: today,
        notification_time: currentTime,
        progress_percentage: Number(progress),
        total_hours_spent: Number(hours),
        observation: null,
      });

      onSaved(data.notification);
    } catch (err) {
      console.error('Error al registrar el avance:', err);
      setErrorMsg(err.message || 'No se pudo registrar el avance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notif-modal-overlay" onClick={onClose}>
      <div className="notif-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="notif-modal-header">
          <div className="notif-modal-header-title">
            <span className="notif-modal-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            <h3>Enviar Notificación</h3>
          </div>
          <button className="notif-modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit} className="notif-modal-form">
          {errorMsg && <div className="notif-modal-error">{errorMsg}</div>}

          <input className="notif-modal-readonly" value={assignment?.assignment_name || ''} readOnly disabled />

          <div className="form-group">
            <label>% de Avance</label>
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Hr de Trabajo</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              placeholder="Horas trabajadas"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary notif-modal-confirm" disabled={!isValid || saving}>
            {saving ? 'Enviando...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  );
}
