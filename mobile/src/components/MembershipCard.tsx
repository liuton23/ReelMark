import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { DeviceMotion } from "expo-sensors";

// ── VHS Tape ────────────────────────────────────────────────────────────────
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

// ── Card inner content — shared between interactive and static variants ─────
export function MembershipCardInner({
  theme,
  memberName,
  memberSince,
  memberNo,
  expiresText = "NEVER ♥",
  // Optionally override individual fields with animated nodes
  memberNameNode,
  memberSinceNode,
  memberNoNode,
  expiresNode,
}: {
  theme: any;
  memberName?: string;
  memberSince?: string;
  memberNo?: string;
  expiresText?: string;
  memberNameNode?: React.ReactNode;
  memberSinceNode?: React.ReactNode;
  memberNoNode?: React.ReactNode;
  expiresNode?: React.ReactNode;
}) {
  const primary = theme.colors.primary;
  const background = theme.colors.background;
  const surface = theme.colors.surface;
  const surfaceVar = theme.colors.surfaceVariant;
  const elevation3 = theme.colors.elevation.level3;
  const labelColor = theme.colors.onSurfaceVariant;
  const textColor = theme.colors.onSurface;

  return (
    <LinearGradient
      colors={[background, surface, surfaceVar, elevation3]}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      style={cardStyles.card}
    >
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
            {memberNoNode ?? (
              <Text style={[cardStyles.memberNo, { color: labelColor }]}>{memberNo ?? "——————"}</Text>
            )}
          </View>

          <View style={cardStyles.rightCol}>
            {/* Member name */}
            <View style={cardStyles.fieldRow}>
              <Text style={[cardStyles.fieldLabel, { color: labelColor }]}>MEMBER'S NAME</Text>
              {memberNameNode ?? (
                <Text style={[cardStyles.handwrittenName, { color: textColor }]}>
                  {memberName ?? ""}
                </Text>
              )}
              <View style={[cardStyles.underline, { backgroundColor: primary }]} />
            </View>

            {/* Member since */}
            <View style={[cardStyles.fieldRow, { marginTop: 8 }]}>
              <Text style={[cardStyles.fieldLabel, { color: labelColor }]}>MEMBER SINCE</Text>
              {memberSinceNode ?? (
                <Text style={[cardStyles.handwrittenName, { color: textColor }]}>
                  {memberSince ?? ""}
                </Text>
              )}
              <View style={[cardStyles.underline, { backgroundColor: primary }]} />
            </View>

            {/* Expires */}
            <View style={[cardStyles.fieldRow, { marginTop: 8 }]}>
              <Text style={[cardStyles.fieldLabel, { color: labelColor }]}>EXPIRES</Text>
              {expiresNode ?? (
                <Text style={[cardStyles.handwrittenName, { color: textColor }]}>{expiresText}</Text>
              )}
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
  );
}

// ── Interactive card — used on ProfileScreen (tilt + gesture) ───────────────
export function MembershipCard({ user, theme }: { user: any; theme: any }) {
  const motionX = useSharedValue(0);
  const motionY = useSharedValue(0);
  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const scale = useSharedValue(1);

  const springConfig = { damping: 18, stiffness: 120 };
  const snapConfig = { damping: 15, stiffness: 150 };

  useEffect(() => {
    DeviceMotion.setUpdateInterval(16);
    const sub = DeviceMotion.addListener(({ rotation }) => {
      if (!rotation) return;
      motionX.value = withSpring(Math.max(-8, Math.min(8, -rotation.beta * 25)), springConfig);
      motionY.value = withSpring(Math.max(-8, Math.min(8, rotation.gamma * 25)), springConfig);
    });
    return () => sub.remove();
  }, []);

  const gesture = Gesture.Pan()
    .onBegin(() => { scale.value = withSpring(1.03, snapConfig); })
    .onUpdate(({ translationX, translationY }) => {
      gestureY.value = (translationX / 160) * 12;
      gestureX.value = -(translationY / 100) * 12;
    })
    .onEnd(() => {
      gestureX.value = withSpring(0, snapConfig);
      gestureY.value = withSpring(0, snapConfig);
      scale.value = withSpring(1, snapConfig);
    });

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[cardStyles.wrapper, { shadowColor: theme.colors.primary }, animatedStyle]}>
          <MembershipCardInner
            theme={theme}
            memberName={user?.displayName || user?.username || "Member"}
            memberSince={memberSince}
            memberNo={memberNo}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

// ── Shared styles ───────────────────────────────────────────────────────────
export const cardStyles = StyleSheet.create({
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
  border: { margin: 6, borderRadius: 6, borderWidth: 2, overflow: "hidden" },
  headerBand: { paddingVertical: 5, paddingHorizontal: 12, alignItems: "center" },
  storeName: { fontFamily: "NeonTilt_400Regular", fontSize: 22, letterSpacing: 5 },
  storeTagline: { fontFamily: "SpaceMono_400Regular", fontSize: 8, letterSpacing: 2.5, marginTop: 1 },
  middle: { flexDirection: "row", paddingHorizontal: 12, paddingVertical: 8, gap: 14 },
  leftCol: { alignItems: "center", justifyContent: "center", gap: 6 },
  memberNoLabel: { fontFamily: "SpaceMono_400Regular", fontSize: 8, letterSpacing: 1, marginTop: 4 },
  memberNo: { fontFamily: "SpaceMono_400Regular", fontSize: 13, letterSpacing: 2 },
  rightCol: { flex: 1, justifyContent: "center" },
  fieldRow: { gap: 2 },
  fieldLabel: { fontFamily: "SpaceMono_400Regular", fontSize: 8, letterSpacing: 1 },
  handwrittenName: { fontFamily: "PatrickHand_400Regular", fontSize: 15, letterSpacing: 0.5 },
  underline: { height: 1, opacity: 0.4, marginTop: 1 },
  footerBand: {
    paddingVertical: 3, paddingHorizontal: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerText: { fontFamily: "SpaceMono_400Regular", fontSize: 7, letterSpacing: 0.5 },
});
