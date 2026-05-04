export function parseSpec(spec) {
  const blocks = []

  if (!spec || !spec.start) return blocks

  let currentKey = spec.start.next?.value
  while (currentKey && currentKey !== 'end' && spec[currentKey]) {
    const component = spec[currentKey]

    const blockId = `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    blocks.push({
      id: blockId,
      type: 'text',
      content: component.text?.value || ''
    })

    if (component.type && component.type.value === 'MANUAL') {
      blocks.push({
        id: `next-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'next'
      })
    }

    currentKey = component.next?.value
  }

  return blocks
}
