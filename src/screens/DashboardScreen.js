import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Bell,
  ChartColumn,
  Eye,
  EyeOff,
  Plus,
  Receipt,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import AnimateOnFocus from "../components/AnimateOnFocus";
import MonthPills from "../components/MonthPills";
import TransactionForm from "../components/TransactionForm";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { formatBRL, signedAmount } from "../utils/format";
import { ActionTile, Card, SectionTitle, radius } from "../design-system";
import { useTheme } from "../context/ThemeContext";

const SPRING = { damping: 20, stiffness: 220, mass: 0.8 };

function clampValue(value, min, max) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { user } = useAuth();
  const { colors, headerGradient, toneColor } = useTheme();
  const { months, selectedMonth, setSelectedMonth, monthTransactions, summary, loading, error } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";
  const greeting = useMemo(() => greetingForNow(), []);
  const displayName = user?.name?.trim() || "Usuário";

  // Sheet começa perto do meio; arrastar para cima sobe até cobrir o hero.
  const sheetTopRest = Math.round(windowHeight * 0.42);
  const sheetTopExpanded = Math.max(insets.top, 8);
  const maxLift = Math.max(sheetTopRest - sheetTopExpanded, 120);
  const lift = useSharedValue(0);
  const dragStart = useSharedValue(0);

  const setExpanded = (expanded) => {
    lift.value = withSpring(expanded ? maxLift : 0, SPRING);
    setSheetExpanded(expanded);
  };

  const snapTo = (expanded) => {
    "worklet";
    lift.value = withSpring(expanded ? maxLift : 0, SPRING);
    runOnJS(setSheetExpanded)(expanded);
  };

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onBegin(() => {
      dragStart.value = lift.value;
    })
    .onUpdate((event) => {
      // Para cima (translationY < 0) sobe a sheet e cobre o hero.
      const next = dragStart.value - event.translationY;
      lift.value = clampValue(next, 0, maxLift);
    })
    .onEnd((event) => {
      if (event.velocityY < -550) {
        snapTo(true);
        return;
      }
      if (event.velocityY > 550) {
        snapTo(false);
        return;
      }
      snapTo(lift.value > maxLift / 2);
    });

  const sheetStyle = useAnimatedStyle(() => {
    const top = interpolate(lift.value, [0, maxLift], [sheetTopRest, sheetTopExpanded], Extrapolation.CLAMP);
    return {
      position: "absolute",
      left: 0,
      right: 0,
      top,
      bottom: 0,
      borderTopLeftRadius: interpolate(lift.value, [0, maxLift], [radius.sheet, 20], Extrapolation.CLAMP),
      borderTopRightRadius: interpolate(lift.value, [0, maxLift], [radius.sheet, 20], Extrapolation.CLAMP),
    };
  });

  const actions = [
    {
      label: "Adicionar",
      tint: colors.accentSoft,
      onPress: () => setFormOpen(true),
      icon: <Plus color={colors.accent} size={16} />,
    },
    {
      label: "Ganhos",
      tint: colors.tintSuccess,
      onPress: () => navigation.navigate("Transacoes"),
      icon: <TrendingUp color={colors.success} size={16} />,
    },
    {
      label: "Gastos",
      tint: colors.tintDanger,
      onPress: () => navigation.navigate("Transacoes"),
      icon: <TrendingDown color={colors.danger} size={16} />,
    },
    {
      label: "Metas",
      tint: colors.tintInfo,
      onPress: () => navigation.navigate("Metas"),
      icon: <Target color={colors.info} size={16} />,
    },
    {
      label: "Dívidas",
      tint: colors.tintWarning,
      onPress: () => navigation.navigate("Dividas"),
      icon: <Receipt color={colors.warning} size={16} />,
    },
    {
      label: "Investir",
      tint: colors.tintInfo,
      onPress: () => navigation.navigate("Investimento"),
      icon: <ChartColumn color={colors.info} size={16} />,
    },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StatusBar style="light" />
      <LinearGradient colors={headerGradient} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <SafeAreaView edges={["top"]}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 18,
              height: sheetTopRest - insets.top - 16,
              justifyContent: "space-between",
            }}
          >
            <AnimateOnFocus delay={0} duration={420}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Pressable
                onPress={() => navigation.navigate("Perfil")}
                style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 }}
              >
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.2)" }}
                  />
                ) : (
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 23,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: colors.onAccent, fontWeight: "700", fontSize: 16 }}>{initial}</Text>
                  </View>
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{greeting}</Text>
                  <Text
                    numberOfLines={1}
                    style={{ color: colors.onAccent, fontSize: 17, fontWeight: "700", marginTop: 2 }}
                  >
                    {displayName}
                  </Text>
                </View>
              </Pressable>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable
                  onPress={() => Alert.alert("Notificações", "Em breve você verá alertas e lembretes aqui.")}
                  hitSlop={8}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell color="#fff" size={18} strokeWidth={2.2} />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("Perfil")}
                  hitSlop={8}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Settings color="#fff" size={18} strokeWidth={2.2} />
                </Pressable>
              </View>
            </View>
            </AnimateOnFocus>

            <AnimateOnFocus delay={80} duration={420} style={{ flex: 1, justifyContent: "center", paddingBottom: 8 }}>
              <Text style={{ textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                Saldo de {selectedMonth}
              </Text>
              <View
                style={{
                  marginTop: 4,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <Text style={{ color: colors.onAccent, fontSize: 34, fontWeight: "700" }}>
                  {balanceVisible ? formatBRL(summary.saldo) : "R$ ****"}
                </Text>
                <Pressable
                  onPress={() => setBalanceVisible((current) => !current)}
                  hitSlop={10}
                  accessibilityLabel={balanceVisible ? "Ocultar saldo" : "Mostrar saldo"}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {balanceVisible ? (
                    <EyeOff color="#fff" size={18} strokeWidth={2.2} />
                  ) : (
                    <Eye color="#fff" size={18} strokeWidth={2.2} />
                  )}
                </Pressable>
              </View>
            </AnimateOnFocus>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View
        style={[
          {
            backgroundColor: colors.surface,
            paddingHorizontal: 20,
            paddingTop: 4,
            zIndex: 2,
            overflow: "hidden",
            flexDirection: "column",
          },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={pan}>
          <Animated.View>
            <Pressable
              onPress={() => setExpanded(!sheetExpanded)}
              hitSlop={12}
              style={{ alignItems: "center", paddingVertical: 8 }}
            >
              <View
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: colors.line,
                }}
              />
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 4, paddingBottom: 10 }}
            >
              {actions.map((action) => (
                <ActionTile key={action.label} compact {...action} />
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              <Card style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>Receita</Text>
                <Text style={{ marginTop: 2, color: colors.success, fontSize: 15, fontWeight: "700" }}>
                  {formatBRL(summary.receita)}
                </Text>
              </Card>
              <Card style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>Despesa</Text>
                <Text style={{ marginTop: 2, color: colors.danger, fontSize: 15, fontWeight: "700" }}>
                  {formatBRL(summary.despesa)}
                </Text>
              </Card>
            </View>
          </Animated.View>
        </GestureDetector>

        {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}

        <SectionTitle>Movimentações</SectionTitle>
        <ScrollView
          style={{ flex: 1, marginTop: 8, minHeight: 180 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <MonthPills months={months} selectedMonth={selectedMonth} onSelect={setSelectedMonth} />

          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
          ) : monthTransactions.length === 0 ? (
            <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 20 }}>
              Nenhuma transação neste mês.
            </Text>
          ) : (
            monthTransactions.map((item) => (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ color: colors.ink, fontWeight: "600" }}>{item.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{item.category}</Text>
                </View>
                <Text style={{ color: toneColor(item.type), fontWeight: "700" }}>
                  {signedAmount(item.type, item.value)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </Animated.View>

      <TransactionForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </GestureHandlerRootView>
  );
}
