# OmniRetail Mobile

OmniRetail Mobile es la aplicacion customer-facing de OmniRetail, construida con React Native, Expo, TypeScript y Expo Router.

Esta etapa contiene la foundation arquitectonica y los contratos core customer-facing. No incluye productos reales/mock, carrito funcional, login real, persistencia, pagos, seguimiento, notificaciones funcionales ni backend.

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
