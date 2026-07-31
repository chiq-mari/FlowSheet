import React from 'react';
import { useAuditoria } from '../../hooks/useAuditoria';
import BuscadorProyecto from './BuscadorProyecto';
import AuditoriaTable from './AuditoriaTable';
import './MantenimientoAuditoria.css';

// Pantalla "Auditoría" (solo lectura, subsistema Seguridad). A diferencia de
// las demás pantallas de Mantenimiento, el mockup no tiene un header oscuro
// con ícono+título -- son dos tarjetas blancas apiladas: filtros arriba,
// resultados abajo -- así que no reusa .maintenance-card/.maintenance-header.
const MantenimientoAuditoria = () => {
  const {
    proyecto,
    setProyecto,
    modoGlobal,
    verAccionesGenerales,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    rangoInvalido,
    registros,
    loading,
    error,
  } = useAuditoria();

  const haySeleccion = Boolean(proyecto || modoGlobal);

  return (
    <div className="auditoria-page">
      <div className="auditoria-filters-card">
        <div className="auditoria-field">
          <label>Fecha Inicio</label>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </div>
        <div className="auditoria-field">
          <label>Fecha Fin</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>
        <div className="auditoria-field auditoria-field-grow">
          <label>Proyecto</label>
          <BuscadorProyecto selected={proyecto} onSelect={setProyecto} />
        </div>
        <button
          type="button"
          className={`auditoria-global-btn ${modoGlobal ? 'active' : ''}`}
          onClick={verAccionesGenerales}
          title="Acciones del Administrador que no pertenecen a ningún proyecto"
        >
          Acciones Generales
        </button>
        <button type="button" className="auditoria-print-btn" onClick={() => window.print()}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m10 0v4a1 1 0 01-1 1H8a1 1 0 01-1-1v-4m10 0H7m3-13h4a1 1 0 011 1v4H9V5a1 1 0 011-1z" />
          </svg>
          Imprimir
        </button>
      </div>

      {rangoInvalido && (
        <p className="maintenance-load-error">El rango de fechas no puede superar un mes.</p>
      )}
      {error && !rangoInvalido && <p className="maintenance-load-error">{error}</p>}

      <div className="auditoria-results-card">
        <div className="auditoria-results-header">
          <span>
            {modoGlobal ? 'Registro de Auditoría — Acciones Generales' : 'Registro de Auditoría del Sistema'}
          </span>
          <span className="auditoria-results-count">{registros.length} registros</span>
        </div>

        {!haySeleccion ? (
          <div className="auditoria-empty-state">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="auditoria-empty-title">Seleccionar proyecto</p>
            <p className="auditoria-empty-subtitle">
              Elige un proyecto, o pulsa "Acciones Generales" para ver las del Administrador
            </p>
          </div>
        ) : (
          <AuditoriaTable rows={registros} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default MantenimientoAuditoria;
