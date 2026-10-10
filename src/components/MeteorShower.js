import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const METEOR_SLOTS = 14;
const STAR_COUNT = 36;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createMeteorConfig(width, height) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    startX: randomBetween(width * 0.2, width * 1.05),
    startY: randomBetween(-140, -20),
    travelX: -randomBetween(width * 0.35, width * 0.85),
    travelY: randomBetween(height * 0.4, height * 0.85),
    length: randomBetween(40, 95),
    thickness: randomBetween(1.4, 2.6),
    gap: randomBetween(60, 480),
    duration: randomBetween(1600, 3200),
    opacity: randomBetween(0.35, 0.75),
  };
}

function createStarConfig(index, width, height) {
  const seed = index * 29 + 11;
  return {
    id: `star-${index}`,
    left: (seed * 53) % Math.max(width, 1),
    top: (seed * 37) % Math.max(height, 1),
    size: 1.2 + (seed % 3) * 0.55,
    delay: (seed * 140) % 3600,
    duration: 2400 + (seed % 2600),
    peakOpacity: 0.18 + ((seed % 6) * 0.05),
  };
}

function Star({ config }) {
  const twinkle = useSharedValue(0.25);

  useEffect(() => {
    twinkle.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: config.duration,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.2, {
            duration: config.duration,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );

    return () => {
      cancelAnimation(twinkle);
    };
  }, [config, twinkle]);

  const style = useAnimatedStyle(() => ({
    opacity: config.peakOpacity * twinkle.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: config.left,
          top: config.top,
          width: config.size,
          height: config.size,
          borderRadius: config.size,
          backgroundColor: "rgba(255,255,255,0.9)",
        },
        style,
      ]}
    />
  );
}

function Meteor({ width, height, initialDelay = 0 }) {
  const [config, setConfig] = useState(() => createMeteorConfig(width, height));
  const progress = useSharedValue(0);
  const firstRun = useRef(true);

  const respawn = useCallback(() => {
    setConfig(createMeteorConfig(width, height));
  }, [width, height]);

  useEffect(() => {
    const startDelay = firstRun.current ? initialDelay : config.gap;
    firstRun.current = false;
    progress.value = 0;
    progress.value = withDelay(
      startDelay,
      withTiming(
        1,
        {
          duration: config.duration,
          easing: Easing.out(Easing.quad),
        },
        (finished) => {
          if (finished) {
            runOnJS(respawn)();
          }
        },
      ),
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [config, initialDelay, progress, respawn]);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const x = config.startX + config.travelX * p;
    const y = config.startY + config.travelY * p;
    const fade =
      p < 0.1 ? p / 0.1 : p > 0.8 ? Math.max(0, (1 - p) / 0.2) : 1;

    return {
      opacity: config.opacity * fade,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: "135deg" },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: config.length,
          height: config.thickness,
          borderRadius: 999,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0)",
          "rgba(255,255,255,0.35)",
          "rgba(255,255,255,0.95)",
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export default function MeteorShower() {
  const { width, height } = useWindowDimensions();
  const skyHeight = height * 0.55;

  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, index) =>
        createStarConfig(index, width, skyHeight),
      ),
    [width, skyHeight],
  );

  const slots = useMemo(
    () =>
      Array.from({ length: METEOR_SLOTS }, (_, index) => ({
        id: `slot-${index}`,
        initialDelay: Math.floor(randomBetween(0, 2200)),
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((config) => (
        <Star key={config.id} config={config} />
      ))}
      {slots.map((slot) => (
        <Meteor
          key={slot.id}
          width={width}
          height={skyHeight}
          initialDelay={slot.initialDelay}
        />
      ))}
    </View>
  );
}
