import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

export default function Screen({ children, scroll = true }) {
  const { colors } = useTheme();

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 128, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, backgroundColor: colors.canvas, paddingHorizontal: 20, paddingTop: 8 }}>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }} edges={["top"]}>
        {body}
      </SafeAreaView>
    </View>
  );
}
