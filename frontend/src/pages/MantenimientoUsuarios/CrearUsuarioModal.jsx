import React, { useState } from 'react';
import Modal from '../../componentes/ui/Modal';
import UsuarioFormFields from './UsuarioFormFields';
import '../../componentes/ui/ModalForm.css';

const emptyForm = { userNa: '', userPw: '', userEmail: '', statusUserId: '', personId: '', personDisplay: null };

// Modal de alta ("+"). Solo sabe recolectar los campos y delegar el guardado al padre.
const CrearUsuarioModal = ({ onClose, onSubmit, error }) => {
  const [values, setValues] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleFieldChange = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const { personDisplay: _personDisplay, ...payload } = values;
    await onSubmit(payload);
    setSubmitting(false);
  };

  return (
    <Modal title="Nuevo Usuario" icon="person" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        <UsuarioFormFields values={values} onFieldChange={handleFieldChange} disabled={submitting} />

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

export default CrearUsuarioModal;
