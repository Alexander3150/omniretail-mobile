# AI Context

OmniRetail Mobile es una app customer-facing, no administrativa.

Stack:

- React Native
- Expo SDK 57
- TypeScript
- Expo Router con rutas en `src/app`

Contexto funcional futuro:

- App autenticada.
- Auth/session funcional mediante `SessionProvider`.
- Repositories definidos en `core`.
- Mocks locales persistentes en `infrastructure`.
- No backend real durante esta etapa.
- No sincronizacion con OmniRetail Web.
- Datos locales persistidos en AsyncStorage.
- Sesion activa y credenciales demo persistidas en SecureStore.
- Pagos, seguimiento y recuperacion de contrasena son simulados.
- Cambios como password reset o change password afectan credenciales locales mock.
- No chatbot IA.
- Bottom tabs definidos: Inicio, Categorias, Carrito, Pedidos, Cuenta.
- Arquitectura por modulos: auth, home, catalog, favorites, cart, checkout, orders, notifications, branches, account y support.
- Core contiene solo contratos customer-facing: entidades, enums, tipos e interfaces de repositorios.
- Repositorios mock comparten una unica instancia de `MockDatabaseStore`.
- Guards de Expo Router viven en layouts de `(auth)` y `(protected)`.
- Login, registro, logout, forgot/reset y cambio de contrasena consumen repositories; no acceden directo a SecureStore.
- Commerce flow funcional local: catalogo, favoritos, carrito, direcciones, checkout y creacion de order.
- Checkout no procesa pagos reales: crea pagos aprobados simulados.
- Mobile solo ofrece pago con tarjeta guardada/demo segura.
- Registro no solicita telefono; el telefono de contacto se solicita en checkout.
- Checkout solicita billing name y NIT opcional para snapshot historico.
- Las tarjetas guardadas persisten solo metadata segura; nunca PAN completo, CVV ni PIN.
- La factura PDF es demo, se genera con `expo-print`, se comparte con `expo-sharing` y no tiene validez fiscal.
- Nuevo pedido nace `confirmed`.
- Customer services esta implementado con pedidos, detalle, tracking simulado, notificaciones, sucursales y soporte local.
- El tracking se deriva desde `Order`; no existe entidad de tracking persistida.
- Las pantallas y hooks en `modules` no acceden directo a `MockDatabaseStore`, `databaseStore`, AsyncStorage ni SecureStore.
