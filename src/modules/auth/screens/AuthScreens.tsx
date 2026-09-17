import { Ionicons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { DEMO_RESET_CODE, useRepositories } from "@/infrastructure";
import { radius, spacing, typography } from "@/theme";

import { useSession } from "../hooks/useSession";
import {
  validateEmail,
  validateNewPassword,
  validatePasswordConfirmation,
  validateRequiredPassword,
} from "../validation";

export function LoginScreen() {
  const { login } = useSession();
  const [email, setEmail] = useState("cliente@demo.com");
  const [password, setPassword] = useState("Demo1234");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError =
      validateEmail(email) ?? validateRequiredPassword(password);
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
    <AuthForm
      title="Login"
      subtitle="Accede a tu cuenta y continúa con tus compras."
      error={error}
    >
      <AuthTextInput
        autoCapitalize="none"
        keyboardType="email-address"
        label="Correo"
        onChangeText={setEmail}
        value={email}
      />
      <AuthTextInput
        label="Contrasena"
        onChangeText={setPassword}
        secureTextEntry
        value={password}
      />
      <PrimaryButton
        disabled={isSubmitting}
        label="Iniciar sesion"
        loading={isSubmitting}
        onPress={handleSubmit}
      />
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
    <AuthForm
      title="Registro"
      subtitle="Crea tu cuenta para comenzar a comprar."
      error={error}
    >
      <AuthTextInput label="Nombre" onChangeText={setName} value={name} />
      <AuthTextInput
        autoCapitalize="none"
        keyboardType="email-address"
        label="Correo"
        onChangeText={setEmail}
        value={email}
      />
      <AuthTextInput
        label="Contrasena"
        onChangeText={setPassword}
        secureTextEntry
        value={password}
      />
      <AuthTextInput
        label="Confirmar contrasena"
        onChangeText={setConfirmPassword}
        secureTextEntry
        value={confirmPassword}
      />
      <PrimaryButton
        disabled={isSubmitting}
        label="Crear cuenta"
        loading={isSubmitting}
        onPress={handleSubmit}
      />
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
      setMessage(
        `Recuperacion simulada solicitada. Codigo de demostracion: ${DEMO_RESET_CODE}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthForm
      title="Recuperar contrasena"
      subtitle="Recupera el acceso a tu cuenta."
      error={error}
      message={message}
    >
      <AuthTextInput
        autoCapitalize="none"
        keyboardType="email-address"
        label="Correo"
        onChangeText={setEmail}
        value={email}
      />
      <PrimaryButton
        disabled={isSubmitting}
        label="Solicitar codigo"
        loading={isSubmitting}
        onPress={handleSubmit}
      />
      <InlineLink
        href={{ pathname: "/(auth)/reset-password", params: { email } }}
        label="Continuar a reset"
      />
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
      await authRepository.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword: password,
      });
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
      <Text style={styles.helpText}>
        Codigo de demostracion: {DEMO_RESET_CODE}
      </Text>
      <AuthTextInput
        autoCapitalize="none"
        keyboardType="email-address"
        label="Correo"
        onChangeText={setEmail}
        value={email}
      />
      <AuthTextInput
        keyboardType="number-pad"
        label="Codigo"
        onChangeText={setCode}
        value={code}
      />
      <AuthTextInput
        label="Nueva contrasena"
        onChangeText={setPassword}
        secureTextEntry
        value={password}
      />
      <AuthTextInput
        label="Confirmar contrasena"
        onChangeText={setConfirmPassword}
        secureTextEntry
        value={confirmPassword}
      />
      <PrimaryButton
        disabled={isSubmitting}
        label="Restablecer"
        loading={isSubmitting}
        onPress={handleSubmit}
      />
    </AuthForm>
  );
}

export function ChangePasswordScreen() {
  const { authRepository } = useRepositories();
  const { session } = useSession();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const validationError = validateNewPassword(
      currentPassword,
      newPassword,
      confirmPassword,
    );

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
      await authRepository.changePassword({
        userId: session.userId,
        currentPassword,
        newPassword,
      });

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
    <ScrollView
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      contentContainerStyle={securityStyles.content}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={securityStyles.hero}>
        <View style={securityStyles.heroDecorationOne} />
        <View style={securityStyles.heroDecorationTwo} />

        <View style={securityStyles.heroTop}>
          <View style={securityStyles.heroHeading}>
            <Text style={securityStyles.brand}>FERREPHARMA</Text>
            <Text style={securityStyles.heroTitle}>Seguridad</Text>
          </View>

          <View style={securityStyles.heroActions}>
            <Pressable
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                securityStyles.backButton,
                pressed ? securityStyles.pressed : null,
              ]}
            >
              <Ionicons
                color={securityPalette.deepBlue}
                name="arrow-back"
                size={20}
              />
            </Pressable>

            <View style={securityStyles.heroIcon}>
              <Ionicons
                color={securityPalette.deepBlue}
                name="shield-checkmark-outline"
                size={23}
              />
            </View>
          </View>
        </View>

        <Text style={securityStyles.heroSubtitle}>
          Protege tu cuenta actualizando tu contraseña de acceso.
        </Text>
      </View>

      <View style={securityStyles.body}>
        <View style={securityStyles.infoCard}>
          <View style={securityStyles.infoIcon}>
            <Ionicons
              color={securityPalette.deepBlue}
              name="lock-closed-outline"
              size={20}
            />
          </View>

          <View style={securityStyles.flex}>
            <Text style={securityStyles.infoTitle}>Cambiar contraseña</Text>

            <Text style={securityStyles.infoText}>
              Ingresa tu contraseña actual y define una nueva para mantener
              protegida tu cuenta.
            </Text>
          </View>
        </View>

        <View style={securityStyles.formCard}>
          <SecurityPasswordField
            label="Contraseña actual"
            onChangeText={setCurrentPassword}
            onToggleVisibility={() => setShowCurrentPassword((value) => !value)}
            placeholder="Ingresa tu contraseña actual"
            showPassword={showCurrentPassword}
            value={currentPassword}
          />

          <View style={securityStyles.divider} />

          <SecurityPasswordField
            label="Nueva contraseña"
            onChangeText={setNewPassword}
            onToggleVisibility={() => setShowNewPassword((value) => !value)}
            placeholder="Escribe tu nueva contraseña"
            showPassword={showNewPassword}
            value={newPassword}
          />

          <SecurityPasswordField
            label="Confirmar contraseña"
            onChangeText={setConfirmPassword}
            onToggleVisibility={() => setShowConfirmPassword((value) => !value)}
            placeholder="Repite la nueva contraseña"
            showPassword={showConfirmPassword}
            value={confirmPassword}
          />
        </View>

        {error ? (
          <View style={securityStyles.errorBox}>
            <Ionicons
              color={securityPalette.danger}
              name="alert-circle-outline"
              size={18}
            />

            <Text style={securityStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        {message ? (
          <View style={securityStyles.successBox}>
            <Ionicons
              color={securityPalette.success}
              name="checkmark-circle-outline"
              size={18}
            />

            <Text style={securityStyles.successText}>{message}</Text>
          </View>
        ) : null}

        <Pressable
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={({ pressed }) => [
            securityStyles.primaryButton,
            isSubmitting ? securityStyles.disabled : null,
            pressed && !isSubmitting ? securityStyles.pressed : null,
          ]}
        >
          <View style={securityStyles.primaryIcon}>
            {isSubmitting ? (
              <ActivityIndicator
                color={securityPalette.deepBlue}
                size="small"
              />
            ) : (
              <Ionicons
                color={securityPalette.deepBlue}
                name="shield-checkmark-outline"
                size={18}
              />
            )}
          </View>

          <Text style={securityStyles.primaryText}>
            {isSubmitting ? "Actualizando..." : "Cambiar contraseña"}
          </Text>

          <Ionicons
            color={securityPalette.white}
            name="chevron-forward"
            size={17}
          />
        </Pressable>

        <View style={securityStyles.tipCard}>
          <Ionicons
            color={securityPalette.deepBlue}
            name="information-circle-outline"
            size={18}
          />

          <Text style={securityStyles.tipText}>
            Usa una contraseña diferente a las que utilizas en otras cuentas y
            evita compartirla con otras personas.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SecurityPasswordField({
  label,
  onChangeText,
  onToggleVisibility,
  placeholder,
  showPassword,
  value,
}: {
  label: string;
  onChangeText(value: string): void;
  onToggleVisibility(): void;
  placeholder: string;
  showPassword: boolean;
  value: string;
}) {
  return (
    <View style={securityStyles.field}>
      <Text style={securityStyles.fieldLabel}>{label}</Text>

      <View style={securityStyles.inputShell}>
        <View style={securityStyles.inputIcon}>
          <Ionicons
            color={securityPalette.deepBlue}
            name="lock-closed-outline"
            size={16}
          />
        </View>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A94A3"
          secureTextEntry={!showPassword}
          style={securityStyles.input}
          value={value}
        />

        <Pressable
          hitSlop={8}
          onPress={onToggleVisibility}
          style={({ pressed }) => [
            securityStyles.eyeButton,
            pressed ? securityStyles.pressed : null,
          ]}
        >
          <Ionicons
            color={securityPalette.muted}
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={18}
          />
        </Pressable>
      </View>
    </View>
  );
}

const securityPalette = {
  deepBlue: "#3E668F",
  dreamyBlue: "#81A9EE",
  silkyLilac: "#AAB4E7",
  butterHoney: "#FFDB83",
  vanillaMilk: "#FFF2D0",
  white: "#FFFFFF",
  text: "#172033",
  muted: "#687286",
  border: "#DDE3EE",
  danger: "#C2413B",
  success: "#1E8E5A",
};

const securityStyles = StyleSheet.create({
  content: {
    backgroundColor: securityPalette.vanillaMilk,
    flexGrow: 1,
    paddingBottom: 30,
  },

  hero: {
    backgroundColor: securityPalette.deepBlue,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
    minHeight: 205,
    overflow: "hidden",
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 34,
  },

  heroDecorationOne: {
    backgroundColor: securityPalette.dreamyBlue,
    borderRadius: 100,
    height: 175,
    opacity: 0.16,
    position: "absolute",
    right: -55,
    top: -65,
    width: 175,
  },

  heroDecorationTwo: {
    backgroundColor: securityPalette.butterHoney,
    borderRadius: 60,
    bottom: -48,
    height: 110,
    opacity: 0.14,
    position: "absolute",
    right: 55,
    width: 110,
  },

  heroTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  heroHeading: {
    flex: 1,
    paddingRight: 12,
  },

  heroActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  backButton: {
    alignItems: "center",
    backgroundColor: securityPalette.white,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  heroIcon: {
    alignItems: "center",
    backgroundColor: securityPalette.butterHoney,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  brand: {
    color: securityPalette.butterHoney,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  heroTitle: {
    color: securityPalette.white,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 4,
  },

  heroSubtitle: {
    color: "#EAF1F8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
    maxWidth: "82%",
  },

  body: {
    gap: 11,
    marginTop: -10,
    paddingHorizontal: 12,
  },

  flex: {
    flex: 1,
  },

  infoCard: {
    alignItems: "center",
    backgroundColor: securityPalette.white,
    borderColor: securityPalette.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },

  infoIcon: {
    alignItems: "center",
    backgroundColor: securityPalette.butterHoney,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42,
  },

  infoTitle: {
    color: securityPalette.text,
    fontSize: 12,
    fontWeight: "900",
  },

  infoText: {
    color: securityPalette.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  formCard: {
    backgroundColor: securityPalette.white,
    borderColor: securityPalette.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 13,
  },

  field: {
    gap: 6,
  },

  fieldLabel: {
    color: securityPalette.text,
    fontSize: 10,
    fontWeight: "900",
  },

  inputShell: {
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderColor: securityPalette.silkyLilac,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    paddingHorizontal: 8,
  },

  inputIcon: {
    alignItems: "center",
    backgroundColor: "#EEF3F8",
    borderRadius: 8,
    height: 31,
    justifyContent: "center",
    width: 31,
  },

  input: {
    color: securityPalette.text,
    flex: 1,
    fontSize: 11,
    minHeight: 46,
    paddingHorizontal: 9,
    paddingVertical: 0,
  },

  eyeButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 34,
  },

  divider: {
    backgroundColor: "#EDF0F4",
    height: 1,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: securityPalette.deepBlue,
    borderRadius: 15,
    flexDirection: "row",
    gap: 9,
    minHeight: 52,
    paddingHorizontal: 11,
  },

  primaryIcon: {
    alignItems: "center",
    backgroundColor: securityPalette.butterHoney,
    borderRadius: 9,
    height: 32,
    justifyContent: "center",
    width: 32,
  },

  primaryText: {
    color: securityPalette.white,
    flex: 1,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  errorBox: {
    alignItems: "center",
    backgroundColor: "#FFF2F1",
    borderColor: "#E8A9A5",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    padding: 10,
  },

  errorText: {
    color: securityPalette.danger,
    flex: 1,
    fontSize: 9,
    fontWeight: "700",
  },

  successBox: {
    alignItems: "center",
    backgroundColor: "#EFFAF5",
    borderColor: "#A7D8C1",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    padding: 10,
  },

  successText: {
    color: securityPalette.success,
    flex: 1,
    fontSize: 9,
    fontWeight: "700",
  },

  tipCard: {
    alignItems: "flex-start",
    backgroundColor: "#EEF3F8",
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },

  tipText: {
    color: securityPalette.muted,
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },

  disabled: {
    opacity: 0.55,
  },

  pressed: {
    opacity: 0.76,
  },
});

type AuthFormProps = {
  children: ReactNode;
  error?: string | null;
  message?: string | null;
  subtitle: string;
  title: string;
};

function AuthForm({
  children,
  error,
  message,
  subtitle,
  title,
}: AuthFormProps) {
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

          <Text style={styles.brandName}>MARJYM</Text>
          <Text style={styles.brandSubtitle}>TU TIENDA, MÁS CERCA DE TI</Text>
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

          <View style={styles.form}>{children}</View>
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
      <Pressable
        style={({ pressed }) => [
          styles.linkButton,
          pressed ? styles.linkButtonPressed : null,
        ]}
      >
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
