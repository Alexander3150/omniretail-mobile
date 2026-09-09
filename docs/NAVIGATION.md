# Navigation

Expo Router usa `src/app` como directorio oficial de rutas.

## Flujos

- `(auth)`: login, registro, recuperacion y restablecimiento de clave.
- `(protected)`: experiencia autenticada futura del cliente.
- `(protected)/(tabs)`: navegacion principal con cinco tabs.

## Tabs

- Inicio
- Categorias
- Carrito
- Pedidos
- Cuenta

## Rutas secundarias

Favoritos, notificaciones, checkout, detalle de producto, detalle de pedido, direcciones, sucursales y soporte viven fuera de tabs dentro de `(protected)`.

`src/app/index.tsx` redirige temporalmente al area protegida. En una tarea posterior se conectara un `SessionProvider` para decidir entre `(auth)` y `(protected)`.
