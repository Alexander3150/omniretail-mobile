# Contract Mapping

Los contratos TypeScript de OmniRetail Mobile quedan alineados conceptualmente con OmniRetail Web, pero la app movil es una simulacion local independiente. No hay sincronizacion con la web ni backend real en esta etapa.

En el futuro, Backend/OpenAPI debe convertirse en la fuente canonica. Mientras tanto, `src/core` define contratos customer-facing para que mocks locales y una API futura puedan intercambiarse sin rehacer pantallas.

## Referencia Provisional

| Concepto mobile | Relacion conceptual web | Adaptacion mobile | Estado |
| --- | --- | --- | --- |
| User | Identidad/autenticacion | Sin roles ni permisos administrativos | Definido |
| Customer | Comprador comercial | Perfil del cliente actual | Definido |
| Session | Sesion activa | Sin tokens obligatorios en dominio | Definido |
| Product | Producto comercial | Visible si esta published y canal mobileApp | Definido |
| ProductMedia | Media de producto | URL/alt/sort, sin imports React | Definido |
| Category | Categoria comercial | Navegacion, busqueda y filtros | Definido |
| Unit | Unidad comercial | Nombre, codigo, simbolo y decimales | Definido |
| Promotion | Promocion | percentage, fixedDiscount, fixedPrice por canal | Definido |
| SalesChannel | Canales de venta | pos, ecommerce, mobileApp | Definido |
| Address | Direccion de cliente | Guardada por customer, archive sobre delete | Definido |
| Order | Pedido | Snapshot historico customer-facing | Definido |
| OrderItem | Item de pedido | Snapshot de nombre, SKU y precios | Definido |
| Payment | Resultado de pago | Simulado; pending, approved, rejected | Definido |
| CustomerPaymentMethod | Metodo guardado | Token/brand/last4, nunca PAN/CVV/PIN | Definido |
| Notification | Notificacion local | Persistible, sin Expo Push en entidad | Definido |
| Branch | Sucursal publica | Retiro, contacto y ubicacion publica | Definido |

## Conceptos Mobile-Local

| Concepto | Motivo | Estado |
| --- | --- | --- |
| Favorite | Relacion customer-product; no contamina Product con `isFavorite` | Definido |
| Cart | Carrito persistible local futuro por tenant/customer | Definido |
| CartItem | Cantidades y snapshots opcionales de precio | Definido |
| ProductAvailability | Proyeccion publica de disponibilidad, sin bodega interna | Definido |
| BusinessConfig | Contenido del negocio demo sin hardcodes en UI | Definido |

## Decisiones

- Entity, DTO y ViewModel permanecen separados. Las entidades no incluyen `formattedPrice`, colores, labels de botones ni estado UI.
- `User` representa identidad; `Customer` representa comprador; `Session` representa la sesion activa.
- `password`, access tokens y refresh tokens no forman parte de entidades publicas. AuthRepository define entradas con password solo para operaciones de autenticacion.
- Precios son numeros. `BusinessConfig.currency` puede usar `GTQ`; el formateo `Q 100.00` pertenece a utilities futuras.
- `Product.basePrice` conserva precio normal; `Promotion` queda separada para que un application service calcule descuento y effectivePrice.
- `CartItem` permite `unitPriceSnapshot` y `effectiveUnitPriceSnapshot` opcionales para consistencia cuando cambien precios durante una simulacion o checkout futuro.
- `Order` y `OrderItem` guardan snapshot historico para no depender del producto actual.
- Tracking mobile usa `confirmedAt`, `preparingAt` y `shippedAt` en `Order`; la timeline sera un ViewModel futuro.
- Reserva temporal de stock queda fuera del MVP. No se crea `StockReservation`.

## Contratos Administrativos Excluidos

No se incluyen conceptos internos como InventoryMovement, InventoryAdjustment, InventoryTransfer, ProductInventorySettings, StorageLocation, PurchaseOrder, Supplier, POS, CashRegister, Role, Permission, AuditLog, Picking ni operaciones de bodega.
