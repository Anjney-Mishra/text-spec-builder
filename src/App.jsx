import { useState, useCallback, useRef } from 'react'
import TextBlock from './components/TextBlock'
import NextButton from './components/NextButton'
import { generateSpec } from './utils/specGenerator'
import { parseSpec } from './utils/specParser'
import './App.css'

function App() {
  const [blocks, setBlocks] = useState([
    { id: 'block-1', type: 'text', content: '' }
  ])
  const contentRef = useRef({})
  const fileInputRef = useRef(null)

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
  }, [])

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
