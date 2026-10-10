import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BusinessConfig } from "@/core";
import { StoreBrandText } from "@/shared/components/StoreBrandText";
import { DEFAULT_STORE_NAME, useBusinessConfig } from "@/shared/hooks/useBusinessConfig";

const state = vi.hoisted(() => ({
  getCurrent: vi.fn(),
}));

vi.mock("expo-router", async () => {
  const { useEffect } = await import("react");
  return {
    // Ejecuta el efecto al montar, como cuando la pantalla toma el foco.
    useFocusEffect: (effect: () => void | (() => void)) => {
      useEffect(effect, [effect]);
    },
  };
});
vi.mock("@/infrastructure", () => {
  const repositories = { businessConfigRepository: { getCurrent: state.getCurrent } };
  return { useRepositories: () => repositories };
});

const config = (extra: Partial<BusinessConfig> = {}): BusinessConfig => ({
  tenantId: "tenant-1",
  name: "  Ferretería Los Simpson  ",
  currency: "GTQ",
  support: {},
  ...extra,
});

describe("useBusinessConfig", () => {
  it("antes de leer la configuracion usa el nombre por defecto y no hay logo ni carrusel", () => {
    state.getCurrent.mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useBusinessConfig());

    expect(result.current.storeName).toBe(DEFAULT_STORE_NAME);
    expect(result.current.logoUri).toBeUndefined();
    expect(result.current.heroSlides).toEqual([]);
  });

  it("entrega el nombre, el logo y el carrusel configurados", async () => {
    const slides = [{ title: "Ofertas", description: "Hasta 50%", imageUri: "https://cdn/x.png" }];
    state.getCurrent.mockResolvedValue(config({ logoUri: "https://cdn/logo.png", heroSlides: slides }));

    const { result } = renderHook(() => useBusinessConfig());

    await waitFor(() => expect(result.current.storeName).toBe("Ferretería Los Simpson"));
    expect(result.current.logoUri).toBe("https://cdn/logo.png");
    expect(result.current.heroSlides).toEqual(slides);
  });

  it("si la configuracion no tiene nombre conserva el valor por defecto", async () => {
    state.getCurrent.mockResolvedValue(config({ name: "   " }));

    const { result } = renderHook(() => useBusinessConfig());

    await waitFor(() => expect(result.current.config).not.toBeNull());
    expect(result.current.storeName).toBe(DEFAULT_STORE_NAME);
  });

  it("sin conexion no falla y mantiene los valores por defecto", async () => {
    state.getCurrent.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useBusinessConfig());

    await waitFor(() => expect(state.getCurrent).toHaveBeenCalled());
    expect(result.current.storeName).toBe(DEFAULT_STORE_NAME);
    expect(result.current.config).toBeNull();
  });
});

describe("StoreBrandText", () => {
  it("muestra el nombre de la tienda en mayusculas", async () => {
    state.getCurrent.mockResolvedValue(config());

    render(<StoreBrandText />);

    expect(await screen.findByText("FERRETERÍA LOS SIMPSON")).toBeTruthy();
  });
});
