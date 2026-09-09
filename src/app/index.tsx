import { Redirect, type Href } from "expo-router";

export default function Index() {
  // TODO: connect SessionProvider/bootstrap here and choose auth or protected flow.
  return <Redirect href={"/(protected)/(tabs)" as Href} />;
}
