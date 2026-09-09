# Architecture

OmniRetail Mobile sigue una arquitectura por ownership de dominio, inspirada conceptualmente en OmniRetail Web pero sin copiar logica administrativa.

## Carpetas

- `src/app`: routing/layouts de Expo Router. Los archivos de ruta deben importar pantallas desde `modules`.
- `src/core`: entidades, enums, types y repository interfaces. En esta foundation solo queda preparado.
- `src/infrastructure`: implementaciones futuras de mocks, storage y API.
- `src/modules`: UI y logica por dominio funcional customer-facing.
- `src/shared`: piezas realmente reutilizables entre modulos.
- `src/config`: configuracion transversal de app, demo/mock y tenant futuro.
- `src/theme`: tokens visuales base.

No se usara una arquitectura global basada solo en `screens`, `components`, `services` y `utils` sin ownership.
