import { type ReactNode } from "react";
import styles from "./FormField.module.css";

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
