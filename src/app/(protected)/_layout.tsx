import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useSession } from "@/modules/auth";
import { CheckoutProvider } from "@/modules/checkout";
import { colors } from "@/theme";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <CheckoutProvider>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="products/[id]" options={{ title: "Producto" }} />
      <Stack.Screen name="favorites" options={{ title: "Favoritos" }} />
      <Stack.Screen name="notifications" options={{ title: "Notificaciones" }} />
      <Stack.Screen name="checkout/delivery" options={{ title: "Entrega" }} />
      <Stack.Screen name="checkout/payment" options={{ title: "Pago" }} />
      <Stack.Screen name="checkout/review" options={{ title: "Revisar pedido" }} />
      <Stack.Screen name="checkout/success" options={{ title: "Pedido confirmado" }} />
      <Stack.Screen name="orders/[id]" options={{ title: "Detalle de pedido" }} />
      <Stack.Screen name="addresses/index" options={{ title: "Direcciones" }} />
      <Stack.Screen name="addresses/new" options={{ title: "Nueva direccion" }} />
      <Stack.Screen name="addresses/[id]" options={{ title: "Editar direccion" }} />
      <Stack.Screen name="account/security" options={{ title: "Seguridad" }} />
      <Stack.Screen name="branches/index" options={{ title: "Sucursales" }} />
      <Stack.Screen name="branches/[id]" options={{ title: "Detalle de sucursal" }} />
      <Stack.Screen name="support/index" options={{ title: "Soporte" }} />
    </Stack>
    </CheckoutProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
});
