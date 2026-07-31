import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import OpcionFormFields from './OpcionFormFields';
import '../../componentes/ui/ModalForm.css';

const emptyForm = { subSystemId: '', optionDe: '', parentOptionId: '' };

// Modal de alta ("+"). Solo sabe recolectar los campos y delegar el guardado al padre.
const CrearOpcionModal = ({ onClose, onSubmit, error }) => {
  const [values, setValues] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(values);
    setSubmitting(false);
  };

  return (
    <Modal title="Nueva Opción" icon="list" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <OpcionFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

        {error && <p className="modal-form-error">{error}</p>}

        <div className="modal-form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CrearOpcionModal;
