import { Linking } from "react-native";

export async function callSupport(phone: string): Promise<void> {
  await Linking.openURL(`tel:${phone}`);
}

export async function emailSupport(email: string): Promise<void> {
  await Linking.openURL(`mailto:${email}`);
}

export async function openWhatsAppSupport(phone: string): Promise<void> {
  await Linking.openURL(`https://wa.me/${phone.replace(/\D/g, "")}`);
}
