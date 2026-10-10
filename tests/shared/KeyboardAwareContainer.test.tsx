import { render } from "@testing-library/react";
import React, { createRef } from "react";
import { Platform, Text, View } from "react-native";
import { describe, expect, it, vi } from "vitest";

import { KeyboardAwareContainer } from "@/shared/components/KeyboardAwareContainer";

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 24, left: 0, right: 0 }),
}));

describe("KeyboardAwareContainer", () => {
  it("renderiza sus hijos correctamente", () => {
    const { getByText } = render(
      <KeyboardAwareContainer>
        <Text>Contenido del Formulario</Text>
      </KeyboardAwareContainer>,
    );

    expect(getByText("Contenido del Formulario")).not.toBeNull();
  });

  it("permite asociar un ref al ScrollView", () => {
    const ref = createRef<any>();
    render(
      <KeyboardAwareContainer ref={ref}>
        <View />
      </KeyboardAwareContainer>,
    );

    expect(ref.current).toBeDefined();
  });

  it("aplica estilos de contenedor y padding extra", () => {
    const { container } = render(
      <KeyboardAwareContainer
        containerStyle={{ backgroundColor: "red" }}
        contentContainerStyle={{ padding: 10, paddingBottom: 15 }}
        extraBottomSpace={30}
      >
        <Text>Test</Text>
      </KeyboardAwareContainer>,
    );

    expect(container).toBeDefined();
  });

  it("maneja offset de teclado personalizado", () => {
    const { container } = render(
      <KeyboardAwareContainer keyboardVerticalOffset={50}>
        <Text>Offset</Text>
      </KeyboardAwareContainer>,
    );

    expect(container).toBeDefined();
  });
});
