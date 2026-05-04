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

  useEffect(() => {
    blocks.forEach(block => {
      if (block.type === 'text' && block.content) {
        contentRef.current[block.id] = block.content
      }
    })
  }, [])

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

  const insertBlockAfter = useCallback((afterId, type) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === afterId)

      if (type === 'next') {
        const currentBlock = prev[index]
        if (currentBlock.type === 'next') return prev
        if (index + 1 < prev.length && prev[index + 1].type === 'next') return prev
      }

      const newId = type === 'text' ? `block-${Date.now()}` : `next-${Date.now()}`
      const newBlock = type === 'text'
        ? { id: newId, type: 'text', content: '' }
        : { id: newId, type: 'next' }

      const updated = [...prev]
      updated.splice(index + 1, 0, newBlock)
      return updated
    })
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
        <div className="navbar-title">Task Spec Builder</div>
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
            <div key={block.id} className="block-wrapper">
              {block.type === 'text' ? (
                <TextBlock
                  id={block.id}
                  initialContent={block.content}
                  onChange={updateBlockContent}
                  onRemove={removeBlock}
                />
              ) : (
                <NextButton
                  id={block.id}
                  onRemove={removeBlock}
                />
              )}
              <div className="inline-actions">
                <button
                  className="inline-btn inline-btn-text"
                  onClick={() => insertBlockAfter(block.id, 'text')}
                >
                  + Text
                </button>
                <button
                  className="inline-btn inline-btn-next"
                  onClick={() => insertBlockAfter(block.id, 'next')}
                >
                  + Next
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
