import { useState, useCallback, useMemo } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import {
  COUNTRIES,
  validateAddress,
  type Address,
  type CountryCode,
  type ValidationResult,
} from "@identity-verification/core";
import { ReactNativeLocaleAdapter } from "@identity-verification/headless/react-native";
import { Picker } from "../shared/Picker";
import { FormField } from "../shared/FormField";
import { useTheme, useNumericSpacing, useBorderRadius } from "../../theme/useTheme";

export interface AddressFormProps {
  value?: Partial<Address>;
  onChange: (address: Address) => void;
  onValidationChange?: (result: ValidationResult) => void;
  defaultCountry?: string;
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

const localeAdapter = new ReactNativeLocaleAdapter();

export function AddressForm({
  value,
  onChange,
  onValidationChange,
  defaultCountry,
}: AddressFormProps) {
  const theme = useTheme();
  const spacing = useNumericSpacing();
  const borderRadius = useBorderRadius();
  const initialCountry = defaultCountry ?? localeAdapter.getDefaultCountryCode();

  const [address, setAddress] = useState<Address>({
    street: value?.street ?? "",
    city: value?.city ?? "",
    state: value?.state ?? "",
    country: value?.country ?? initialCountry,
    postalCode: value?.postalCode ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === address.country) ?? null,
    [address.country],
  );

  const postalHint = POSTAL_HINTS[address.country] ?? "";

  const inputStyle = [
    styles.input,
    {
      borderColor: theme.colors.border,
      borderRadius,
      color: theme.colors.text,
      fontFamily: theme.fontFamily,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
    },
  ];

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
      setTouchedFields((prev) => new Set(prev).add(field));
      validateAndSetErrors(address);
    },
    [address, validateAndSetErrors],
  );

  const handleCountryChange = useCallback(
    (country: CountryCode) => {
      setAddress((prev) => {
        const updated = { ...prev, country: country.code };
        onChange(updated);
        return updated;
      });
    },
    [onChange],
  );

  const getError = (field: string) =>
    touchedFields.has(field) ? fieldErrors[field] : undefined;

  return (
    <View style={{ gap: spacing.sm }}>
      <FormField label="Street Address" error={getError("street")} required>
        <TextInput
          style={inputStyle}
          value={address.street}
          onChangeText={(v) => updateField("street", v)}
          onBlur={() => handleBlur("street")}
          placeholder="123 Main St"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </FormField>

      <View style={[styles.row, { gap: spacing.sm }]}>
        <View style={styles.halfField}>
          <FormField label="City" error={getError("city")} required>
            <TextInput
              style={inputStyle}
              value={address.city}
              onChangeText={(v) => updateField("city", v)}
              onBlur={() => handleBlur("city")}
              placeholder="City"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </FormField>
        </View>

        <View style={styles.halfField}>
          <FormField label="State / Province" error={getError("state")} required>
            <TextInput
              style={inputStyle}
              value={address.state}
              onChangeText={(v) => updateField("state", v)}
              onBlur={() => handleBlur("state")}
              placeholder="State"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </FormField>
        </View>
      </View>

      <FormField label="Country" error={getError("country")} required>
        <Picker
          options={COUNTRIES}
          value={selectedCountry}
          onChange={handleCountryChange}
          renderOption={(c) => (
            <View style={styles.countryOption}>
              <Text style={{ fontSize: 18 }}>{c.flag}</Text>
              <Text style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}>
                {c.name}
              </Text>
            </View>
          )}
          renderSelected={(c) => (
            <View style={styles.selectedCountry}>
              <Text style={{ fontSize: 16 }}>{c.flag}</Text>
              <Text style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}>
                {c.name}
              </Text>
            </View>
          )}
          filterFn={(c, query) => {
            const q = query.toLowerCase();
            return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
          }}
          keyFn={(c) => c.code}
          label="Country"
        />
      </FormField>

      <FormField label="Postal Code" error={getError("postalCode")} hint={postalHint} required>
        <TextInput
          style={inputStyle}
          value={address.postalCode}
          onChangeText={(v) => updateField("postalCode", v)}
          onBlur={() => handleBlur("postalCode")}
          placeholder="Postal code"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </FormField>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  halfField: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedCountry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
