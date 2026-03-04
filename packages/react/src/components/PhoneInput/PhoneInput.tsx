import { useState, useCallback, useRef, useId } from "react";
import {
  COUNTRIES,
  validatePhone,
  type CountryCode,
  type ValidationResult,
} from "@identity-verification/core";
import { BrowserLocaleAdapter } from "@identity-verification/headless";
import { Dropdown } from "../shared/Dropdown";
import { FormField } from "../shared/FormField";
import styles from "./PhoneInput.module.css";

export interface PhoneInputProps {
  value?: string;
  defaultCountry?: string;
  onChange: (phone: string, countryCode: string) => void;
  onValidationChange?: (result: ValidationResult) => void;
  className?: string;
}

const localeAdapter = new BrowserLocaleAdapter();

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function getMaxDigits(country: CountryCode): number {
  return Array.isArray(country.phoneLength)
    ? country.phoneLength[1]
    : country.phoneLength;
}

export function PhoneInput({
  value: controlledValue,
  defaultCountry,
  onChange,
  onValidationChange,
  className,
}: PhoneInputProps) {
  const initialCountry = defaultCountry ?? localeAdapter.getDefaultCountryCode();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    () => COUNTRIES.find((c) => c.code === initialCountry) ?? COUNTRIES[0],
  );
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const phoneValue = controlledValue ?? internalValue;

  const handleCountryChange = useCallback(
    (country: CountryCode) => {
      setSelectedCountry(country);
      const digits = stripNonDigits(phoneValue).slice(0, getMaxDigits(country));
      setInternalValue(digits);
      onChange(digits, country.code);
      if (touched && digits) {
        const result = validatePhone(digits, country.code);
        setError(result.valid ? undefined : result.errors[0]?.message);
        onValidationChange?.(result);
      }
    },
    [phoneValue, onChange, onValidationChange, touched],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const cleaned = raw.replace(/[^\d\s\-()]/g, "");
      const digits = stripNonDigits(cleaned);
      if (digits.length > getMaxDigits(selectedCountry)) return;
      setInternalValue(cleaned);
      onChange(digits, selectedCountry.code);
      if (touched && error && digits) {
        const result = validatePhone(digits, selectedCountry.code);
        if (result.valid) {
          setError(undefined);
          onValidationChange?.(result);
        }
      }
    },
    [selectedCountry, onChange, touched, error, onValidationChange],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    const digits = stripNonDigits(phoneValue);
    if (digits) {
      const result = validatePhone(digits, selectedCountry.code);
      setError(result.valid ? undefined : result.errors[0]?.message);
      onValidationChange?.(result);
    } else {
      setError("Phone number is required");
      onValidationChange?.({ valid: false, errors: [{ field: "phone", code: "REQUIRED", message: "Phone number is required" }] });
    }
  }, [phoneValue, selectedCountry, onValidationChange]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text").trim();
      if (!pasted.startsWith("+")) return;

      e.preventDefault();
      const digits = stripNonDigits(pasted);

      const sortedCountries = [...COUNTRIES].sort(
        (a, b) => stripNonDigits(b.dialCode).length - stripNonDigits(a.dialCode).length,
      );

      for (const country of sortedCountries) {
        const dialDigits = stripNonDigits(country.dialCode);
        if (digits.startsWith(dialDigits)) {
          const phoneDigits = digits.slice(dialDigits.length).slice(0, getMaxDigits(country));
          if (selectedCountry.dialCode === country.dialCode) {
            setInternalValue(phoneDigits);
            onChange(phoneDigits, selectedCountry.code);
          } else {
            setSelectedCountry(country);
            setInternalValue(phoneDigits);
            onChange(phoneDigits, country.code);
          }
          return;
        }
      }

      const truncated = digits.slice(0, getMaxDigits(selectedCountry));
      setInternalValue(truncated);
      onChange(truncated, selectedCountry.code);
    },
    [selectedCountry, onChange],
  );

  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <FormField label="Phone Number" error={touched ? error : undefined} required htmlFor={inputId}>
        <div className={styles.inputGroup}>
          <Dropdown
            options={COUNTRIES}
            value={selectedCountry}
            onChange={handleCountryChange}
            renderOption={(c) => (
              <span className={styles.countryOption}>
                <span className={styles.flag}>{c.flag}</span>
                <span className={styles.countryName}>{c.name}</span>
                <span className={styles.dialCode}>{c.dialCode}</span>
              </span>
            )}
            renderSelected={(c) => (
              <span className={styles.selectedCountry}>
                <span className={styles.flag}>{c.flag}</span>
                <span className={styles.dialCode}>{c.dialCode}</span>
              </span>
            )}
            filterFn={(c, query) => {
              const q = query.toLowerCase();
              return (
                c.name.toLowerCase().includes(q) ||
                c.dialCode.includes(q) ||
                c.code.toLowerCase().includes(q)
              );
            }}
            keyFn={(c) => c.code}
            className={styles.countryDropdown}
            label="Country code"
          />
          <input
            ref={inputRef}
            id={inputId}
            type="tel"
            className={styles.input}
            value={phoneValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onPaste={handlePaste}
            placeholder="Phone number"
            aria-label="Phone number"
          />
        </div>
      </FormField>
    </div>
  );
}
