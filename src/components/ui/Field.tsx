import type { ChangeEvent, ReactNode } from 'react';

type FieldProps = {
  label: ReactNode;
  children: ReactNode;
  /** Renders a <label> when the control is a single input. */
  as?: 'label' | 'div';
};

export function Field({ label, children, as = 'div' }: FieldProps) {
  const Tag = as;
  return (
    <Tag className="field">
      <span className="field-label">{label}</span>
      {children}
    </Tag>
  );
}

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email';
  autoFocus?: boolean;
  label?: string;
};

export function TextInput({ value, onChange, placeholder, type = 'text', autoFocus, label }: TextInputProps) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      placeholder={placeholder}
      autoFocus={autoFocus}
      aria-label={label}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  );
}

type SelectProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label?: string;
  /** Narrows the control where it sits inline with other chrome. */
  width?: number;
};

export function Select<T extends string>({ value, onChange, options, label, width }: SelectProps<T>) {
  return (
    <select
      className="input"
      value={value}
      aria-label={label}
      style={width ? { width } : undefined}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Form({ children }: { children: ReactNode }) {
  return <div className="form">{children}</div>;
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="form-actions">{children}</div>;
}
