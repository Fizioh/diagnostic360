import type { EditorLanguage } from "../domain/diagnostic/answerModes";
import { CodeMirrorEditor } from "./assessment/CodeMirrorEditor";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  rows?: number;
  placeholder?: string;
  readOnly?: boolean;
}

function mapLanguage(language: string): EditorLanguage {
  if (language === "tsx") return "tsx";
  if (language === "python") return "python";
  if (language === "sql") return "sql";
  if (language === "javascript") return "javascript";
  return "typescript";
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  rows = 16,
  readOnly,
}: CodeEditorProps) {
  const minHeight = `${Math.max(120, rows * 22)}px`;
  return (
    <CodeMirrorEditor
      value={value}
      onChange={onChange}
      language={mapLanguage(language)}
      readOnly={readOnly}
      minHeight={minHeight}
    />
  );
}
