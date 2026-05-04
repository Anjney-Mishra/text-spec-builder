import { useState, useCallback, useRef, useEffect } from 'react'
import TextBlock from './components/TextBlock'
import NextButton from './components/NextButton'
import { generateSpec } from './utils/specGenerator'
import { parseSpec } from './utils/specParser'
import './App.css'

const STORAGE_KEY = 'introgen_blocks'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [{ id: 'block-1', type: 'text', content: '' }]
}

function App() {
  const [blocks, setBlocks] = useState(loadFromStorage)
  const contentRef = useRef({})
  const fileInputRef = useRef(null)

  // Initialize contentRef from loaded blocks
  useEffect(() => {
    blocks.forEach(block => {
      if (block.type === 'text' && block.content) {
        contentRef.current[block.id] = block.content
      }
    })
  }, [])

  // Save to localStorage whenever blocks change
  useEffect(() => {
    const blocksToSave = blocks.map(block => {
      if (block.type === 'text') {
        return { ...block, content: contentRef.current[block.id] || block.content || '' }
      }
      return block
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocksToSave))
  }, [blocks])

  const saveToStorage = useCallback(() => {
    const blocksToSave = blocks.map(block => {
      if (block.type === 'text') {
        return { ...block, content: contentRef.current[block.id] || '' }
      }
      return block
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocksToSave))
  }, [blocks])

  const addTextBlock = useCallback(() => {
    const newId = `block-${Date.now()}`
    setBlocks(prev => [...prev, { id: newId, type: 'text', content: '' }])
  }, [])

  const addNextButton = useCallback(() => {
    const newId = `next-${Date.now()}`
    setBlocks(prev => [...prev, { id: newId, type: 'next' }])
  }, [])

  const updateBlockContent = useCallback((id, content) => {
    contentRef.current[id] = content
    saveToStorage()
  }, [saveToStorage])

  const removeBlock = useCallback((id) => {
    setBlocks(prev => prev.filter(block => block.id !== id))
    delete contentRef.current[id]
  }, [])

  const downloadJson = useCallback(() => {
    const blocksWithContent = blocks.map(block => {
      if (block.type === 'text') {
        return { ...block, content: contentRef.current[block.id] || '' }
      }
      return block
    })
    const spec = generateSpec(blocksWithContent)
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'spec.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [blocks])

  const resetAll = useCallback(() => {
    if (window.confirm('Are you sure? This will clear all blocks and reset the editor.')) {
      contentRef.current = {}
      localStorage.removeItem(STORAGE_KEY)
      setBlocks([{ id: `block-${Date.now()}`, type: 'text', content: '' }])
    }
  }, [])

  const uploadJson = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const spec = JSON.parse(event.target.result)
        const parsedBlocks = parseSpec(spec)
        if (parsedBlocks.length > 0) {
          contentRef.current = {}
          parsedBlocks.forEach(block => {
            if (block.type === 'text' && block.content) {
              contentRef.current[block.id] = block.content
            }
          })
          setBlocks(parsedBlocks)
        }
      } catch (err) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-title">Text Spec Builder</div>
        <div className="navbar-actions">
          <button className="nav-btn nav-btn-reset" onClick={resetAll}>
            Reset
          </button>
          <button className="nav-btn nav-btn-upload" onClick={() => fileInputRef.current?.click()}>
            Upload JSON
          </button>
          <button className="nav-btn nav-btn-download" onClick={downloadJson}>
            Download JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={uploadJson}
            hidden
          />
        </div>
      </nav>

      <div className="container">
        <div className="blocks-container">
          {blocks.map((block) => (
            block.type === 'text' ? (
              <TextBlock
                key={block.id}
                id={block.id}
                initialContent={block.content}
                onChange={updateBlockContent}
                onRemove={removeBlock}
              />
            ) : (
              <NextButton
                key={block.id}
                id={block.id}
                onRemove={removeBlock}
              />
            )
          ))}
        </div>

        <div className="actions">
          <button className="btn btn-text" onClick={addTextBlock}>
            Add Text
          </button>
          <button className="btn btn-next" onClick={addNextButton}>
            Add Next Button
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
