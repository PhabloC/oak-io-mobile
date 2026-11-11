import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XIcon } from "../icons/UiIconSvg";
import { useTheme } from "../../context/ThemeContext";
import { radius } from "../../design-system";

export default function SheetShell({
  visible,
  title,
  onClose,
  children,
  footer = null,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28, 27, 41, 0.4)" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: Math.max(insets.bottom, 20),
            maxHeight: "90%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700", flex: 1 }}>
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.sm,
                backgroundColor: colors.canvas,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon color={colors.muted} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {children}
          </ScrollView>
          {footer}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
