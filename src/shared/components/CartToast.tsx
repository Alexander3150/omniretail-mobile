import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function useCartToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  function showCartToast(nextMessage: string) {
    setMessage(nextMessage);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setMessage(null), 2400);
  }

  return { cartToastMessage: message, showCartToast };
}

export function CartToast({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.toast}>
        <Ionicons color="#247A52" name="checkmark-circle" size={20} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    bottom: 18,
    left: 18,
    position: "absolute",
    right: 18,
  },
  toast: {
    alignItems: "center",
    backgroundColor: "#EAF7EF",
    borderColor: "#B9E5CC",
    borderRadius: 15,
    borderWidth: 1,
    elevation: 6,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
  },
  text: {
    color: "#247A52",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
});
