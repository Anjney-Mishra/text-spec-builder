import { useRef, useCallback, useEffect } from 'react'

function TextBlock({ id, initialContent, onChange, onRemove }) {
  const editorRef = useRef(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (editorRef.current && initialContent && !initialized.current) {
      editorRef.current.innerHTML = initialContent
      onChange(id, initialContent)
      initialized.current = true
    }
  }, [initialContent, id, onChange])

  const execCommand = useCallback((command) => {
    document.execCommand(command, false, null)
    if (editorRef.current) {
      onChange(id, editorRef.current.innerHTML)
    }
  }, [id, onChange])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(id, editorRef.current.innerHTML)
    }
  }, [id, onChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.execCommand('insertLineBreak')
      if (editorRef.current) {
        onChange(id, editorRef.current.innerHTML)
      }
    }
  }, [id, onChange])

  return (
    <div className="text-block">
      <button className="remove-btn" onClick={() => onRemove(id)} title="Remove">
        ×
      </button>
      <div className="toolbar">
        <button
          onMouseDown={(e) => { e.preventDefault(); execCommand('bold') }}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); execCommand('underline') }}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          onMouseDown={(e) => { e.preventDefault(); execCommand('italic') }}
          title="Italic"
        >
          <em>I</em>
        </button>
      </div>
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

export default TextBlock
