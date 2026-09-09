import { OrderStatus, type Order } from "@/core";

export type TrackingStepKey = "confirmed" | "preparing" | "shipped";
export type TrackingStepState = "completed" | "current" | "pending";

export type TrackingStep = {
  key: TrackingStepKey;
  label: string;
  state: TrackingStepState;
  date?: string;
};

const orderProgress: Record<TrackingStepKey, number> = {
  confirmed: 0,
  preparing: 1,
  shipped: 2,
};

export function mapOrderTracking(order: Order): TrackingStep[] {
  const currentStep = getCurrentStep(order.status);

  const steps: Omit<TrackingStep, "state">[] = [
    { key: "confirmed", label: "Confirmado", date: order.confirmedAt },
    { key: "preparing", label: "Preparando", date: order.preparingAt },
    { key: "shipped", label: "Enviado", date: order.shippedAt },
  ];

  return steps.map((step) => ({
    ...step,
    state: resolveStepState(step.key, currentStep),
  }));
}

function getCurrentStep(status: OrderStatus): TrackingStepKey {
  if (status === OrderStatus.Shipped) {
    return "shipped";
  }
  if (status === OrderStatus.Preparing) {
    return "preparing";
  }
  return "confirmed";
}

function resolveStepState(step: TrackingStepKey, currentStep: TrackingStepKey): TrackingStepState {
  if (orderProgress[step] < orderProgress[currentStep]) {
    return "completed";
  }
  if (orderProgress[step] === orderProgress[currentStep]) {
    return "current";
  }
  return "pending";
}
