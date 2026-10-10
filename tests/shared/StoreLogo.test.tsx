import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StoreLogo } from "@/shared/components/StoreLogo";

const icon = (container: HTMLElement) => container.querySelector("[data-icon='storefront-outline']");

describe("StoreLogo", () => {
  it("muestra el icono de tienda cuando no hay logo", () => {
    const { container } = render(<StoreLogo />);

    expect(icon(container)).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("no intenta cargar logos que no son URLs http(s) (p. ej. los assets del modo mock)", () => {
    const { container } = render(<StoreLogo uri="asset://demo/business/logo.png" />);

    expect(icon(container)).not.toBeNull();
  });

  it("muestra la imagen del logo cuando es una URL http(s)", () => {
    const { container } = render(<StoreLogo size={40} uri="http://10.0.2.2:8080/media/t/ecommerce/t/logo.png" />);

    expect(icon(container)).toBeNull();
    expect(container.innerHTML).toContain("logo.png");
  });

  it("si la imagen no carga vuelve al icono de tienda", async () => {
    // react-native-web carga las imagenes con `new window.Image()`: aqui siempre falla.
    class FailingImage {
      onload?: () => void;
      onerror?: () => void;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", FailingImage);

    const { container } = render(<StoreLogo uri="https://cdn.example.com/roto.png" />);

    await waitFor(() => expect(icon(container)).not.toBeNull());
    vi.unstubAllGlobals();
  });
});
