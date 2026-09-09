export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterCustomerInput = {
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export type ChangePasswordInput = {
  userId: string;
  currentPassword: string;
  newPassword: string;
};

export type PasswordResetRequestInput = {
  email: string;
};

export type PasswordResetVerificationInput = {
  email: string;
  code: string;
};

export type ResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
};
