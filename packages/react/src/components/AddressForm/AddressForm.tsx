import { useState, useCallback, useMemo, useId, useEffect } from "react";
import {
  COUNTRIES,
  validateAddress,
  type Address,
  type CountryCode,
  type ValidationResult,
} from "@identity-verification/core";
import { BrowserLocaleAdapter } from "@identity-verification/headless/web";
import { Dropdown } from "../shared/Dropdown";
import { FormField } from "../shared/FormField";
import styles from "./AddressForm.module.css";

export interface AddressFormProps {
  value?: Partial<Address>;
  onChange: (address: Address) => void;
  onValidationChange?: (result: ValidationResult) => void;
  defaultCountry?: string;
  className?: string;
}

const POSTAL_HINTS: Record<string, string> = {
  US: "e.g., 94102",
  GB: "e.g., SW1A 1AA",
  CA: "e.g., K1A 0B1",
  DE: "e.g., 10115",
  JP: "e.g., 100-0001",
  BR: "e.g., 01001-000",
  AU: "e.g., 2000",
  FR: "e.g., 75001",
  MX: "e.g., 06600",
};

const localeAdapter = new BrowserLocaleAdapter();

export function AddressForm({
  value,
  onChange,
  onValidationChange,
  defaultCountry,
  className,
}: AddressFormProps) {
  const initialCountry = defaultCountry ?? localeAdapter.getDefaultCountryCode();
  const [address, setAddress] = useState<Address>({
    street: value?.street ?? "",
    city: value?.city ?? "",
    state: value?.state ?? "",
    country: value?.country ?? initialCountry,
    postalCode: value?.postalCode ?? "",
  });
  useEffect(() => {
    if (!value) return;
    setAddress((prev) => ({
      street: value.street ?? prev.street,
      city: value.city ?? prev.city,
      state: value.state ?? prev.state,
      country: value.country ?? prev.country,
      postalCode: value.postalCode ?? prev.postalCode,
    }));
  }, [value]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const fieldIdPrefix = useId();

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === address.country) ?? null,
    [address.country],
  );

  const postalHint = POSTAL_HINTS[address.country] ?? "";

  const updateField = useCallback(
    (field: keyof Address, fieldValue: string) => {
      const updated = { ...address, [field]: fieldValue };
      setAddress(updated);
      onChange(updated);
      if (touchedFields.has(field) && fieldErrors[field]) {
        const result = validateAddress(updated, updated.country);
        const stillInvalid = result.errors.some((e) => e.field === field);
        if (!stillInvalid) {
          setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
          onValidationChange?.(result);
        }
      }
    },
    [address, onChange, touchedFields, fieldErrors, onValidationChange],
  );

  const validateAndSetErrors = useCallback(
    (currentAddress: Address) => {
      const result = validateAddress(currentAddress, currentAddress.country);
      const errorMap: Record<string, string | undefined> = {};
      for (const err of result.errors) {
        errorMap[err.field] = err.message;
      }
      setFieldErrors(errorMap);
      onValidationChange?.(result);
    },
    [onValidationChange],
  );

  const handleBlur = useCallback(
    (field: string) => {
      setTouchedFields((prev: Set<string>) => new Set(prev).add(field));
      validateAndSetErrors(address);
    },
    [address, validateAndSetErrors],
  );

  const handleCountryChange = useCallback(
    (country: CountryCode) => {
      setAddress((prev: Address) => {
        const updated = { ...prev, country: country.code };
        onChange(updated);
        return updated;
      });
    },
    [onChange],
  );

  const getError = (field: string) => (touchedFields.has(field) ? fieldErrors[field] : undefined);
  const fieldId = (name: string) => `${fieldIdPrefix}-${name}`;

  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <div className={styles.grid}>
        <FormField
          label="Street Address"
          error={getError("street")}
          required
          className={styles.fullWidth}
          htmlFor={fieldId("street")}
        >
          <input
            id={fieldId("street")}
            type="text"
            className={styles.input}
            value={address.street}
            onChange={(e) => updateField("street", e.target.value)}
            onBlur={() => handleBlur("street")}
            placeholder="123 Main St"
          />
        </FormField>

        <FormField label="City" error={getError("city")} required htmlFor={fieldId("city")}>
          <input
            id={fieldId("city")}
            type="text"
            className={styles.input}
            value={address.city}
            onChange={(e) => updateField("city", e.target.value)}
            onBlur={() => handleBlur("city")}
            placeholder="City"
          />
        </FormField>

        <FormField
          label="State / Province"
          error={getError("state")}
          required
          htmlFor={fieldId("state")}
        >
          <input
            id={fieldId("state")}
            type="text"
            className={styles.input}
            value={address.state}
            onChange={(e) => updateField("state", e.target.value)}
            onBlur={() => handleBlur("state")}
            placeholder="State"
          />
        </FormField>

        <FormField label="Country" error={getError("country")} required>
          <Dropdown
            options={COUNTRIES}
            value={selectedCountry}
            onChange={handleCountryChange}
            renderOption={(c) => (
              <span className={styles.countryOption}>
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </span>
            )}
            renderSelected={(c) => (
              <span className={styles.selectedCountry}>
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </span>
            )}
            filterFn={(c, query) => {
              const q = query.toLowerCase();
              return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
            }}
            keyFn={(c) => c.code}
            label="Country"
          />
        </FormField>

        <FormField
          label="Postal Code"
          error={getError("postalCode")}
          hint={postalHint}
          required
          htmlFor={fieldId("postal")}
        >
          <input
            id={fieldId("postal")}
            type="text"
            className={styles.input}
            value={address.postalCode}
            onChange={(e) => updateField("postalCode", e.target.value)}
            onBlur={() => handleBlur("postalCode")}
            placeholder="Postal code"
          />
        </FormField>
      </div>
    </div>
  );
}
