# Architecture

OmniRetail Mobile sigue una arquitectura por ownership de dominio, inspirada conceptualmente en OmniRetail Web pero sin copiar logica administrativa.

## Carpetas

- `src/app`: routing/layouts de Expo Router. Los archivos de ruta deben importar pantallas desde `modules`.
- `src/core`: entidades, enums, types y repository interfaces. En esta foundation solo queda preparado.
- `src/infrastructure`: storage local, MockDatabase, seeds, repositorios mock y composicion de repositories. No contiene API real.
- `src/modules`: UI y logica por dominio funcional customer-facing.
- `src/shared`: piezas realmente reutilizables entre modulos.
- `src/config`: configuracion transversal de app, demo/mock y tenant futuro.
- `src/theme`: tokens visuales base.

No se usara una arquitectura global basada solo en `screens`, `components`, `services` y `utils` sin ownership.

## Persistencia Local

Todos los repositorios mock comparten una misma instancia de `MockDatabaseStore`. El store persiste un snapshot versionado en AsyncStorage y normaliza colecciones ausentes para tolerar cambios futuros del schema demo.

SecureStore se reserva para sesion activa y credenciales mock. Las entidades `User`, `Customer` y `Session` no guardan passwords ni tokens obligatorios.

La UI futura debe consumir repositorios desde `RepositoryProvider` o `getRepositoryRegistry`, no instanciar repositorios concretos dentro de screens.
