import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

const SEARCH_THRESHOLD = 12;

type OptionPickerProps = {
  label: string;
  options: readonly string[];
  value: string;
  onChange(value: string): void;
  emptyText?: string;
};

/** Selector desplegable con búsqueda para listas extensas. */
export function OptionPicker({
  emptyText = "Sin opciones disponibles.",
  label,
  onChange,
  options,
  value,
}: OptionPickerProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function handleClose() {
    setQuery("");
    setIsOpen(false);
  }

  const visibleOptions = useMemo(() => {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => normalize(option).includes(normalizedQuery));
  }, [options, query]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setIsOpen(true)} style={styles.select}>
        <Text numberOfLines={1} style={[styles.selectText, !value ? styles.placeholder : null]}>{value || `Selecciona ${label.toLowerCase()}`}</Text>
        <Ionicons color={colors.primary} name="chevron-down" size={18} />
      </Pressable>
      {options.length === 0 ? <Text style={styles.empty}>{emptyText}</Text> : null}

      <Modal animationType="slide" onRequestClose={handleClose} transparent visible={isOpen}>
        <View style={styles.backdrop}>
          <Pressable accessibilityLabel="Cerrar selector" onPress={handleClose} style={StyleSheet.absoluteFill} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardAvoiding}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{label}</Text><Pressable onPress={handleClose} style={styles.close}><Ionicons color={colors.primary} name="close" size={20} /></Pressable></View>
              {options.length > SEARCH_THRESHOLD ? <TextInput autoFocus onChangeText={setQuery} placeholder={`Buscar ${label.toLowerCase()}`} placeholderTextColor={colors.textMuted} style={styles.search} value={query} /> : null}
              <FlatList data={visibleOptions} keyExtractor={(item) => item} ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>} renderItem={({ item }) => <Pressable onPress={() => { onChange(item); handleClose(); }} style={[styles.option, item === value ? styles.optionSelected : null]}><Text style={[styles.optionText, item === value ? styles.optionTextSelected : null]}>{item}</Text>{item === value ? <Ionicons color={colors.surface} name="checkmark" size={18} /> : null}</Pressable>} />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  select: { alignItems: "center", borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 47, paddingHorizontal: spacing.md },
  selectText: { color: colors.text, flex: 1, fontSize: typography.body }, placeholder: { color: colors.textMuted },
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
  backdrop: { backgroundColor: "rgba(23, 32, 51, .55)", flex: 1, justifyContent: "flex-end" }, keyboardAvoiding: { justifyContent: "flex-end", width: "100%" }, sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "72%", padding: spacing.lg }, sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }, sheetTitle: { color: colors.text, fontSize: typography.subtitle, fontWeight: "800" }, close: { alignItems: "center", backgroundColor: "#EEF3FB", borderRadius: 16, height: 32, justifyContent: "center", width: 32 }, option: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 48, paddingHorizontal: spacing.sm }, optionSelected: { backgroundColor: colors.primary, borderRadius: radius.sm }, optionText: { color: colors.text, fontSize: typography.body }, optionTextSelected: { color: colors.surface, fontWeight: "700" },
});
