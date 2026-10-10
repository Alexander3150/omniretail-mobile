import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

// Los iconos de Expo cargan fuentes nativas: en las pruebas basta con ver que icono se pidio.
vi.mock("@expo/vector-icons", () => ({
  Ionicons: ({ name }: { name: string }) => createElement("span", { "data-icon": name }),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});
