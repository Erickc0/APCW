function ConfirmModal({ confirmation, onAccept, onCancel }) {
  if (!confirmation) {
    return null;
  }

  return (
    <div className="confirm-modal">
      <div className="confirm-modal-content">
        <h3>Confirmar acción</h3>
        <p>{confirmation.message}</p>
        <div className="form-actions">
          <button type="button" onClick={onAccept}>
            Confirmar
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
