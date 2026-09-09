import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Registro" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Recuperar clave" }} />
      <Stack.Screen name="reset-password" options={{ title: "Restablecer clave" }} />
    </Stack>
  );
}
