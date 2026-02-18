import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  TextInput as RNTextInput,
} from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import NeonText from "../components/NeonText";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { MembershipCardInner, cardStyles } from "../components/MembershipCard";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── Cassette Tape — step 1 data entry ─────────────────────────────────────
function CassetteTape({
  username, password, onUsernameChange, onPasswordChange, theme,
}: {
  username: string; password: string;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  theme: any;
}) {
  const primary = theme.colors.primary;
  const background = theme.colors.background;
  const surface = theme.colors.surface;
  const labelColor = theme.colors.onSurfaceVariant;
  const textColor = theme.colors.onSurface;
  const outline = theme.colors.outline;

  const passwordRef = useRef<RNTextInput>(null);

  return (
    <View style={tapeStyles.wrapper}>
      <LinearGradient
        colors={["#2C1810", "#1E0F0A", "#2C1810"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={tapeStyles.shell}
      >
        {/* Top screws */}
        <View style={tapeStyles.screwRow}>
          <View style={tapeStyles.screw} />
          <View style={tapeStyles.screwCenter} />
          <View style={tapeStyles.screw} />
        </View>

        {/* Label */}
        <LinearGradient
          colors={[background, surface, background]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[tapeStyles.label, { borderColor: outline }]}
        >
          <View style={[tapeStyles.labelBrandBar, { backgroundColor: primary }]}>
            <Text style={[tapeStyles.labelBrand, { color: background }]}>
              REELMARK  ·  MEMBER TAPE
            </Text>
          </View>

          {/* SIDE A — username */}
          <View style={tapeStyles.labelSection}>
            <Text style={[tapeStyles.sideTag, { color: primary }]}>SIDE A</Text>
            <Text style={[tapeStyles.fieldHint, { color: labelColor }]}>YOUR NAME ON THE TAPE</Text>
            <RNTextInput
              value={username}
              onChangeText={onUsernameChange}
              placeholder="e.g. videofan_92"
              placeholderTextColor={outline}
              style={[tapeStyles.handwrittenInput, { color: textColor, borderBottomColor: primary + "66" }]}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          {/* Tape window divider */}
          <View style={tapeStyles.tapeWindowRow}>
            <View style={[tapeStyles.reel, { borderColor: primary + "66" }]}>
              <View style={[tapeStyles.reelHub, { backgroundColor: primary + "44" }]} />
            </View>
            <View style={[tapeStyles.tapeWindow, { borderColor: outline }]} />
            <View style={[tapeStyles.reel, { borderColor: primary + "66" }]}>
              <View style={[tapeStyles.reelHub, { backgroundColor: primary + "44" }]} />
            </View>
          </View>

          {/* SIDE B — password */}
          <View style={tapeStyles.labelSection}>
            <Text style={[tapeStyles.sideTag, { color: labelColor }]}>SIDE B</Text>
            <Text style={[tapeStyles.fieldHint, { color: labelColor }]}>SECRET ACCESS CODE</Text>
            <RNTextInput
              ref={passwordRef}
              value={password}
              onChangeText={onPasswordChange}
              placeholder="min. 6 characters"
              placeholderTextColor={outline}
              secureTextEntry
              style={[tapeStyles.handwrittenInput, { color: textColor, borderBottomColor: labelColor + "44" }]}
              returnKeyType="done"
            />
          </View>

          <View style={[tapeStyles.labelBottom, { borderTopColor: outline + "55" }]}>
            <Text style={[tapeStyles.labelBottomText, { color: labelColor }]}>
              ℗ REELMARK VIDEO · DO NOT DUPLICATE
            </Text>
          </View>
        </LinearGradient>

        {/* Bottom screws */}
        <View style={[tapeStyles.screwRow, { marginTop: 8 }]}>
          <View style={tapeStyles.screw} />
          <View style={[tapeStyles.shellRib, { borderColor: outline + "33" }]} />
          <View style={tapeStyles.screw} />
        </View>
      </LinearGradient>
    </View>
  );
}

const tapeStyles = StyleSheet.create({
  wrapper: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 16, marginHorizontal: 8 },
  shell: { borderRadius: 12, padding: 14, paddingBottom: 10 },
  screwRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  screw: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#4A3020", borderWidth: 1, borderColor: "#6B4423" },
  screwCenter: { width: 28, height: 6, borderRadius: 3, backgroundColor: "#3D2010", borderWidth: 1, borderColor: "#5A3520" },
  shellRib: { flex: 1, height: 4, borderWidth: 1, borderRadius: 2, marginHorizontal: 12 },
  label: { borderRadius: 8, borderWidth: 1, overflow: "hidden" },
  labelBrandBar: { paddingVertical: 5, paddingHorizontal: 12, alignItems: "center" },
  labelBrand: { fontFamily: "NeonTilt_400Regular", fontSize: 10, letterSpacing: 3 },
  labelSection: { paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  sideTag: { fontFamily: "NeonTilt_400Regular", fontSize: 9, letterSpacing: 3 },
  fieldHint: { fontFamily: "SpaceMono_400Regular", fontSize: 7, letterSpacing: 1.5, marginBottom: 2 },
  handwrittenInput: { fontFamily: "PatrickHand_400Regular", fontSize: 20, borderBottomWidth: 1, paddingVertical: 4, paddingHorizontal: 2 },
  tapeWindowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 20, paddingVertical: 6 },
  reel: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  reelHub: { width: 7, height: 7, borderRadius: 4 },
  tapeWindow: { flex: 1, height: 10, borderRadius: 4, borderWidth: 1, marginHorizontal: 10 },
  labelBottom: { borderTopWidth: 1, paddingVertical: 5, paddingHorizontal: 12, alignItems: "center" },
  labelBottomText: { fontFamily: "SpaceMono_400Regular", fontSize: 7, letterSpacing: 1 },
});

// ── Card Issue — step 2 animated card reveal ───────────────────────────────
function MembershipCardIssue({ username, theme, onComplete }: { username: string; theme: any; onComplete: () => void }) {
  const primary = theme.colors.primary;
  const textColor = theme.colors.onSurface;
  const labelColor = theme.colors.onSurfaceVariant;

  const nameOpacity = useRef(new Animated.Value(0)).current;
  const sinceOpacity = useRef(new Animated.Value(0)).current;
  const noOpacity = useRef(new Animated.Value(0)).current;
  const expiresOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const memberNo = username
    ? String(username.split("").reduce((a, c) => a + c.charCodeAt(0), 0)).padStart(6, "0")
    : "000001";
  const memberSince = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, bounciness: 8, speed: 6 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      Animated.sequence([
        Animated.timing(nameOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(sinceOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(noOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(expiresOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  return (
    <View style={issueStyles.container}>
      <Text style={[issueStyles.headline, { color: primary }]}>MEMBERSHIP ISSUED</Text>
      <Text style={[issueStyles.subline, { color: labelColor }]}>
        Welcome to the library, {username || "Member"}
      </Text>

      <Animated.View style={[
        cardStyles.wrapper,
        { width: "100%", opacity: cardOpacity, transform: [{ scale: cardScale }], shadowColor: primary, marginBottom: 32 },
      ]}>
        {/* Use the exact same MembershipCardInner from ProfileScreen, but pass animated nodes */}
        <MembershipCardInner
          theme={theme}
          memberNoNode={
            <Animated.Text style={[cardStyles.memberNo, { color: labelColor, opacity: noOpacity }]}>
              {memberNo}
            </Animated.Text>
          }
          memberNameNode={
            <Animated.Text style={[cardStyles.handwrittenName, { color: textColor, opacity: nameOpacity }]}>
              {username || "Member"}
            </Animated.Text>
          }
          memberSinceNode={
            <Animated.Text style={[cardStyles.handwrittenName, { color: textColor, opacity: sinceOpacity }]}>
              {memberSince}
            </Animated.Text>
          }
          expiresNode={
            <Animated.Text style={[cardStyles.handwrittenName, { color: primary, opacity: expiresOpacity, fontSize: 17 }]}>
              NEVER ♥
            </Animated.Text>
          }
        />
      </Animated.View>

      <Animated.View style={{ opacity: expiresOpacity, width: "100%" }}>
        <View style={[issueStyles.buttonWrap, { shadowColor: primary }]}>
          <Button
            mode="contained"
            onPress={onComplete}
            style={issueStyles.button}
            buttonColor={primary}
            labelStyle={issueStyles.buttonLabel}
          >
            ENTER THE STORE
          </Button>
        </View>
      </Animated.View>
    </View>
  );
}

const issueStyles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  headline: { fontFamily: "BebasNeue_400Regular", fontSize: 32, letterSpacing: 6, marginBottom: 4 },
  subline: { fontFamily: "SpaceMono_400Regular", fontSize: 11, marginBottom: 32, textAlign: "center" },
  buttonWrap: { borderRadius: 10, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 16, elevation: 10 },
  button: { paddingVertical: 10, borderRadius: 10 },
  buttonLabel: { fontFamily: "Righteous_400Regular", fontSize: 18, letterSpacing: 3 },
});

// ── Main LoginScreen ───────────────────────────────────────────────────────
export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  type Flow = "login" | "register" | "card";
  const [flow, setFlow] = useState<Flow>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = username.trim().length > 0 && password.trim().length > 0;

  const tapeSlide = useRef(new Animated.Value(400)).current;
  const tapeOpacity = useRef(new Animated.Value(0)).current;

  const showTape = () => {
    tapeSlide.setValue(400);
    tapeOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(tapeSlide, { toValue: 0, useNativeDriver: true, bounciness: 6, speed: 8 }),
      Animated.timing(tapeOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Missing fields", text2: "Username and password are required" });
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Something went wrong";
      Toast.show({ type: "error", text1: "Login failed", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({ type: "error", text1: "Missing fields", text2: "Username and password are required" });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: "error", text1: "Password too short", text2: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), password, email.trim() || undefined);
      setFlow("card");
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || "Something went wrong";
      Toast.show({ type: "error", text1: "Registration failed", text2: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Card issue screen
  if (flow === "card") {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <MembershipCardIssue username={username} theme={theme} onComplete={() => { }} />
      </View>
    );
  }

  // ── Register screen (tape UI)
  if (flow === "register") {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: 40 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <NeonText size={40} intensity="high">New Member</NeonText>
              <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
                Label your tape to join the library
              </Text>
            </View>

            <Animated.View style={{ opacity: tapeOpacity, transform: [{ translateY: tapeSlide }] }}>
              <CassetteTape
                username={username} password={password}
                onUsernameChange={setUsername} onPasswordChange={setPassword}
                theme={theme}
              />
            </Animated.View>

            <View style={[styles.form, { marginTop: 28 }]}>
              <View style={[styles.buttonWrap, isFormValid && styles.buttonGlow]}>
                <Button
                  mode="contained" onPress={handleRegister} loading={loading} disabled={loading}
                  style={styles.button} buttonColor={theme.colors.primary}
                  textColor={theme.colors.background} labelStyle={styles.buttonLabel}
                >
                  ISSUE MY CARD
                </Button>
              </View>
              <Button
                mode="text"
                onPress={() => { setFlow("login"); setUsername(""); setPassword(""); }}
                style={styles.switchButton}
                labelStyle={[styles.switchLabel, { color: theme.colors.primary }]}
              >
                Already a member? Sign in
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ── Login screen
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60, paddingBottom: 60 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <NeonText size={56} intensity="high">ReelMark</NeonText>
            <NeonText size={20} intensity="low" style={{ marginTop: -4 }} textStyle={{ letterSpacing: 12 }}>
              Video
            </NeonText>
            <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
              Members only — show your card
            </Text>
          </View>

          <View style={styles.form}>
            <RNTextInput
              value={username} onChangeText={setUsername}
              placeholder="Username" placeholderTextColor={theme.colors.outline}
              style={[styles.retryInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}
              autoCapitalize="none" autoCorrect={false}
            />
            <RNTextInput
              value={password} onChangeText={setPassword}
              placeholder="Password" placeholderTextColor={theme.colors.outline}
              secureTextEntry
              style={[styles.retryInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}
            />

            <View style={[styles.buttonWrap, isFormValid && styles.buttonGlow]}>
              <Button
                mode="contained" onPress={handleLogin} loading={loading} disabled={loading}
                style={styles.button} buttonColor={theme.colors.primary}
                textColor={theme.colors.background} labelStyle={styles.buttonLabel}
              >
                SIGN IN
              </Button>
            </View>

            <Button
              mode="text"
              onPress={() => { setFlow("register"); setTimeout(showTape, 50); }}
              style={styles.switchButton}
              labelStyle={[styles.switchLabel, { color: theme.colors.primary }]}
            >
              New to the neighbourhood? Join the library
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 32 },
  header: { alignItems: "center", marginBottom: 40 },
  tagline: { fontFamily: "SpaceMono_400Regular", fontSize: 11, marginTop: 16, textAlign: "center" },
  form: { width: "100%" },
  retryInput: {
    fontFamily: "SpaceMono_400Regular", fontSize: 14,
    borderWidth: 2, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 14,
    marginBottom: 14,
  },
  buttonWrap: { marginTop: 8, borderRadius: 10 },
  buttonGlow: {
    shadowColor: "#D35400",
    shadowOpacity: 0.6, shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 }, elevation: 10,
  },
  button: { paddingVertical: 10, borderRadius: 10 },
  buttonLabel: { fontFamily: "Righteous_400Regular", fontSize: 18, letterSpacing: 3 },
  switchButton: { marginTop: 16 },
  switchLabel: { fontFamily: "SpaceMono_400Regular", fontSize: 11 },
});