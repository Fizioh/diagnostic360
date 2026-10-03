import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import type { EditorLanguage } from "../../domain/diagnostic/answerModes";

function languageExtension(lang: EditorLanguage) {
  switch (lang) {
    case "typescript":
      return javascript({ typescript: true });
    case "javascript":
      return javascript();
    case "tsx":
      return javascript({ jsx: true, typescript: true });
    case "python":
      return python();
    case "sql":
      return sql();
    default:
      return [];
  }
}

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: EditorLanguage;
  readOnly?: boolean;
  minHeight?: string;
  onDebouncedEdit?: () => void;
}

export function CodeMirrorEditor({
  value,
  onChange,
  language = "typescript",
  readOnly,
  minHeight = "240px",
  onDebouncedEdit,
}: CodeMirrorEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const debounceRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const onDebouncedRef = useRef(onDebouncedEdit);

  onChangeRef.current = onChange;
  onDebouncedRef.current = onDebouncedEdit;

  useEffect(() => {
    if (!hostRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      const text = update.state.doc.toString();
      onChangeRef.current(text);
      if (onDebouncedRef.current) {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
          onDebouncedRef.current?.();
        }, 1500);
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        languageExtension(language),
        oneDark,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        EditorView.theme({
          "&": { fontSize: "13px", minHeight },
          ".cm-scroller": { fontFamily: "ui-monospace, monospace", lineHeight: "1.55" },
          "&.cm-focused": { outline: "none" },
        }),
        EditorView.lineWrapping,
        updateListener,
        readOnly ? EditorState.readOnly.of(true) : [],
      ],
    });

    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      view.destroy();
      viewRef.current = null;
    };
  }, [language, readOnly, minHeight]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#0a0b0e]">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 font-mono text-[10px] text-muted">
        <span>{language}</span>
        <span>{readOnly ? "read-only" : "autosave · local only"}</span>
      </div>
      <div ref={hostRef} className="cm-diagnostic360 max-h-[70vh] overflow-auto" />
    </div>
  );
}
