export function generateSpec(blocks) {
  const textBlocks = []
  const nextButtonPositions = new Set()

  // Identify which text block indices are followed by a "next" block
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'text') {
      textBlocks.push(blocks[i])
    } else if (blocks[i].type === 'next') {
      // Find the preceding text block
      for (let j = i - 1; j >= 0; j--) {
        if (blocks[j].type === 'text') {
          nextButtonPositions.add(blocks[j].id)
          break
        }
      }
    }
  }

  if (textBlocks.length === 0) {
    return {
      start: {
        key: 'start',
        name: 'Start Component',
        next: { src: 'CONSTANT', type: 'REF', value: 'end' },
        ctype: 'START',
        description: 'First Component of the task specification'
      },
      end: {
        key: 'end',
        name: 'End Component',
        next: { src: 'CONSTANT', type: 'REF', value: null },
        ctype: 'END',
        description: 'Last Component of the task specification'
      }
    }
  }

  const spec = {}

  // Build start component
  spec.start = {
    key: 'start',
    name: 'Start Component',
    next: {
      src: 'CONSTANT',
      type: 'REF',
      value: `text${1}`
    },
    ctype: 'START',
    description: 'First Component of the task specification'
  }

  // Build text components as linked list
  textBlocks.forEach((block, index) => {
    const key = `text${index + 1}`
    const nextKey = index < textBlocks.length - 1 ? `text${index + 2}` : 'end'

    const component = {
      key,
      name: key,
      next: {
        src: 'CONSTANT',
        type: 'REF',
        value: nextKey
      },
      text: {
        src: 'CONSTANT',
        type: 'STRING',
        value: cleanHtml(block.content || '')
      },
      ctype: 'PLATFORM',
      dtype: 'TEXT',
      messageDisplay: {
        src: 'CONSTANT',
        type: 'ENUM',
        value: 'DEFAULT',
        options: {
          DEFAULT: 'DEFAULT',
          EXAMPLE: 'EXAMPLE',
          TUTORIAL: 'TUTORIAL',
          REFERENCE: 'REFERENCE',
          INSTRUCTION: 'INSTRUCTION'
        }
      }
    }

    // Add type parameter if this text block is followed by a next button
    if (nextButtonPositions.has(block.id)) {
      component.type = {
        src: 'CONSTANT',
        type: 'ENUM',
        value: 'MANUAL',
        options: {
          AUTO: 'Move to the next component automatically',
          DELAY: 'Wait for a specified delay',
          MANUAL: 'User clicks a button to proceed'
        }
      }
    }

    spec[key] = component
  })

  // Build end component
  spec.end = {
    key: 'end',
    name: 'End Component',
    next: {
      src: 'CONSTANT',
      type: 'REF',
      value: null
    },
    ctype: 'END',
    description: 'Last Component of the task specification'
  }

  return spec
}

function cleanHtml(html) {
  if (!html) return ''

  let cleaned = html
    // Normalize div/p tags to br
    .replace(/<div><br\s*\/?><\/div>/gi, '<br>')
    .replace(/<div>/gi, '<br>')
    .replace(/<\/div>/gi, '')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '<br>')
    // Keep only allowed tags: b, u, i, br
    .replace(/<(?!\/?(?:b|u|i|br)\b)[^>]*>/gi, '')
    // Clean up multiple consecutive br tags
    .replace(/(<br\s*\/?>){3,}/gi, '<br><br>')
    // Remove leading/trailing br
    .replace(/^(<br\s*\/?>)+/i, '')
    .replace(/(<br\s*\/?>)+$/i, '')
    // Normalize br tags
    .replace(/<br\s*\/?>/gi, '<br>')

  return cleaned.trim()
}
