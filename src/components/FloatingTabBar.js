import { useEffect } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../design-system";

const SPRING = { damping: 18, stiffness: 220, mass: 0.7 };

function TabItem({ route, descriptor, navigation, focused, colors, shadow }) {
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

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors, shadow, isDark } = useTheme();
  const bottom = Math.max(insets.bottom, 10);

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
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isDark ? colors.line : "rgba(238, 234, 246, 0.95)",
          boxShadow: shadow.float,
          paddingHorizontal: 6,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {state.routes.map((route, index) => (
          <TabItem
            key={route.key}
            route={route}
            descriptor={descriptors[route.key]}
            navigation={navigation}
            focused={state.index === index}
            colors={colors}
            shadow={shadow}
          />
        ))}
      </View>
    </View>
  );
}
