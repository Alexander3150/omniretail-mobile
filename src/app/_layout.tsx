import { Stack } from "expo-router";

import { SessionProvider } from "@/modules/auth";
import { RepositoryProvider } from "@/infrastructure";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <RepositoryProvider>
      <SessionProvider>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack>
      </SessionProvider>
    </RepositoryProvider>
  );
}
