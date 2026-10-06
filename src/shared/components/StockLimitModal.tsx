import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type StockLimitModalProps = {
  availableQuantity: number;
  onClose(): void;
  visible: boolean;
};

export function StockLimitModal({
  availableQuantity,
  onClose,
  visible,
}: StockLimitModalProps) {
  const message = availableQuantity > 0
    ? `Solo hay ${availableQuantity} ${availableQuantity === 1 ? "unidad disponible" : "unidades disponibles"} por el momento.`
    : "La cantidad solicitada no está disponible por el momento.";

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons color="#B94343" name="alert-outline" size={27} />
          </View>

          <Text style={styles.title}>Lo sentimos</Text>
          <Text style={styles.message}>{message}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.button, pressed ? styles.pressed : null]}
          >
            <Text style={styles.buttonText}>Entendido</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(23, 32, 51, 0.62)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE3EE",
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 380,
    padding: 24,
    width: "100%",
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  title: {
    color: "#172033",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 14,
  },
  message: {
    color: "#687286",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#3E668F",
    borderRadius: 14,
    marginTop: 22,
    minHeight: 48,
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.82,
  },
});
