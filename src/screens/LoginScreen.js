import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { radius } from "../design-system";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function AmbientBlob({ size, color, style, delay = 0, drift = 14 }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -drift]) },
      { scale: interpolate(progress.value, [0, 1], [1, 1.08]) },
    ],
    opacity: interpolate(progress.value, [0, 1], [0.55, 0.85]),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

export default function LoginScreen() {
  const { signIn, redirectTo } = useAuth();
  const { colors, shadow, isDark } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const logoScale = useSharedValue(0.86);
  const logoFloat = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    logoFloat.value = withDelay(
      700,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      )
    );
  }, [logoFloat, logoScale]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: interpolate(logoFloat.value, [0, 1], [0, -6]) },
    ],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.97]) }],
    opacity: busy ? 0.7 : 1,
  }));

  const handleLogin = async () => {
    try {
      setBusy(true);
      setError("");
      await signIn();
    } catch (err) {
      setError(err?.message || "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AmbientBlob
        size={260}
        color={isDark ? "#2A2440" : "#E8E0FF"}
        style={{ top: -70, right: -80 }}
        delay={0}
        drift={18}
      />
      <AmbientBlob
        size={200}
        color={isDark ? "#1F2A3A" : "#F0EBFF"}
        style={{ top: 180, left: -90 }}
        delay={400}
        drift={12}
      />
      <AmbientBlob
        size={160}
        color={isDark ? "#163528" : "#E4F7EF"}
        style={{ bottom: 120, right: -40 }}
        delay={800}
        drift={16}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 20 }}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Animated.View entering={FadeIn.duration(500)} style={{ alignItems: "center" }}>
              <Animated.View style={[{ alignItems: "center" }, logoStyle]}>
                <View
                  style={{
                    width: 108,
                    height: 108,
                    borderRadius: 36,
                    backgroundColor: colors.surface,
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: shadow.float,
                  }}
                >
                  <Image
                    source={require("../../public/logo_app.png")}
                    style={{ height: 72, width: 72, borderRadius: 24 }}
                    resizeMode="cover"
                  />
                </View>
              </Animated.View>
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(160).springify().damping(15)}
              style={{
                marginTop: 28,
                textAlign: "center",
                fontSize: 42,
                fontWeight: "800",
                letterSpacing: -1,
                color: colors.ink,
              }}
            >
              OakIo
            </Animated.Text>

            <Animated.Text
              entering={FadeInDown.delay(260).springify().damping(16)}
              style={{
                marginTop: 10,
                textAlign: "center",
                fontSize: 16,
                lineHeight: 24,
                color: colors.muted,
                paddingHorizontal: 12,
              }}
            >
              Suas finanças com clareza — saldo, metas e gastos no mesmo lugar.
            </Animated.Text>
          </View>

          <Animated.View entering={FadeInUp.delay(620).springify().damping(16)}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.sheet,
                padding: 20,
                boxShadow: shadow.card,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.muted,
                  marginBottom: 14,
                }}
              >
                Entre para continuar
              </Text>

              <Pressable
                disabled={busy}
                onPress={handleLogin}
                onPressIn={() => {
                  press.value = withTiming(1, { duration: 90 });
                }}
                onPressOut={() => {
                  press.value = withTiming(0, { duration: 120 });
                }}
                android_ripple={{ color: "rgba(255,255,255,0.22)", borderless: false }}
              >
                <Animated.View
                  style={[
                    {
                      height: 54,
                      borderRadius: 27,
                      backgroundColor: colors.accent,
                      paddingHorizontal: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      elevation: 2,
                    },
                    buttonStyle,
                  ]}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {busy ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Image
                        source={require("../../assets/google.png")}
                        style={{ width: 16, height: 16 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text style={{ color: colors.onAccent, fontSize: 16, fontWeight: "700" }}>
                    {busy ? "Abrindo Google..." : "Continuar com Google"}
                  </Text>
                </Animated.View>
              </Pressable>

              {error ? (
                <Animated.Text
                  entering={FadeIn.duration(220)}
                  style={{
                    marginTop: 14,
                    textAlign: "center",
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.danger,
                  }}
                >
                  {error}
                </Animated.Text>
              ) : null}
            </View>

            {__DEV__ && redirectTo ? (
              <Text
                style={{
                  marginTop: 14,
                  textAlign: "center",
                  fontSize: 11,
                  lineHeight: 16,
                  color: colors.muted,
                }}
              >
                Redirect: {redirectTo}
              </Text>
            ) : null}

            <Text
              style={{
                marginTop: 18,
                textAlign: "center",
                fontSize: 12,
                color: colors.muted,
              }}
            >
              © {new Date().getFullYear()} OakIo · Phablo Carvalho
            </Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
