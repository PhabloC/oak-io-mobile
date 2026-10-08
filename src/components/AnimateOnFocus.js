import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import Animated, { Easing, FadeIn } from "react-native-reanimated";

/**
 * Entrada suave ao ganhar foco — só fade, sem bounce.
 */
export default function AnimateOnFocus({ children, delay = 0, style, duration = 400 }) {
  const focused = useIsFocused();
  const [playId, setPlayId] = useState(0);

  useEffect(() => {
    if (focused) setPlayId((id) => id + 1);
  }, [focused]);

  if (!focused) {
    return <>{children}</>;
  }

  return (
    <Animated.View
      key={playId}
      entering={FadeIn.delay(delay)
        .duration(duration)
        .easing(Easing.out(Easing.cubic))}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
