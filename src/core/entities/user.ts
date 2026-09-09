import { UserStatus } from "../enums";
import type { EntityId, ISODateString } from "../types";

export type User = {
  id: EntityId;
  email: string;
  status: UserStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};
