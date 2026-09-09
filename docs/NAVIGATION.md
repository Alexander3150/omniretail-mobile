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

`src/app/index.tsx` usa `SessionProvider` para hacer bootstrap:

- loading mientras lee storage;
- sin sesion: `/(auth)/login`;
- con sesion: `/(protected)/(tabs)`.

`(auth)/_layout.tsx` evita que un usuario autenticado permanezca en login/register/reset. `(protected)/_layout.tsx` protege tabs y rutas secundarias.

## Seguridad

`/(protected)/account/security` contiene el cambio de contrasena autenticado. No hay OAuth, email, SMS, push ni integraciones externas reales.

## Commerce

- Home y Categorias cargan catalogo local.
- Product detail vive en `/(protected)/products/[id]`.
- Favorites vive en `/(protected)/favorites`.
- Cart vive en la tab Carrito.
- Checkout usa `delivery -> payment -> review -> success`.
- Success puede navegar a `/(protected)/orders/[id]`.

## Customer Services

- Pedidos vive como tab en `/(protected)/(tabs)/orders`.
- Detalle de pedido vive en `/(protected)/orders/[id]`.
- Notificaciones vive en `/(protected)/notifications`.
- Sucursales vive en `/(protected)/branches`.
- Detalle de sucursal vive en `/(protected)/branches/[id]`.
- Soporte vive en `/(protected)/support`.
- Cuenta enlaza a pedidos, notificaciones, sucursales y soporte.
