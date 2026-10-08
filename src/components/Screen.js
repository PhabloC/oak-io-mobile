import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimateOnFocus from "./AnimateOnFocus";

export default function Screen({ children }) {
  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScrollView
          contentContainerClassName="px-5 pb-32 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <AnimateOnFocus delay={20} duration={360}>
            {children}
          </AnimateOnFocus>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
