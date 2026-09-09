# Invoice Flow

La factura movil es un documento PDF de demostracion. No es FEL, no se conecta con SAT y no tiene validez fiscal.

## Source of Truth

La factura se genera desde datos historicos:

- `Order`
- `OrderItem` snapshots
- `Payment` seguro
- `BusinessConfig`

No usa `Product` ni `Customer` actuales para reconstruir historial.

## Checkout

Checkout solicita:

- telefono de contacto obligatorio;
- nombre de facturacion obligatorio;
- NIT opcional.

Si NIT queda vacio, la factura muestra `CF`.

## Tarjetas

La app mobile solo usa `PaymentMethodType.Card`.

El formulario de tarjeta acepta datos demo y valida:

- numero requerido con longitud razonable y Luhn;
- titular requerido;
- expiracion vigente;
- CVV requerido.

Solo se persiste metadata segura:

- `providerTokenId` demo;
- `brand`;
- `last4`;
- `expirationMonth`;
- `expirationYear`;
- `cardholderName`;
- `isDefault`;
- `status`.

No se persiste PAN completo, CVV ni PIN.

## PDF

`expo-print` genera un PDF desde HTML. `expo-sharing` comparte o guarda el archivo segun las capacidades del dispositivo.

Las pantallas no llaman directamente a Expo Print/Sharing. Usan un hook de factura y el adapter vive en infraestructura.

El footer del PDF indica:

```text
DOCUMENTO DE DEMOSTRACION - SIN VALIDEZ FISCAL
```
