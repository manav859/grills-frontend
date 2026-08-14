import { cloneElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

/*
 * Field — 06-COMPONENT-SPEC.md §Field. Wraps one control with its visible label,
 * optional hint, and error, and wires the accessibility relationships: the label
 * targets the control by id; `aria-describedby` chains hint then error; and
 * `aria-invalid` is set only while an error is present. The control is cloned
 * with those props, so callers pass a bare input/select without repeating ids.
 *
 * Required fields append a visible "(required)" in caption type — never an
 * asterisk, never optional-marking (06 §Field).
 */

export interface FieldProps {
  label: string;
  name: string;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean;
  children: ReactElement<{
    id?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
  }>;
}

export function FormError({
  id,
  children,
}: {
  id?: string | undefined;
  children: ReactNode;
}): ReactNode {
  return (
    <p id={id} role="alert" className="font-body text-body-sm text-danger">
      {children}
    </p>
  );
}

export function Field({
  label,
  name,
  hint,
  error,
  required = false,
  children,
}: FieldProps): ReactNode {
  const hintId = hint !== undefined ? `${name}-hint` : undefined;
  const errorId = error !== undefined ? `${name}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const controlProps: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
  } = { id: name };
  if (describedBy !== undefined) {
    controlProps['aria-describedby'] = describedBy;
  }
  if (error !== undefined) {
    controlProps['aria-invalid'] = true;
  }

  const control = cloneElement(children, controlProps);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-body font-medium text-ink">
        {label}
        {required ? (
          <span className="ml-1 font-body text-caption text-ink-subtle">
            (required)
          </span>
        ) : null}
      </label>
      {hint !== undefined ? (
        <p id={hintId} className="font-body text-body-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {control}
      {error !== undefined ? <FormError id={errorId}>{error}</FormError> : null}
    </div>
  );
}
