import { useState, useCallback, useRef } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import {
  COUNTRIES,
  validatePhone,
  type CountryCode,
  type ValidationResult,
} from "@identity-verification/core";
import { ReactNativeLocaleAdapter } from "@identity-verification/headless/react-native";
import { Picker } from "../shared/Picker";
import { FormField } from "../shared/FormField";
import { useTheme, useNumericSpacing, useBorderRadius } from "../../theme/useTheme";

export interface PhoneInputProps {
  value?: string;
  defaultCountry?: string;
  onChange: (phone: string, countryCode: string) => void;
  onValidationChange?: (result: ValidationResult) => void;
}

const localeAdapter = new ReactNativeLocaleAdapter();

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
}: PhoneInputProps) {
  const theme = useTheme();
  const spacing = useNumericSpacing();
  const borderRadius = useBorderRadius();
  const initialCountry = defaultCountry ?? localeAdapter.getDefaultCountryCode();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    () => COUNTRIES.find((c) => c.code === initialCountry) ?? COUNTRIES[0],
  );
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<TextInput>(null);

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

  const handleChangeText = useCallback(
    (raw: string) => {
      if (raw.startsWith("+")) {
        const digits = stripNonDigits(raw);
        const sortedCountries = [...COUNTRIES].sort(
          (a, b) => stripNonDigits(b.dialCode).length - stripNonDigits(a.dialCode).length,
        );
        for (const country of sortedCountries) {
          const dialDigits = stripNonDigits(country.dialCode);
          if (digits.startsWith(dialDigits)) {
            const phoneDigits = digits.slice(dialDigits.length).slice(0, getMaxDigits(country));
            setSelectedCountry(country);
            setInternalValue(phoneDigits);
            onChange(phoneDigits, country.code);
            return;
          }
        }
      }

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
      onValidationChange?.({
        valid: false,
        errors: [{ field: "phone", code: "REQUIRED", message: "Phone number is required" }],
      });
    }
  }, [phoneValue, selectedCountry, onValidationChange]);

  return (
    <View>
      <FormField label="Phone Number" error={touched ? error : undefined} required>
        <View style={[styles.inputGroup, { gap: spacing.sm }]}>
          <View style={styles.countryPicker}>
            <Picker
              options={COUNTRIES}
              value={selectedCountry}
              onChange={handleCountryChange}
              renderOption={(c) => (
                <View style={styles.countryOption}>
                  <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.fontFamily, flex: 1 }}>
                    {c.name}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fontFamily }}>
                    {c.dialCode}
                  </Text>
                </View>
              )}
              renderSelected={(c) => (
                <View style={styles.selectedCountry}>
                  <Text style={{ fontSize: 16 }}>{c.flag}</Text>
                  <Text style={{ color: theme.colors.text, fontFamily: theme.fontFamily, fontSize: 14 }}>
                    {c.dialCode}
                  </Text>
                </View>
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
              label="Country code"
            />
          </View>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                borderColor: theme.colors.border,
                borderRadius,
                color: theme.colors.text,
                fontFamily: theme.fontFamily,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.sm,
              },
            ]}
            value={phoneValue}
            onChangeText={handleChangeText}
            onBlur={handleBlur}
            placeholder="Phone number"
            keyboardType="phone-pad"
            accessibilityLabel="Phone number"
          />
        </View>
      </FormField>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryPicker: {
    minWidth: 100,
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedCountry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    fontSize: 16,
  },
});
