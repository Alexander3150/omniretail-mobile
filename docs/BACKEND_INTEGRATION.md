# Backend Integration

No hay backend real en esta etapa y no existe sincronizacion con OmniRetail Web.

El flujo de consumo esperado sera:

```text
Screen
-> Hook
-> Application Service
-> Repository
-> Mock ahora / API futuro
```

`src/infrastructure/mock` aloja datos locales, normalizacion y repositorios mock. `src/infrastructure/storage` separa AsyncStorage para datos no sensibles y SecureStore para sesion/credenciales demo.

## Simulacion Local

La simulacion cubre login, registro, cambio de contrasena, recuperacion de contrasena, carrito, pedidos, pagos simulados y notificaciones locales desde repositorios mock, sin afirmar integraciones externas reales.

Las credenciales pertenecen a infraestructura/auth o al mock interno futuro. `User` y `Customer` no guardan `password`, tokens ni secretos.

## Excluido

No se modelan API clients, fetch, checkout completo, tracking automatico, push notifications, GPS, maps ni analytics en esta rama.

## Reset Demo

`getRepositoryRegistry().resetToDemoData()` restaura seeds, credenciales demo y limpia la sesion activa. La UI para invocarlo se agregara en otra tarea.
