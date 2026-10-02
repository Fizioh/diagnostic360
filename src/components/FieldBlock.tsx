interface FieldBlockProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldBlock({ label, hint, children }: FieldBlockProps) {
  return (
    <div className="space-y-2">
      <label className="block font-mono text-[11px] uppercase tracking-wide text-muted">{label}</label>
      {hint && <p className="text-xs leading-relaxed text-muted/90">{hint}</p>}
      {children}
    </div>
  );
}

export function TextAreaField({
  value,
  onChange,
  rows = 6,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-md border border-border bg-panel p-3 text-sm leading-relaxed text-accent outline-none focus:border-accent/40"
    />
  );
}
