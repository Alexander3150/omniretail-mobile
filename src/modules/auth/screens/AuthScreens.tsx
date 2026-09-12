import { Link, router, useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { DEMO_RESET_CODE, useRepositories } from "@/infrastructure";
import { radius, spacing, typography } from "@/theme";

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
    <AuthForm title="Login" subtitle="Accede a tu cuenta y continúa con tus compras." error={error}>
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
    <AuthForm title="Registro" subtitle="Crea tu cuenta para comenzar a comprar." error={error}>
      <AuthTextInput label="Nombre" onChangeText={setName} value={name} />
      <AuthTextInput autoCapitalize="none" keyboardType="email-address" label="Correo" onChangeText={setEmail} value={email} />
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
    <AuthForm title="Recuperar contrasena" subtitle="Recupera el acceso a tu cuenta." error={error} message={message}>
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
    <AuthForm
      title="Restablecer contrasena"
      subtitle="Define una nueva contraseña para tu cuenta."
      error={error}
      message={message}
    >
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
    <AuthForm title="Seguridad" subtitle="Actualiza la seguridad de tu cuenta." error={error} message={message}>
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
  subtitle: string;
  title: string;
};

function AuthForm({ children, error, message, subtitle, title }: AuthFormProps) {
  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      contentContainerStyle={styles.scrollContent}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.decorativeCircleTop} />
      <View style={styles.decorativeCircleBottom} />

      <View style={styles.authWrapper}>
        <View style={styles.brandArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>✦</Text>
          </View>

          <Text style={styles.brandName}>FerrePharma</Text>
          <Text style={styles.brandSubtitle}>
            FERRETERÍA & FARMACIA
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.formSubtitle}>{subtitle}</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={styles.messageBox}>
              <Text style={styles.message}>{message}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {children}
          </View>
        </View>

        <Text style={styles.footerText}>
          Compra fácil, segura y desde cualquier lugar.
        </Text>
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

      <View style={styles.inputContainer}>
        <TextInput
          placeholder={label}
          placeholderTextColor="#8290A5"
          style={styles.input}
          {...inputProps}
        />
      </View>
    </View>
  );
}

type PrimaryButtonProps = {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress(): void;
};

function PrimaryButton({
  disabled,
  label,
  loading,
  onPress,
}: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </Pressable>
  );
}

type InlineLinkProps = {
  href: React.ComponentProps<typeof Link>["href"];
  label: string;
};

function InlineLink({ href, label }: InlineLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [
        styles.linkButton,
        pressed ? styles.linkButtonPressed : null,
      ]}>
        <Text style={styles.link}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const palette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  danger: "#C2413B",
  success: "#1E8E5A",
};

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: palette.vanillaMilk,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
    overflow: "hidden",
    paddingBottom: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  decorativeCircleTop: {
    backgroundColor: palette.silkyLilac,
    borderRadius: 120,
    height: 210,
    opacity: 0.35,
    position: "absolute",
    right: -80,
    top: -70,
    width: 210,
  },

  decorativeCircleBottom: {
    backgroundColor: palette.butterHoney,
    borderRadius: 100,
    bottom: -70,
    height: 190,
    left: -80,
    opacity: 0.35,
    position: "absolute",
    width: 190,
  },

  authWrapper: {
    alignSelf: "center",
    maxWidth: 480,
    width: "100%",
  },

  brandArea: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  logoBox: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: radius.lg,
    height: 58,
    justifyContent: "center",
    marginBottom: spacing.sm,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: 58,
    elevation: 5,
  },

  logoIcon: {
    color: palette.butterHoney,
    fontSize: 30,
    fontWeight: "800",
  },

  brandName: {
    color: palette.deepBlue,
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  brandSubtitle: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginTop: 2,
  },

  formCard: {
    backgroundColor: palette.white,
    borderColor: palette.silkyLilac,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  title: {
    color: palette.text,
    fontSize: typography.title,
    fontWeight: "900",
    textAlign: "center",
  },

  formSubtitle: {
    color: palette.muted,
    fontSize: typography.caption,
    lineHeight: 19,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  form: {
    gap: spacing.md,
    width: "100%",
  },

  field: {
    gap: spacing.xs,
  },

  label: {
    color: palette.deepBlue,
    fontSize: typography.caption,
    fontWeight: "800",
  },

  inputContainer: {
    backgroundColor: "#FAFBFD",
    borderColor: palette.silkyLilac,
    borderRadius: 12,
    borderWidth: 1,
  },

  input: {
    color: palette.text,
    fontSize: typography.body,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },

  button: {
    alignItems: "center",
    backgroundColor: palette.deepBlue,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: spacing.md,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: palette.white,
    fontSize: typography.body,
    fontWeight: "800",
  },

  linkButton: {
    alignItems: "center",
    borderRadius: radius.md,
    justifyContent: "center",
    minHeight: 38,
  },

  linkButtonPressed: {
    backgroundColor: palette.vanillaMilk,
  },

  link: {
    color: palette.deepBlue,
    fontSize: typography.body,
    fontWeight: "700",
    textAlign: "center",
  },

  errorBox: {
    backgroundColor: "#FFF2F1",
    borderColor: "#E8A9A5",
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },

  error: {
    color: palette.danger,
    fontSize: typography.caption,
    fontWeight: "600",
    textAlign: "center",
  },

  messageBox: {
    backgroundColor: "#EFFAF5",
    borderColor: "#A7D8C1",
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },

  message: {
    color: palette.success,
    fontSize: typography.caption,
    fontWeight: "600",
    textAlign: "center",
  },

  helpText: {
    backgroundColor: palette.vanillaMilk,
    borderRadius: radius.md,
    color: palette.deepBlue,
    fontSize: typography.caption,
    fontWeight: "700",
    padding: spacing.sm,
    textAlign: "center",
  },

  footerText: {
    color: palette.deepBlue,
    fontSize: typography.caption,
    fontWeight: "600",
    marginTop: spacing.lg,
    opacity: 0.8,
    textAlign: "center",
  },
});
