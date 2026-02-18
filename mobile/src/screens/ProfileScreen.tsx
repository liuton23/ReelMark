import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import { UserIcon } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import Constants from "expo-constants";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { DeviceMotion } from "expo-sensors";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

const appVersion = Constants.expoConfig?.version ?? "1.0.0";

// ── VHS Tape decoration using Views ────────────────────────────────────────
function VHSTape({ color }: { color: string }) {
  return (
    <View style={[vhsStyles.tape, { borderColor: color }]}>
      <View style={[vhsStyles.tapeInner, { backgroundColor: color + "22" }]}>
        <View style={[vhsStyles.reel, { borderColor: color }]}>
          <View style={[vhsStyles.reelHub, { backgroundColor: color }]} />
        </View>
        <View style={[vhsStyles.tapeWindow, { borderColor: color + "66" }]} />
        <View style={[vhsStyles.reel, { borderColor: color }]}>
          <View style={[vhsStyles.reelHub, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const vhsStyles = StyleSheet.create({
  tape: {
    width: 72,
    height: 44,
    borderRadius: 4,
    borderWidth: 1.5,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  tapeInner: {
    width: "90%",
    height: "75%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
  },
  reel: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  reelHub: { width: 5, height: 5, borderRadius: 3 },
  tapeWindow: { width: 24, height: 8, borderRadius: 2, borderWidth: 1 },
});

// ── Membership Card ────────────────────────────────────────────────────────
function MembershipCard({ user, theme }: { user: any; theme: any }) {
  // Separate shared values for motion and gesture so they layer
  const motionX = useSharedValue(0);
  const motionY = useSharedValue(0);
  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const scale = useSharedValue(1);

  const springConfig = { damping: 18, stiffness: 120 };
  const snapConfig = { damping: 15, stiffness: 150 };

  // ── DeviceMotion: gravity tilt ───────────────────────────────────────────
  useEffect(() => {
    DeviceMotion.setUpdateInterval(16);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      motionX.value = withSpring(
        Math.max(-8, Math.min(8, -rotation.beta * 25)),
        springConfig
      );
      motionY.value = withSpring(
        Math.max(-8, Math.min(8, rotation.gamma * 25)),
        springConfig
      );
    });
    return () => sub.remove();
  }, []);

  // ── Pan gesture: drag on top of motion ──────────────────────────────────
  const gesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.03, snapConfig);
    })
    .onUpdate(({ translationX, translationY }) => {
      gestureY.value = (translationX / 160) * 12;
      gestureX.value = -(translationY / 100) * 12;
    })
    .onEnd(() => {
      gestureX.value = withSpring(0, snapConfig);
      gestureY.value = withSpring(0, snapConfig);
      scale.value = withSpring(1, snapConfig);
    });

  // ── Combine both ─────────────────────────────────────────────────────────
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${motionX.value + gestureX.value}deg` },
      { rotateY: `${motionY.value + gestureY.value}deg` },
      { scale: scale.value },
    ],
  }));

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const memberNo = user?.username
    ? String(user.username.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0)).padStart(6, "0")
    : "000001";

  // Pull colors from theme
  const primary = theme.colors.primary;         // #D35400 burnt orange
  const background = theme.colors.background;      // #FFF6EC cream
  const surface = theme.colors.surface;         // #FFF0E0 peach cream
  const surfaceVar = theme.colors.surfaceVariant;  // #F5E1CC warm beige
  const elevation3 = theme.colors.elevation.level3; // #EBD2B4 deeper beige
  const labelColor = theme.colors.onSurfaceVariant; // #6B4423 medium brown
  const textColor = theme.colors.onSurface;        // #2C1810 dark brown

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[cardStyles.wrapper, { shadowColor: primary }, animatedStyle]}>
          <LinearGradient
            colors={[background, surface, surfaceVar, elevation3]}
            start={{ x: 0.0, y: 0.0 }}
            end={{ x: 1.0, y: 1.0 }}
            style={cardStyles.card}
          >
            {/* Worn paper texture overlay */}
            <LinearGradient
              colors={["rgba(255,255,255,0.25)", "transparent", "rgba(0,0,0,0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={[cardStyles.border, { borderColor: primary }]}>

              {/* Header band */}
              <View style={[cardStyles.headerBand, { backgroundColor: primary }]}>
                <Text style={[cardStyles.storeName, { color: background }]}>REELMARK VIDEO</Text>
                <Text style={[cardStyles.storeTagline, { color: background + "A6" }]}>
                  YOUR LOCAL TAPE LIBRARY
                </Text>
              </View>

              {/* Middle */}
              <View style={cardStyles.middle}>
                <View style={cardStyles.leftCol}>
                  <VHSTape color={primary} />
                  <Text style={[cardStyles.memberNoLabel, { color: labelColor }]}>NO.</Text>
                  <Text style={[cardStyles.memberNo, { color: labelColor }]}>{memberNo}</Text>
                </View>

                <View style={cardStyles.rightCol}>
                  <View style={cardStyles.fieldRow}>
                    <Text style={[cardStyles.fieldLabel, { color: labelColor }]}>MEMBER'S NAME</Text>
                    <Text style={[cardStyles.handwrittenName, { color: textColor }]}>
                      {user?.displayName || user?.username || "Member"}
                    </Text>
                    <View style={[cardStyles.underline, { backgroundColor: primary }]} />
                  </View>

                  <View style={[cardStyles.fieldRow, { marginTop: 8 }]}>
                    <Text style={[cardStyles.fieldLabel, { color: labelColor }]}>MEMBER SINCE</Text>
                    <Text style={[cardStyles.handwrittenName, { color: textColor }]}>{memberSince}</Text>
                    <View style={[cardStyles.underline, { backgroundColor: primary }]} />
                  </View>

                  <View style={[cardStyles.fieldRow, { marginTop: 8 }]}>
                    <Text style={[cardStyles.fieldLabel, { color: labelColor }]}>EXPIRES</Text>
                    <Text style={[cardStyles.handwrittenName, { color: textColor }]}>NEVER ♥</Text>
                    <View style={[cardStyles.underline, { backgroundColor: primary }]} />
                  </View>
                </View>
              </View>

              {/* Footer band */}
              <View style={[cardStyles.footerBand, { backgroundColor: primary }]}>
                <Text style={[cardStyles.footerText, { color: background + "CC" }]}>
                  PLEASE RETURN TAPES BY 6:30PM
                </Text>
                <Text style={[cardStyles.footerText, { color: background + "CC" }]}>
                  ☎ reelmark.video
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const cardStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 4,
    marginBottom: 24,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  card: { borderRadius: 10, overflow: "hidden" },
  border: {
    margin: 6,
    borderRadius: 6,
    borderWidth: 2,
    overflow: "hidden",
  },
  headerBand: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  storeName: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 22,
    letterSpacing: 5,
  },
  storeTagline: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 8,
    letterSpacing: 2.5,
    marginTop: 1,
  },
  middle: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 14,
  },
  leftCol: { alignItems: "center", justifyContent: "center", gap: 6 },
  memberNoLabel: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 4,
  },
  memberNo: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 13,
    letterSpacing: 2,
  },
  rightCol: { flex: 1, justifyContent: "center" },
  fieldRow: { gap: 2 },
  fieldLabel: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 8,
    letterSpacing: 1,
  },
  handwrittenName: {
    fontFamily: "PatrickHand_400Regular",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  underline: { height: 1, opacity: 0.4, marginTop: 1 },
  footerBand: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 7,
    letterSpacing: 0.5,
  },
});

// ── Screen ─────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Return Your Membership Card?",
      "You'll be signed out of ReelMark.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error("Logout error:", error);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
    >
      {/* Avatar — Polaroid style */}
      <View style={styles.header}>
        <View style={[styles.polaroid, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
          <View style={[styles.avatarInner, { backgroundColor: theme.colors.surfaceVariant }]}>
            <UserIcon size={56} color={theme.colors.onSurfaceVariant} weight="regular" />
          </View>
        </View>
        <Text style={[styles.displayName, { color: theme.colors.onSurface }]}>
          {user?.displayName || user?.username || "Member"}
        </Text>
        <Text style={[styles.username, { color: theme.colors.onSurfaceVariant }]}>
          @{user?.username}
        </Text>
      </View>

      <MembershipCard user={user} theme={theme} />

      <Button
        mode="contained"
        onPress={handleLogout}
        loading={loggingOut}
        disabled={loggingOut}
        style={styles.logoutButton}
        buttonColor={theme.colors.surfaceVariant}
        textColor={theme.colors.error}
        labelStyle={styles.logoutLabel}
      >
        SIGN OUT
      </Button>

      <Text style={[styles.version, { color: theme.colors.onSurfaceVariant }]}>
        ReelMark Video v{appVersion}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { alignItems: "center", marginBottom: 24, marginTop: 12 },
  polaroid: {
    width: 110,
    height: 110,
    borderRadius: 12,
    padding: 6,
    marginBottom: 16,
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  displayName: { fontFamily: "Righteous_400Regular", fontSize: 32, letterSpacing: 2 },
  username: { fontFamily: "SpaceMono_400Regular", fontSize: 16, marginTop: 6, textAlign: "center" },
  sectionHint: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 10,
    opacity: 0.6,
  },
  logoutButton: { borderRadius: 8, paddingVertical: 4 },
  logoutLabel: { fontFamily: "Righteous_400Regular", fontSize: 14, letterSpacing: 1 },
  version: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
  },
});