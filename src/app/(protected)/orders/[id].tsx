import { useLocalSearchParams } from "expo-router";

import {
  ApiOrderDetailScreen,
  OrderDetailScreen,
} from "@/modules/orders";

export default function OrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (id?.startsWith("api:")) {
    return <ApiOrderDetailScreen />;
  }

  return <OrderDetailScreen />;
}
