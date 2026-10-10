import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlusIcon } from "./icons/UiIconSvg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../design-system";

const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };

function TabItem({ route, descriptor, navigation, focused, colors }) {
  const { options } = descriptor;
  const label = options.tabBarLabel ?? options.title ?? route.name;
  const Icon = options.tabBarIconComponent;
  const scale = useSharedValue(focused ? 1 : 0.94);

  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.94, SPRING);
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!focused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={typeof label === "string" ? label : route.name}
      hitSlop={6}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={[
          {
            width: 44,
            height: 44,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: focused ? colors.accent : "transparent",
            boxShadow: focused
              ? [{ offsetX: 0, offsetY: 6, blurRadius: 14, color: "rgba(110, 86, 240, 0.35)" }]
              : undefined,
          },
          animatedStyle,
        ]}
      >
        {Icon ? (
          <Icon
            color={focused ? colors.onAccent : colors.muted}
            size={21}
            strokeWidth={focused ? 2.4 : 2}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

function CenterAddButton({ onPress, colors, barColor }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ width: 64, alignItems: "center", justifyContent: "center" }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.92, SPRING);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING);
        }}
        accessibilityRole="button"
        accessibilityLabel="Adicionar transação"
        hitSlop={8}
        style={{ marginTop: -22 }}
      >
        <Animated.View
          style={[
            {
              width: 56,
              height: 56,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accent,
              borderWidth: 4,
              borderColor: barColor,
              boxShadow: [
                { offsetX: 0, offsetY: 8, blurRadius: 18, color: "rgba(110, 86, 240, 0.4)" },
              ],
            },
            animatedStyle,
          ]}
        >
          <PlusIcon color={colors.onAccent} size={26} strokeWidth={2.6} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

export default function FloatingTabBar({ state, descriptors, navigation, onAddPress }) {
  const insets = useSafeAreaInsets();
  const { colors, shadow, isDark } = useTheme();
  const bottom = Math.max(insets.bottom, 10);
  const midpoint = Math.ceil(state.routes.length / 2);
  const leftRoutes = state.routes.slice(0, midpoint);
  const rightRoutes = state.routes.slice(midpoint);

  // Lilás sólido que combina com o accent, sem transparência.
  const barColor = isDark ? "#2A2440" : "#EFE9FF";
  const borderColor = isDark ? "rgba(139, 116, 255, 0.22)" : "rgba(110, 86, 240, 0.14)";

  const renderTab = (route) => {
    const index = state.routes.findIndex((item) => item.key === route.key);
    return (
      <TabItem
        key={route.key}
        route={route}
        descriptor={descriptors[route.key]}
        navigation={navigation}
        focused={state.index === index}
        colors={colors}
      />
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 14,
        paddingBottom: bottom,
      }}
    >
      <View
        style={{
          height: 64,
          borderRadius: radius.sheet,
          overflow: "visible",
          backgroundColor: barColor,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor,
          boxShadow: shadow.float,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 6,
          }}
        >
          {leftRoutes.map(renderTab)}
          <CenterAddButton onPress={onAddPress} colors={colors} barColor={barColor} />
          {rightRoutes.map(renderTab)}
        </View>
      </View>
    </View>
  );
}
