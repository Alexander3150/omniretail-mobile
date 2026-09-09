# Backend Integration

No hay backend real en esta etapa y no existe sincronizacion con OmniRetail Web.

El flujo futuro sera:

```text
Screen
-> Hook
-> Application Service
-> Repository
-> Mock ahora / API futuro
```

`src/infrastructure/mock` alojara datos locales y repositorios mock cuando se habiliten. `src/infrastructure/storage` queda reservado para persistencia futura, sin AsyncStorage ni SecureStore todavia.

## Simulacion Local

La siguiente etapa podra implementar repositorios mock sobre datos locales. Esa simulacion debera cubrir login, registro, cambio de contrasena, recuperacion de contrasena, carrito, checkout, pagos simulados, tracking simulado y notificaciones locales sin afirmar integraciones externas reales.

Las credenciales pertenecen a infraestructura/auth o al mock interno futuro. `User` y `Customer` no guardan `password`, tokens ni secretos.

## Excluido

No se modelan API clients, fetch, storage real, service locator, providers ni repositories concretos en esta rama.
