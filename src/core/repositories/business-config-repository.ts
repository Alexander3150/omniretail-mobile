import type { BusinessConfig } from "../entities";

export interface BusinessConfigRepository {
  getCurrent(): Promise<BusinessConfig>;
}
