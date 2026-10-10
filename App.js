import "./global.css";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PortalHost } from "@rn-primitives/portal";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { FinanceProvider } from "./src/context/FinanceContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { NAV_THEME } from "./src/lib/theme";
import LoginScreen from "./src/screens/LoginScreen";
import MainTabs from "./src/navigation/MainTabs";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "none",
        detachPreviousScreen: false,
        freezeOnBlur: true,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

function ThemedApp() {
  const { statusBar, scheme } = useTheme();

  return (
    <NavigationContainer theme={NAV_THEME[scheme]}>
      <StatusBar style={statusBar} />
      <View style={{ flex: 1, backgroundColor: scheme === "dark" ? "#12101A" : "#F4F2FA" }}>
        <RootNavigator />
        <PortalHost />
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <ThemedApp />
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
