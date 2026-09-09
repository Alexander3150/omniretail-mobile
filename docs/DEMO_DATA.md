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
