import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

const SEARCH_THRESHOLD = 12;

type OptionPickerProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange(value: string): void;
  emptyText?: string;
};

/** Lista cerrada de opciones como chips; agrega búsqueda cuando la lista es larga. */
export function OptionPicker({
  emptyText = "Sin opciones disponibles.",
  label,
  onChange,
  options,
  value,
}: OptionPickerProps) {
  const [query, setQuery] = useState("");

  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => normalize(option).includes(normalizedQuery));
  }, [options, query]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {value ? <Text style={styles.selected}>{`  ·  ${value}`}</Text> : null}
      </Text>

      {options.length > SEARCH_THRESHOLD ? (
        <TextInput
          onChangeText={setQuery}
          placeholder={`Buscar ${label.toLowerCase()}`}
          placeholderTextColor={colors.textMuted}
          style={styles.search}
          value={query}
        />
      ) : null}

      {visibleOptions.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        <View style={styles.chips}>
          {visibleOptions.map((option) => {
            const isSelected = option === value;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={option}
                onPress={() => onChange(option)}
                style={[styles.chip, isSelected ? styles.chipSelected : null]}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : null]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

const styles = StyleSheet.create({
  chip: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: typography.caption,
  },
  chipTextSelected: {
    color: colors.surface,
    fontWeight: "700",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  search: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  selected: {
    color: colors.primary,
  },
});
