# AI Context

OmniRetail Mobile es una app customer-facing, no administrativa.

Stack:

- React Native
- Expo SDK 57
- TypeScript
- Expo Router con rutas en `src/app`

Contexto funcional futuro:

- App autenticada.
- Repositories definidos en `core`.
- Mocks locales en `infrastructure` antes de API real.
- No backend real durante esta etapa.
- No sincronizacion con OmniRetail Web.
- Datos locales en la simulacion futura.
- Pagos, seguimiento y recuperacion de contrasena seran simulados.
- Cambios como password reset o change password deberan afectar la base local cuando existan mocks.
- No chatbot IA.
- Bottom tabs definidos: Inicio, Categorias, Carrito, Pedidos, Cuenta.
- Arquitectura por modulos: auth, home, catalog, favorites, cart, checkout, orders, notifications, branches, account y support.
- Core contiene solo contratos customer-facing: entidades, enums, tipos e interfaces de repositorios.
