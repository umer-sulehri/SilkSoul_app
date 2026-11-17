"use client";

import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";

export function ColorField({
  id,
  name,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-12 cursor-pointer rounded-[10px] border border-border bg-surface p-1"
          aria-label={`${label} colour picker`}
        />
        <Input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={7}
          spellCheck={false}
          aria-invalid={Boolean(error)}
          className="font-mono uppercase"
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}
