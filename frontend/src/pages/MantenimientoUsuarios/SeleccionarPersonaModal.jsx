import React, { useState } from 'react';
import { usePersonas } from '../../hooks/usePersonas';
import Modal from '../../componentes/ui/Modal';
import '../../componentes/ui/DataTable.css';
import '../../componentes/ui/SearchToolbar.css';
import '../../componentes/ui/ModalForm.css';
import './SeleccionarPersonaModal.css';

// Modal anidado que se abre desde el campo "Persona" de Crear/Editar Usuario.
// Reusa el hook de Persona ya construido (solo la parte de lectura: lista + búsqueda),
// sin duplicar ninguna llamada a toProcess.
const SeleccionarPersonaModal = ({ selectedPersonId, onClose, onSelect }) => {
  const { personas, search, setSearch, loading } = usePersonas();
  const [pickedId, setPickedId] = useState(selectedPersonId || null);

  const handleAccept = () => {
    const persona = personas.find((p) => p.person_id === pickedId);
    if (persona) onSelect(persona);
    onClose();
  };

  return (
    <Modal title="Seleccionar Persona" icon="person" onClose={onClose}>
      <div className="persona-picker">
        <div className="search-toolbar-input persona-picker-search">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="data-table-wrapper persona-picker-table-wrapper">
          {loading ? (
            <p className="data-table-status">Cargando personas...</p>
          ) : personas.length === 0 ? (
            <p className="data-table-status">No se encontraron personas.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-col"></th>
                  <th>CI</th>
                  <th>NOMBRE</th>
                  <th>APELLIDO</th>
                </tr>
              </thead>
              <tbody>
                {personas.map((persona) => {
                  const isPicked = pickedId === persona.person_id;
                  return (
                    <tr
                      key={persona.person_id}
                      className={isPicked ? 'selected' : ''}
                      onClick={() => setPickedId(persona.person_id)}
                    >
                      <td>
                        <button
                          type="button"
                          className={`row-checkbox ${isPicked ? 'checked' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setPickedId(persona.person_id); }}
                          aria-label={`Seleccionar ${persona.person_na}`}
                        />
                      </td>
                      <td className="cell-mono">{persona.person_ci}</td>
                      <td className="cell-strong">{persona.person_na}</td>
                      <td>{persona.person_ln}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleAccept} disabled={!pickedId}>
            Aceptar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SeleccionarPersonaModal;
