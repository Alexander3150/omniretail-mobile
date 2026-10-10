import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = fileURLToPath(new URL("./src", import.meta.url));

// Las pruebas corren en jsdom y react-native se sustituye por react-native-web (ya es dependencia
// del proyecto), asi los componentes se pueden renderizar sin un emulador.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${src}/` },
      { find: /^react-native$/, replacement: "react-native-web" },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.tsx"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: [
        "src/infrastructure/api/account/ApiStorefrontConfigService.ts",
        "src/modules/home/components/RemoteBannerCard.tsx",
        "src/modules/home/screens/HomeScreen.tsx",
        "src/modules/home/utils/bannerScroll.ts",
        "src/shared/components/StoreBrandText.tsx",
        "src/shared/components/StoreLogo.tsx",
        "src/shared/hooks/useBusinessConfig.ts",
      ],
    },
  },
});
