import { useState, useCallback, type ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useTheme, useNumericSpacing, useBorderRadius } from "../../../theme/useTheme";

export interface PickerProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  renderOption: (option: T) => ReactNode;
  renderSelected: (option: T) => ReactNode;
  filterFn: (option: T, query: string) => boolean;
  keyFn: (option: T) => string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export function Picker<T>({
  options,
  value,
  onChange,
  renderOption,
  renderSelected,
  filterFn,
  keyFn,
  placeholder = "Select...",
  disabled = false,
  label,
}: PickerProps<T>) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const spacing = useNumericSpacing();
  const borderRadius = useBorderRadius();

  const filtered = search
    ? options.filter((opt) => filterFn(opt, search))
    : options;

  const open = useCallback(() => {
    if (disabled) return;
    setVisible(true);
    setSearch("");
  }, [disabled]);

  const select = useCallback(
    (option: T) => {
      onChange(option);
      setVisible(false);
      setSearch("");
    },
    [onChange],
  );

  return (
    <View>
      <Pressable
        onPress={open}
        disabled={disabled}
        style={[
          styles.trigger,
          {
            borderColor: theme.colors.border,
            borderRadius,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.sm,
            backgroundColor: theme.colors.background,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {value ? (
          renderSelected(value)
        ) : (
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.fontFamily }}>
            {placeholder}
          </Text>
        )}
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>▼</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.header, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
            {label && (
              <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily }]}>
                {label}
              </Text>
            )}
            <Pressable onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={{ color: theme.colors.primary, fontSize: 16, fontFamily: theme.fontFamily }}>
                Done
              </Text>
            </Pressable>
          </View>

          <TextInput
            style={[
              styles.search,
              {
                borderColor: theme.colors.border,
                borderRadius,
                margin: spacing.md,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.sm,
                color: theme.colors.text,
                fontFamily: theme.fontFamily,
              },
            ]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
          />

          <FlatList
            data={filtered}
            keyExtractor={keyFn}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = value !== null && keyFn(value) === keyFn(item);
              return (
                <Pressable
                  onPress={() => select(item)}
                  style={[
                    styles.option,
                    {
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      backgroundColor: selected
                        ? theme.colors.surface
                        : theme.colors.background,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  {renderOption(item)}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  padding: spacing.lg,
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fontFamily,
                }}
              >
                No results found
              </Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  modal: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  search: {
    borderWidth: 1,
    fontSize: 14,
  },
  option: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
});
