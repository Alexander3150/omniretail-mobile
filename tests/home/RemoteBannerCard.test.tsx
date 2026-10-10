import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RemoteBannerCard } from "@/modules/home/components/RemoteBannerCard";

describe("RemoteBannerCard", () => {
  it("muestra el titulo y la descripcion de la diapositiva sobre la imagen", () => {
    const { container } = render(
      <RemoteBannerCard
        slide={{ title: "Ofertas", description: "Hasta 50%", imageUri: "https://cdn.example.com/a.png" }}
        width={300}
      />,
    );

    expect(screen.getByText("Ofertas")).toBeTruthy();
    expect(screen.getByText("Hasta 50%")).toBeTruthy();
    expect(container.innerHTML).toContain("a.png");
  });

  it("sin imagen deja el fondo de color con los textos", () => {
    const { container } = render(
      <RemoteBannerCard slide={{ title: "Envíos", description: "A todo el país" }} width={300} />,
    );

    expect(screen.getByText("Envíos")).toBeTruthy();
    expect(container.innerHTML).not.toContain("url(");
  });

  it("si la diapositiva solo tiene imagen no dibuja la capa de texto", () => {
    render(
      <RemoteBannerCard
        slide={{ title: "", description: "", imageUri: "https://cdn.example.com/solo.png" }}
        width={300}
      />,
    );

    expect(screen.queryByText("Ofertas")).toBeNull();
  });

  it("si la imagen no carga conserva los textos sobre el fondo de color", async () => {
    class FailingImage {
      onload?: () => void;
      onerror?: () => void;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal("Image", FailingImage);

    const { container } = render(
      <RemoteBannerCard
        slide={{ title: "Ofertas", description: "d", imageUri: "https://cdn.example.com/rota.png" }}
        width={300}
      />,
    );

    await waitFor(() => expect(container.innerHTML).not.toContain("rota.png"));
    expect(screen.getByText("Ofertas")).toBeTruthy();
    vi.unstubAllGlobals();
  });
});
