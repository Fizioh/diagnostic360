import { FieldBlock, TextAreaField } from "../FieldBlock";
import type { StructuredFieldSpec } from "../../domain/diagnostic/answerModes";

function wordCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

interface StructuredFieldsPanelProps {
  fields: StructuredFieldSpec[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  showWordCount?: boolean;
}

export function StructuredFieldsPanel({
  fields,
  values,
  onChange,
  showWordCount,
}: StructuredFieldsPanelProps) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <FieldBlock
          key={f.answerKey}
          label={
            showWordCount
              ? `${f.label} · ${wordCount(values[f.answerKey] ?? "")} words`
              : f.label
          }
        >
          <TextAreaField
            value={values[f.answerKey] ?? ""}
            onChange={(v) => onChange(f.answerKey, v)}
            rows={f.rows ?? 4}
            placeholder={f.placeholder}
          />
        </FieldBlock>
      ))}
    </div>
  );
}
