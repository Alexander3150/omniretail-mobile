# Customer Services

Esta rama completa capacidades post-compra locales para el cliente autenticado.

## Alcance

- Pedidos del customer actual, ordenados por `createdAt DESC`.
- Detalle de pedido usando `OrderRepository.getWithItems()`.
- Snapshots historicos de `OrderItem`; no se reconstruyen desde `Product`.
- Tracking simulado derivado desde `Order`.
- Avance demo de estado `confirmed -> preparing -> shipped`.
- Notificaciones locales por customer con leidas/no leidas.
- Sucursales activas del tenant.
- Soporte desde `BusinessConfigRepository`.

## Arquitectura

Las pantallas consumen hooks de modulo. Los hooks consumen application services o repositories.

```text
Screen
-> Hook
-> Application Service / Mapper
-> Repository
-> Mock Repository
-> MockDatabaseStore
```

`src/modules/**` y `src/app/**` no importan `MockDatabaseStore`, `databaseStore` ni `src/infrastructure/mock/database`.

## Tracking Demo

El tracking visual no se guarda como entidad nueva. Se deriva de:

- `status`
- `confirmedAt`
- `preparingAt`
- `shippedAt`

El avance demo esta controlado por `demoConfig.enableOrderStatusControls`.

Cada avance valido persiste el nuevo estado y crea una notificacion:

- `confirmed -> preparing`: `orderPreparing`
- `preparing -> shipped`: `orderShipped`

Estados no avanzables no crean notificaciones.

## Sin Integraciones Reales

No hay push notifications, mapas nativos, GPS, backend ni sincronizacion. Las acciones de telefono, email, WhatsApp y direcciones usan `Linking`.
