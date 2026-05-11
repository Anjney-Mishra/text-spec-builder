import { useRef, useCallback, useEffect, useState } from 'react'

function TextBlock({ id, initialContent, onChange, onRemove }) {
  const editorRef = useRef(null)
  const initialized = useRef(false)
  const [activeFormats, setActiveFormats] = useState({ bold: false, underline: false, italic: false })

  useEffect(() => {
    if (editorRef.current && initialContent && !initialized.current) {
      editorRef.current.innerHTML = initialContent
      onChange(id, initialContent)
      initialized.current = true
    }
  }, [initialContent, id, onChange])

  const checkActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      underline: document.queryCommandState('underline'),
      italic: document.queryCommandState('italic')
    })
  }, [])

  const execCommand = useCallback((command) => {
    document.execCommand(command, false, null)
    if (editorRef.current) {
      onChange(id, editorRef.current.innerHTML)
    }
    checkActiveFormats()
  }, [id, onChange, checkActiveFormats])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(id, editorRef.current.innerHTML)
    }
    checkActiveFormats()
  }, [id, onChange, checkActiveFormats])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      document.execCommand('insertLineBreak')
      if (editorRef.current) {
        onChange(id, editorRef.current.innerHTML)
      }
    }
  }, [id, onChange])

  const handleKeyUp = useCallback(() => {
    checkActiveFormats()
  }, [checkActiveFormats])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    if (editorRef.current) {
      onChange(id, editorRef.current.innerHTML)
    }
  }, [id, onChange])

  const handleMouseUp = useCallback(() => {
    checkActiveFormats()
  }, [checkActiveFormats])

  return (
    <div className="text-block">
      <button className="remove-btn" onClick={() => onRemove(id)} title="Remove">
        ×
      </button>
      <div className="toolbar">
        <button
          className={activeFormats.bold ? 'active' : ''}
          onMouseDown={(e) => { e.preventDefault(); execCommand('bold') }}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          className={activeFormats.underline ? 'active' : ''}
          onMouseDown={(e) => { e.preventDefault(); execCommand('underline') }}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          className={activeFormats.italic ? 'active' : ''}
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
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        onMouseUp={handleMouseUp}
      />
    </div>
  )
}

export default TextBlock
