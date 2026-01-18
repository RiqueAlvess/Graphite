import { useEffect, useRef, useCallback, useState, memo } from 'react'
import { EditorState, Extension } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { linter, lintGutter } from '@codemirror/lint'
import { bracketMatching, foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import type { VegaLiteSpec } from '@/types'
import { useDebounce } from '@/hooks/useDebounce'

interface VegaJsonEditorProps {
  spec: VegaLiteSpec | null
  onChange: (spec: VegaLiteSpec) => void
  readOnly?: boolean
  theme?: 'light' | 'dark'
  debounceMs?: number
  className?: string
}

function VegaJsonEditor({
  spec,
  onChange,
  readOnly = false,
  theme = 'dark',
  debounceMs = 100, // Reduced from 500ms to 100ms for better real-time performance
  className = '',
}: VegaJsonEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<EditorView | null>(null)
  const isExternalUpdateRef = useRef(false)

  const [parseError, setParseError] = useState<string | null>(null)
  const [localContent, setLocalContent] = useState<string>('')

  // Debounce local content changes before calling onChange
  const debouncedContent = useDebounce(localContent, debounceMs)

  // Parse and emit changes when debounced content changes
  useEffect(() => {
    if (!debouncedContent || isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false
      return
    }

    try {
      const parsed = JSON.parse(debouncedContent) as VegaLiteSpec
      setParseError(null)
      onChange(parsed)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setParseError(e.message)
      }
    }
  }, [debouncedContent, onChange])

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return

    const initialContent = spec ? JSON.stringify(spec, null, 2) : '{}'

    const extensions: Extension[] = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
      ]),
      json(),
      linter(jsonParseLinter()),
      lintGutter(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !isExternalUpdateRef.current) {
          const content = update.state.doc.toString()
          setLocalContent(content)
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '13px',
        },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
        },
        '.cm-content': {
          caretColor: theme === 'dark' ? '#fff' : '#000',
        },
        '.cm-gutters': {
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f5f5f5',
          borderRight: '1px solid',
          borderColor: theme === 'dark' ? '#333' : '#ddd',
        },
      }),
    ]

    if (theme === 'dark') {
      extensions.push(oneDark)
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true))
    }

    const state = EditorState.create({
      doc: initialContent,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    editorRef.current = view
    setLocalContent(initialContent)

    return () => {
      view.destroy()
      editorRef.current = null
    }
  }, [theme, readOnly]) // Only recreate on theme/readOnly changes

  // Update editor content when spec changes externally
  useEffect(() => {
    if (!editorRef.current || !spec) return

    const newContent = JSON.stringify(spec, null, 2)
    const currentContent = editorRef.current.state.doc.toString()

    // Only update if content actually changed and not from local edit
    if (newContent !== currentContent) {
      // Check if the parsed values are equal (to avoid formatting-only updates)
      try {
        const currentParsed = JSON.parse(currentContent)
        if (JSON.stringify(currentParsed) === JSON.stringify(spec)) {
          return // Same data, just different formatting
        }
      } catch {
        // If current content is invalid JSON, proceed with update
      }

      isExternalUpdateRef.current = true
      editorRef.current.dispatch({
        changes: {
          from: 0,
          to: editorRef.current.state.doc.length,
          insert: newContent,
        },
      })
      setLocalContent(newContent)
    }
  }, [spec])

  // Format JSON handler
  const handleFormat = useCallback(() => {
    if (!editorRef.current) return

    try {
      const content = editorRef.current.state.doc.toString()
      const parsed = JSON.parse(content)
      const formatted = JSON.stringify(parsed, null, 2)

      isExternalUpdateRef.current = true
      editorRef.current.dispatch({
        changes: {
          from: 0,
          to: editorRef.current.state.doc.length,
          insert: formatted,
        },
      })
      setLocalContent(formatted)
      setParseError(null)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setParseError(e.message)
      }
    }
  }, [])

  // Minify JSON handler
  const handleMinify = useCallback(() => {
    if (!editorRef.current) return

    try {
      const content = editorRef.current.state.doc.toString()
      const parsed = JSON.parse(content)
      const minified = JSON.stringify(parsed)

      isExternalUpdateRef.current = true
      editorRef.current.dispatch({
        changes: {
          from: 0,
          to: editorRef.current.state.doc.length,
          insert: minified,
        },
      })
      setLocalContent(minified)
      setParseError(null)
    } catch (e) {
      if (e instanceof SyntaxError) {
        setParseError(e.message)
      }
    }
  }, [])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-700'
          : 'bg-gray-100 border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Vega-Lite Spec
          </span>
          {parseError && (
            <span className="text-xs text-red-500 ml-2">
              JSON Error
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleFormat}
              className={`px-2 py-1 text-xs rounded ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              title="Formatar JSON (Ctrl+Shift+F)"
            >
              Formatar
            </button>
            <button
              onClick={handleMinify}
              className={`px-2 py-1 text-xs rounded ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
              title="Minificar JSON"
            >
              Minificar
            </button>
          </div>
        )}
      </div>

      {/* Error banner */}
      {parseError && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-3 py-2">
          <p className="text-xs text-red-500 font-mono">
            {parseError}
          </p>
        </div>
      )}

      {/* Editor container */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden ${
          theme === 'dark' ? 'bg-[#282c34]' : 'bg-white'
        }`}
      />
    </div>
  )
}

// Memoize component to prevent unnecessary re-renders
// Custom comparison to only re-render when critical props change
export default memo(VegaJsonEditor, (prevProps, nextProps) => {
  // Don't re-render if spec, theme, and readOnly are the same
  return (
    JSON.stringify(prevProps.spec) === JSON.stringify(nextProps.spec) &&
    prevProps.theme === nextProps.theme &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.debounceMs === nextProps.debounceMs
  )
})
