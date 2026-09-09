# OmniRetail Mobile

OmniRetail Mobile es la aplicacion customer-facing de OmniRetail, construida con React Native, Expo, TypeScript y Expo Router.

Esta etapa contiene la foundation arquitectonica, contratos core customer-facing, infraestructura local persistente y auth/session funcional para simulacion demo. No incluye UI final, checkout completo, pagos reales, seguimiento automatico, notificaciones push ni backend.

## Scripts

```bash
npm run lint
npx tsc --noEmit
npx expo export
```

## Arquitectura

El codigo vive en `src/`:

- `app/`: rutas y layouts de Expo Router.
- `core/`: entidades, enums, tipos y contratos de repositorios futuros.
- `infrastructure/`: implementaciones futuras de mock, almacenamiento y API.
- `modules/`: pantallas y logica por dominio funcional.
- `shared/`: componentes, hooks, utils y validacion reutilizable.
- `config/`: configuracion transversal.
- `theme/`: tokens visuales base.

Consulta `docs/` para el detalle de arquitectura, navegacion, contratos e integracion futura.

## Core Contracts

`src/core` define entidades, enums, tipos de input y repository interfaces para una simulacion local independiente. Los contratos conservan semantica compatible con OmniRetail Web, pero no sincronizan datos con la web ni incluyen conceptos administrativos.

## Local Persistence

`src/infrastructure/mock` implementa repositorios mock sobre un unico `MockDatabaseStore` persistido en AsyncStorage. La sesion activa y credenciales demo viven separadas en SecureStore.

Datos demo:

- Email: `cliente@demo.com`
- Password: `Demo1234`
- Reset code demo: `123456`

El reset tecnico de demo esta disponible desde `getRepositoryRegistry().resetToDemoData()` para futuras pantallas/herramientas internas.

## Auth Local

La app inicia con bootstrap de sesion:

- sin sesion: redirige a `/(auth)/login`;
- con sesion: redirige a `/(protected)/(tabs)`;
- rutas auth redirigen a Home si ya hay sesion;
- rutas protegidas redirigen a Login si no hay sesion.

La pantalla Cuenta muestra el customer actual y permite cerrar sesion. La ruta `/(protected)/account/security` permite cambiar contrasena de forma local.
