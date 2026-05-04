function NextButton({ id, onRemove }) {
  return (
    <div className="next-button-block">
      <button className="remove-btn" onClick={() => onRemove(id)} title="Remove">
        ×
      </button>
      <span className="next-label">Next</span>
    </div>
  )
}

export default NextButton
