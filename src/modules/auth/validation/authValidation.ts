const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "El correo es requerido.";
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return "Ingresa un correo valido.";
  }

  return null;
}

export function validateRequiredPassword(password: string): string | null {
  return password ? null : "La contrasena es requerida.";
}

export function validatePasswordConfirmation(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return "Confirma la contrasena.";
  }

  if (password !== confirmPassword) {
    return "Las contrasenas no coinciden.";
  }

  return null;
}

export function validateNewPassword(currentPassword: string, newPassword: string, confirmPassword: string): string | null {
  return (
    validateRequiredPassword(currentPassword) ??
    validateRequiredPassword(newPassword) ??
    validatePasswordConfirmation(newPassword, confirmPassword) ??
    (currentPassword === newPassword ? "La nueva contrasena debe ser diferente." : null)
  );
}
