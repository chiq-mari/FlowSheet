import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import PersonaFormFields from './PersonaFormFields';
import '../../componentes/ui/ModalForm.css';

// Modal de edición (icono lápiz). Recibe la fila seleccionada y la precarga en el formulario.
const EditarPersonaModal = ({ persona, onClose, onSubmit, error }) => {
  const [values, setValues] = useState({
    personCi: persona.person_ci || '',
    personNa: persona.person_na || '',
    personLn: persona.person_ln || '',
    personEmail: persona.person_email || '',
    chargeId: persona.charge_id ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ personId: persona.person_id, ...values });
    setSubmitting(false);
  };

  return (
    <Modal title="Editar Persona" icon="person" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <PersonaFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

        {error && <p className="modal-form-error">{error}</p>}

        <div className="modal-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditarPersonaModal;
