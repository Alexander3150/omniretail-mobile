import { demoDatabase } from "../seeds";

import type { MockDatabase } from "./MockDatabase";

export function createMockDatabase(): MockDatabase {
  return JSON.parse(JSON.stringify(demoDatabase)) as MockDatabase;
}
