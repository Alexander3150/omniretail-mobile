import type {
  ChangePasswordInput,
  LoginInput,
  PasswordResetRequestInput,
  PasswordResetVerificationInput,
  RegisterCustomerInput,
  ResetPasswordInput,
} from "../types";
import type { Customer, Session, User } from "../entities";

export type AuthResult = {
  user: User;
  customer: Customer;
  session: Session;
};

export interface AuthRepository {
  login(input: LoginInput): Promise<AuthResult>;
  registerCustomer(input: RegisterCustomerInput): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<Session | null>;
  changePassword(input: ChangePasswordInput): Promise<void>;
  requestPasswordReset(input: PasswordResetRequestInput): Promise<void>;
  verifyPasswordResetCode(input: PasswordResetVerificationInput): Promise<boolean>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
}
