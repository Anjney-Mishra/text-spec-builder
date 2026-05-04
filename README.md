# INTROGEN — Task Spec Builder

A React-based visual editor for building task specification JSON files. Workers can compose text blocks with rich formatting, insert "Next" buttons between them, and export/import the resulting linked-list spec.

## Features

- **Rich Text Editor** — Bold, Underline, Italic formatting with line break support
- **Next Button Blocks** — Inserts a manual navigation marker between text blocks (adds `type: MANUAL` to the preceding block)
- **Linked List Spec** — Text blocks are chained as `start → text1 → text2 → ... → end`
- **Download JSON** — Exports the full spec as a `.json` file
- **Upload JSON** — Import a previously exported spec to reconstruct the UI

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build

```bash
npm run build
```

## Spec Format

The generated JSON follows a linked-list structure:

| Key | Description |
|-----|-------------|
| `start` | Entry point, links to the first text block |
| `textN` | Text component with `next`, `text`, `ctype`, `dtype`, `messageDisplay` fields |
| `end` | Terminal node |

Text blocks immediately before a "Next" button receive an additional `type` field with `value: "MANUAL"`.

## Tech Stack

- React + Vite
- ContentEditable rich text (no external editor dependency)
