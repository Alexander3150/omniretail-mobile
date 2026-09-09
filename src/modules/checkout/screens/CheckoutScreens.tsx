import { PlaceholderScreen } from "@/shared";

export function CheckoutDeliveryScreen() {
  return <PlaceholderScreen title="Entrega" description="Paso futuro de direccion y metodo de entrega." />;
}

export function CheckoutPaymentScreen() {
  return <PlaceholderScreen title="Pago" description="Paso futuro de pago simulado." />;
}

export function CheckoutReviewScreen() {
  return <PlaceholderScreen title="Revisar pedido" description="Paso futuro de confirmacion." />;
}

export function CheckoutSuccessScreen() {
  return <PlaceholderScreen title="Pedido confirmado" description="Resultado futuro del checkout." />;
}
