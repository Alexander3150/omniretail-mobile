# Demo Data

OmniRetail Mobile usa un dataset local independiente. No hay backend ni sincronizacion con OmniRetail Web.

## Cuenta Demo

- Email: `cliente@demo.com`
- Password: `Demo1234`
- Codigo reset demo: `123456`

Estas credenciales existen solo para simulacion academica/local. No se guardan en `User`, `Customer` ni `Session`.

## Storage

- AsyncStorage: snapshot no sensible de `MockDatabase`.
- SecureStore: sesion activa y credenciales mock.

Keys:

- `omniretail-mobile:mock-db:v1`
- `omniretail-mobile:mock-credentials:v1`
- `omniretail-mobile:session:v1`

## Dataset

- 1 negocio demo con moneda `GTQ`.
- 2 sucursales en Huehuetenango: Centro y Norte.
- 1 usuario/customer demo.
- 6 categorias.
- 16 productos con media separada.
- 4 promociones: percentage, fixedDiscount y fixedPrice.
- Disponibilidad por producto/sucursal, incluyendo productos sin disponibilidad y productos disponibles solo en una sucursal.
- 2 direcciones del customer demo.
- 3 favoritos.
- Carrito inicial vacio para evitar sorpresas al usuario demo.
- 3 pedidos historicos: confirmed, preparing y shipped.
- 5 notificaciones, algunas leidas y otras no leidas.
- 1 metodo de pago demo seguro con token, brand y last4.

## Reset

El reset tecnico se ejecuta desde infraestructura:

```ts
import { getRepositoryRegistry } from "@/infrastructure";

await getRepositoryRegistry().resetToDemoData();
```

Esto borra el snapshot local, restaura seeds, restaura credenciales demo y limpia la sesion activa.

Si cambias la contrasena del usuario demo, `Demo1234` deja de funcionar hasta ejecutar `resetToDemoData()`.

## Manual Runtime Tests

1. Fresh install/reset: debe mostrar Login.
2. Login demo con `cliente@demo.com` / `Demo1234`: debe ir a Home.
3. Cerrar y abrir app: debe seguir autenticado.
4. Logout desde Cuenta: debe volver a Login.
5. Login con credenciales incorrectas: debe mostrar error.
6. Register nueva cuenta: debe iniciar sesion y persistir tras logout/login.
7. Forgot password: muestra codigo demo `123456`; no envia email/SMS real.
8. Reset password con `123456`: password anterior falla y nueva funciona.
9. Change password autenticado: password anterior falla tras logout y la nueva funciona.
10. Ruta protegida sin session: redirige a Login.
11. Login/register/reset con session activa: redirige a Home.

## Commerce Manual Tests

1. Login demo: Home carga negocio, categorias y productos seed.
2. Categorias: seleccionar categoria filtra productos.
3. Search: buscar por nombre o SKU.
4. Product Detail: abrir producto y ver precio/disponibilidad.
5. Favorite: agregar/quitar y reiniciar app; debe persistir.
6. Cart: agregar, aumentar, disminuir, eliminar y reiniciar app; debe persistir.
7. Account: muestra customer actual.
8. Address: crear direccion y marcar default.
9. Checkout home delivery: seleccionar direccion y confirmar.
10. Checkout store pickup: seleccionar sucursal y confirmar.
11. Payment: seleccionar metodo demo; siempre aprueba en MVP.
12. Confirm: crea Order `confirmed`.
13. Cart: queda vacio despues de confirmar.
14. Orders: pedido nuevo persiste tras restart.
15. Second customer: registrar otro customer y verificar aislamiento de favoritos, carrito, direcciones y pedidos.
