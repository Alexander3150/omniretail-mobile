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
- No backend real en esta foundation.
- Pagos y seguimiento seran simulados inicialmente.
- No chatbot IA.
- Bottom tabs definidos: Inicio, Categorias, Carrito, Pedidos, Cuenta.
- Arquitectura por modulos: auth, home, catalog, favorites, cart, checkout, orders, notifications, branches, account y support.
