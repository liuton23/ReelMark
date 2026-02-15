import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput, Button, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Username and password are required",
      });
      return;
    }

    if (isRegister && password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(username.trim(), password, email.trim() || undefined);
        Toast.show({
          type: "success",
          text1: "Welcome to ReelMark!",
          text2: "Your membership card is ready",
        });
      } else {
        await login(username.trim(), password);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || "Something went wrong";
      Toast.show({
        type: "error",
        text1: isRegister ? "Registration failed" : "Login failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.logo,
              { color: theme.colors.primary },
            ]}
          >
            REELMARK
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            VIDEO
          </Text>
          <Text
            style={[
              styles.tagline,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {isRegister
              ? "Get your membership card"
              : "Members only — show your card"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onSurface}
          />

          {isRegister && (
            <TextInput
              label="Email (optional)"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />
          )}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            textColor={theme.colors.onSurface}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {isRegister ? "SIGN UP" : "SIGN IN"}
          </Button>

          <Button
            mode="text"
            onPress={() => {
              setIsRegister(!isRegister);
              setEmail("");
            }}
            style={styles.switchButton}
            labelStyle={[
              styles.switchLabel,
              { color: theme.colors.primary },
            ]}
          >
            {isRegister
              ? "Already a member? Sign in"
              : "New here? Get a membership"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 56,
    letterSpacing: 6,
  },
  subtitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 20,
    letterSpacing: 12,
    marginTop: -8,
  },
  tagline: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonLabel: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 20,
    letterSpacing: 2,
  },
  switchButton: {
    marginTop: 16,
  },
  switchLabel: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
  },
});
