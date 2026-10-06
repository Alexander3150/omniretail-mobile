# Backend Integration

La app funciona en dos modos, elegidos con `EXPO_PUBLIC_API_MODE`:

- `mock` (default): todo vive en `src/infrastructure/mock` (AsyncStorage + seeds demo).
- `api`: lo que el backend OmniRetail ya expone se consume por HTTP; el resto sigue local de forma deliberada.

```text
Screen -> Hook -> Application Service -> Repository (interfaz en src/core)
                                            ├─ Mock*  (src/infrastructure/mock)
                                            └─ Api*   (src/infrastructure/api)
```

La selección ocurre en `src/infrastructure/repositories/RepositoryRegistry.ts`.

## Configuración

Crea `.env.local` en la raíz de la app (no se versiona) y reinicia Expo con `npx expo start --clear`:

```bash
EXPO_PUBLIC_API_MODE=api
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_TENANT_SLUG=ferrepharma-demo
# Solo para dispositivo Android físico (IP LAN de la computadora):
# EXPO_PUBLIC_API_BASE_URL_ANDROID=http://192.168.1.50:8080/api/v1
```

| Plataforma | URL efectiva |
|---|---|
| Web / iOS Simulator | `EXPO_PUBLIC_API_BASE_URL` |
| Android Emulator | `localhost` se reescribe a `10.0.2.2` automáticamente |
| Android físico | `EXPO_PUBLIC_API_BASE_URL_ANDROID` |

En modo `api`, si falta la URL o el tenant la app falla al arrancar (`assertApiConfig`), en lugar de degradar a mock en silencio.

El backend debe permitir el origen de Expo web en CORS: `app.cors.allowed-origins` incluye `http://localhost:8081` por defecto (o `CORS_ALLOWED_ORIGINS`).

Cliente demo (seeds del backend, contexto `dev`): `ana@example.com` / `ClienteDemo1`. Es la misma contraseña que usa el modo mock del frontend web para esa cuenta.

## Qué es remoto y qué es local en modo `api`

| Módulo | Fuente | Endpoint |
|---|---|---|
| Login, logout, restaurar sesión | API | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Registro | API | `POST /public/{slug}/auth/register` (queda pendiente de verificar correo) |
| Verificación de correo | API | `POST /auth/email/verify` |
| Recuperar / restablecer contraseña | API | `POST /auth/password/forgot`, `POST /auth/password/reset` |
| Cambio de contraseña | API | `POST /auth/password/change` |
| Perfil | API | `PUT /me/profile` |
| Direcciones | API | `/me/addresses` (+ `/{id}/default`) |
| Tarjetas guardadas (solo metadatos) | API | `/me/payment-methods` (+ `/{id}/default`) |
| Catálogo, categorías, disponibilidad | API | `GET /public/{slug}/products` |
| Configuración comercial y sucursales | API | `GET /public/{slug}/config` |
| Checkout | API | `POST /public/{slug}/checkout` (con `Idempotency-Key`; con sesión, el pedido queda asociado al cliente) |
| Historial y detalle de pedidos | API | `GET /customer/orders`, `GET /customer/orders/{id}` |
| Tracking | API | `GET /public/{slug}/tracking/{token}` |
| Carrito, favoritos | **Local** | El backend no expone carrito/favoritos de cliente |
| Notificaciones internas | **Local** | Sin endpoint de cliente |
| Promociones y media de producto | **Local / del producto** | El precio efectivo ya viene en el producto |

## Limitaciones conocidas

- **MFA**: si el login responde un desafío (`challengeToken`), la app muestra un error explicativo; el segundo paso (`POST /auth/mfa/verify`) no está implementado.
- **Enlaces de correo**: verificación y recuperación envían enlaces al frontend web (`app.frontend.base-url`). En la app se pega el enlace completo o el token en "Verificar mi correo" / "Restablecer contraseña". En desarrollo los correos llegan a Mailpit (`http://localhost:8025`).
- **Web**: `expo-secure-store` no existe en web; ahí el token se guarda en AsyncStorage (localStorage). Aceptable para desarrollo, no es almacenamiento seguro.
- **Direcciones**: el backend exige departamento y municipio de Guatemala con nombre exacto (`src/config/guatemala-locations.json`, copia del backend) y no guarda teléfono por dirección.

## Reset Demo

`getRepositoryRegistry().resetToDemoData()` restaura seeds, credenciales demo y limpia la sesión activa (solo afecta datos locales).
