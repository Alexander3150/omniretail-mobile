import { Linking } from "react-native";

import type { Branch } from "@/core";

export async function openBranchDirections(branch: Branch): Promise<void> {
  const query = branch.latitude !== undefined && branch.longitude !== undefined ? `${branch.latitude},${branch.longitude}` : encodeURIComponent(branch.address);
  await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
}
