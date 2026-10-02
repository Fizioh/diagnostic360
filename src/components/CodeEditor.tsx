interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  rows?: number;
  placeholder?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  rows = 16,
  placeholder,
  readOnly,
}: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#0a0b0e]">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 font-mono text-[10px] text-muted">
        <span>{language}</span>
        <span>monospace · local only</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        className="block w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed text-accent/95 outline-none placeholder:text-muted/50"
      />
    </div>
  );
}
