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
import DividasScreen from "./src/screens/DividasScreen";
import InvestimentoScreen from "./src/screens/InvestimentoScreen";

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
        animation: "fade",
        animationDuration: 280,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ animation: "fade" }} />
          <Stack.Screen name="Dividas" component={DividasScreen} />
          <Stack.Screen name="Investimento" component={InvestimentoScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ animation: "fade" }} />
      )}
    </Stack.Navigator>
  );
}

function ThemedApp() {
  const { statusBar, scheme } = useTheme();

  return (
    <NavigationContainer theme={NAV_THEME[scheme]}>
      <StatusBar style={statusBar} />
      <RootNavigator />
      <PortalHost />
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
