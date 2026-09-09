# Commerce Flow

El flujo local es:

```text
Product
-> Favorite
-> Cart
-> Checkout
-> Order
```

No hay backend, reservas de stock, gateway de pago, tracking automatico, GPS ni integraciones externas.

## Catalogo

Home y Categorias usan repositories para cargar `BusinessConfig`, `Category`, `Product`, `ProductMedia`, `Promotion`, `ProductAvailability` y `Favorite`. Solo se muestran productos `published` con `SalesChannel.MobileApp`.

## Pricing

`calculatePrice()` calcula `basePrice`, `discount` y `effectivePrice` sin modificar `Product.basePrice`.

Promociones soportadas:

- `percentage`
- `fixedDiscount`
- `fixedPrice`

`formatCurrency()` muestra `GTQ` como `Q 100.00`; los calculos siguen usando `number`.

## Cart

El carrito pertenece al `tenantId` y `customerId` de la sesion. `CartItem` conserva snapshots opcionales de precio al agregar, pero el snapshot historico definitivo se crea en `OrderItem`.

Totales de carrito:

- `subtotalBeforeDiscount`
- `discount`
- `subtotal`
- `shippingCost`
- `total`

En carrito normal, shipping es `0`.

## Checkout

Checkout usa estado temporal local:

- `deliveryMethod`
- `addressId`
- `pickupBranchId`
- `contactPhone`
- `billingName`
- `nit`
- `paymentMethod`
- `customerPaymentMethodId`

Regla demo de envio:

- `homeDelivery`: `Q 25.00`
- `storePickup`: `Q 0.00`

Payment simulation:

- metodo mobile: card;
- resultado MVP: `approved`;
- nunca se solicita PAN, CVV ni PIN.
- tarjetas guardadas persisten solo metadata segura.

## Billing

Checkout solicita telefono de contacto obligatorio, nombre de facturacion obligatorio y NIT opcional. Si NIT queda vacio, la factura demo usa `CF`.

## Place Order

`PlaceOrderService` obtiene carrito, valida seleccion, calcula totales, crea el agregado `Order + OrderItem` mediante `OrderRepository.create`, snapshottea contacto/facturacion, crea `Payment` aprobado con metadata segura de tarjeta, crea `Notification` `orderConfirmed` y vacia el carrito.

El nuevo pedido nace `confirmed`. No se avanza automaticamente a `preparing` ni `shipped`.

## Post-compra

Pedidos y detalle consumen `OrderRepository.getByCustomer`, `getItems` y `getWithItems`.

El detalle usa snapshots historicos de `OrderItem`. El tracking visual se deriva desde `Order` y el avance demo persiste cambios por repository.

Notificaciones consumen `NotificationRepository`; no hay Expo push notifications en esta etapa.

## Invoice

Success y Order Detail pueden generar una factura PDF de demostracion desde `Order`, `OrderItems`, `Payment` y `BusinessConfig`. No se reconstruye desde `Product` actual. El PDF se genera con `expo-print` y se comparte con `expo-sharing`.
