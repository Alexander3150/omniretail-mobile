import { Link, router, useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { DEMO_RESET_CODE, useRepositories } from "@/infrastructure";
import { colors, radius, spacing, typography } from "@/theme";

import { useSession } from "../hooks/useSession";
import { validateEmail, validateNewPassword, validatePasswordConfirmation, validateRequiredPassword } from "../validation";

export function LoginScreen() {
  const { login } = useSession();
  const [email, setEmail] = useState("cliente@demo.com");
  const [password, setPassword] = useState("Demo1234");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError = validateEmail(email) ?? validateRequiredPassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.replace("/(protected)/(tabs)");
    } catch {
      setError("Correo o contrasena incorrectos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm title="Login" error={error}>
      <AuthTextInput autoCapitalize="none" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} />
      <AuthTextInput label="Contrasena" onChangeText={setPassword} secureTextEntry value={password} />
      <PrimaryButton disabled={isSubmitting} label="Iniciar sesion" loading={isSubmitting} onPress={handleSubmit} />
      <InlineLink href="/(auth)/register" label="Crear cuenta" />
      <InlineLink href="/(auth)/forgot-password" label="Recuperar contrasena" />
    </AuthForm>
  );
}

export function RegisterScreen() {
  const { register } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError =
      (!name.trim() ? "El nombre es requerido." : null) ??
      validateEmail(email) ??
      validateRequiredPassword(password) ??
      validatePasswordConfirmation(password, confirmPassword);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      router.replace("/(protected)/(tabs)");
    } catch {
      setError("El correo ya esta registrado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm title="Registro" error={error}>
      <AuthTextInput label="Nombre" onChangeText={setName} value={name} />
      <AuthTextInput autoCapitalize="none" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} />
      <AuthTextInput keyboardType="phone-pad" label="Telefono" onChangeText={setPhone} value={phone} />
      <AuthTextInput label="Contrasena" onChangeText={setPassword} secureTextEntry value={password} />
      <AuthTextInput label="Confirmar contrasena" onChangeText={setConfirmPassword} secureTextEntry value={confirmPassword} />
      <PrimaryButton disabled={isSubmitting} label="Crear cuenta" loading={isSubmitting} onPress={handleSubmit} />
      <InlineLink href="/(auth)/login" label="Ya tengo cuenta" />
    </AuthForm>
  );
}

export function ForgotPasswordScreen() {
  const { authRepository } = useRepositories();
  const [email, setEmail] = useState("cliente@demo.com");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await authRepository.requestPasswordReset({ email: email.trim() });
      setMessage(`Recuperacion simulada solicitada. Codigo de demostracion: ${DEMO_RESET_CODE}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm title="Recuperar contrasena" error={error} message={message}>
      <AuthTextInput autoCapitalize="none" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} />
      <PrimaryButton disabled={isSubmitting} label="Solicitar codigo" loading={isSubmitting} onPress={handleSubmit} />
      <InlineLink href={{ pathname: "/(auth)/reset-password", params: { email } }} label="Continuar a reset" />
    </AuthForm>
  );
}

export function ResetPasswordScreen() {
  const { authRepository } = useRepositories();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "cliente@demo.com");
  const [code, setCode] = useState(DEMO_RESET_CODE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError =
      validateEmail(email) ??
      (!code.trim() ? "El codigo es requerido." : null) ??
      validateRequiredPassword(password) ??
      validatePasswordConfirmation(password, confirmPassword);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await authRepository.resetPassword({ email: email.trim(), code: code.trim(), newPassword: password });
      setMessage("Contrasena actualizada. Ya puedes iniciar sesion.");
      router.replace("/(auth)/login");
    } catch {
      setError("El codigo no es valido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm title="Restablecer contrasena" error={error} message={message}>
      <Text style={styles.helpText}>Codigo de demostracion: {DEMO_RESET_CODE}</Text>
      <AuthTextInput autoCapitalize="none" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} />
      <AuthTextInput keyboardType="number-pad" label="Codigo" onChangeText={setCode} value={code} />
      <AuthTextInput label="Nueva contrasena" onChangeText={setPassword} secureTextEntry value={password} />
      <AuthTextInput label="Confirmar contrasena" onChangeText={setConfirmPassword} secureTextEntry value={confirmPassword} />
      <PrimaryButton disabled={isSubmitting} label="Restablecer" loading={isSubmitting} onPress={handleSubmit} />
    </AuthForm>
  );
}

export function ChangePasswordScreen() {
  const { authRepository } = useRepositories();
  const { session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError = validateNewPassword(currentPassword, newPassword, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!session) {
      setError("Necesitas iniciar sesion.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      await authRepository.changePassword({ userId: session.userId, currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Contrasena actualizada.");
    } catch {
      setError("La contrasena actual es incorrecta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm title="Seguridad" error={error} message={message}>
      <AuthTextInput label="Contrasena actual" onChangeText={setCurrentPassword} secureTextEntry value={currentPassword} />
      <AuthTextInput label="Nueva contrasena" onChangeText={setNewPassword} secureTextEntry value={newPassword} />
      <AuthTextInput label="Confirmar contrasena" onChangeText={setConfirmPassword} secureTextEntry value={confirmPassword} />
      <PrimaryButton disabled={isSubmitting} label="Cambiar contrasena" loading={isSubmitting} onPress={handleSubmit} />
    </AuthForm>
  );
}

type AuthFormProps = {
  children: ReactNode;
  error?: string | null;
  message?: string | null;
  title: string;
};

function AuthForm({ children, error, message, title }: AuthFormProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.title}>{title}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
        {children}
      </View>
    </ScrollView>
  );
}

type AuthTextInputProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  label: string;
  onChangeText(value: string): void;
  secureTextEntry?: boolean;
  value: string;
};

function AuthTextInput({ label, ...inputProps }: AuthTextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholder={label} placeholderTextColor={colors.textMuted} style={styles.input} {...inputProps} />
    </View>
  );
}

type PrimaryButtonProps = {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress(): void;
};

function PrimaryButton({ disabled, label, loading, onPress }: PrimaryButtonProps) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled ? styles.buttonDisabled : null]}>
      {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>{label}</Text>}
    </Pressable>
  );
}

type InlineLinkProps = {
  href: React.ComponentProps<typeof Link>["href"];
  label: string;
};

function InlineLink({ href, label }: InlineLinkProps) {
  return (
    <Link href={href} style={styles.link}>
      {label}
    </Link>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    fontSize: typography.body,
  },
  field: {
    gap: spacing.xs,
  },
  form: {
    gap: spacing.md,
    width: "100%",
  },
  helpText: {
    color: colors.textMuted,
    fontSize: typography.body,
  },
  input: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "700",
  },
  link: {
    color: colors.primary,
    fontSize: typography.body,
    textAlign: "center",
  },
  message: {
    color: colors.success,
    fontSize: typography.body,
  },
  scrollContent: {
    backgroundColor: colors.background,
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "700",
  },
});
